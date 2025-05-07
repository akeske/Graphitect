/** @format */

import { Component, Input, OnDestroy, TemplateRef } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Workspace } from '../../models/workspace.model';
import { ApiCall } from '../../models/apicall.model';
import { Subject } from 'rxjs';
import { faTrash, faPlus, faFloppyDisk, faVialCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiFormComponent } from './modal-form/api-form.component';
import { SharedService } from '../../services/shared';

@Component({
  selector: 'app-api-editor',
  standalone: false,
  templateUrl: './api-editor.component.html',
})
export class ApiEditorComponent implements OnDestroy {
  @Input() edgeName: string | undefined;

  private readonly inputSubject = new Subject<void>();

  faTrash = faTrash;
  faPlus = faPlus;
  faFloppyDisk = faFloppyDisk;
  faVialCircleCheck = faVialCircleCheck;

  refreshCount = 0;
  workspaces: Workspace[] = [];
  apiCalls: ApiCall[] = [];
  selectedWorkspaceId: number | undefined;
  newWorkspace: Workspace = {};
  response: any = '';
  responseObj: any = '';

  newApiCall: ApiCall = {
    url: '',
    method: 'GET',
    body: '',
    headers: [],
    params: [],
    auth: {
      type: '',
      header: '',
      value: '',
    },
  };

  constructor(
    private readonly api: ApiService,
    public readonly sharedService: SharedService,
    private readonly modalService: NgbModal
  ) {}

  ngOnChanges() {
    if (this.edgeName) {
      this.workspaces = [];
      this.apiCalls = [];
      this.loadWorkspaces(this.edgeName);
      this.selectedWorkspaceId = undefined;
    }
  }

  ngOnDestroy(): void {
    this.inputSubject.complete();
  }

  loadApiCallsByWorkspace(workspaceId: number) {
    this.api.getApiCallsByWorkspace(workspaceId).subscribe((data) => {
      this.apiCalls = data;
      this.apiCalls.forEach((call) => {
        call.baseUrl = (call.url ?? '').split('?')[0];
      });
    });
  }

  deleteApiCall(apiCallId: number) {
    this.api.deleteApiCall(apiCallId).subscribe(() => {
      if (this.selectedWorkspaceId !== undefined) {
        this.loadApiCallsByWorkspace(this.selectedWorkspaceId);
      }
    });
  }

  deleteWorkspace(content: TemplateRef<any>, workspaceId: number) {
    this.modalService.open(content, { centered: true }).result.then(
      (result) => {
        if (result === 'yes') {
          this.api.deleteWorkspace(workspaceId).subscribe(() => {
            this.ngOnChanges();
          });
          // await lastValueFrom(this.notesService.deleteNote(noteId));
        }
      },
      () => {}
    );
  }

  loadApiCalls() {
    this.api.getApiCalls().subscribe((data) => (this.apiCalls = data));
  }

  loadWorkspaces(name: string): void {
    const dashCount = name.split('-').length - 1;
    this.api.getWorkspacesLikeByName(name, dashCount).subscribe((data) => {
      this.workspaces = data;
      this.workspaces.forEach((ws) => {
        ws.source = ws.name?.split('-')[0];
        if (ws.name?.split('-').length === 2) {
          ws.target = undefined;
          ws.workspace = ws.name?.split('-')[1];
        } else {
          ws.target = ws.name?.split('-')[1];
          ws.workspace = ws.name?.split('-')[2];
        }
      });
    });
  }

  createWorkspace() {
    if (this.edgeName && this.newWorkspace.name) {
      this.newWorkspace.name = `${this.edgeName}-${this.newWorkspace.name}`;
      this.api.createWorkspace(this.newWorkspace).subscribe(() => {
        if (this.edgeName) this.loadWorkspaces(this.edgeName);
        this.newWorkspace = {};
      });
    }
  }

  openModal(apiCallId: number) {
    const modalRef = this.modalService.open(ApiFormComponent, {
      size: 'xl',
      centered: true,
      scrollable: false,
      modalDialogClass: 'dark-modal',
      backdropClass: 'light-blue-backdrop',
      windowClass: 'dark-modal',
    });
    modalRef.componentInstance.selectedWorkspaceId = this.selectedWorkspaceId;
    modalRef.componentInstance.selectedApiId = apiCallId;
    modalRef.result.then(
      (result) => {
        if (result === 'Save' || result === 'Delete' || result === 'Update') {
          if (this.selectedWorkspaceId !== undefined) {
            this.loadApiCallsByWorkspace(this.selectedWorkspaceId);
          }
        }
      },
      (dismissReason) => {
        // console.log('Modal new dismissed:', dismissReason);
      }
    );
  }

  selectWorkspace(workspaceId: number) {
    this.selectedWorkspaceId = workspaceId;
    if (this.selectedWorkspaceId !== undefined) {
      this.loadApiCallsByWorkspace(this.selectedWorkspaceId);
      localStorage.setItem('selectedWorkspaceId', String(this.selectedWorkspaceId));
    }
  }

  testCall(id: number) {
    this.api.testApiCall(id).subscribe((res) => {
      try {
        const parsed = typeof res === 'string' ? JSON.parse(res) : res;
        if (typeof parsed.body === 'string') {
          try {
            parsed.body = JSON.parse(parsed.body);
          } catch (e) {
            // if body isn't valid JSON, leave it as-is
          }
        }
        this.response = JSON.stringify(parsed, null, 2);
      } catch (err: any) {
        this.response = 'Failed to parse response: ' + err.message;
      }
      this.refreshCount++;
    });
  }
}
