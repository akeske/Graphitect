/** @format */

import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import Architecture from '../entities/Architecture';

export class ArchitectureController {
  static async getArchitectures(req: Request, res: Response) {
    const architectures = await AppDataSource.getRepository(Architecture).find();
    res.json(architectures);
  }

  static async getArchitectureById(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Architecture);
    const arch = await repo.findOne({ where: { id: parseInt(req.params.id) } });
    if (!arch) {
      return res.status(404).json({ error: 'Architecture not found' });
    }
    res.json(arch);
  }

  static async deleteArchitecture(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Architecture);
    const arch = await repo.findOne({ where: { id: parseInt(req.params.id) } });
    if (arch) {
      await repo.remove(arch);
    }
    res.json(arch);
  }

  static async createArchitecture(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Architecture);
    const arch = repo.create(req.body);
    const result = await repo.save(arch);
    res.status(201).json(result);
  }

  static async updateArchitecture(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Architecture);

    const archToUpdate = await repo.findOne({ where: { id: parseInt(req.params.id) } });

    if (archToUpdate) {
      Object.assign(archToUpdate, req.body);
      await repo.save(archToUpdate);
    }
    const arch = await repo.findOne({ where: { id: parseInt(req.params.id) } });

    res.json(arch);
  }
}
