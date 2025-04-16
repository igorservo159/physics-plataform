import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list'
import { MatIconModule } from '@angular/material/icon';

export type MenuItem = {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-custom-sidenav',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule
  ],
  templateUrl: './custom-sidenav.component.html',
  styleUrl: './custom-sidenav.component.css'
})
export class CustomSidenavComponent {
  menuItems  = signal<MenuItem[]>([
    {
      icon: 'home',
      label: 'Home',
      route:  'home',
    },
    {
      icon: 'calendar_today',
      label: 'Mep',
      route: 'mep',
    },
    {
      icon: 'perm_identity',
      label: 'Professor',
      route: 'professor',
    },
  ])

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

}