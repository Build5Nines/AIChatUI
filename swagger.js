const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

module.exports = (app) => {
    const options = {
        swaggerDefinition: {
            openapi: '3.0.1',
            info: {
            title: 'AIChatUI',
            version: '0.1',
            description: '',
            }/*,
            servers: [
            {
                url: 'http://localhost:80',
            },
            ],*/
        },
        apis: ['*.js', 'api/*.js'],
    }
    
    const specs = swaggerJsdoc(options)

    app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs))
}
