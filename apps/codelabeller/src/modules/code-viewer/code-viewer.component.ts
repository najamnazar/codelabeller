import { Component, Input } from '@angular/core';
import { SourceFile } from './source-file.interface';

@Component({
  selector: 'codelabeller-code-viewer',
  templateUrl: './code-viewer.component.html',
  styleUrls: ['./code-viewer.component.scss']
})
export class CodeViewerComponent {
  @Input() sourceFile!: SourceFile | undefined;
}
