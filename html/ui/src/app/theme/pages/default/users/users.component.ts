import { Component,Input, Output, OnInit, ViewEncapsulation, AfterViewInit, ViewChild, ElementRef, EventEmitter, } from '@angular/core';
import { Helpers } from '../../../../helpers';
import { ScriptLoaderService } from '../../../../_services/script-loader.service';

import { UserService } from './users.service';
import { UsersDataTable } from './users.datatable';
import { Users } from './users';
import { WSResponse } from "../../../../ws-response";
import { EventService } from "../events/events.service";
import { FileUploader } from '../../../../_services/fileuploader.service';
import { environment } from "../../../../../environments/environment";

import { TeamService } from "../teams/teams.service";
import {Title} from "@angular/platform-browser";

declare var jQuery: any;

@Component({
    selector: "app-users",
    templateUrl: "./users.component.html",
    encapsulation: ViewEncapsulation.None,
    providers: [UserService, UsersDataTable, FileUploader, TeamService]
})
export class UsersComponent implements OnInit, AfterViewInit {
    @ViewChild('userImage') userImage: ElementRef;

    public formData: Users;
    public modalTitle: string;

    public allGenres: Array<any>;

    public search:{keyword: string, teamId: number} = {keyword: "", teamId: 0};

    public allTeams:Array<any> = [];

    public newPassword: string = "";
    public confirmPassword: string = "";
    public teamPhotoUrl: string = environment.graphicsBaseUrl;

    public currentUser = JSON.parse(localStorage.getItem('currentUser'));

    public selectedTeamId: number;
    public selectedTeamName: string;
    public selectedTeamRole:number;

    private cmdTeams: any;
    private teams: Array<any> = [];

    public selectedTeams: Array<any>;
    public teamListBlock: any;
    public saveButtonActive:boolean;

    constructor(private _teamService: TeamService, private _uploaderService:FileUploader, private _script: ScriptLoaderService, private _usersDataTable: UsersDataTable, private _userService: UserService, private _eventService: EventService, private _titleService: Title) {
        this.formData = new Users();
        this.saveButtonActive = false;
        console.log(this.teamPhotoUrl);
    }

     public userImgClick(){
        let el: HTMLElement = this.userImage.nativeElement as HTMLElement;
        el.click();
    }

    public onUserImageChange(event:any){
        //let file = event.srcElement.files;
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


    public TableClick($e: any) {
        var target = $e.target || $e.srcElement || $e.currentTarget;

        if (jQuery(target).hasClass("modal-activator")) {
            this._getUserDetails(jQuery(target).data("id"));
            $e.preventDefault();
        } else {
            var parent = jQuery(target).parent();
            if (parent.hasClass("modal-activator")) {
                this._getUserDetails(parent.data("id"));
                $e.preventDefault();
            }
        }

        // For Delete option
        if (jQuery(target).hasClass("btn-delete")) {            
            Helpers.setLoading(true);
            if (confirm("Do you want to remove this user?")) {
                this._userService.removeUser(jQuery(target).data("id")).subscribe((response: WSResponse) => {
                    Helpers.setLoading(false);
                    this._usersDataTable.redraw();
                },
                (err) => {
                    //TODO: Error handling
                });
            } else {
                Helpers.setLoading(false);
            } 
            $e.preventDefault();
        } else {
            //alert(parent.data("id"));
            var parent = jQuery(target).parent();
            if (parent.hasClass("btn-delete")) {
                Helpers.setLoading(true);
                if (confirm("Do you want to remove this user?")) {
                    this._userService.removeUser(parent.data("id")).subscribe((response: WSResponse) => {
                        Helpers.setLoading(false);
                        this._usersDataTable.redraw();
                    },
                    (err) => {
                        //TODO: Error handling
                    });
                } else {
                    Helpers.setLoading(false);
                } 
                $e.preventDefault();
            }
        }
    }

    ngOnInit() {
        this._titleService.setTitle('Users List - Event Alliance');
    }

    public searchUsers(){
        this._usersDataTable.search(this.search.keyword.trim() + "^" + this.search.teamId);
    }

    public resetUsersData() {
       this.search.keyword = '';
       this.search.teamId = 0;      
       this._usersDataTable.search('');
    }

    public openCreateUserModal() {
        this.formData.reset();
        this.modalTitle = "Create User";
        this.teamListBlock = 0;
        this.selectedTeams = [];
        jQuery("#editUser").modal("show");
        this.saveButtonActive = true;
    }

    public SaveUser(): void {
        Helpers.setLoading(true);
        this.saveButtonActive = false;

        this.formData.team_ids = [];
        var _selectedTeamMembers = jQuery("#teamsList").select2("data");
        for (var i = 0; i < _selectedTeamMembers.length; i++) {
            this.formData.team_ids.push(_selectedTeamMembers[i].id);
        };
                
        console.log(this.formData);
             
       
        if((this.newPassword != "" || this.confirmPassword != "") && (this.newPassword != this.confirmPassword)) {
            alert("Passwords do not match");
            Helpers.setLoading(false);
        } else { 
            if (this.formData.id > 0) {

                if(this.newPassword != ""){
                    this.formData.password = this.newPassword;
                }
                //* If we are in edit mode, call the updateUser API 
                this._userService.updateUser(this.formData).subscribe((response: WSResponse) => {
                    Helpers.setLoading(false);
                    if (response.status === true) {
                        //TODO: show success alert
                        jQuery("#editUser").modal("hide");
                        this._usersDataTable.redraw();
                    } else {
                        //TODO: Show failure alert
                        this.saveButtonActive = true;
                    }
                }, (err) => {
                    console.error(err);
                    Helpers.setLoading(false);
                    this.saveButtonActive = true;
                    //TODO: Error handling
                });
            } else {

                if(this.newPassword != ""){
                    this.formData.password = this.newPassword;
                }
                //* Else we are in add mode, call the createUser API 
                this._userService.createUser(this.formData).subscribe((response: WSResponse) => {
                    console.log(response);
                    Helpers.setLoading(false);
                    if (response.status === true) {
                        //* TODO: User has been crated. Show a success message and close the modal 
                        jQuery("#editUser").modal("hide");
                        this._usersDataTable.redraw();
                    }
                }, (err) => {
                    console.log(err);
                    Helpers.setLoading(false);
                });
            }
        }
    }

    private _getUserDetails(userId: number) {
        this.formData.reset();
        var i: number;
        var _userList: Array<Users> = this._userService.getUsersList();


        for (i = 0; i < _userList.length; i++) {            
            if (_userList[i].id == userId) {
                Object.assign(this.formData, _userList[i]);

                if(this.formData.profile_pic != null){
                    this.formData.profile_pic = environment.graphicsBaseUrl + "user/" + this.formData.profile_pic;
                }

                // Team list option Enable/Disable
                if(this.formData.user_type == null || this.formData.user_type == 0) {
                    this.teamListBlock = 0;
                } else {
                    this.teamListBlock = 1;
                }
                // End

                this.modalTitle = "Edit User: " + this.formData.first_name + " " + this.formData.last_name;
                this.saveButtonActive = true;
                //alert(this.formData.user_type);
                if(this.formData.user_type == 3) {           
                    jQuery("#teamsList").attr("multiple", "multiple");
                } else {
                    jQuery("#teamsList").removeAttr("multiple");
                }
                
                // Bind the Team data in select2 options
                let userTeamId = this.formData.teamList;
                this.selectedTeams = [];
                for (let d = 0; d < userTeamId.length; d++) {
                    this.selectedTeams.push(userTeamId[d].id);
                }
                // End Team
                jQuery("#teamsList").val(this.selectedTeams).trigger("change");
               /* if (this.formData.id > 0) {                
                    if(this.selectedTeams.length>0) {
                        jQuery("#teamsList").val(this.selectedTeams).trigger("change");
                    }
                } */



                
                jQuery("#editUser").modal("show");
                break;
            }
        }
        console.log(userId);
        jQuery("#editUser").modal("show");
    }

    ngAfterViewInit() {
        var user_id = 0;
        this.teamListBlock = 0
        let current_user  = JSON.parse(localStorage.getItem('currentUser')); 
        user_id = current_user.id;



        this._usersDataTable.load();
        //Initialize the bootstrap modals;
        jQuery("#editUser").modal({ show: false }).on("hidden.bs.modal", (e) => {

        });

        this._eventService.getAllTeams().subscribe((data) => {            
            var firstSelectElement: { id: number, name: string } = {id: 0, name: "-- All Teams --"};
            this.allTeams = data;
            this.allTeams.splice(0, 0, firstSelectElement);           
        }, (err) => {

        });


        this._script.loadScript("select2", "/assets/eventalliance/custom/components/forms/widgets/select2.js", true).then(() => {
            this._teamService.loadTeams(user_id).map((data:any) => {
                var transformedData = [];
                for (var i = 0; i < data.length; i++) {
                    transformedData.push({ id: data[i].id, text: data[i].name });
                }
                return transformedData;
            }).subscribe(
                (data:any) => {
                    this.teams = data;
                    this.cmdTeams = jQuery("#teamsList").select2({data:this.teams}).on("select2:select", (e: any) => {
                        this.selectedTeamId = e.params.data.id;
                        this.selectedTeamName = e.params.data.text;
                    });
                }
            );
        });
    }

    public roleChange(event) {
        console.log(this.selectedTeams);
        //console.log(this.modalTitle);
        let roleId = event.target.value;
        
        if(roleId == 3) {
                       
            jQuery("#teamsList").attr("multiple", "multiple");
        } else {
            jQuery("#teamsList").removeAttr("multiple");
        }
        // Team list option Enable/Disable
        if(roleId == -1 || roleId == 0) {
            this.teamListBlock = 0;
        }
        if(roleId == 1 || roleId == 2 || roleId == 3) {
            this.teamListBlock = 1;  
            if (this.formData.id > 0) {                
            if(this.selectedTeams.length>0) {
                // Set the value in select2 options from api
                //alert('Edit Part');
                jQuery("#teamsList").val(this.selectedTeams).trigger("change");
            }
            } else {
                // Reset value by the null in select2 Options 
                //alert('Create Part');
                jQuery("#teamsList").val(null).trigger("change");
            }          
        }

        


       // this.cmdTeams.select2({data:this.teams});

    }

}