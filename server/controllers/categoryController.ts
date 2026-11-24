import { Request, Response } from 'express';
import { CategoryModel } from '../models/categoryModel';

export const CategoryController = {
  async getAll(req: Request, res: Response) {
    try {
      const categories = await CategoryModel.getAll();
      res.json({ success: true, data: categories });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await CategoryModel.getById(id);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
      }
      res.json({ success: true, data: category });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name, description, iconName } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi' });
      }
      const category = await CategoryModel.create({ name, description, iconName });
      res.status(201).json({ success: true, data: category });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await CategoryModel.update(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = await CategoryModel.remove(id);
      if (!success) {
        return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
      }
      res.json({ success: true, message: 'Kategori berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
};
