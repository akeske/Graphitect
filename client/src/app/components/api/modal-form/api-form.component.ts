/** @format */

import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Workspace } from '../../../models/workspace.model';
import { ApiCall } from '../../../models/apicall.model';
import { faTrash, faPlus, faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import { Subject, debounceTime } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from '../../../services/shared';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './api-form.component.html',
})
export class ApiFormComponent implements OnInit {
  @ViewChild('apiInput') apiInput!: ElementRef<HTMLTextAreaElement>;
  @Input() selectedWorkspaceId: number | undefined;
  @Input() selectedApiId: number | undefined;

  faTrash = faTrash;
  faPlus = faPlus;
  faFloppyDisk = faFloppyDisk;

  refreshCount = 0;
  workspaces: Workspace[] = [];
  apiCalls: ApiCall[] = [];
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
  newWorkspace: Workspace = {};
  response: any = '';
  responseObj: any = '';

  private readonly inputSubject = new Subject<void>();

  constructor(
    private readonly api: ApiService,
    public readonly sharedService: SharedService,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {
    if (this.selectedApiId !== undefined) {
      this.api.getApiCallById(this.selectedApiId).subscribe((apiCall) => {
        apiCall.baseUrl = (apiCall.url ?? '').split('?')[0];
        this.newApiCall = apiCall;
        // localStorage.setItem('selectedApiCallId', String(this.newApiCall.id));
      });
    }
  }

  ngAfterViewInit(): void {
    this.inputSubject.pipe(debounceTime(500)).subscribe(() => {
      const textarea = this.apiInput.nativeElement;
      const raw = textarea.value;
      const beautified = this.beautifyJsonOrXml(raw);
      if (beautified && beautified !== raw) {
        textarea.value = beautified;
      }
    });
  }

  onUserTyping(): void {
    this.inputSubject.next();
  }

  loadApiCallsByWorkspace(workspaceId: number) {
    this.api.getApiCallsByWorkspace(workspaceId).subscribe((data) => {
      this.apiCalls = data;
      this.apiCalls.forEach((call) => {
        call.baseUrl = (call.url ?? '').split('?')[0];
      });
    });
  }

  loadApiCalls() {
    this.api.getApiCalls().subscribe((data) => (this.apiCalls = data));
  }

  createApiCall() {
    if (this.selectedWorkspaceId === undefined) return;
    if (!this.newApiCall.id) {
      this.newApiCall.workspace = { id: this.selectedWorkspaceId };
      console.error(this.newApiCall);
      this.api.createApiCall(this.newApiCall).subscribe(() => {
        this.activeModal.close('Save'); // Close the modal
      });
    } else {
      this.api.updateApiCall(this.newApiCall.id, this.newApiCall).subscribe(() => {
        this.activeModal.close('Update'); // Close the modal
      });
    }
  }

  updateFullUrl() {
    setTimeout(() => {
      const baseUrl = this.newApiCall.baseUrl;
      console.error(this.newApiCall.baseUrl);
      let newUrl: string = this.newApiCall.baseUrl ?? '';
      if (newUrl.indexOf('?') === -1) {
        newUrl = baseUrl + '?';
      }
      this.newApiCall.params?.forEach((param) => {
        newUrl = newUrl + `${param.key}=${param.value}&`;
      });
      if (newUrl.endsWith('&') || newUrl.endsWith('?')) {
        newUrl = newUrl.slice(0, -1);
      }
      this.newApiCall.url = newUrl;
    }, 1);
  }

  updateParams() {
    const queryString = this.newApiCall.url?.split('?')[1] ?? '';
    console.error(this.newApiCall.url);
    console.error(this.newApiCall.url?.split('?')[1]);
    if (!queryString) return [];
    this.newApiCall.params = [];
    return queryString.split('&').map((param) => {
      const [key, value] = param.split('=');
      this.newApiCall.params?.push({ key, value, description: '' });
    });
  }

  remoreHeaderParam(type: string, indexToRemove: number): void {
    if (type === 'param') {
      this.newApiCall?.params?.splice(indexToRemove, 1);
      this.updateFullUrl();
    } else if (type === 'header') {
      this.newApiCall?.headers?.splice(indexToRemove, 1);
    }
  }

  authStringPlaceholder(auth?: string) {
    if (auth === 'jwt') {
      return { header: undefined, value: 'secret' };
    } else if (auth === 'basic') {
      return { header: 'username', value: 'password' };
    } else if (auth === 'bearer') {
      return { header: undefined, value: 'token' };
    } else if (auth === 'apiKey') {
      return { header: 'key', value: 'value' };
    } else if (auth === 'oauth') {
      return { header: undefined, value: 'token' };
    } else {
      return { header: undefined, value: undefined };
    }
  }

  addHeaderParam(type: string): void {
    if (type === 'param') {
      this.newApiCall?.params?.push({ key: '', value: '', description: '' });
    } else if (type === 'header') {
      this.newApiCall?.headers?.push({ key: '', value: '', description: '' });
    }
  }

  selectedApiCall(apiCallId: number) {
    this.api.getApiCallById(apiCallId).subscribe((apiCall) => {
      apiCall.baseUrl = (apiCall.url ?? '').split('?')[0];
      this.newApiCall = apiCall;
      localStorage.setItem('selectedApiCallId', String(this.newApiCall.id));
    });
  }

  // onPaste(event: ClipboardEvent): void {
  //   // Wait for paste to complete
  //   setTimeout(() => {
  //     this.beautify();
  //   }, 10);
  // }

  // onInput(event: Event): void {
  //   // Optional: debounce if needed
  //   this.beautify();
  // }

  private beautifyJsonOrXml(raw: string): string | null {
    // Try JSON
    try {
      const obj = JSON.parse(raw);
      return JSON.stringify(obj, null, 2);
    } catch (_) {
      // Try XML
      try {
        const parser = new DOMParser();
        const xml = parser.parseFromString(raw, 'application/xml');

        const hasParserError = xml.getElementsByTagName('parsererror').length > 0;
        if (hasParserError) return null;

        const serializer = new XMLSerializer();
        const pretty = serializer.serializeToString(xml);
        return this.formatXml(pretty);
      } catch (_) {
        return null;
      }
    }
  }

  responceClass(response: any): string {
    this.responseObj = JSON.parse(response);
    if (this.responseObj.status >= 200 && this.responseObj.status < 300) {
      return 'bg-success text-white';
    } else {
      return 'bg-danger text-white';
    }
  }

  private formatXml(xml: string): string {
    const PADDING = '  ';
    const reg = /(>)(<)(\/*)/g;
    let formatted = '';
    let pad = 0;
    xml = xml.replace(reg, '$1\r\n$2$3');
    xml.split('\r\n').forEach((node) => {
      let indent = 0;
      if (RegExp(/.+<\/\w[^>]*>$/).exec(node)) {
        indent = 0;
      } else if (RegExp(/^<\/\w/).exec(node)) {
        if (pad !== 0) pad -= 1;
      } else if (RegExp(/^<\w([^>]*[^/])?>.*$/).exec(node)) {
        indent = 1;
      }
      const padding = PADDING.repeat(pad);
      formatted += padding + node + '\r\n';
      pad += indent;
    });
    return formatted.trim();
  }
}
