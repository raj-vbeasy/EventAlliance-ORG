import { Injectable } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import { Http, Response, RequestOptions, Headers } from "@angular/http";
import { Observable } from "rxjs";
import "rxjs/add/operator/map";
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthenticationService {
    constructor(private http: Http, private _router: Router ) {
    }


    public verify():Observable<boolean> {
        return Observable.create((observer) => {
            setTimeout(() => {
                let currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if(currentUser){
                   this.http.post(environment.apiBaseUrl + 'users/verify.json', {'userId': currentUser.id, 'userToken': currentUser.token}).subscribe((response: Response) => {
					 let data:any=response.json();
						//console.log(data);
						if(data.hasOwnProperty("status")){
							if(data["status"] == true){
								observer.next(true);
								observer.complete(true);
							}else{
								observer.next(false);
								observer.complete(false);
							}
						}						
				   });
                } else {
                    observer.next(false);
                    observer.complete(false);
                }
            }, 1000);
        });
    }

    public login(email: string, password: string) {
        let json = JSON.stringify({ email: email, password: password });
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        let options = new RequestOptions({ headers: headers });
        return this.http.post(environment.apiBaseUrl + 'users/userLogin.json', json, { headers: headers }).map((response: Response) => {
             let data:any=response.json();
             console.log(data);
             if(data.hasOwnProperty("status")){
                 if(data["status"] == true){
                     localStorage.setItem('currentUser', JSON.stringify(data.data));
                     return true;
                 }
             }
             return false;
         });
    
    }

	public forgetPassword(email:string){
                                
		return this.http.post(environment.apiBaseUrl + 'users/resetPassword.json', {'email': email}).map((response: Response) => {
            let data:any=response.json();
            console.log(data);
            if(data.hasOwnProperty("status")){
                 if(data["status"] == true){
                     return true;
                 }
            }
            return false;
         });              
       
    }
	
	public changePassword(user_id:number,password:string,security_key:string){
		return this.http.post(environment.apiBaseUrl + 'users/changePassword.json', {'user_id':user_id,'password':password,'security_key':security_key}).map((response: Response) => {
            let data:any=response.json();
            console.log(data);
            if(data.hasOwnProperty("status")){
                 if(data["status"] == true){
                     return true;
                 }
            }
            return false;
         });        
	}
	
    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
    }
}
