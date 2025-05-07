/** @format */

export interface ApiCall {
  id?: number;
  name?: string;
  url?: string;
  enviroment?: string;
  method?: string;
  headers?: { key: string; value: string; description: string }[];
  params?: { key: string; value: string; description: string }[];
  body?: string;
  auth?: {
    type: string; //'jwt' | 'apiKey' | 'oauth' | 'basic' | 'none'
    value: string;
    header: string;
  };
  schema?: string;
  intervalMinutes?: number;
  workspace?: { id: number };

  baseUrl?: string;
}
