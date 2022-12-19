import { 
    Component, 
    OnInit, 
    ViewEncapsulation,
     AfterViewInit, 
     Input, 
     ViewChildren, 
     Directive, 
     HostListener, 
     EventEmitter,
     ViewChild,
     ElementRef
 } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Helpers } from '../../../../helpers';
import { ScriptLoaderService } from '../../../../_services/script-loader.service';
import { environment } from '../../../../../environments/environment';
import { TeamService } from './teams.service';
import { Team } from './team';
import { TeamMember } from './teammember';
import { TeamRole } from "./teamrole";
import { TeamDataTable } from "./teams.datatable";
import { WSResponse } from "../../../../ws-response";
import { FileUploader } from '../../../../_services/fileuploader.service';
import {Title} from "@angular/platform-browser";

import * as $ from "jquery";

import 'rxjs';


declare var jQuery: any;


@Component({
    selector: "app-teams",
    templateUrl: "./teams.component.html",
    encapsulation: ViewEncapsulation.None,
    providers: [TeamService, TeamDataTable, FileUploader],
})

export class TeamsComponent implements OnInit, AfterViewInit {
    @ViewChild('teamImage') teamImage: ElementRef;

    public formData: Team;

    public teamroles: Array<TeamRole>;
    public selectedRoleId: number;
    public selectedMemberId: number;
    public selectedMemberName: string;

    public modalTitle: string;

    private _needToUpdateModalContent: boolean;

    public environment: any;

    public keyword: string = "";

    private user_id: number;
   
    public currentUser = JSON.parse(localStorage.getItem('currentUser'));

    public saveButtonActive:boolean;
    //v2
    teamForm: FormGroup;
    formUserID = [];

    constructor(private _uploaderService:FileUploader, private _teamService: TeamService, private _teamDataTable: TeamDataTable, private _scriptLoaderService: ScriptLoaderService, private _titleService: Title) {
        this.formData = new Team();
        this._needToUpdateModalContent = false;
        this.saveButtonActive = false;

        this._teamDataTable.dataTableAjaxDone.subscribe((e: any) => {
            if (this._needToUpdateModalContent) {
                this._getTeamDetails(this.formData.id, false);
                this._needToUpdateModalContent = false;
            }
        });

        this.environment = environment;
    }

    public imgClick(){
        let el: HTMLElement = this.teamImage.nativeElement as HTMLElement;
        el.click();
    }

    public onTeamImageChange(event:any){        
        var target = event.hasOwnProperty("srcElement") ? event.srcElement : event.target;
        let file = target.files;
        this._uploaderService.upload (environment.fileUploadUrl, file).subscribe((response:any) => {
            target.value = "";
            if(response.hasOwnProperty("status")){
                if(response.status === true){
                    this.formData.photo = response.data.fileUrl; //response.data.fileName holds the basee fileName
                    this.formData.photo_temp_id = response.data.id;
                }
            }
        }, (error:any) => {
            console.log(error);
            target.value = "";
        });
    }   

    ngOnInit() {
        this._titleService.setTitle('Teams List - Event Alliance');
        var user_id = 0;
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if(currentUser){
            this.user_id = currentUser.id;
        }

    }

    public searchTeams(){
        this._teamDataTable.search(this.keyword.trim());
    }

    public resetTeamsData() {
       this.keyword = '';       
       this._teamDataTable.search('');
    }

    public openTeamAddModal() {
        this.formData.reset();
        this.modalTitle = "Create a Team";
        jQuery("#editTeam").modal("show");
        this.saveButtonActive = true;
    }

    public TableClick($e: any) {
        var target = $e.target || $e.srcElement || $e.currentTarget;

        if (jQuery(target).hasClass("modal-activator")) {
            this._getTeamDetails(jQuery(target).data("id"));
            $e.preventDefault();
        } else {
            var parent = jQuery(target).parent();
            if (parent.hasClass("modal-activator")) {
                this._getTeamDetails(parent.data("id"));
                $e.preventDefault();
            }
        }

        // For Delete option
        if (jQuery(target).hasClass("btn-delete")) {
            Helpers.setLoading(true);
            if (confirm("Do you want to remove this team?")) {
                this._teamService.removeTeam(jQuery(target).data("id")).subscribe((response: WSResponse) => {
                    Helpers.setLoading(false);
                    this._teamDataTable.redraw();
                },
                (err) => {
                    //TODO: Error handling
                });
            } else {
                Helpers.setLoading(false);
            }
            $e.preventDefault();
        } else {
            var parent = jQuery(target).parent();
            if (parent.hasClass("btn-delete")) {
                Helpers.setLoading(true);
                if (confirm("Do you want to remove this team?")) {
                    this._teamService.removeTeam(parent.data("id")).subscribe((response: WSResponse) => {
                        Helpers.setLoading(false);
                        this._teamDataTable.redraw();
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

    private _getTeamDetails(teamId: number, openModal: boolean = true) {
        try {
            if (this.formData) this.formData.reset();
            this.formData = this._teamService.getTeamById(teamId);
            if(this.formData.photo != null){
                this.formData.photo = environment.graphicsBaseUrl + "team/" + this.formData.photo;
            }
            this.modalTitle = "Edit " + this.formData.name;
            this.saveButtonActive = true;
            console.log(this.formData);
            if (openModal) jQuery("#editTeam").modal("show");
        } catch (err) {
            console.log(err);
        }
    }


    public addMemberToTeam(): void {
        if (this.selectedRoleId == 0) {
            alert("Please select a role");
            return;
        }

        if (this.selectedMemberId == 0) {
            alert("Please select a member");
            return;
        }

        if (this.formData.id > 0) {
            /* If we are in edit mode, call the addMember API directly */
            this._teamService.addMember(this.formData.id, this.selectedMemberId, this.selectedRoleId).subscribe((response: WSResponse) => {
                console.log(response);
                if (response.status === true) {
                    /* If the API succeeded, get the team details again to refresh the UI */
                    this._needToUpdateModalContent = true;
                    this._teamDataTable.redraw();
                }
            },
                (err) => {
                    console.log(err);
                });
        } else {
            /* Else if we are in add mode, append the user to the members array */
            var _member = new TeamMember();
            _member.userId = this.selectedMemberId;
            _member.name = this.selectedMemberName;
            _member.roleId = this.selectedRoleId;
            for (var i = 0; i < this.teamroles.length; i++) {
                if (this.teamroles[i].id == this.selectedRoleId) {
                    _member.role = this.teamroles[i].roleName;
                    break;
                }
            }
            this.formData.members.push(_member);
            
        }
    }

    public memberStatus(event_status,member) {        
        let member_id = member.id;   
        console.log(event_status) ;  
        console.log(member) ;  
        this._teamService.changeMemberStatus(member_id,event_status).subscribe((response: WSResponse) => {
            console.log(response);
            if (response.status === true) {
                // If the API succeeded, get the team details again 
                alert("Member Status is changed successfully");
                return;               
            }
        },
        (err) => {
            console.log(err);
        });
    }

    public deleteMember(member: TeamMember) {
        if (confirm("Do you really want to remove this member from the team? It is undoable!")) {
            if (this.formData.id > 0) {
                /* If we are in edit mode, call the removeMember direct API directly */
                this._teamService.removeMember(this.formData.id, member.id).subscribe((response: WSResponse) => {
                    console.log(response);
                    if (response.status === true) {
                        /* if the API succeeded, remove the member from the members array */
                        for (var i = 0; i < this.formData.members.length; i++) {
                            if (this.formData.members[i].id == member.id) {
                                this.formData.members.splice(i, 1);
                            }
                        }
                    }
                }, (err) => {
                    console.log(err);
                });
            } else {
                /* Else we are in ad mode and remove the member from the team members array only */
                for (var i = 0; i < this.formData.members.length; i++) {
                    if (this.formData.members[i].userId == member.userId) {
                        this.formData.members.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }

    public SaveTeam(): void {
        Helpers.setLoading(true);
        this.saveButtonActive = false;
        console.log(this.formData);
        if (this.formData.id > 0) {
            /* If we are in edit mode, call the updateTeam API */
            this._teamService.updateTeam(this.formData).subscribe((response: WSResponse) => {
                Helpers.setLoading(false);
                if (response.status === true) {
                    //TODO: show success alert
                    jQuery("#editTeam").modal("hide");
                    this._teamDataTable.redraw();
                } else {
                    //TODO: Show failure alert
                    this.saveButtonActive = false;
                }
            }, (err) => {
                Helpers.setLoading(false);
                //TODO: Error handling
            });
        } else {
            /* Else we are in add mode, call the createTeam API */
            this._teamService.createTeam(this.formData).subscribe((response: WSResponse) => {
                Helpers.setLoading(false);
                console.log(response);
                if (response.status === true) {
                    /* TODO: Team has been crated. Show a success message and close the modal */
                    jQuery("#editTeam").modal("hide");
                    this._teamDataTable.redraw();
                }
            }, (err) => {
                Helpers.setLoading(false);
                //TODO: Show error alert
                console.log(err);
            });
        }
    }


    ngAfterViewInit() {
        this.selectedMemberId = 0;
        this.selectedRoleId = 0;
        this.teamroles = [];
        this.formData.reset();

        this._teamService.getTeamRole().subscribe((data: Array<TeamRole>) => {
            var firstSelectElement = new TeamRole();
            firstSelectElement.id = 0;
            firstSelectElement.roleName = "-- Select --";
            this.teamroles = data;
            this.teamroles.splice(0, 0, firstSelectElement);
            this.selectedRoleId = 0;
        }, (err) => {

        });

        //Initialize the bootstrap modals;
        jQuery("#editTeam").modal({ show: false }).on("hidden.bs.modal", (e) => {
            this.formData.reset();
        });


        this._teamDataTable.load();

        //Load select2 js (if not already loaded) and initialize select2 elements
        this._scriptLoaderService.loadScript("select2", "/assets/eventalliance/custom/components/forms/widgets/select2.js", true).then(() => {
            jQuery("#cmbMember").select2().on("select2:select", (e: any) => {
                this.selectedMemberId = e.params.data.id;
                this.selectedMemberName = e.params.data.text;
            });
        });


    }

    public CreateTeam(): void {
        Helpers.setLoading(true);
        this._teamService.createTeam(this.formData).subscribe((response: WSResponse) => {
            Helpers.setLoading(false);
            if (response.status === true) {
                //TODO: show success alert
                jQuery("#addTeam").modal("hide");
                this.formData.reset();
            } else {
                //TODO: Show failure alert
            }
        }, (err) => {
            Helpers.setLoading(false);
            //TODO: Error handling
        });
    }

    public _getMembers(): void {
        this._teamService.getMembers();
    }

    public TeamRoleChangeEvent(teamRoleId: number) {        
        Helpers.setLoading(true);
        jQuery("#cmbMember").val(null).trigger('change');
        jQuery("#cmbMember").select2({
            ajax: {
               //url: environment.apiBaseUrl + 'users/list.json?role_id='+teamRoleId,
                url: environment.apiBaseUrl + 'users/list.json?request_for=teammember&user_id=' + this.user_id + '&role_id=' +teamRoleId,
                processResults: function(data) {
                    /* TODO: need to change this according to the final API */
                    var transformedData = [];
                    for (var i = 0; i < data.data.length; i++) {
                        transformedData.push({ id: data.data[i].id, text: data.data[i].first_name + " " + data.data[i].last_name });
                    }
                    Helpers.setLoading(false);
                    return { results: transformedData };
                }
            }
        }).on("select2:select", (e: any) => {
            this.selectedMemberId = e.params.data.id;
            this.selectedMemberName = e.params.data.text;
        });

    }
}