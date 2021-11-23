import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { NavigationStart, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class PageService {

  navigatedUrl$ = new BehaviorSubject<string | null>(null);

  public constructor(private titleService: Title, private router: Router, private location: Location) {
    // If lastPage has been set, it means the user exited the application temporarily to reauthenticate their session.
    // When they come back to the application, return them to the page which they were last at.
    const page = localStorage.getItem("lastPage");

    if (page) {
      localStorage.removeItem("lastPage");
      this.router.navigate([page]);
    }

    router.events.pipe(
      filter((e: any) => e instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        if (event.navigationTrigger === 'popstate') {
          // User pressed browser back/forward buttons.
          this.navigatedUrl$.next(event.url)
        }
      });
  }

  setTitle(prefix?: string): void {
    let title = `CodeLabeller`;

    if (prefix) {
      title = `${prefix} | ${title}`;
    }

    this.titleService.setTitle(title);
  }

  navigateToPage(newPath: string) {
    // Only navigate if the new path is not the same as the path of the current page.
    if (this.location.path() != newPath) {
      this.location.go(newPath);
    }
  }
}
