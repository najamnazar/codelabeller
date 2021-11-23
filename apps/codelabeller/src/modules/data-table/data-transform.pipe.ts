import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "dataTransform"
})
export class DataTransformPipe implements PipeTransform {
  transform(value: any, ...args: any[]): string {
    const transformationFunction: (x: any) => string = args[0];

    if (transformationFunction != null) {
      return transformationFunction(value);
    }

    return value;
  }
}
