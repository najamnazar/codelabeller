import { Component, Input, TemplateRef } from '@angular/core';
import { ResizeEvent } from 'angular-resizable-element';

@Component({
  selector: 'codelabeller-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  @Input() toolbar!: TemplateRef<any>;
  @Input() sideNav!: TemplateRef<any>;

  @Input() minSideNavWidth = 300;
  @Input() maxSideNavWidth = 1200;

  sideNavVisible = true;
  sideNavWidth = '300px';

  private lastVisibleSideNavWidth = this.sideNavWidth;

  hideSideNav() {
    this.sideNavVisible = false;

    this.lastVisibleSideNavWidth = this.sideNavWidth;
    this.sideNavWidth = "0px";
  }

  showSideNav() {
    this.sideNavVisible = true;

    this.sideNavWidth = this.lastVisibleSideNavWidth;
  }

  onResizing(event: ResizeEvent): void {
    if (event.rectangle.right <= this.minSideNavWidth || event.rectangle.right >= this.maxSideNavWidth) {
      return;
    }

    this.sideNavWidth = `${event.rectangle.right}px`;
  }
}
