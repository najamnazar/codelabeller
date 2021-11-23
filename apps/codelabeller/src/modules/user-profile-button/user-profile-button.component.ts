import { Component, Input } from '@angular/core';
import { UserProfile } from './user-profile.interface';

@Component({
  selector: 'codelabeller-user-profile-button',
  templateUrl: './user-profile-button.component.html',
  styleUrls: ['./user-profile-button.component.scss']
})
export class UserProfileButtonComponent {
  @Input() userProfile!: UserProfile;
  @Input() displayTooltip = true;

  getTooltipText(): string {
    if (!this.displayTooltip) {
      return '';
    }

    return `${this.userProfile.name ?? ''}\n${this.userProfile.email ?? ''}`.trim();
  }
}
