/** @format */

export interface ApiStatus {
  id?: number;
  lastChecked?: Date;
  status?: 'up' | 'down' | 'error';
  api?: { id: number };
}
