import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Customers API - BDB",
            version: "1.0.0",
            description: "API REST para la gestión de clientes del Banco de Bogotá",
            contact: {
                name: "BDB Backend Team",
            },
        },
        servers: [
            {
                url: "http://localhost:8080",
                description: "Servidor de desarrollo",
            },
            {
                url: "http://localhost:9090",
                description: "Servidor de producción",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Token JWT obtenido en /api/auth/login",
                },
            },
            schemas: {
                LoginInput: {
                    type: "object",
                    required: ["username", "password"],
                    properties: {
                        username: {
                            type: "string",
                            example: "admin",
                        },
                        password: {
                            type: "string",
                            example: "admin123",
                        },
                    },
                },
                LoginResponse: {
                    type: "object",
                    properties: {
                        accessToken: {
                            type: "string",
                            description: "JWT para Authorization: Bearer <token>",
                        },
                        tokenType: {
                            type: "string",
                            example: "Bearer",
                        },
                        expiresIn: {
                            type: "string",
                            example: "8h",
                        },
                        user: {
                            type: "object",
                            properties: {
                                username: {
                                    type: "string",
                                    example: "admin",
                                },
                                role: {
                                    type: "string",
                                    enum: ["ADMIN", "ASESOR"],
                                },
                            },
                        },
                    },
                },
                Customer: {
                    type: "object",
                    properties: {
                        id: {
                            type: "integer",
                            description: "ID único del cliente",
                            example: 1,
                        },
                        typeId: {
                            type: "string",
                            enum: [
                                "cedula de ciudadania",
                                "cedula de extranjeria",
                                "pasaporte",
                            ],
                            description: "Tipo de identificación",
                            example: "cedula de ciudadania",
                        },
                        identification: {
                            type: "string",
                            description: "Número de identificación (7-10 dígitos)",
                            example: "1234567890",
                        },
                        name: {
                            type: "string",
                            description: "Nombre del cliente (2-100 caracteres)",
                            example: "Juan Pérez",
                        },
                        age: {
                            type: "integer",
                            description: "Edad del cliente (1-120)",
                            example: 30,
                        },
                        email: {
                            type: "string",
                            format: "email",
                            description: "Correo electrónico del cliente",
                            example: "juan.perez@email.com",
                        },
                        product: {
                            type: "string",
                            enum: [
                                "cuenta de ahorros",
                                "cuenta corriente",
                                "tarjeta de credito",
                                "credito libre inversion",
                                "credito de vehiculo",
                                "credito rotativo",
                            ],
                            description: "Producto bancario del cliente",
                            example: "cuenta de ahorros",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Fecha de creación del registro",
                        },
                    },
                },
                CustomerInput: {
                    type: "object",
                    required: [
                        "typeId",
                        "identification",
                        "name",
                        "age",
                        "email",
                        "product",
                    ],
                    properties: {
                        typeId: {
                            type: "string",
                            enum: [
                                "cedula de ciudadania",
                                "cedula de extranjeria",
                                "pasaporte",
                            ],
                            description: "Tipo de identificación",
                            example: "cedula de ciudadania",
                        },
                        identification: {
                            type: "string",
                            description: "Número de identificación (7-10 dígitos)",
                            example: "1234567890",
                        },
                        name: {
                            type: "string",
                            description: "Nombre del cliente (2-100 caracteres)",
                            example: "Juan Pérez",
                        },
                        age: {
                            type: "integer",
                            description: "Edad del cliente (1-120)",
                            example: 30,
                        },
                        email: {
                            type: "string",
                            format: "email",
                            description: "Correo electrónico del cliente",
                            example: "juan.perez@email.com",
                        },
                        product: {
                            type: "string",
                            enum: [
                                "cuenta de ahorros",
                                "cuenta corriente",
                                "tarjeta de credito",
                                "credito libre inversion",
                                "credito de vehiculo",
                                "credito rotativo",
                            ],
                            description: "Producto bancario del cliente",
                            example: "cuenta de ahorros",
                        },
                    },
                },
                Error: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            description: "Mensaje de error",
                        },
                        errors: {
                            type: "array",
                            items: {
                                type: "string",
                            },
                            description: "Lista de errores de validación",
                        },
                    },
                },
            },
        },
        paths: {
            "/api/auth/login": {
                post: {
                    tags: ["Auth"],
                    summary: "Iniciar sesión",
                    description: "Autentica usuario y devuelve un token JWT.",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/LoginInput",
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: "Login exitoso",
                            content: {
                                "application/json": {
                                    schema: {
                                        $ref: "#/components/schemas/LoginResponse",
                                    },
                                },
                            },
                        },
                        400: {
                            description: "Parámetros inválidos",
                            content: {
                                "application/json": {
                                    schema: {
                                        $ref: "#/components/schemas/Error",
                                    },
                                },
                            },
                        },
                        401: {
                            description: "Credenciales inválidas",
                            content: {
                                "application/json": {
                                    schema: {
                                        $ref: "#/components/schemas/Error",
                                    },
                                },
                            },
                        },
                    },
                },
            },
            "/api/customers": {
                get: {
                    tags: ["Customers"],
                    summary: "Obtener todos los clientes",
                    description: "Retorna una lista de todos los clientes registrados",
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: {
                            description: "Lista de clientes obtenida exitosamente",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "array",
                                        items: {
                                            $ref: "#/components/schemas/Customer",
                                        },
                                    },
                                },
                            },
                        },
                        500: {
                            description: "Error interno del servidor",
                            content: {
                                "application/json": {
                                    schema: {
                                        $ref: "#/components/schemas/Error",
                                    },
                                },
                            },
                        },
                        401: {
                            description: "Token ausente o inválido",
                        },
                    },
                },
                post: {
                    tags: ["Customers"],
                    summary: "Crear un nuevo cliente",
                    description: "Crea un nuevo registro de cliente en la base de datos",
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/CustomerInput",
                                },
                            },
                        },
                    },
                    responses: {
                        201: {
                            description: "Cliente creado exitosamente",
                            content: {
                                "application/json": {
                                    schema: {
                                        $ref: "#/components/schemas/Customer",
                                    },
                                },
                            },
                        },
                        400: {
                            description: "Error de validación",
                            content: {
                                "application/json": {
                                    schema: {
                                        $ref: "#/components/schemas/Error",
                                    },
                                },
                            },
                        },
                        500: {
                            description: "Error interno del servidor",
                            content: {
                                "application/json": {
                                    schema: {
                                        $ref: "#/components/schemas/Error",
                                    },
                                },
                            },
                        },
                        401: {
                            description: "Token ausente o inválido",
                        },
                    },
                },
            },
            "/api/customers/{id}": {
                put: {
                    tags: ["Customers"],
                    summary: "Actualizar un cliente",
                    description: "Actualiza los datos de un cliente existente (solo ADMIN)",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            description: "ID del cliente a actualizar",
                            schema: {
                                type: "integer",
                            },
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/CustomerInput",
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: "Cliente actualizado exitosamente",
                            content: {
                                "application/json": {
                                    schema: {
                                        $ref: "#/components/schemas/Customer",
                                    },
                                },
                            },
                        },
                        400: {
                            description: "Error de validación",
                            content: {
                                "application/json": {
                                    schema: {
                                        $ref: "#/components/schemas/Error",
                                    },
                                },
                            },
                        },
                        404: {
                            description: "Cliente no encontrado",
                            content: {
                                "application/json": {
                                    schema: {
                                        $ref: "#/components/schemas/Error",
                                    },
                                },
                            },
                        },
                        500: {
                            description: "Error interno del servidor",
                            content: {
                                "application/json": {
                                    schema: {
                                        $ref: "#/components/schemas/Error",
                                    },
                                },
                            },
                        },
                        401: {
                            description: "Token ausente o inválido",
                        },
                        403: {
                            description: "No autorizado para este recurso",
                        },
                    },
                },
                delete: {
                    tags: ["Customers"],
                    summary: "Eliminar un cliente",
                    description: "Elimina un cliente de la base de datos (solo ADMIN)",
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            description: "ID del cliente a eliminar",
                            schema: {
                                type: "integer",
                            },
                        },
                    ],
                    responses: {
                        200: {
                            description: "Cliente eliminado exitosamente",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            message: {
                                                type: "string",
                                                example: "Cliente eliminado correctamente",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        404: {
                            description: "Cliente no encontrado",
                            content: {
                                "application/json": {
                                    schema: {
                                        $ref: "#/components/schemas/Error",
                                    },
                                },
                            },
                        },
                        500: {
                            description: "Error interno del servidor",
                            content: {
                                "application/json": {
                                    schema: {
                                        $ref: "#/components/schemas/Error",
                                    },
                                },
                            },
                        },
                        401: {
                            description: "Token ausente o inválido",
                        },
                        403: {
                            description: "No autorizado para este recurso",
                        },
                    },
                },
            },
        },
    },
    apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
