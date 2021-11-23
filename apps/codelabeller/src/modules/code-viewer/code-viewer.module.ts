import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeViewerComponent } from './code-viewer.component';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { ScrollPanelModule } from 'primeng/scrollpanel';

@NgModule({
  declarations: [
    CodeViewerComponent
  ],
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    DividerModule,
    ScrollPanelModule,
    HighlightModule
  ],
  providers: [
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore -- fix issue with declaration file not found.
        lineNumbersLoader: () => import('highlightjs-line-numbers.js'),
        languages: {
          java: () => import('highlight.js/lib/languages/java'),
        }
      }
    }
  ],
  exports: [
    CodeViewerComponent
  ]
})
export class CodeViewerModule { }
