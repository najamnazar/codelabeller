import { Component } from '@angular/core';

@Component({
  selector: 'codelabeller-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent {
  visible = false;

  show() {
    this.visible = true;
  }
}
