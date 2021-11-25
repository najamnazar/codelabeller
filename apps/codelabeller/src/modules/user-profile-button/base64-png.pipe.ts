import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Pipe({
  name: "Base64Png"
})
export class Base64PngPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(value: any, ...args: any[]): any {
    if (value) {
      // Allow Base64 encoded data to be shown as an image instead of being blocked by XSS sanitisation.
      // Other data will not be allowed to bypass XSS sanitisation using this pipe.
      if (!value.startsWith('data:image/png;base64')) {
        return value;
      }

      return (this.sanitizer.bypassSecurityTrustResourceUrl(value));
    }

    return null;
  }
}
