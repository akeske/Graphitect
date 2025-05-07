/** @format */

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ApiStatusService } from '../../../services/apistatus.service';
import { ApiStatus } from '../../../models/apistatus.model';

@Component({
  selector: 'app-status-dashboard',
  standalone: false,
  templateUrl: './status-dashboard.component.html',
  styleUrls: ['./status-dashboard.component.scss'],
})
export class StatusDashboardComponent implements OnChanges {
  @Input() apiId: number | undefined;
  @Input() refreshTrigger!: number;

  statuses: ApiStatus[] = [];

  constructor(private readonly api: ApiStatusService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['refreshTrigger'] || changes['apiId']) && this.apiId !== undefined && this.apiId > 0) {
      this.loadStatuses();
    }
  }

  loadStatuses() {
    if (this.apiId !== undefined) {
      this.api.getApiCallById(this.apiId).subscribe((data) => {
        this.statuses = data;
      });
    }
  }

  getBadgeClass(status: string): string {
    return (
      {
        up: 'bg-success',
        down: 'bg-danger',
        error: 'bg-warning',
      }[status] ?? 'bg-secondary'
    );
  }
}
