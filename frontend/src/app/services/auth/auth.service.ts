import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import "firebase/compat/auth";
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth:firebase.auth.Auth;

  private userLogged:boolean=false;

  private uToken: string | null = null;

  private userLogginSource = new BehaviorSubject<boolean>(false);

  private userId = new BehaviorSubject<string | undefined>(undefined);

  userLogginSource$ = this.userLogginSource.asObservable();
  userId$ = this.userId.asObservable();



  constructor(private router: Router) {
    firebase.initializeApp(environment.firebase);
    this.auth = firebase.auth();

    this.updateToken();

    this.auth.onAuthStateChanged((user)=>{
      if(user){
        this.userLogginSource.next(true);  
        this.userId.next(this.auth.currentUser?.uid);
        this.userLogged=true;
        this.updateToken();
      }else{
        this.userLogged=false;
        this.router.navigate(['/login']);
      }
    })
    
  }  

  createUser(email:string, password: string, name: string = "Fulano"){
    this.auth.createUserWithEmailAndPassword(email, password)
      .then(() => {
        this.auth.currentUser?.updateProfile({displayName:name, photoURL:""}
        ).then((res)=>{
          console.log("User criado.")
        })
      })
      .catch((error) => {
        console.log(error)
      });
  }

  login(email:string, password:string){
    return this.auth.signInWithEmailAndPassword(email, password);
      
  }   
  
  updateToken(){
    this.auth.currentUser?.getIdToken().then(res=>{
      this.uToken=res;
    })
  }

  reauthenticationLogin(current_password:any){
    let email= this.auth.currentUser?.email
    if (email!=undefined && email!=null){
      const credential = firebase.auth.EmailAuthProvider.credential(email, current_password);
      return this.auth.currentUser?.reauthenticateWithCredential(credential)
    }else{
      return false
    }    
  }

  getUsername():string | null{
    const userName = this.auth.currentUser?.displayName;

    if(userName){
      return userName;
    }else{
      return null
    }
  }

  updateUsername(newName:string){
    return this.auth.currentUser?.updateProfile({displayName:newName, photoURL:""})
  }

  getEmail():string | null{
    const email = this.auth.currentUser?.email;

    if(email){
      return email;
    }else{
      return null;
    }

  }

  getCurrentToken():string | null{
    return this.uToken;
  }

  setCurrentToken(tk: string){
    this.uToken=tk;
  }

  reloadToken(): Promise<string> | undefined{
    return this.auth.currentUser?.getIdToken()
  }

  updateUserPassword(newPassword:string){
    return this.auth.currentUser?.updatePassword(newPassword);
  }

  logout(){
    this.auth.signOut()
    .then(()=>{
      this.userLogginSource.next(false);
      this.userId.next(undefined);
      console.log("Usuário deslogado.")

      this.router.navigate(['/login']);
      
    })
    .catch((err)=>{
      console.log(err);
    })
  }
}
