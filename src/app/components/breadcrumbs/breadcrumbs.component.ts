import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
    selector: 'app-breadcrumbs',
    imports: [RouterModule, MatButtonModule, MatIconModule],
    templateUrl: './breadcrumbs.component.html',
    styleUrl: './breadcrumbs.component.scss'
})
export class BreadcrumbsComponent implements OnInit {
breadcrumbs: Breadcrumb[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    // Build breadcrumbs on initial load
    this.generateBreadcrumbs();

    // Rebuild breadcrumbs whenever the URL changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.generateBreadcrumbs();
    });
  }

  private generateBreadcrumbs() {
    // Strip out query parameters if any exist (e.g., ?sort=asc)
    const path = this.router.url.split('?')[0]; 
    
    // Split the URL by '/' and remove empty segments
    const segments = path.split('/').filter(segment => segment !== '');
    
    let currentUrl = '';
    this.breadcrumbs = segments.map(segment => {
      currentUrl += `/${segment}`;
      return {
        label: decodeURIComponent(segment),
        url: currentUrl
      };
    });
  }
}
