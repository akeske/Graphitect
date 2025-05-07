/** @format */

import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './new-arch.component.html',
})
export class NewArchitectureModal implements OnInit {
  @Input() currentArchName: string | undefined;
  newArchitectureName: string | undefined = undefined;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    this.newArchitectureName = this.currentArchName;
  }

  saveArchitecture(): void {
    const returnValue = {
      status: 'Save',
      archName: this.newArchitectureName,
    };
    this.activeModal.close(returnValue); // Close the modal
  }
}
