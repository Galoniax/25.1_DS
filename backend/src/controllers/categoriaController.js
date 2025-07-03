import { CategoriaService } from "../services/categoriaService.js";

export class CategoriaController {
  constructor() {
    this.categoriaService = CategoriaService.getInstance();
  }

  async getAllCategorias(req, res) {
    try {
      const categorias = await this.categoriaService.getAllCategorias();
      res.status(200).json(categorias);

      if (!categorias) {
        return res.status(404).json({ message: "Categorias no encontradas." });
      }

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getCategoriaById(req, res) {
    const { id } = req.params;
    try {
      const categoria = await this.categoriaService.getCategoriaById(id);
      if (!categoria) {
        return res.status(404).json({ message: "Categoría no encontrada." });
      }
      res.status(200).json(categoria);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createCategoria(req, res) {
    try {
      const categoria = req.body;
      const createdCategoria = await this.categoriaService.createCategoria(
        categoria
      );
      res.status(201).json(createdCategoria);

      if (!createdCategoria) {
        return res.status(400).json({ message: "Categoría no creada." });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateCategoria(req, res) {
    const { id } = req.params;
    try {
      const categoria = req.body;
      const updatedCategoria = await this.categoriaService.updateCategoria(
        id,
        categoria
      );
      res.status(200).json(updatedCategoria);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteCategoria(req, res) {
    const { id } = req.params;
    try {
      await this.categoriaService.deleteCategoria(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
