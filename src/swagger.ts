import swaggerJsDoc from "swagger-jsdoc"

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Web Apps Assignment REST API",
            version: "1.0.0",
            description: "REST server including authentication using JWT",
        },
        servers: [{url: 'http://localhost:8080'},
                  {url: 'http://localhost:3000'}],
    },
    apis: ["./src/*.ts", "./src/**/*.ts"],
};

export default swaggerJsDoc(options)
