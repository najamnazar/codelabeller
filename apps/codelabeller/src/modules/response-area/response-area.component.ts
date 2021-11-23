import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IResponse } from '@codelabeller/api-interfaces';
import { InputField } from '../input-form/input-fields/input-field';
import { InputFormComponent } from '../input-form/input-form.component';

import { ResponseState } from './response-state.enum';

@Component({
  selector: 'codelabeller-response-area',
  templateUrl: './response-area.component.html',
  styleUrls: ['./response-area.component.scss']
})
export class ResponseAreaComponent implements AfterViewInit {
  @ViewChild(InputFormComponent) inputFormComponent !: InputFormComponent<IResponse>;

  _responseState: ResponseState = ResponseState.UNSUBMITTED;

  @Input()
  get responseState() {
    return this._responseState;
  }

  set responseState(state: ResponseState) {
    this._responseState = state;
  }

  @Input() inputFields: InputField[] = [];
  @Input() infoText !: string;
  @Input()
  get isLoading() {
    return this.inputFormComponent.isLoading;
  }

  set isLoading(state: boolean) {
    this.inputFormComponent.isLoading = state;
  }

  @Input()
  get isEnabled() {
    return this.inputFormComponent.isEnabled;
  }

  set isEnabled(state: boolean) {
    this.inputFormComponent.isEnabled = state;
  }

  @Output() submittedResponse = new EventEmitter<IResponse>();
  @Output() responseChange = new EventEmitter<IResponse>();

  restoreForm(formValues: IResponse): void {
    this.inputFormComponent?.restoreForm(formValues);
  }

  clearForm(): void {
    this.inputFormComponent?.clearForm();
  }

  onResponseChange(response: IResponse) {
    this.responseChange.emit(response);
  }

  onResponseSubmit(response: IResponse) {
    this.submittedResponse.emit(response);
  }

  setResponseState(state: ResponseState) {
    // Setter method alias to allow for TypeScript optional chaining syntax.
    this.responseState = state;
  }

  ngAfterViewInit() {
    // This lifecycle method required to ensure input form ViewChild is initialised.
    return;
  }
}
