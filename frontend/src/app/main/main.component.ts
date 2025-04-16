import { Component, HostListener } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    HeaderComponent,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {
  constructor(private router: Router){};

  activeSection: string | null = 'home';

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

  goToKiwify(){
    window.open('https://dashboard.kiwify.com.br/login')
  }
}
