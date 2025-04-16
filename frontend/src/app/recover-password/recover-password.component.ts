import { Component, Input, OnInit } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,],
  templateUrl: './recover-password.component.html',
  styleUrl: './recover-password.component.css',
})
export class RecoverPasswordComponent implements OnInit {
  @Input () recoverBtn:any;

  recoverBtnValue!:boolean;

  private auth: firebase.auth.Auth;

  constructor() {

    firebase.initializeApp(environment.firebase);
    this.auth = firebase.auth();
  }

  ngOnInit(): void {
    this.recoverBtn.subscribe(
      (res:any)=>{
        this.recoverBtnValue=res;
      }
    )
  }

  getEmail(): string {
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const emailValue = emailInput.value;
    return emailValue;
  }

  recoverPassword(event: Event) {
    event.preventDefault();
    const email: string = this.getEmail();
    const answer: boolean = confirm(
      `Você deseja enviar um email de recuperação de senha para ${email}?`
    );
    if (answer) {
      this.auth
        .sendPasswordResetEmail(email)
        .then(() => {
          alert('Email enviado com sucesso');
        })
        .catch((error) => {
          alert(error);
        });
    }
  }

  recoverBtnClick(){
    this.recoverBtn.next(false);
  }
}
