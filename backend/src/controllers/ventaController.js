import { VentaService } from "../services/ventaService.js";

export class VentaController {
  constructor() {
    this.ventaService = VentaService.getInstance();
  }

  async getAllVentas(req, res) {
    try {
      const ventas = await this.ventaService.getAllVentas();
      if (!ventas) {
        return res.status(404).json({ message: "Ventas no encontradas" });
      }
      return res.status(200).json(ventas);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getVentasById(req, res) {
    const { id } = req.params;
    try {
      const venta = await this.ventaService.getVentasById({ id: Number(id) });

      if (!venta) {
        return res.status(404).json({ message: "Venta no encontrada" });
      }

      return res.status(200).json(venta);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getVentasBySucursal(req, res) {
    const { id_sucursal } = req.params;
    try {
      const ventas = await this.ventaService.getVentasBySucursal({ id: Number(id_sucursal) });
      if (!ventas) {
        return res.status(404).json({ message: "Ventas no encontradas" });
      }
      return res.status(200).json(ventas);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}
