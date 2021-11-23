import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

export const OP_LOGIN = 'login';
export const OP_LOGOUT = 'logout';

@Component({
  selector: 'codelabeller-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {
    const operation = this.route.snapshot.data['operation'];

    operation === OP_LOGIN ? this.login() : this.logout();
  }

  private login() {
    // The user does not need to log in again if they have already logged in.
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
      return;
    }

    this.authService.login(() => {
      this.router.navigate(['/home']);
      return;
    });
  }

  private logout() {
    this.authService.logout();
    this.router.navigate(['/landing'], { state: { loggedOut: true } });
  }
}
