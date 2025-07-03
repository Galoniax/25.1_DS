import swaggerUi from 'swagger-ui-express';

import YAML from 'yamljs';
import { DOCS_PREFIX } from '../config/config.js';


const swaggerDocument = YAML.load('./src/docs/swagger.yaml');

export const swaggerDocs = (app) => {
    app.use(`${DOCS_PREFIX}`, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}


