import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
  ],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.css',
})
export class WorkspaceComponent implements OnInit {
  constructor(private router: Router, private authService: AuthService) {}

  isMobile: boolean = false;

  ngOnInit(): void {
    if (window.innerWidth <= 480) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?: any) {
    if (window.innerWidth <= 480) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }

  //width:number = window.innerWidth;

  longBar: boolean = false;

  isActive(page: string) {
    let local: string[] = location.href.split('/');
    local = local.slice(-1);
    if (local[0] == page) {
      return true;
    }
    return false;
  }

  logout() {
    this.authService.logout();
  }
}
