import { InputField } from "./input-field";

export class TextBox extends InputField {
  protected type = 'textBox';

  numRowsToShow!: number;
}
