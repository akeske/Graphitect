/** @format */

import { ApiStatusService } from '../services/apistatus.service';
import { Request, Response } from 'express';

export class ApiStatusController {
  static async getStatusesByApiId(req: Request, res: Response) {
    const apiStatuses = await ApiStatusService.getStatusesByApiId(Number(req.params.apiId));
    res.json(apiStatuses);
  }
}
