/** @format */

import { Request, Response } from 'express';
import { SoapService } from '../services/soap.service';

export class SaopController {
  static async storeSoap(req: Request, res: Response) {
    const { wsdlUrl } = req.body;

    try {
      await SoapService.analyzeWsdlAndStore(wsdlUrl);
      res.json({ message: 'WSDL parsed and operations stored' });
    } catch (err: any) {
      console.error('WSDL Parse Error:', err);
      res.status(500).json({ error: err.message });
    }
  }
}
