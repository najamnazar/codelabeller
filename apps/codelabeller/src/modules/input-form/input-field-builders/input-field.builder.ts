import { ValidatorFn, AbstractControlOptions } from "@angular/forms";
import { InputField } from "../input-fields/input-field";

export abstract class InputFieldBuilder<T extends InputFieldBuilder<T, U>, U extends InputField> {
  protected abstract getThis(): T;
  protected abstract getProduct(): U;

  name(name: string): T {
    this.getProduct().name = name;
    return this.getThis();
  }
  
  displayName(displayName: string): T {
    this.getProduct().displayName = displayName;
    return this.getThis();
  }

  defaultValue(defaultValue: any): T {
    this.getProduct().defaultValue = defaultValue;
    return this.getThis();
  }

  prompt(prompt: string): T {
    this.getProduct().prompt = prompt;
    return this.getThis();
  }

  required(required: boolean): T {
    this.getProduct().required = required;
    return this.getThis();
  }

  disabled(disabled: boolean): T {
    this.getProduct().disabled = disabled;
    return this.getThis();
  }

  validators(validators: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null): T {
    this.getProduct().validators = validators;
    return this.getThis();
  }

  build(): U {
    return this.getProduct();
  }
}
