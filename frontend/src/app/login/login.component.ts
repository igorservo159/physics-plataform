import { Component } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  FormGroup,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../services/auth/auth.service';
import { RecoverPasswordComponent } from '../recover-password/recover-password.component';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RecoverPasswordComponent,
    CommonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  hide = true;

  recoverBtnHtml: boolean = false;
  recoverBtn = new BehaviorSubject<boolean>(false);

  loginUser!: FormGroup;

  loggingIn:boolean=false;

  constructor(
    private router: Router,
    private _formBuilder: FormBuilder,
    private auth: AuthService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.recoverBtn.subscribe(
      res=>{
        this.recoverBtnHtml=res;
      }
    )

    this.recoverBtn.next(false);
    this.loginUser = this._formBuilder.group({
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });

    this.auth.userLogginSource$.subscribe({
      next: isLogged=>{
        if (isLogged){
          this.router.navigate(['/workspace/home']);
          this.openLoggedSnack();
        }
      }
    })
  }

  login() {
    this.loggingIn = true; 
    this.auth.login(
      this.loginUser.get('email')?.value,
      this.loginUser.get('password')?.value
    )
    .then((res)=>{
      this.auth.updateToken();
      this.router.navigate(['/workspace/home']) 
      this.openLoggedSnack();
    })
    .catch((error)=>{
      console.log(error);
      this.loggingIn = false; 
      this.openLoginErrorSnack();
    })
  }

  recoverPassword() {
    this.recoverBtn.next(true);
  }
  
  goToCore(): void {
    this.router.navigate(['/']);
  }

  openLoggedSnack() {
    this._snackBar.openFromComponent(LoggedSnack, {
      duration: 5000,
    });
  }

  openLoginErrorSnack() {
    this._snackBar.openFromComponent(LoginErrorSnack, {
      duration: 5000,
    });
  }
}

@Component({
  selector: 'password-snack',
  template: '<span class="password-snack">Login efetuado!</span>',
  styles: `
    .password-snack {
      color: white;
    }
  `,
  standalone: true,
})
export class LoggedSnack {}

@Component({
  selector: 'password-snack',
  template: '<span class="password-snack">Senha ou usuário inválidos.</span>',
  styles: `
    .password-snack {
      color: white;
    }
  `,
  standalone: true,
})
export class LoginErrorSnack {}