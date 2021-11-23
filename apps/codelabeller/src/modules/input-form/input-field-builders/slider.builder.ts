import { InputFieldBuilder } from "./input-field.builder";
import { Slider } from "../input-fields/slider";

export class SliderBuilder extends InputFieldBuilder<SliderBuilder, Slider> {
  private _slider = new Slider();

  protected getThis(): SliderBuilder {
    return this;
  }

  getProduct(): Slider {
    return this._slider;
  }
  
  minValue(minValue: number): SliderBuilder {
    this.getProduct().minValue = minValue;
    return this;
  }

  maxValue(maxValue: number): SliderBuilder {
    this.getProduct().maxValue = maxValue;
    return this;
  }

  increment(increment: number): SliderBuilder {
    this.getProduct().increment = increment;
    return this;
  }
}