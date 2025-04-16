import { Component, OnInit, Inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import {MatDialogModule} from '@angular/material/dialog'; 
import {MatButtonModule} from '@angular/material/button';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-workspace-profile',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, FormsModule,
     ReactiveFormsModule, MatProgressSpinnerModule, CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './workspace-profile.component.html',
  styleUrl: './workspace-profile.component.css'
})
export class WorkspaceProfileComponent implements OnInit{

  
  name : string | null='';

  inputName !: string | null;

  email : string | null='';

  inputs!: FormGroup;
  
  btnDisabled:boolean=true;

  contentLoaded:boolean=false;

  loadingChanges: boolean=false;

  constructor(private auth: AuthService, private formBuilder: FormBuilder, public dialog : MatDialog, private _snackBar: MatSnackBar){}

  ngOnInit(): void {

    this.auth.userLogginSource$.subscribe(
      res=>{
        if (res){
          this.contentLoaded=true;

          this.name = this.auth.getUsername();
          this.inputName=this.name;
          this.email = this.auth.getEmail();

          this.inputs = this.formBuilder.group({
            name:[this.name],
            curso:['one']
          })

        }else{
          this.contentLoaded=false;
        }    
      }
    ) 
    
  }
  

  isDirtyAndNotNull(){
    return this.inputs.get('name')?.dirty && this.inputs.get('name')?.value!=="";
  }

  changeUsername(){
    this.loadingChanges=true;
    this.auth.updateUsername(this.inputs.get('name')?.value)
    ?.then((res)=>{
      this.openNameChangeSnackBar();
      this.name = this.auth.getUsername();

    }).catch((err)=>{
      this.openErrorSnackBar();
    }).finally(()=>{
      this.loadingChanges=false;
    })
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(PasswordDialog, {
      data: {newPassword: "", newPasswordConfirmation:""},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Cancel');
    });
  }

  openNameChangeSnackBar() {
    this._snackBar.openFromComponent(NameChangedSnack, {
      duration: 5000,
    });
  }

  openErrorSnackBar() {
    this._snackBar.openFromComponent(PasswordError, {
      duration: 5000,
    });
  }

}

@Component({
  selector: 'password-dialog',
  templateUrl: 'password-dialog.html',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
})
export class PasswordDialog {
  constructor(
    public dialogRef: MatDialogRef<PasswordDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {newPassword:string, newPasswordConfirmation:string, currentPassword:string},
    private auth: AuthService,
    private _snackBar: MatSnackBar
  ) {}
  
  isPasswordValid() {
    return (
      this.data.newPassword.length>=8 && this.data.newPassword==this.data.newPasswordConfirmation
    );
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  openPasswordChangeSnackBar() {
    this._snackBar.openFromComponent(PasswordSnack, {
      duration: 5000,
    });
  }

  openPasswordChangeError(){
    this._snackBar.openFromComponent(PasswordError, {
      duration: 5000,
    });
  }

  openWrongPasswordError(){
    this._snackBar.openFromComponent(WrongPasswordError, {
      duration: 5000,
    });
  }

  onChangePasswordClick(): void{
    let validation = this.auth.reauthenticationLogin(this.data.currentPassword)    
    if (validation!=false && validation!==undefined){
      validation.then(
        (res)=>{
          this.auth.updateUserPassword(this.data.newPassword)
          ?.then((res)=>{
            this.openPasswordChangeSnackBar()
            this.dialogRef.close();
            this.auth.updateToken();
          }).catch(
            (err)=>{
              this.openPasswordChangeError();
            }
          )
        }
      ).catch(
        (err)=>{
          this.openWrongPasswordError();
        }
      )
    }    
  }
}

@Component({
  selector: 'password-snack',
  template: '<span class="password-snack">Seu nome foi alterado.</span>',
  styles: `
    .password-snack {
      color: white;
    }
  `,
  standalone: true,
})
export class NameChangedSnack {}

@Component({
  selector: 'password-snack',
  template: '<span class="password-snack">Senha alterada.</span>',
  styles: `
    .password-snack {
      color: white;
    }
  `,
  standalone: true,
})
export class PasswordSnack {}

@Component({
  selector: 'password-snack',
  template: '<span class="password-snack">Ocorreu um erro.</span>',
  styles: `
    .password-snack {
      color: white;
    }
  `,
  standalone: true,
})
export class PasswordError {}

@Component({
  selector: 'password-snack',
  template: '<span class="password-snack">Sua senha está incorreta.</span>',
  styles: `
    .password-snack {
      color: white;
    }
  `,
  standalone: true,
})
export class WrongPasswordError {}


