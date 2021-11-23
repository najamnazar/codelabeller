import { InputField } from "./input-field";

export class Dropdown extends InputField {
  protected type = 'dropdown';

  data!: Record<string, unknown>[];
  displayKey!: string;
  valueKey!: string;
}