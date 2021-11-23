import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { UserProfile } from '../user-profile-button/user-profile.interface';

@Component({
  selector: 'codelabeller-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  @Input() title = 'CodeLabeller';
  @Input() showSideButton = true;
  @Input() buttonIcon = 'fa fa-bars';
  @Input() userProfile: UserProfile = {};

  @Output() sideButtonClick = new EventEmitter<unknown>();

  showAdmin = false;

  constructor(private authService: AuthService) {
    this.userProfile.name = this.authService.getUserDisplayName();
    this.userProfile.email = this.authService.getUserEmail();
    this.userProfile.profileImageSrc = this.authService.getUserProfileImageSrc();

    this.authService.isAdmin().then(adminState => {
      this.showAdmin = adminState;
    }).catch(() => {
      this.showAdmin = false;
    });
  }

  onSideButtonClick() {
    this.sideButtonClick.emit();
  }
}
