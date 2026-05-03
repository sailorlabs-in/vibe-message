#!/bin/bash
set -e

echo "Starting Vibe Message Deployment to Local Kubernetes (KIND)..."

CLUSTER_NAME="vibe-new"

# Ensure KIND cluster exists
if ! sudo kind get clusters | grep -q "$CLUSTER_NAME" ; then
    echo "KIND cluster not found. Creating local cluster with port 3400 mapping..."
    sudo kind create cluster --name $CLUSTER_NAME --config kind-config.yaml
    
    # Copy kubeconfig for the normal user
    mkdir -p ~/.kube
    sudo cp /root/.kube/config ~/.kube/config
    sudo chown $USER:$USER ~/.kube/config
else
    echo "KIND cluster '$CLUSTER_NAME' already exists."
fi

# Switch kubectl context to ensure deployment goes to the new cluster
kubectl config use-context kind-$CLUSTER_NAME

echo "Setting up NGINX Ingress controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Wait for ingress controller to be ready
echo "Waiting for NGINX Ingress Controller to be ready..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s || echo "Ingress controller may take longer to be fully ready."

# Setup Secrets from .env
ENV_FILE="apps/server/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "Wait, checking root .env..."
    if [ -f ".env" ]; then
        ENV_FILE=".env"
    else
        echo "Error: .env file does not exist in apps/server/ or root. Please create it first."
        exit 1
    fi
fi

# The database might be running on the host machine. If DATABASE_URL uses localhost/127.0.0.1, it needs to use the host IP
echo "Extracting host IP for Kubernetes pods to reach host database..."
if command -v ip &> /dev/null; then
    HOST_IP=$(ip -4 route get 1.1.1.1 | grep -P -o 'src \K\S+')
else
    HOST_IP="host.docker.internal"
fi

echo "Creating backend-secret for Kubernetes..."
cp "$ENV_FILE" .env.k8s
sed -i "s/localhost/$HOST_IP/g" .env.k8s
sed -i "s/127.0.0.1/$HOST_IP/g" .env.k8s

kubectl apply -f k8s/namespace.yaml

# Re-create the secret
kubectl create secret generic backend-secret \
    --from-env-file=.env.k8s \
    -n message-app --dry-run=client -o yaml | kubectl apply -f -

echo "Creating backend-config ConfigMap for Kubernetes..."
PORT_VAL=$(grep '^PORT=' .env.k8s | cut -d '=' -f2 | tr -d '\r')
ENV_VAL=$(grep '^NODE_ENV=' .env.k8s | cut -d '=' -f2 | tr -d '\r')
CORS_VAL=$(grep '^FRONTEND_URL=' .env.k8s | cut -d '=' -f2 | tr -d '\r')
ALLOWED_VAL=$(grep '^ALLOWED_ORIGINS=' .env.k8s | cut -d '=' -f2 | tr -d '\r')

# Assign actual default values if missing
[ -z "$PORT_VAL" ] && PORT_VAL="5000"
[ -z "$ENV_VAL" ] && ENV_VAL="production"
[ -z "$CORS_VAL" ] && CORS_VAL="http://localhost"

kubectl create configmap backend-config \
    --from-literal=PORT="${PORT_VAL}" \
    --from-literal=NODE_ENV="${ENV_VAL}" \
    --from-literal=CORS_ORIGIN="${CORS_VAL}" \
    --from-literal=ALLOWED_ORIGINS="${ALLOWED_VAL}" \
    -n message-app --dry-run=client -o yaml | kubectl apply -f -

rm .env.k8s

echo "Building Docker images..."
sudo docker build -f ./apps/frontend/Dockerfile -t local/frontend:latest .
sudo docker build -f ./apps/server/Dockerfile -t local/server:latest .
sudo docker build -f ./apps/notification-demo/Dockerfile -t local/demo:latest .

echo "Loading docker images into KIND cluster..."
sudo kind load docker-image local/frontend:latest --name $CLUSTER_NAME
sudo kind load docker-image local/server:latest --name $CLUSTER_NAME
sudo kind load docker-image local/demo:latest --name $CLUSTER_NAME

echo "Applying Kubernetes manifests (excluding DB)..."
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/backend-deployment.yaml

kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml

kubectl apply -f k8s/demo-service.yaml
kubectl apply -f k8s/demo-deployment.yaml

echo "Applying Ingress Manifests..."
# The admission webhook might take a bit longer to be ready even after the pod is in Ready state.
# We retry a few times if it fails.
for i in {1..5}; do
    if kubectl apply -f k8s/ingress.yaml && kubectl apply -f k8s/ingress-api.yaml; then
        echo "Ingress applied successfully."
        break
    else
        echo "Ingress webhook not ready yet, retrying in 10 seconds... ($i/5)"
        sleep 10
    fi
    if [ $i -eq 5 ]; then
        echo "Failed to apply ingress resources."
        exit 1
    fi
done

echo "✅ Deployment requested successfully!"
echo "Run 'kubectl get pods -n message-app -w' to monitor the startup."
echo "Once running, access the apps at:"
echo "- Frontend: http://localhost:3400/"
echo "- Backend:  http://localhost:3400/api/"
echo "- Demo:     http://localhost:3400/demo-app/"
