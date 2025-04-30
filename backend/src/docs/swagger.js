import swaggerJsDoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de integración de datos',
            version: '1.0.0',
            description: 'API para la integración de datos de diferentes fuentes a una base de datos.',
            host : 'localhost:5000',
            basePath: '/api/v1/reportes',
        },
    },
}


