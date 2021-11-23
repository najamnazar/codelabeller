import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../modules/auth/auth.service';
import { PageService } from '../../services/page/page.service';

@Component({
  selector: 'codelabeller-forbidden',
  templateUrl: './forbidden.component.html',
  styleUrls: ['./forbidden.component.scss']
})
export class ForbiddenComponent {
  logoutRequired = false;

  constructor(private authService: AuthService, private pageService: PageService, private router: Router) {
    this.pageService.setTitle('Forbidden');

    const navigation = this.router.getCurrentNavigation();
    if (navigation) {
      this.logoutRequired = navigation.extras.state?.logoutRequired;
    }

    if (this.logoutRequired) {
      this.authService.logout();
    }
  }
}
