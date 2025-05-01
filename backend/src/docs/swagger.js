import swaggerUi from 'swagger-ui-express';

import YAML from 'yamljs';

const swaggerDocument = YAML.load('./src/docs/swagger.yaml');

export const swaggerDocs = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}


