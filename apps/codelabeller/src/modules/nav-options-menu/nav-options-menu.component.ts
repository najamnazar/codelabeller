import { Component, Input, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';

@Component({
  selector: 'codelabeller-nav-options-menu',
  templateUrl: './nav-options-menu.component.html',
  styleUrls: ['./nav-options-menu.component.scss']
})
export class NavOptionsMenuComponent {
  @ViewChild(Menu) menu!: Menu;

  private _showAdmin = false;

  @Input()
  get showAdmin() {
    return this._showAdmin;
  }

  set showAdmin(adminStatus: boolean) {
    this._showAdmin = adminStatus;

    this.menuItems = this.getMenuItems();
  }

  menuItems: MenuItem[] = this.getMenuItems();

  toggle(event: Event) {
    // Toggle can be used to both show and hide the menu, so refresh menu items only when the menu is being toggled to show.
    if (!this.menu?.visible) {
      this.menuItems = this.getMenuItems();
    }

    this.menu.toggle(event);
  }

  getMenuItems(): MenuItem[] {
    return [
      {
        label: 'Admin Panel',
        icon: 'menu-icon fas fa-flask',
        routerLink: '/admin-panel',
        visible: this._showAdmin
      },
      {
        separator: true,
        visible: this._showAdmin
      },
      {
        label: 'Home',
        icon: 'menu-icon fa fa-home',
        routerLink: '/home'
      },
      {
        label: 'My Responses',
        icon: 'menu-icon fa fa-tasks',
        routerLink: '/my-responses'
      },
      {
        label: 'Settings',
        icon: 'menu-icon fa fa-tools',
        routerLink: '/settings'
      },
      {
        separator: true
      },
      {
        label: 'Logout',
        icon: 'menu-icon fas fa-sign-out-alt',
        routerLink: '/logout'
      },
    ];
  }
}
