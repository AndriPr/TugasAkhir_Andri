import { Request, Response } from 'express';
import { ClaimModel } from '../models/claimModel.js';

export const ClaimController = {
  async getAll(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      const claims = await ClaimModel.getAll(userId as string | undefined);
      res.json({ success: true, data: claims });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const claim = await ClaimModel.getById(id);
      if (!claim) {
        return res.status(404).json({ success: false, message: 'Data klaim tidak ditemukan' });
      }
      res.json({ success: true, data: claim });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { itemId, claimantName, claimantPhone, proofDescription } = req.body;
      if (!itemId || !claimantName || !claimantPhone || !proofDescription) {
        return res.status(400).json({
          success: false,
          message: 'Field itemId, claimantName, claimantPhone, dan proofDescription wajib diisi',
        });
      }

      const claim = await ClaimModel.create(req.body);
      res.status(201).json({
        success: true,
        data: claim,
        message: 'Pengajuan klaim berhasil dikirim dan menunggu verifikasi posko',
      });
    } catch (err: any) {
      const statusCode = err.message?.includes('terkonfigurasi') ? 503 : 500;
      res.status(statusCode).json({ success: false, message: err.message, error: err.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await ClaimModel.update(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Data klaim tidak ditemukan' });
      }
      res.json({ success: true, data: updated, message: 'Status klaim berhasil diperbarui' });
    } catch (err: any) {
      const statusCode = err.message?.includes('terkonfigurasi') ? 503 : 500;
      res.status(statusCode).json({ success: false, message: err.message, error: err.message });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const success = await ClaimModel.remove(id);
      if (!success) {
        return res.status(404).json({ success: false, message: 'Data klaim tidak ditemukan' });
      }
      res.json({ success: true, message: 'Data klaim berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
};
