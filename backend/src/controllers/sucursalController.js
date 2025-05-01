import { SucursalService } from "../services/sucursalService";

/**
 * @swagger
 * tags: 
 *     name: Sucursal
 *     description: Gestión de sucursales
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Sucursal:
 *       type: object
 *       properties:
 *         id_sucursal:
 *           type: integer
 *           description: ID de la sucursal
 *         nombre:
 *           type: string
 *           description: Nombre de la sucursal
 *         direccion:
 *           type: string
 *           description: Dirección de la sucursal
 */

export class SucursalController {
    constructor() {
        this.sucursalService = SucursalService.getInstance();
    }

    async getAllSucursales(req, res) {
        try {
            const sucursales = await this.sucursalService.getAllSucursales();
            return res.status(200).json(sucursales);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async getStocks(req, res) {
        try {
            const { id_sucursal } = req.params;
            const stocks = await this.sucursalService.getStocks({ id_sucursal });
            return res.status(200).json(stocks);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async getVentas(req, res) {
        try {
            const { id_sucursal } = req.params;
            const ventas = await this.sucursalService.getVentas({ id_sucursal });
            return res.status(200).json(ventas);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async getReportes(req, res) {
        try {
            const { id_sucursal } = req.params;
            const reportes = await this.sucursalService.getReportes({ id_sucursal });
            return res.status(200).json(reportes);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async getFuentesDatos(req, res) {
        try {
            const { id_sucursal } = req.params;
            const fuentesDatos = await this.sucursalService.getFuenteDatos({ id_sucursal });
            return res.status(200).json(fuentesDatos);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
    
}