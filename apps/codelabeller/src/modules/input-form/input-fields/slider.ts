import { InputField } from "./input-field";

export class Slider extends InputField {
  protected type = 'slider';

  minValue!: number;
  maxValue!: number;
  increment!: number;
}
