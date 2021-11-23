import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'codelabeller-admin-sidenav',
  templateUrl: './admin-sidenav.component.html',
  styleUrls: ['./admin-sidenav.component.scss']
})
export class AdminSidenavComponent implements OnInit {
  items: MenuItem[] = [];

  ngOnInit() {
    this.items = [
      {
        label: 'Admin Home',
        icon: 'fas fa-flask',
        routerLink: '/admin-panel'
      },
      {
        separator: true,
        visible: true
      },
      {
        label: 'Users',
        icon: 'fas fa-users-cog',
        routerLink: '/admin-panel/users'
      },
      {
        label: 'Design Patterns',
        icon: 'fas fa-drafting-compass',
        routerLink: '/admin-panel/design-patterns'
      },
      {
        label: 'Projects',
        icon: 'fas fa-project-diagram',
        routerLink: '/admin-panel/projects'
      },
      {
        label: 'All Responses',
        icon: 'fas fa-poll-h',
        routerLink: '/admin-panel/all-responses'
      },
      {
        separator: true,
        visible: true
      },
      {
        label: 'File Upload Jobs',
        icon: 'fas fa-upload',
        routerLink: '/admin-panel/upload-jobs'
      },
      {
        label: 'Settings',
        icon: 'fas fa-cog',
        routerLink: '/admin-panel/settings'
      }
    ];
  }
}
