import { Component, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { Helpers } from '../../../helpers';
import { environment } from "./../../../../environments/environment";
import { Router, NavigationStart } from '@angular/router';

declare let mLayout: any;
@Component({
    selector: "app-header-nav",
    templateUrl: "./header-nav.component.html",
    encapsulation: ViewEncapsulation.None,
})
export class HeaderNavComponent implements OnInit, AfterViewInit {
    public isEventSection: boolean = false;
    public isArtistSection: boolean = false;

    public currentUserStorageInformation: any;
    public currentUserInformation: { userId: number, fullName: string, email: string, profilePicture: string, user_type: number } = 
    { userId: null, fullName: "", email: "", profilePicture: "", user_type: 2 };

    //public getCurrentUserInformation: any = { "first_name" } 
     public environment: any;

    constructor(private _router: Router) {
        this.environment = environment;
    }

    ngOnInit() {
        this._router.events.subscribe((route) => {
            if (route instanceof NavigationStart) {
                this._markSection(route.url);
            }
        });
    }

    ngAfterViewInit() {
        this._markSection(this._router.url);
        mLayout.initHeader();
        this.currentUserStorageInformation = JSON.parse(localStorage.getItem('currentUser'));
        this.currentUserInformation.userId = this.currentUserStorageInformation.id;
        this.currentUserInformation.fullName = this.currentUserStorageInformation.first_name + " " + this.currentUserStorageInformation.last_name;
        this.currentUserInformation.email = this.currentUserStorageInformation.email;
        this.currentUserInformation.profilePicture = this.currentUserStorageInformation.profile_pic;
        this.currentUserInformation.user_type = this.currentUserStorageInformation.user_type;
        if(this.currentUserStorageInformation.profile_pic != null) {
            this.currentUserInformation.profilePicture = environment.graphicsBaseUrl + "user/" +  this.currentUserStorageInformation.profile_pic;
        } 

       

        //this.currentUserInformation.teamID = this.currentUserStorageInformation.team_members[0].team_id;
        
    }

    private _markSection(url: string) {
        if (url.indexOf("/events") >= 0 || url.indexOf("/event-summary") >= 0 || url.indexOf("/event-approval") >= 0 || url.indexOf("/event-public-survey") >= 0 || url.indexOf("/event-picks") >= 0) {
            this.isEventSection = true;
        } else {
            this.isEventSection = false;
        }

        if (url.indexOf("/artists") >= 0 || url.indexOf("/artist-details") >= 0 || url.indexOf("/about-artist") >= 0 || url.indexOf("/current-event") >= 0 || url.indexOf("/past-event") >= 0) {
            this.isArtistSection = true;
        } else {
            this.isArtistSection = false;
        }
    }

}