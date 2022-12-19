import { Component, OnInit, ViewEncapsulation, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";
import { FileUploader } from '../../../../_services/fileuploader.service';
import { environment } from '../../../../../environments/environment';
import { WSResponse } from "../../../../ws-response";
import "rxjs/add/operator/map";

import { Helpers } from '../../../../helpers';
import { UserService } from '../users/users.service';
import { Users } from "../users/users";

import { Title } from "@angular/platform-browser";

import * as $ from "jquery";


declare var jQuery: any;


@Component({
    selector: "app-profile",
    templateUrl: "./profile.component.html",
    encapsulation: ViewEncapsulation.None,
    providers: [UserService, FileUploader]
})
export class ProfileComponent implements OnInit, AfterViewInit {
	 @ViewChild('profileImage') profileImage: ElementRef;

	public formData: Users;
    public newPassword: string = "";
    public confirmPassword: string = "";


    constructor(private _uploaderService:FileUploader, private _httpClient: HttpClient, private _userService: UserService, private _titleService: Title ) {
    	this.formData = new Users();
    }
    ngOnInit() {
        this._titleService.setTitle('User Profile - Event Alliance');
    }
    ngAfterViewInit() {
    	 let currentUser  = JSON.parse(localStorage.getItem('currentUser'));    	
    	 this.formData.id = currentUser.id;
    	 this._getUserDetailsById(this.formData.id);
    }

    private _getUserDetailsById(userId: number) {
       this._userService.getUserById(userId).subscribe((data: any) => {
                Helpers.setLoading(false);
                //this.userDetails = data.user.first_name;
                
                this.formData.first_name = data.user.first_name;
				this.formData.last_name = data.user.last_name;
				this.formData.phone_no = data.user.phone_no;
				//this.formData.password = data.user.password;
				this.formData.email = data.user.email;
				this.formData.profile_pic = data.user.profile_pic;    
                if(this.formData.profile_pic != null){
                    this.formData.profile_pic = environment.graphicsBaseUrl + "user/" + this.formData.profile_pic;
                }            

        }, (err) => {
            Helpers.setLoading(false);
            //TODO: Error handling
        });
        
    }

    public profileImgClick(){
        let el: HTMLElement = this.profileImage.nativeElement as HTMLElement;
        el.click();
    }

    public onProfileImageChange(event:any){
        var target = event.hasOwnProperty("srcElement") ? event.srcElement : event.target;
        let file = target.files;
        this._uploaderService.upload (environment.fileUploadUrl, file).subscribe((response:any) => {
            target.value = "";
            if(response.hasOwnProperty("status")){
                if(response.status === true){
                    this.formData.temp_photo_id = response.data.id;
                    this.formData.profile_pic = response.data.fileUrl; //response.data.fileName holds the basee fileName
                }
            }
        }, (error:any) => {
            console.log(error);
            target.value = "";
        });
    }

    public updateUser(): void {
        Helpers.setLoading(true);
        
        if((this.newPassword != "" || this.confirmPassword != "") && (this.newPassword != this.confirmPassword)) {
        	alert("Passwords do not match");
        	Helpers.setLoading(false);
        } else {       
	        if (this.formData.id > 0) {
	        	if(this.newPassword != ""){
                    this.formData.password = this.newPassword;
                }
	            // If we are in edit mode, call the updateUser API *
	            this._userService.updateUser(this.formData).subscribe((response: WSResponse) => {
	                Helpers.setLoading(false);
	                if (response.status === true) {
                        alert("Profile information has been updated successfully");
                        
	                } else {
	                    //TODO: Show failure alert
	                }
	            }, (err) => {
	                console.error(err);
	                Helpers.setLoading(false);
	                //TODO: Error handling
	            });
	        }
    	}
    }

}