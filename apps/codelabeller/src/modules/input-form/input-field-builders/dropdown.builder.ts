import { InputFieldBuilder } from "./input-field.builder";
import { Dropdown } from "../input-fields/dropdown";

export class DropdownBuilder extends InputFieldBuilder<DropdownBuilder, Dropdown> {
  private _dropdown = new Dropdown();

  protected getThis(): DropdownBuilder {
    return this;
  }

  getProduct(): Dropdown {
    return this._dropdown;
  }
  
  data(data: any[]): DropdownBuilder {
    this.getProduct().data = data;
    return this;
  }

  displayKey(displayKey: string): DropdownBuilder {
    this.getProduct().displayKey = displayKey;
    return this;
  }

  valueKey(valueKey: string): DropdownBuilder {
    this.getProduct().valueKey = valueKey;
    return this;
  }
}