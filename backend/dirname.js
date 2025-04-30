import path from "path";
import { fileURLToPath } from "url";

// Obtiene el nombre del archivo actual
const __filename = fileURLToPath(import.meta.url);

// Obtiene el directorio del archivo actual
const __dirname = path.dirname(__filename);

export default __dirname;