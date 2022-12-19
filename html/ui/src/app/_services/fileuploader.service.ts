import { Injectable, ErrorHandler } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';


@Injectable()
export class FileUploader {

    private _observer: any;

    constructor(private http: HttpClient) {
    }

    public upload (url: string, files: File[], postData: any = null) : Observable<any> {
      let formData:FormData = new FormData();
      let currentUser  = JSON.parse(localStorage.getItem('currentUser')); 
      formData.append('curUser', currentUser.id);
      formData.append('files', files[0], files[0].name);
      // For multiple files
      // for (let i = 0; i < files.length; i++) {
      //     formData.append(`files[]`, files[i], files[i].name);
      // }

      if(postData !=="" && postData !== undefined && postData !==null){
        for (var property in postData) {
            if (postData.hasOwnProperty(property)) {
                formData.append(property, postData[property]);
            }
        }
      }

      return this.http.post(url, formData);
    }

}