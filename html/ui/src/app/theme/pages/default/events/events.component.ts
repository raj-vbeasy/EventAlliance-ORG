import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';

import { Helpers } from '../../../../helpers';
import { ScriptLoaderService } from '../../../../_services/script-loader.service';

import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { HttpParams } from '@angular/common/http';


import { EventService } from './events.service';
import { Event } from './event';
import { EventDataTable } from "./events.datatable";
import { Budgets } from './budgets';
import { ArtistNumbers } from './artistnumbers';
import { Question } from './question';

import { WSResponse } from "../../../../ws-response";

import { environment } from "../../../../../environments/environment";

import { FileUploader } from '../../../../_services/fileuploader.service';
import { TeamService } from './../teams/teams.service';
import { Title } from "@angular/platform-browser";


import * as $ from "jquery";


declare var jQuery: any;



@Component({
    selector: "app-events",
    templateUrl: "./events.component.html",
    encapsulation: ViewEncapsulation.None,
    providers: [EventService, EventDataTable, FileUploader, TeamService],
})

export class EventsComponent implements OnInit {
    @ViewChild('profileImage') profileImage: ElementRef;
    @ViewChild('surveyImage') surveyImage: ElementRef;

    public formData: Event;
    public amounts: Array<Budgets>;
    public activatedMenu: number = 1;
    public modalTitle: string;
    //public eventTime: Date;
    public _number_of_artists: Array<ArtistNumbers>;
    public environment: any;
    public totalTeam: number;



    public genres: Array<{ id: number, text: string }>;
    public demographics: Array<{ id: number, text: string }>;

    public selectToDemographics: Array<any>;
    public selectToGenres: Array<any>;

    public allTeams: Array<any>;
    public selectedMemberId: number;
    public selectedMemberName: string;

    public search:{keyword: string, eventStatus: number, teamId: number} = {keyword: "", eventStatus: 0, teamId: 0};

    public questions:Array<Question>=[];
   
    public question: Question= new Question();

    public getUserTeams:Array<any>=[];

    public currentUser: any = {};

    public teamUsers: Array<{ team_member_id: number, user_id: number, user_name: string }>;

    public saveButtonActive:boolean;

    public selectedGenreId: number;

    public getGenresIds: Array<any> = [];

    public selected: Array<any> = [];
    public initials: Array<any> = [];


    constructor(private _uploaderService:FileUploader, private _scriptLoaderService: ScriptLoaderService, private _eventDataTable: EventDataTable, private _eventService: EventService,private _teamService: TeamService, private _titleService: Title) {
        this.formData = new Event();
        this.environment = environment;
        this.saveButtonActive = false;
    }

    public surveyImgClick(){
        let el: HTMLElement = this.surveyImage.nativeElement as HTMLElement;
        el.click();
    }

    public onSurveyImageChange(event:any){
        var target = event.hasOwnProperty("srcElement") ? event.srcElement : event.target;
        let file = target.files;
        console.log(file);
        this._uploaderService.upload (environment.fileUploadUrl, file).subscribe((response:any) => {
            target.value = "";
            if(response.hasOwnProperty("status")){
                if(response.status === true){
                    this.formData.public_survey_main_picture = response.data.fileUrl; //response.data.fileName holds the basee fileName
                    this.formData.survey_main_picture_temp_id = response.data.id;
                }
            }
        }, (error:any) => {
            console.log(error);
            target.value = "";
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
                    this.formData.profile_picture = response.data.fileUrl; //response.data.fileName holds the basee fileName
                    this.formData.event_picture_temp_id = response.data.id;
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
            this._getEventDetails(jQuery(target).data("id"));
            $e.preventDefault();
        } else {
            var parent = jQuery(target).parent();
            if (parent.hasClass("modal-activator")) {
                this._getEventDetails(parent.data("id"));
                $e.preventDefault();
            }
        }

        // For Delete option
        if (jQuery(target).hasClass("btn-delete")) {
            //alert('First');
            Helpers.setLoading(true);
            if (confirm("Do you want to remove this event?")) {
                this._eventService.removeEvent(jQuery(target).data("id")).subscribe((response: WSResponse) => {
                    Helpers.setLoading(false);
                    this._eventDataTable.redraw();
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
                if (confirm("Do you want to remove this event?")) {
                    this._eventService.removeEvent(parent.data("id")).subscribe((response: WSResponse) => {
                        Helpers.setLoading(false);
                        this._eventDataTable.redraw();
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

    public searchEvent(){
        console.log(this.search);
        this._eventDataTable.search(this.search.keyword.trim() + "^" + this.search.eventStatus.toString() + "^" + this.search.teamId.toString());
    }

    public resetEventsData() {
       this.search.keyword = '';
       this.search.eventStatus = 0;
       this.search.teamId = 0;
       this._eventDataTable.search('');
    }

    private _getEventDetails(eventId: number) {
        this.formData.reset();
        var i: number;
        var _eventList: Array<Event> = this._eventService.getEventList();
        //console.log('Test');
        //console.log(_eventList);
        this.questions = [];

        for (i = 0; i < _eventList.length; i++) {
            if (_eventList[i].id == eventId) {
                this.formData.reset();

                Object.assign(this.formData, _eventList[i]);

                this.questions = [];
                for(var j=0; j<this.formData.survey_questions.length; j++){
                    this.addQuestion(this.formData.survey_questions[j].question, this.formData.survey_questions[j].id);
                    for(var k=0; k<this.formData.survey_questions[j].survey_question_options.length; k++){
                        this.addOption(j, this.formData.survey_questions[j].survey_question_options[k].options, this.formData.survey_questions[j].survey_question_options[k].id);
                    }
                }

                if(this.formData.profile_picture != null){
                    this.formData.profile_picture = environment.graphicsBaseUrl + "event/" + this.formData.profile_picture;
                }

                if(this.formData.public_survey_main_picture != null){
                    this.formData.public_survey_main_picture = environment.graphicsBaseUrl + "event/" + this.formData.public_survey_main_picture;
                }

                this.modalTitle = "Edit Event: " + this.formData.name;
                this.saveButtonActive = true;
                
                
                // Get Team Members
                let eventTeamMembers = this.formData["team"]["team_members"];
                this.teamUsers = [];
                for (let d = 0; d < eventTeamMembers.length; d++) {
                    // Only user Role Team Admin(1) and Team Member(2)
                    if(eventTeamMembers[d].team_role_id == 2) {
                        let _teamUser: any = { team_member_id: "", user_id: "", user_name: "" }
                        _teamUser.team_member_id = eventTeamMembers[d].id;
                        _teamUser.user_id = eventTeamMembers[d]["user"].id;
                        _teamUser.user_name = eventTeamMembers[d]["user"].first_name + " " + eventTeamMembers[d]["user"].last_name;
                        this.teamUsers.push(_teamUser);
                    }
                }
                console.log(this.teamUsers);
                console.log(eventTeamMembers);

                // End

                // Bind the Demograph data in select2 options
                let enentDemographis = this.formData.event_demographics;
                this.selectToDemographics = [];
                for (let d = 0; d < enentDemographis.length; d++) {
                    this.selectToDemographics.push(enentDemographis[d].demographic_id);

                }

                jQuery("#cmbDemographics").val(this.selectToDemographics).trigger("change");
                // End Demograph 

                // Bind the Genres data in select2 options
                let enentGenres = this.formData.event_genres;              

                this.selectToGenres = [];
                for (let d = 0; d < enentGenres.length; d++) {
                    this.selectToGenres.push(enentGenres[d].genre_id);
                }
                console.log('Get selected genres');
                console.log(this.selectToGenres);
                
                //jQuery("#cmbGenres").val(this.selectToGenres).trigger("change");             
               
                
                
                let params:HttpParams = new HttpParams().set('GenreIds', this.selectToGenres.toString());

                jQuery("#cmbGenres > option").remove();

                this._eventService.eventGenres(params).subscribe((response) => {
                    for(var i=0;i<response.response.length;i++){
                        var option = new Option(response.response[i].name, response.response[i].id, false, true);
                        jQuery("#cmbGenres").append(option).trigger('change');
                    }                    
                });                       
                
                // End Genres

                try {
                    var startDate = new Date(this.formData.start_date);
                    var endDate = new Date(this.formData.end_date);

                    jQuery('#txtEventDateRange').data('daterangepicker').setStartDate(startDate);
                    jQuery('#txtEventDateRange').data('daterangepicker').setEndDate(endDate);

                    jQuery("#txtEventDateRange").val(jQuery('#txtEventDateRange').data('daterangepicker').startDate.format('MM/DD/YYYY') + ' - ' + jQuery('#txtEventDateRange').data('daterangepicker').endDate.format('MM/DD/YYYY'));
                } catch (err) {
                    console.error(err);
                }

                this.activatedMenu = 1;
                jQuery("#editEvent").modal("show");
                break;
            }
        }
    }

    public formatRepoSelection( repo ) {   
        return repo.text || repo.id;
    }



    ngOnInit() {
        this._titleService.setTitle('Events List - Event Alliance');
        this.currentUser  = JSON.parse(localStorage.getItem('currentUser'));
    }


    public openEventAddModal(type:string='') {
        this.questions = [];
        this.formData.reset();
        this.activatedMenu = 1;
        this.modalTitle = "Create Event";
        this.saveButtonActive = true;
        
        jQuery("#editEvent").modal("show");
        jQuery("#cmbGenres").val(null).trigger("change");
        jQuery("#cmbDemographics").val(null).trigger("change");
    }

    public eventTeamMembers(event,team_member_id,user_id) {
        let checked_event =  event.target.checked;
        let event_id = this.formData.id;
        if(checked_event === true ) {
            // add
            let status = 1;
            //console.log('Add Event ID'+event_id+" Team Member ID "+team_member_id + "User ID" +user_id);
            this._eventService.addEventTeamMember(event_id,team_member_id,user_id,status).subscribe((response: WSResponse) => {            
                if (response.status === true) {
                    // If the API success, get details again                
                }
            },
            (err) => {
                console.log(err);
            });
        } else {
            // remove            
            let status = 0;
            //console.log('Add Event ID'+event_id+" Team Member ID "+team_member_id + "User ID" +user_id);
            this._eventService.addEventTeamMember(event_id,team_member_id,user_id,status).subscribe((response: WSResponse) => {            
                if (response.status === true) {
                    // If the API success, get details again                
                }
            },
            (err) => {
                console.log(err);
            });
        }
        //console.log(event.target.checked);

    }

    public SaveEvent(): void {
		
        
        this.saveButtonActive = false;
		console.log(this.questions);
		this.formData.survey_questions=this.questions;
        this.formData.event_genres = [];
        var _selectedGenres = jQuery("#cmbGenres").select2("data");
        for (var i = 0; i < _selectedGenres.length; i++) {
            this.formData.event_genres.push(_selectedGenres[i].id);
        };


        this.formData.event_demographics = [];
        var _selectedDemographics = jQuery("#cmbDemographics").select2("data");
        for (var i = 0; i < _selectedDemographics.length; i++) {
            this.formData.event_demographics.push(_selectedDemographics[i].id);
        };


        Helpers.setLoading(true);

        
        //alert(currentUser.team_members.length);
        if(this.currentUser.team_members.length == 1) {            
            this.formData.team_id = this.currentUser.team_members[0].team_id;
        } 
        // Select team id from drop dropdown
        

        if (this.formData.id > 0) { 
            // If we are in edit mode, call the updateTeam API 
            this._eventService.updateEvent(this.formData).subscribe((response: WSResponse) => {
                Helpers.setLoading(false);
                if (response.status === true) {
                    //TODO: show success alert
                    jQuery("#editEvent").modal("hide");
                    this._eventDataTable.redraw();
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
        
            // Else we are in add mode, call the createTeam API 
            this._eventService.createEvent(this.formData).subscribe((response: WSResponse) => {
                console.log(response);
                Helpers.setLoading(false);
                if (response.status === true) {
                    // TODO: Team has been crated. Show a success message and close the modal 
                    jQuery("#editEvent").modal("hide");
                    this._eventDataTable.redraw();
                } else {
                    alert("Error\n\n" + response.message);                    
                    this.saveButtonActive = true;
                }
            }, (err) => {
                console.log(err);                
                this.saveButtonActive = true;
                Helpers.setLoading(false);
            });
           
        }
    }

    addQuestion(question:string="", id:number=0) {
		let q = new Question(); 
        q.id=id;
        q.question=question;
        this.questions.push(q);

    }

    addOption(index:number, option:string="", id: number=0){
		console.log(index);
        for(var i=0;i<=this.questions.length;i++){
            if(index==i){
                this.questions[index].addOption(option, id);
            }
        }
    }

    ngAfterViewInit() {        

        // Fetach Budgets data from service
        this._eventService.getBudgets().subscribe((data: Array<Budgets>) => {
            var firstSelectElement = new Budgets();
            firstSelectElement.id = 0;
            firstSelectElement.amount = "-- Select --";
            this.amounts = data;
            this.amounts.splice(0, 0, firstSelectElement);
        }, (err) => {

        });

        this._eventService.getAllTeams().subscribe((data) => {            
            var firstSelectElement: { id: number, name: string } = {id: 0, name: "-- All Teams --"};
            this.allTeams = data;
            this.allTeams.splice(0, 0, firstSelectElement);           
        }, (err) => {

        });

         var user_id = 0;
         let currentUser  = JSON.parse(localStorage.getItem('currentUser'));
         user_id = currentUser.id;
        // this.totalTeam = currentUser.team_members.length;          

        this._teamService.getTeamMembers(user_id).subscribe((data: Array<any>) => {            
            for(var i=0; i< data['data'].length; i++){                     ;
                this.getUserTeams.push({id:data['data'][i].id, name:data['data'][i].name});
            }
        });        
      

        // Fetch all Teams

        // Fetach Number of artist data from service
        this._eventService.getArtistNumbers().subscribe((data: Array<ArtistNumbers>) => {
            var firstSelectElement_AN = new ArtistNumbers();
            firstSelectElement_AN.id = 0;
            firstSelectElement_AN.number_of_artist = "-- Select --";
            this._number_of_artists = data;
            this._number_of_artists.splice(0, 0, firstSelectElement_AN);
        }, (err) => {

        });


        jQuery('#txtEventDateRange').daterangepicker({
            autoUpdateInput: false,
            locale: {
                format: 'MM/DD/YYYY'
            }
        },
            (start, end, label) => {
                this.formData.start_date = start;
                this.formData.end_date = end;
            });

        jQuery('#txtEventDateRange').on('apply.daterangepicker', (ev, picker) => {
           

            var startYear=picker.startDate._d.getFullYear();
            var startMonth=(picker.startDate._d.getMonth()+1>9 ? picker.startDate._d.getMonth()+1:("0"+(picker.startDate._d.getMonth()+1)));
            var startDate=(picker.startDate._d.getDate()>9 ? picker.startDate._d.getDate():("0"+picker.startDate._d.getDate()));

            var endYear=picker.endDate._d.getFullYear();
            var endMonth=(picker.endDate._d.getMonth()+1>9 ? picker.endDate._d.getMonth()+1:("0"+(picker.endDate._d.getMonth()+1)));
            var endDate=(picker.endDate._d.getDate()>9 ? picker.endDate._d.getDate():("0"+picker.endDate._d.getDate()));

           //console.log(startYear+'-'+startMonth+'-'+startDate+"T00:00:00Z");

            //var startdate=new Date(startYear+'-'+startMonth+'-'+startDate+"T00:00:00Z");
           //var enddate=new Date(endYear+'-'+endMonth+'-'+endDate+"T00:00:00Z");
            //console.log(startdate);
            //console.log(enddate);

            this.formData.start_date = new Date(startYear+'-'+startMonth+'-'+startDate+"T00:00:00Z");
            this.formData.end_date = new Date(endYear+'-'+endMonth+'-'+endDate+"T00:00:00Z");
            //alert(this.formData.start_date);
            //alert(this.formData.end_date);
            jQuery('#txtEventDateRange').val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
        });

        jQuery('#txtEventDateRange').on('cancel.daterangepicker', (ev, picker) => {
            this.formData.start_date = null;
            this.formData.end_date = null;
            jQuery('#txtEventDateRange').val('');
        });

        //Initialize the bootstrap modals;
        jQuery("#editEvent").modal({ show: false }).on("hidden.bs.modal", (e) => {
            if (this.formData) this.formData.reset();
        });


        //Load select2 js (if not already loaded) and initialize select2 elements
        this._scriptLoaderService.loadScript("select2", "/assets/eventalliance/custom/components/forms/widgets/select2.js", true).then(() => {

            this._eventService.getDemographics().subscribe((data: any) => {
                var _demographics: Array<{ id: number, text: string }> = [];
                for (var i = 0; i < data.response.length; i++) {
                    _demographics.push({ id: data.response[i].id, text: data.response[i].name });
                }
                this.demographics = _demographics;
                setTimeout(() => {
                    jQuery("#cmbDemographics").select2();
                }, 200);
            }, (err) => {
                //TODO: Error handling
            });


            /*this._eventService.getGenres().subscribe((data: any) => {
                var _genres: Array<{ id: number, text: string }> = [];
                for (var i = 0; i < data.response.length; i++) {
                    _genres.push({ id: data.response[i].id, text: data.response[i].name });
                }
                this.genres = _genres;
                console.log(this.genres);
                setTimeout(() => {
                    jQuery("#cmbGenres").select2();
                }, 200);
            }, (err) => {
                //TODO: Error handling
            });*/

        });        

        jQuery('#cmbGenres').select2({
            placeholder: 'Select an item',
            minimumInputLength: 3 ,
            //data: this.initials,
            ajax: {
                url: environment.apiBaseUrl + 'masters/getGenres.json',
                dataType: 'json',
                delay: 250, 
                processResults: function(data:any, params: any){                   
                    return {
                        results:
                        data.data.map(function(genres) {
                            return {
                                id: genres.id,
                                text: genres.name
                            };
                        }
                    )};
                },
                cache: false                
            },                        
            templateSelection: this.formatRepoSelection

        });

        this._eventDataTable.load();
    }

    public isAccessGivenToMember(index:number){
        for(var j=0; j<this.formData.event_team_members.length; j++){
            if(this.formData.event_team_members[j].team_member_id == this.teamUsers[index].team_member_id){
                return true;
            }
        }
        return false;
    }

    public toggleMemberAccess(event:any, index:number){
        var tmp = event.target.value.split("|");
        var team_member_id = tmp[0];
        var user_id = tmp[1];

        if(event.target.checked){
            this.formData.event_team_members.push({
                team_member_id: team_member_id,
                user_id: user_id
            });
        } else {
            for(var i=0; i<this.formData.event_team_members.length; i++){
                if(this.formData.event_team_members[i].team_member_id == team_member_id){
                    this.formData.event_team_members.splice(i, 1);
                    break;
                }
            }
        }

        console.log(this.formData.event_team_members);
    }

    toggleMenu(value) {
        this.activatedMenu = value;
    }

}