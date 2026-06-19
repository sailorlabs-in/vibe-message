#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: ./update-component-v2.sh <component-name>"
  echo "Example: ./update-component-v2.sh backend"
  echo "Valid components: frontend, backend, demo, frontend-new, backend-new, demo-new"
  exit 1
fi

COMPONENT=$1
NAMESPACE="message-app"
CLUSTER_NAME="vibe-new"

# Switch kubectl context to ensure deployment goes to the new cluster
kubectl config use-context kind-$CLUSTER_NAME

case $COMPONENT in
  frontend|frontend-new)
    DOCKERFILE="./apps/frontend/Dockerfile"
    IMAGE="local/frontend:latest"
    DEPLOYMENT="frontend"
    ;;
  backend|backend-new)
    DOCKERFILE="./apps/server/Dockerfile"
    IMAGE="local/server:latest"
    DEPLOYMENT="backend"
    
    # Refresh the backend secret so latest .env changes are picked up
    echo "Updating backend-secret from apps/server/.env..."
    if command -v ip &> /dev/null; then
        HOST_IP=$(ip -4 route get 1.1.1.1 | grep -P -o 'src \K\S+')
    else
        HOST_IP="host.docker.internal"
    fi
    cp apps/server/.env .env.k8s
    sed -i "s/localhost/$HOST_IP/g" .env.k8s
    sed -i "s/127.0.0.1/$HOST_IP/g" .env.k8s
    kubectl create secret generic backend-secret \
        --from-env-file=.env.k8s \
        -n $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    
    # Refresh the backend configmap
    echo "Updating backend-config ConfigMap from apps/server/.env..."
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
        -n $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
        
    rm .env.k8s
    ;;
  demo|demo-new)
    DOCKERFILE="./apps/notification-demo/Dockerfile"
    IMAGE="local/demo:latest"
    DEPLOYMENT="demo"
    ;;
  *)
    echo "Invalid component: $COMPONENT"
    echo "Valid components: frontend, backend, demo, frontend-new, backend-new, demo-new"
    exit 1
    ;;
esac

echo "Step 1/3: Rebuilding Docker image for $COMPONENT (using Monorepo Root Context)..."
 docker build -f $DOCKERFILE -t $IMAGE .

echo "Step 2/3: Loading image into KIND cluster '$CLUSTER_NAME'..."
 kind load docker-image $IMAGE --name $CLUSTER_NAME

echo "Step 3/3: Restarting Kubernetes deployment to pick up the new image..."
kubectl rollout restart deployment/$DEPLOYMENT -n $NAMESPACE

echo "✅ Update initiated for $COMPONENT. Kubernetes is restarting the pods."
echo "Run 'kubectl get pods -n $NAMESPACE -w' to monitor progress."
