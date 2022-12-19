import { Component, OnInit, ViewEncapsulation, AfterViewInit, Input, ViewChildren, Directive, HostListener } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Helpers } from '../../../../helpers';
import { ScriptLoaderService } from '../../../../_services/script-loader.service'
import { environment } from '../../../../../environments/environment'
import { WSResponse } from "../../../../ws-response";

import { HttpParams } from '@angular/common/http';

import { ArtistService } from './artists.service'
import { ArtistDetails } from '../artist-details/artistdetails.service';
import { Artist } from './artist';
import { ArtistChannel } from "./artistchannel";
import { ArtistGenre } from "./artistgenre";
import { Channel } from "./channel";
import { ArtistDataTable } from "./artists.datatable";
import { Title } from "@angular/platform-browser";


import * as $ from "jquery";
declare var jQuery: any;


@Component({
    selector: "app-artists",
    templateUrl: "./artists.component.html",
    encapsulation: ViewEncapsulation.None,
    providers: [ArtistService, ArtistDataTable,ArtistDetails],
})

export class ArtistsComponent implements OnInit, AfterViewInit {
    public formData: Artist;
    public modalTitle: string;

    public allGenres: Array<any>;
    public allBudgets: Array<any>;

    teamForm: FormGroup;
    formUserID = [];

    public currentUser: any = {};

    public selectedEventId: number;
    public selectedEventName: string;
    public userId:number;

    public artistId: number;

    public selectedGenreId: number;


    public search:{keyword: string, genreId: number, budgetId: number} = {keyword: "", genreId: 0, budgetId: 0};

    public saveButtonActive:boolean;

    public selectToGenres: Array<any>;

    constructor(private _artistService: ArtistService, private _artistDataTable: ArtistDataTable, private _scriptLoaderService: ScriptLoaderService, private _artistDetails: ArtistDetails, private _titleService: Title) {
        this.formData = new Artist();
        this.saveButtonActive = false;
    }


    ngOnInit() {
        this._titleService.setTitle('Artists List - Event Alliance');
        var userId = 0;
        this.currentUser  = JSON.parse(localStorage.getItem('currentUser'));        
        this.userId = this.currentUser.id;
    }

    public openTeamAddModal() {
        this.formData.reset();
        this.modalTitle = "Create an Artist";
        jQuery("#editArtist").modal("show");
    }

    public TableClick($e: any) {
        var target = $e.target || $e.srcElement || $e.currentTarget;

        if (jQuery(target).hasClass("modal-activator")) {
            this._getArtistDetails(jQuery(target).data("id"));
            $e.preventDefault();
        } else {
            var parent = jQuery(target).parent();
            if (parent.hasClass("modal-activator")) {
                this._getArtistDetails(parent.data("id"));
                $e.preventDefault();
            }
        } 

        if (jQuery(target).hasClass("modal-activator-events")) {
            //jQuery("#add_artist_event").prop("disabled",false); 
            this.saveButtonActive = true;
            jQuery("#eventList").modal("show");
            var artist_id = jQuery(target).data("id");
            this.artistId = artist_id;
            this.addArtistEvent()
            $e.preventDefault();
        } else {
            var parent = jQuery(target).parent();
            if (parent.hasClass("modal-activator-events")) {
                //jQuery("#add_artist_event").prop("disabled",false); 
                this.saveButtonActive = true;
                this.artistId = parent.data("id");               
                this.addArtistEvent()                
                $e.preventDefault();
            }
        }


        // For Delete option
        if (jQuery(target).hasClass("btn-delete")) {
            //alert('First');
            Helpers.setLoading(true);
            if (confirm("Do you want to remove this artist?")) {
                this._artistService.deleteArtist(jQuery(target).data("id")).subscribe((response: WSResponse) => {
                    Helpers.setLoading(false);
                    this._artistDataTable.redraw();
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
                if (confirm("Do you want to remove this artist?")) {
                    this._artistService.deleteArtist(parent.data("id")).subscribe((response: WSResponse) => {
                        Helpers.setLoading(false);
                        this._artistDataTable.redraw();
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

    public searchArtists(){
        if(this.selectedGenreId ==undefined) {
            this.selectedGenreId = 0;
        }        
        //this._artistDataTable.search(this.search.keyword.trim() + "^" + this.search.genreId.toString() + "^" + this.search.budgetId.toString());
        this._artistDataTable.search(this.search.keyword.trim() + "^" + this.selectedGenreId.toString() + "^" + this.search.budgetId.toString());
    }

    public resetArtistsData() {        
        this.search.keyword = '';
        // this.search.genreId = 0;       
       /*jQuery('#cmbMember').select2('data', {
         placeholder: "Studiengang wählen",
         id: null,
         text: ''
     });*/

     jQuery("#cmbMember").empty().trigger('change');       
     this.search.budgetId = 0;
     this._artistDataTable.search('');
 }

 public saveArtists(){
     jQuery("#add_artist").prop("disabled",true); 
     this.formData.genres = [];
     var _selectedGenres = jQuery("#cmbGenres").val();
     var _artistGenre: ArtistGenre;
     for(var i=0; i<_selectedGenres.length; i++){
         _artistGenre = new ArtistGenre();
         _artistGenre.id = _selectedGenres[i];
         this.formData.genres.push(_artistGenre);
     }
     this.formData.budgetId = jQuery("#cmbBudget").val();

     if(this.formData.id > 0){
         this._artistService.updateArtist(this.formData).subscribe((response:WSResponse) => {
             if(response.status === true){
                 alert(response.message);
                 jQuery("#modal_artist").modal("hide");
                 this._artistDataTable.redraw();
             } else {
                 alert("Error\n\n" + response.message);
                 jQuery("#add_artist").prop("disabled",false); 
             }
         }, (err) => {
             console.log(err);
             alert("Error\n\nThere was an error communicating with the server");
             jQuery("#add_artist").prop("disabled",false); 
         });
     } else {
         this._artistService.createArtist(this.formData).subscribe((response:WSResponse) => {
             if(response.status === true){
                 alert(response.message);
                 jQuery("#modal_artist").modal("hide");
                 this._artistDataTable.redraw();
             } else {
                 alert("Error\n\n" + response.message);
                 jQuery("#add_artist").prop("disabled",false); 
             }
         }, (err) => {
             console.log(err);
             alert("Error\n\nThere was an error communicating with the server");
             jQuery("#add_artist").prop("disabled",false); 
         });
     }
 }

 private _getArtistDetails(artistId: number) {
     this.formData.reset();
     console.log('click' + artistId);
     Helpers.setLoading(true);
     this._artistService.getArtistDetails(artistId).subscribe((t: Artist) => {
         var _selectedGenres = [];
         this.selectToGenres = [];
         Helpers.setLoading(false);
         this.formData = Object.assign(new Artist, t);
         for(var i=0; i<this.formData.genres.length; i++){
             console.log(this.formData.genres[i]["genre_id"]);
             _selectedGenres.push(<any>(this.formData.genres[i])["genre_id"]);
             this.selectToGenres.push(this.formData.genres[i]["genre_id"]);
         }

         //jQuery("#cmbGenres").val(_selectedGenres).trigger("change");

         //console.log('xxxxxxxxxxxx' + this.selectToGenres);
         let params:HttpParams = new HttpParams().set('GenreIds', this.selectToGenres.toString());

         jQuery("#cmbGenres > option").remove();

         this._artistService.eventGenres(params).subscribe((response) => {
             for(var i=0;i<response.response.length;i++){
                 var option = new Option(response.response[i].name, response.response[i].id, false, true);
                 jQuery("#cmbGenres").append(option).trigger('change');
             }                    
         });  


         jQuery("#cmbBudget").val(this.formData.budgetId).trigger("change");
         this.modalTitle = "Edit " + this.formData.name;
         jQuery("#add_artist").prop("disabled",false); 
         jQuery("#modal_artist").modal("show");
     }, (err) => {
         Helpers.setLoading(false);
     });



 }

 public formatRepoSelection( repo ) {   
     return repo.text || repo.id;
 }

 public openCreateArtistModal(){
     this.modalTitle = "Add Artist";
     this.formData.reset();
     jQuery("#add_artist").prop("disabled",false); 
     jQuery("#modal_artist").modal("show");
     jQuery("#cmbGenres > option").remove();
 }

 addArtistEvent(eventId: number = null) {   

     //Get the userid from localstorage  
     this._artistDetails.addArtist(this.userId, this.artistId, eventId).subscribe((response: WSResponse) => {
         if (response.status === true) {
             jQuery("#eventList").modal("hide");
             alert("The artist has been added to the event");
         } else {
             if(response.message=="MULTIEVENT") {
                 jQuery("#eventList").modal("show");
             } else {
                 alert("There was an error processing your request\n\nDetails: " + response.message);
                 //jQuery("#add_artist_event").prop("disabled",false); 
                 this.saveButtonActive = true;
             }
         }
     }, (err) => {
         alert("There was an error communicating with the server");
         //jQuery("#add_artist_event").prop("disabled",false); 
         this.saveButtonActive = true;
     });
 }

 SaveEvent(eventId: number) {  
     //jQuery("#add_artist_event").prop("disabled",true);      
     this.saveButtonActive = false;    
     Helpers.setLoading(true);
     this._artistDetails.addArtist(this.userId, this.artistId, eventId).subscribe((response: WSResponse) => {
         if (response.status === true) {
             alert("The artist has been added to the event");
             jQuery("#eventList").modal("hide");
             Helpers.setLoading(false);
         } else {               
             alert("There was an error processing your request\n\nDetails: " + response.message); 
             //jQuery("#add_artist_event").prop("disabled",false);  
             this.saveButtonActive = true;
             Helpers.setLoading(false);             
         }
     }, (err) => {
         alert("There was an error communicating with the server");
         Helpers.setLoading(false);
         //jQuery("#add_artist_event").prop("disabled",false); 
         this.saveButtonActive = true;
     });
 }

 deleteAllArtist() {
     if( jQuery('.deleteRow:checked').length > 0 ){  // at-least one checkbox checked
         var ids = [];
         jQuery('.deleteRow').each(function(){
             if(jQuery(this).is(':checked')) { 
                 ids.push(jQuery(this).val());
             }
         });
         var ids_string = ids.toString();

         if (confirm("Do you want to remove this artists?")) {
             this._artistService.deleteAllArtist(ids_string).subscribe((response: WSResponse) => {
                 Helpers.setLoading(false);
                 this._artistDataTable.redraw();
             },
             (err) => {
                 //TODO: Error handling
             });
         } else {
             Helpers.setLoading(false);
         }

     }

    // alert(ids_string);
 }


 ngAfterViewInit() {
     this.formData.reset();

     jQuery("#bulkDelete").on('click',function() { // bulk checked         
        var status = this.checked;
        var button_text = jQuery("#bulkDelete").text();
        if(button_text == 'CHECK ALL') {         
             jQuery(this).text('UNCHECK ALL');             
             jQuery(".deleteRow").each( function() {            
                 var rows;
                 rows = jQuery('.m-datatable__table').find('tbody tr');             
                 jQuery.each(rows, function() {
                     var checkbox = jQuery(jQuery(this).find('td').eq(0)).find('input').prop('checked', true);
                     // console.log(checkbox);
                 });
             });             
        } else {
             jQuery(this).text('CHECK ALL');
             jQuery(".deleteRow").each( function() {            
                 var rows;
                 rows = jQuery('.m-datatable__table').find('tbody tr');             
                 jQuery.each(rows, function() {
                     var checkbox = jQuery(jQuery(this).find('td').eq(0)).find('input').prop('checked', false);
                      //console.log(checkbox);
                 });
             });
        }
         
     });

     jQuery('#cmbMember').select2({

         placeholder: 'Select Genres',
         minimumInputLength: 3 ,

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
                 cache: true                
             }

         }).on("select2:select", (e: any) => {
             // console.log('Select selectedGenreId');

             this.selectedGenreId = e.params.data.id;
             //alert(this.selectedGenreId);

         });

      /*  jQuery("#cmbMember").select2({
            ajax: {
               //url: environment.apiBaseUrl + 'users/list.json?role_id='+teamRoleId,
               url: environment.apiBaseUrl + 'masters/getGenres.json',
                processResults: function(data) {
                    console.log('Get all genres');
                    console.log(data.data);
                    
                    var transformedData = [];
                    for (var i = 0; i < data.data.length; i++) {
                        transformedData.push({ id: data.data[i].id, text: data.data[i].name  });
                    }
                    Helpers.setLoading(false);
                    return { results: transformedData };
                }
            }
        }).on("select2:select", (e: any) => {
            console.log('Select selectedGenreId');

            this.selectedGenreId = e.params.data.id;
            //alert(this.selectedGenreId);
          
        });*/

        this._scriptLoaderService.loadScript("select2", "/assets/eventalliance/custom/components/forms/widgets/select2.js", true).then(() => {

            // Fetach all genre data from service
            /*this._artistService.getAllGenres().subscribe((data: Array<any>) => {
                var firstSelectElement: any = { id: "", name: "" }
                firstSelectElement.id = 0;
                firstSelectElement.name = "-- Select --";
                this.allGenres = data;
                this.allGenres.splice(0, 0, firstSelectElement);
                setTimeout(() => {
                    jQuery("#cmbGenres").select2();
                }, 200);
            }, (err) => {

            });*/




            // Fetch all budgets data

            this._artistService.getAllBudgets().subscribe((data: Array<any>) => {
                var firstSelectElement: any = { id: "", amount: "" }
                firstSelectElement.id = 0;
                firstSelectElement.amount = "-- Select --";
                this.allBudgets = data;
                this.allBudgets.splice(0, 0, firstSelectElement);
                setTimeout(() => {
                    jQuery("#cmbBudget").select2();
                }, 200);
            }, (err) => {

            });
        });

        this._scriptLoaderService.loadScript("select2", "/assets/eventalliance/custom/components/forms/widgets/select2.js", true).then(() => {

            jQuery("#eventsList").select2({
                ajax: {
                    url: environment.apiBaseUrl + 'events/list.json?user_id=' + this.userId,                    
                    processResults: function(data) {                       
                        /// TODO: need to change this according to the final API 
                        var transformedData = [];
                        for (var i = 0; i < data.data.length; i++) {
                            transformedData.push({ id: data.data[i].id, text: data.data[i].name });
                        }
                        return { results: transformedData };
                    }
                }
            }).on("select2:select", (e: any) => {
                this.selectedEventId = e.params.data.id;
                this.selectedEventName = e.params.data.text;
            });
        });


        


        //Initialize the bootstrap modals;
        jQuery("#modal_artist").modal({ show: false }).on("hidden.bs.modal", (e) => {
            this.formData.reset();
        });


        jQuery('#cmbGenres').select2({
            placeholder: 'Select Genres',
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

        this._artistDataTable.load();

    }

}