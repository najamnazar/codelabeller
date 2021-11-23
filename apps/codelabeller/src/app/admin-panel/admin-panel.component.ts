import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../modules/auth/auth.service';
import { NavigationComponent } from '../../modules/navigation/navigation.component';
import { PageService } from '../../services/page/page.service';

@Component({
  selector: 'codelabeller-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent {
  @ViewChild(NavigationComponent) navigationComponent !: NavigationComponent;

  private _sideNavVisible = true;
  currentRoute = '/';

  constructor(public authService: AuthService, private pageService: PageService, private route: ActivatedRoute) {
    this.pageService.setTitle('Admin Panel');
    this.currentRoute = this.route.snapshot.data['route'];
  }

  toggleSideNav() {
    this._sideNavVisible = !this._sideNavVisible;
    if (this._sideNavVisible) {
      this.navigationComponent.showSideNav();
    } else {
      this.navigationComponent.hideSideNav();
    }
  }
}
