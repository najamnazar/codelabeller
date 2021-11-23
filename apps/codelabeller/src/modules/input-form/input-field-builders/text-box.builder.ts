import { InputFieldBuilder } from "./input-field.builder";
import { TextBox } from "../input-fields/text-box";

export class TextBoxBuilder extends InputFieldBuilder<TextBoxBuilder, TextBox> {
  private _textBox = new TextBox();

  protected getThis(): TextBoxBuilder {
    return this;
  }

  getProduct(): TextBox {
    return this._textBox;
  }
  
  numRowsToShow(numRowsToShow: number): TextBoxBuilder {
    this.getProduct().numRowsToShow = numRowsToShow;
    return this;
  }
}