import { Component, HostListener, OnInit, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav'
import { CustomSidenavComponent } from '../custom-sidenav/custom-sidenav.component';
import { Signal } from '@angular/core';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconButton,
    MatIconModule,
    MatSidenavModule,
    CustomSidenavComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent implements OnInit {
  
  collapsed = signal(true);

  sidenavWidth = computed(() => this.collapsed() ? '0px' : '150px');


  constructor(private router: Router){};

  activeSection: string | null = 'home';

  ngOnInit(): void {
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    this.detectVisibleSection();
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  detectVisibleSection() {
    const sections = document.querySelectorAll('section');
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i] as HTMLElement;
      const rect = section.getBoundingClientRect();
      if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
        this.activeSection = section.id;
        break;
      }
    }
  }

  isActive(sectionId: string): boolean {
    return this.activeSection === sectionId;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}