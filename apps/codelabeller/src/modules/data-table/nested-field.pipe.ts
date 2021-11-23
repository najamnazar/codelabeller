import { Pipe, PipeTransform } from "@angular/core";
import { TableColumn } from "./table-column.interface";

@Pipe({
  name: "nestedField"
})
export class NestedFieldPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    const column: TableColumn = args[0];
    const defaultValue = args[1] ?? null;

    const nestings = column.field.split(".");

    let result = value;
    let traversals = 0;

    nestings.forEach((f: string) => {
      if (result[f] != null) { // Need to explicitly check if null or defined, as some values such as numeric 0 might cause issues.
        result = result[f]
        traversals++;
      }
    });

    if (traversals != nestings.length) {
      // If full traversal is not possible, that means the property does not exist. Hence, return the default value.
      return defaultValue;
    }

    return result;
  }
}
