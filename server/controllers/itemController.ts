import { Request, Response } from 'express';
import { ItemModel, ItemFilterParams } from '../models/itemModel.js';

export const ItemController = {
  async getAll(req: Request, res: Response) {
    try {
      const { type, category, search, status, userId } = req.query;
      const params: ItemFilterParams = {
        type: type as 'lost' | 'found' | undefined,
        category: category as string | undefined,
        search: search as string | undefined,
        status: status as string | undefined,
        userId: userId as string | undefined,
      };

      const items = await ItemModel.getAll(params);
      res.json({
        success: true,
        data: items,
        pagination: {
          total: items.length,
          page: 1,
          limit: items.length,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const item = await ItemModel.getById(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Laporan barang tidak ditemukan' });
      }
      res.json({ success: true, data: item });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { title, type, category, location, contactPhone } = req.body;
      if (!title || !type || !category || !location || !contactPhone) {
        return res.status(400).json({
          success: false,
          message: 'Field title, type, category, location, dan contactPhone wajib diisi',
        });
      }

      const created = await ItemModel.create(req.body);
      res.status(201).json({ success: true, data: created, message: 'Laporan berhasil dibuat' });
    } catch (err: any) {
      const statusCode = err.message?.includes('terkonfigurasi') ? 503 : 500;
      res.status(statusCode).json({ success: false, message: err.message, error: err.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await ItemModel.update(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Laporan barang tidak ditemukan' });
      }
      res.json({ success: true, data: updated, message: 'Laporan berhasil diperbarui' });
    } catch (err: any) {
      const statusCode = err.message?.includes('terkonfigurasi') ? 503 : 500;
      res.status(statusCode).json({ success: false, message: err.message, error: err.message });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const success = await ItemModel.remove(id);
      if (!success) {
        return res.status(404).json({ success: false, message: 'Laporan barang tidak ditemukan' });
      }
      res.json({ success: true, message: 'Laporan barang berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async getStats(_req: Request, res: Response) {
    try {
      const allItems = await ItemModel.getAll();
      const lostCount = allItems.filter((i) => i.type === 'lost').length;
      const foundCount = allItems.filter((i) => i.type === 'found').length;
      const resolvedCount = allItems.filter((i) => i.status === 'resolved').length;
      const openCount = allItems.filter((i) => i.status === 'open').length;

      res.json({
        success: true,
        data: {
          total: allItems.length,
          lost: lostCount,
          found: foundCount,
          open: openCount,
          resolved: resolvedCount,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
};
