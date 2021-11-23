import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';
import { InputField } from './input-fields/input-field';

@Component({
  selector: 'codelabeller-input-form',
  templateUrl: './input-form.component.html',
  styleUrls: ['./input-form.component.scss']
})
export class InputFormComponent<T> implements OnDestroy {
  private _inputFields: InputField[] = [];
  private _isEnabled = true;
  private clearingForm = false;
  private formChangeSubscriptions: Subscription[] = [];

  responseForm: FormGroup = new FormGroup({});
  submitButtonTooltipText = "";

  formFieldControlMapping: { [name: string]: { inputField: InputField, formControl: FormControl } } = {};

  @Input() buttonLabel = "Submit";
  @Input() isLoading = false;
  @Input() scrollable = true;

  @Input()
  set isEnabled(state: boolean) {
    this._isEnabled = state;

    if (state) {
      this.responseForm.enable();
      return;
    }

    this.responseForm.disable();
  }

  get isEnabled(): boolean {
    return this._isEnabled;
  }

  @Input()
  set inputFields(inputFields: InputField[]) {
    this._inputFields = inputFields;
    this.responseForm = new FormGroup({});

    for (const subscription of this.formChangeSubscriptions) {
      subscription.unsubscribe();
    }

    for (const item of inputFields) {
      const formControl = new FormControl({ value: item.defaultValue, disabled: item.disabled ?? false }, item.validators)
      this.formFieldControlMapping[item.name] = {
        inputField: item,
        formControl: formControl
      }

      this.responseForm.addControl(item.name, formControl);
    }

    this.formChangeSubscriptions = this.onFormUpdate();
    this.setSubmitButtonTooltipText();
  }

  get inputFields() {
    return this._inputFields;
  }

  @Output() isLoadingChange = new EventEmitter<boolean>();
  @Output() responseChange = new EventEmitter<T>();
  @Output() responseClear = new EventEmitter<void>();
  @Output() submittedResponse = new EventEmitter<T>();

  ngOnDestroy(): void {
    for (const subscription of this.formChangeSubscriptions) {
      subscription.unsubscribe();
    }
  }

  onSubmit() {
    this.responseForm.disable();
    this.isLoading = true;

    this.submittedResponse.emit(this.responseForm.value);
  }

  onFormUpdate(): Subscription[] {
    const subscriptions = [];

    subscriptions.push(this.responseForm.valueChanges.subscribe(value => {
      if (!this.clearingForm) {
        this.responseChange.emit(value);
      }
    }));

    subscriptions.push(this.responseForm.statusChanges.subscribe(() => {
      this.setSubmitButtonTooltipText();
    }));

    return subscriptions;
  }

  restoreForm(formValues: T): void {
    this.responseForm.patchValue(formValues);
    this.responseForm.markAsPristine();
    this.submitButtonTooltipText = 'No changes were made to any input fields.';
  }

  clearForm(): void {
    // Do not emit responseChange event when form is cleared.
    // Emit responseClear event instead.
    this.clearingForm = true;

    this.responseForm.reset();

    // Reset to default values.
    for (const field of this.inputFields) {
      this.responseForm.controls[field.name].setValue(field.defaultValue);
    }

    this.clearingForm = false;

    this.responseClear.emit();
  }

  setSubmitButtonTooltipText() {
    // This tooltip shows the name of input fields that are invalid. Find the names of invalid controls.
    const invalidList: string[] = [];
    const formControls = this.responseForm.controls;

    for (const control in formControls) {
      if (formControls[control].invalid) {
        const inputField = this._inputFields.find(e => e.name === control);

        if (!inputField) {
          invalidList.push(control);
          continue;
        }

        invalidList.push(inputField.displayName);
      }
    }

    if (invalidList.length > 0) {
      this.submitButtonTooltipText = `Form is incomplete or error(s) exist. Please check the following fields:\n ${invalidList.toString().replace(/,/g, ", ")}`;
      return;
    }

    this.submitButtonTooltipText = "";
  }
}
