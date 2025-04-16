import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-workspace-home',
  standalone: true,
  imports: [MatProgressSpinnerModule, CommonModule],
  templateUrl: './workspace-home.component.html',
  styleUrl: './workspace-home.component.css',
})
export class WorkspaceHomeComponent implements OnInit {
  name: string | null = '';

  contentLoaded: boolean = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.auth.userLogginSource$.subscribe((res) => {
      if (res) {
        this.contentLoaded = true;

        this.name = this.auth.getUsername();
      } else {
        this.contentLoaded = false;
      }
    });
  }

  goToMep() {
    this.router.navigate(['/workspace/mep']);
  }

  goToClasses() {
    window.open('https://dashboard.kiwify.com.br/login');
  }
}
