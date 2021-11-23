import { ValidatorFn, AbstractControlOptions } from "@angular/forms";

export abstract class InputField {
  protected type = '';

  name!: string;
  displayName!: string;
  prompt!: string;
  defaultValue!: any;
  required!: boolean;
  disabled!: boolean;
  validators!: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null

  getType() {
    return this.type;
  }
}