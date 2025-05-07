/** @format */

import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import Workspace from '../entities/Workspace';
import { Like } from 'typeorm/find-options/operator/Like';

export class WorkspaceController {
  static async getWorkspaces(req: Request, res: Response) {
    const workspaces = await AppDataSource.getRepository(Workspace).find({ relations: ['apis'] });
    res.json(workspaces);
  }

  static async deleteWorkspace(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Workspace);
    const workspaceToDelete = await repo.findOne({ where: { id: parseInt(req.params.id) } });
    if (workspaceToDelete) {
      await repo.remove(workspaceToDelete);
    }
    res.json(workspaceToDelete);
  }

  static async createWorkspace(req: Request, res: Response) {
    console.error('Creating workspace', req.body);
    const repo = AppDataSource.getRepository(Workspace);
    const workspace = repo.create(req.body);
    const result = await repo.save(workspace);
    res.status(201).json(result);
  }

  static async getWorkspace(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Workspace);
    const workspace = await repo.findOne({ where: { id: parseInt(req.params.id) }, relations: ['apis'] });
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    res.json(workspace);
  }

  static async getWorkspacesLikeByName(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Workspace);
    let workspaces = await repo.find({ where: { name: Like(`${req.params.name}%`) }, relations: ['apis'] });
    workspaces = workspaces.filter((ws) => {
      const dashCount = (ws.name.match(/-/g) || []).length - 1;
      return dashCount === Number(req.params.dashCount);
    });

    // if (workspaces.length === 0) {
    //   return res.status(404).json({ error: 'Workspaces not found' });
    // }
    res.json(workspaces);
  }
}
