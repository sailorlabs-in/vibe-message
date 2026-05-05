import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "vibe-message API",
      version: "1.0.0",
      description: "API documentation for the vibe-message platform",
    },
    servers: [
      {
        url: "/api",
        description: "Development server",
      },
      {
        url: "/",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: "Internal App APIs",
        description:
          "Endpoints used by the Vibe Message Dashboard (Authentication, App Management, Admin features)",
      },
      {
        name: "External Notifications APIs",
        description:
          "Endpoints used by third-party backend and frontend services to register devices and trigger notifications",
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Path to the API docs
};

export const specs = swaggerJsdoc(options);
