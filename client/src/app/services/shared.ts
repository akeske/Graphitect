/** @format */

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SharedService {
  setVerbClass(verb?: string): string {
    if (verb === 'GET') {
      return 'fw-bold text-success';
    } else if (verb === 'POST') {
      return 'fw-bold text-warning';
    } else if (verb === 'PUT') {
      return 'fw-bold text-primary';
    } else if (verb === 'DELETE') {
      return 'fw-bold text-danger';
    } else {
      return 'fw-bold text-primary';
    }
  }
}
