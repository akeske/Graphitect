/** @format */

import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxEditorModule } from 'ngx-editor';

import { AppComponent } from './app.component';
import { ApiEditorComponent } from './components/api/api-editor.component';
import { StatusDashboardComponent } from './components/api/status/status-dashboard.component';
import { GraphComponent } from './components/graph/graph.component';

import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { ApiFormComponent } from './components/api/modal-form/api-form.component';
import { NewArchitectureModal } from './components/graph/modals/new-architecture/new-arch.component';

@NgModule({
  declarations: [
    GraphComponent,
    AppComponent,
    NewArchitectureModal,
    ApiFormComponent,
    ApiEditorComponent,
    StatusDashboardComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    NgbModalModule,
    NgbModule,
    NgSelectModule,
    NgxEditorModule,
    FontAwesomeModule,
    MonacoEditorModule.forRoot(),
  ],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AppModule {}
