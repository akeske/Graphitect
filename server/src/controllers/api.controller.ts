/** @format */

import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import fetch from 'node-fetch';
import Api from '../entities/Api';
import { ApiService } from '../services/api.service';
import ApiStatus from '../entities/ApiStatus';

export class ApiController {
  static async createApi(req: Request, res: Response) {
    const { name, url, method, headers, params, body, info, auth, schema, intervalMinutes, workspace } = req.body;
    const newApi = new Api();
    newApi.name = name;
    newApi.url = url;
    newApi.method = method ?? 'GET';
    newApi.headers = headers;
    newApi.params = params;
    newApi.body = body;
    newApi.info = info;
    newApi.auth = auth;
    newApi.schema = schema;
    newApi.intervalMinutes = intervalMinutes ?? 60;
    newApi.workspace = workspace;
    const api = await ApiService.createApi(newApi);
    res.json(api);
  }

  static async getApis(req: Request, res: Response) {
    const apis = await ApiService.getApis();
    res.json(apis);
  }

  static async getApiById(req: Request, res: Response) {
    const api = await ApiService.getApiById(Number(req.params.id));
    if (!api) return res.status(404).json({ error: 'API call not found' });
    res.json(api);
  }

  static async updateApi(req: Request, res: Response) {
    const api = await ApiService.updateApi(Number(req.params.id), req.body);
    res.json(api);
  }

  static async deleteApi(req: Request, res: Response) {
    const api = await ApiService.deleteApi(Number(req.params.id));
    res.json(api);
  }

  static async getApisByWorkspaceId(req: Request, res: Response) {
    const apis = await ApiService.getApisByWorkspaceId(Number(req.params.workspaceId));
    res.json(apis);
  }

  static async testApiCall(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Api);
    const apiCall = await repo.findOneBy({ id: parseInt(req.params.id) });

    if (!apiCall) return res.status(404).json({ error: 'API call not found' });

    try {
      if (!apiCall.url) {
        return res.status(400).json({ error: 'API call URL is missing' });
      }

      // Build query string from params[]
      let fullUrl = apiCall.url;
      if (Array.isArray(apiCall.params) && apiCall.params.length > 0) {
        const queryString = apiCall.params
          .filter((p) => p.key && p.value)
          .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
          .join('&')
          .replace(/&$/, '');
        fullUrl += fullUrl.includes('?') ? `&${queryString}` : `?${queryString}`;
      }

      // Convert headers[] to object
      const headers: Record<string, string> = {};
      if (Array.isArray(apiCall.headers)) {
        apiCall.headers.forEach((h) => {
          if (h.key && h.value) headers[h.key] = h.value;
        });
      }

      // Handle auth types
      if (apiCall.auth) {
        const { type, value, header } = apiCall.auth;
        switch (type) {
          case 'jwt':
          case 'oauth':
            headers['Authorization'] = `Bearer ${value}`;
            break;
          case 'basic': {
            const credentials = Buffer.from(`${header}:${value}`).toString('base64');
            headers['Authorization'] = `Basic ${credentials}`;
            break;
          }
          case 'apiKey':
            headers[header ?? 'x-api-key'] = value;
            break;
        }
      }

      // Build fetch options
      const fetchOptions: any = {
        method: apiCall.method,
        headers,
      };

      if (['POST', 'PUT', 'PATCH'].includes((apiCall.method ?? '').toUpperCase()) && apiCall.body) {
        fetchOptions.body = apiCall.body;
        if (!headers['Content-Type']) {
          headers['Content-Type'] = 'application/json';
        }
      }

      // Fire the request
      const response = await fetch(fullUrl, fetchOptions);

      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');
      const responseBody = isJson ? await response.json() : await response.text();

      const apiStatusrepo = AppDataSource.getRepository(ApiStatus);
      const apiStatus: ApiStatus = new ApiStatus();
      apiStatus.api = apiCall;
      apiStatus.status = response.status < 299 ? 'up' : 'down';
      apiStatus.message = String(response.status) || '';
      apiStatus.lastChecked = new Date();
      await apiStatusrepo.save(apiStatus);

      // Return results
      res.json({
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseBody,
      });
    } catch (err: any) {
      console.error('Test API Error:', err);
      const apiStatusrepo = AppDataSource.getRepository(ApiStatus);
      const apiStatus: ApiStatus = new ApiStatus();
      apiStatus.api = apiCall;
      apiStatus.status = 'down';
      apiStatus.message = err.message;
      apiStatus.lastChecked = new Date();
      await apiStatusrepo.save(apiStatus);
      res.status(500).json({ error: err.message ?? 'Unknown error occurred' });
    }
  }
}
