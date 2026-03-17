import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  templateUrl: './breadcrumbs.component.html',
  styleUrl: './breadcrumbs.component.css'
})
export class BreadcrumbsComponent implements OnInit {
breadcrumbs: Breadcrumb[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    // 1. Build breadcrumbs on initial load
    this.generateBreadcrumbs();

    // 2. Rebuild breadcrumbs whenever the URL changes
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
