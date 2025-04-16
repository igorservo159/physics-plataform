import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { AuthService } from '../services/auth/auth.service';
import { MepCreationService } from '../services/mep-creation/mep-creation.service';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import {inject} from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarAction,
  MatSnackBarActions,
  MatSnackBarLabel,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
  selector: 'app-workspace-download',
  standalone: true,
  imports: [MatProgressSpinnerModule, CommonModule, HttpClientModule, MatFormFieldModule, FormsModule, MatInputModule, MatButtonModule],
  templateUrl: './workspace-download.component.html',
  styleUrl: './workspace-download.component.css',
  providers: [ MepCreationService,  ],
})

export class WorkspaceDownloadComponent implements OnInit{
  loadingMep: boolean = false;
  hasMep: boolean=false;

  contentLoaded:boolean=false;
  meps: any;

  durationInSeconds = 5;
  openSnackBar() {
    this._snackBar.openFromComponent(PizzaPartyAnnotatedComponent, {
      duration: this.durationInSeconds * 1000,
    });
  }

  constructor(private _snackBar: MatSnackBar, private mepCreation: MepCreationService, private auth : AuthService, private router: Router){

  }

  ngOnInit(): void {
    this.auth.userLogginSource$.subscribe(
      resAuth=>{
        if (resAuth){
          this.mepCreation.getUserMepsMinimal().then(
            next=>{
              next.subscribe({
                next: resIds => {
                  this.meps = resIds;
                  if(resIds.length != 0){
                    this.hasMep = true;
                  } else{
                    this.hasMep = false;
                  }
                  this.contentLoaded=true;
                  console.log(resIds);
                },
                error: ()=>{
                  window.location.reload();
                }
              });
            }
          ).catch(
            ()=>{
              window.location.reload();
            }
          )
        }else{
          this.contentLoaded=false;
        }    
      }
    );
  }

  downloadMep(mep: any){
    this.mepCreation.downloadMep(mep.fullMepReference);
    this.openSnackBar();
  }

  fazerMep(){
    this.router.navigate(['/workspace/mep']);
  }

}

@Component({
  selector: 'snack',
  templateUrl: './snack.html',
  styles: `
    :host {
      display: flex;
    }

    .example-pizza-party {
      color: hotpink;
    }
  `,
  standalone: true,
  imports: [MatButtonModule, MatSnackBarLabel, MatSnackBarActions, MatSnackBarAction],
})
class PizzaPartyAnnotatedComponent {
  snackBarRef = inject(MatSnackBarRef);
}