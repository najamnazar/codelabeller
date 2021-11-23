import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PageService } from '../../services/page/page.service';

@Component({
  selector: 'codelabeller-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {

  constructor(private messageService: MessageService, private pageService: PageService, private router: Router, private route: ActivatedRoute) {
    this.pageService.setTitle('Welcome');

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state?.loggedOut) {
      this.messageService.add({ severity: 'success', summary: 'Logout', detail: `You have successfully logged out.` });
    }
  }

  login() {
    this.router.navigate(['/login']);
  }
}
