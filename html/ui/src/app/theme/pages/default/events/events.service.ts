import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";
import { environment } from '../../../../../environments/environment';
import { Event } from "./event";
import { Budgets } from './budgets';
import { ArtistNumbers } from './artistnumbers';
//import { Members } from './members'; // Get users
import { WSResponse } from "../../../../ws-response";

@Injectable()
export class EventService {

    private _eventList: Array<Event>;

    constructor(private _httpClient: HttpClient) {
        this._eventList = [];
    }

    public setEventList(data: Array<any>): void {
        this._eventList = [];
        var _event: Event;
        for (var i = 0; i < data.length; i++) {
            _event = new Event();
            for (var key in data[i]) {
                if (_event.hasOwnProperty(key)) {
                    _event[key] = data[i][key];
                }
            }
            this._eventList.push(_event);
        }
    }

    public getEventList(): Array<Event> {
        return this._eventList;
    }

    public getEventDetails(eventId: number): Observable<any> {
        return this._httpClient.get<any>(environment.apiBaseUrl + "events/details/" + eventId + ".json");
    }

    getBudgets(): Observable<Array<Budgets>> {
        return this._httpClient.get<any>(environment.apiBaseUrl + "events/budgets.json").map((response): Array<Budgets> => {
            var _amounts: Array<Budgets> = [];
            var _amount: Budgets;
            for (var i = 0; i < response.data.length; i++) {
                _amount = new Budgets();
                _amount.id = response.data[i]["id"];
                _amount.amount = response.data[i]["amount"];
                _amounts.push(_amount);
            }
            return _amounts;
        });
    }

    getArtistNumbers(): Observable<Array<ArtistNumbers>> {
        return this._httpClient.get<any>(environment.apiBaseUrl + "events/artistNumber.json").map((response): Array<ArtistNumbers> => {
            var _artistnumbers: Array<ArtistNumbers> = [];
            var _artistnumber: ArtistNumbers;
            for (var i = 0; i < response.data.length; i++) {
                _artistnumber = new ArtistNumbers();
                _artistnumber.id = response.data[i]["id"];
                _artistnumber.number_of_artist = response.data[i]["number_of_artist"];
                _artistnumbers.push(_artistnumber);
            }
            return _artistnumbers;
        });
    }

    /*getAllTeams(): Observable<any> {        
        return this._httpClient.get<any>(environment.apiBaseUrl + "teams/list.json");
    }*/

    getAllTeams(): Observable<any> {
        var user_id = 0;
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if(currentUser){
            user_id = currentUser.id;
        }
        return this._httpClient.get<any>(environment.apiBaseUrl + "teams/list.json?user_id=" + user_id).map((response): Array<any> => {
            var _teams: Array<any> = [];
            
            for (var i = 0; i < response.data.length; i++) {
                let _team: any = { id: "", name: "" }
                _team.id = response.data[i]["id"];
                _team.name = response.data[i]["name"];
                _teams.push(_team);
                //console.log(_team);
            }
            return _teams;

        });
    }

    eventGenres(Params: any): Observable<any> {
        return this._httpClient.get<any>(environment.apiBaseUrl + 'masters/eventGenres.json', { params: Params });
    }

    updateEvent(Data: Event): Observable<WSResponse> {
        return this._httpClient.put<WSResponse>(environment.apiBaseUrl + "events/update.json", Data);
    }

    createEvent(Data: Event): Observable<WSResponse> {
        return this._httpClient.post<WSResponse>(environment.apiBaseUrl + "events/create.json", Data);
    }

    getDemographics(): Observable<any> {
        return this._httpClient.get<any>(environment.apiBaseUrl + 'masters/demographics.json');
    }

    getGenres(): Observable<any> {
        return this._httpClient.get<any>(environment.apiBaseUrl + 'masters/genres.json');
    }
    getEventServeyResults(eventID: number): Observable<any> {
        return this._httpClient.get<any>(environment.apiBaseUrl + 'events/' + eventID + '/getEventServeyResults.json');
    }

    // Using this api for Approval and Picks Pages 
    getEventPickedArtists(eventID: number): Observable<any> {
        return this._httpClient.get<any>(environment.apiBaseUrl + 'events/' + eventID + '/getEventPickedArtists.json');
    }

    // Using this api for Approval and Picks Pages 
    updatePickStatus(Data: any): Observable<any> {
        return this._httpClient.put<any>(environment.apiBaseUrl + "events/updateEventArtistPick.json", Data);
    }

    // Using this api for public survey Pages 
    getEventPublicSurveyOptIns(eventID: number): Observable<any> {
        return this._httpClient.get<any>(environment.apiBaseUrl + 'events/' + eventID + '/getTotalPublicSurvey.json');
    }

    /* getEventPublicSurveyOptIns1(eventID: number): Observable<any> {
         return this._httpClient.get<any>(environment.apiBaseUrl + 'events/' + eventID + '/getTotalPublicSurvey.json');
     }*/

    getEventPublicSurveyQuestionAnswer(eventID: number): Observable<any> {
        return this._httpClient.get<any>(environment.apiBaseUrl + 'events/' + eventID + '/getPublicSurveyQuestionAnswerdetails.json');
    }

    getEventSurveyQueries(eventID: number): Observable<any> {
        return this._httpClient.get<any>(environment.apiBaseUrl + 'masters/' + eventID + '/getEventSurveyQueries.json');
    }    

    getArtistVotes(eventID: number): Observable<any> {
        return this._httpClient.get<any>(environment.apiBaseUrl + 'events/' + eventID + '/getTeamMemberVote.json');
    }

    privateVote(eventId: number, userId: number, vote: number, artistId: number): Observable<WSResponse> {
        return this._httpClient.post<WSResponse>(environment.apiBaseUrl + "events/addTeamMemberVote.json", { eventId: eventId, userId: userId, vote: vote, artistId: artistId });
    }

    addEventTeamMember(eventId: number, teamMemberId: number, userId: number, status: number): Observable<WSResponse> {
        return this._httpClient.post<WSResponse>(environment.apiBaseUrl + "events/addEventTeamMember.json", { event_id: eventId, team_member_id: teamMemberId, user_id: userId, status: status });
    }

    changeArtistStatus(eventId: number, artistId: number, status: number): Observable<WSResponse> {
        return this._httpClient.post<WSResponse>(environment.apiBaseUrl + "events/" + eventId + "/updateArtistStatus.json", {artistId:artistId, status:status});
    }
    
    removeEvent(Id: number): Observable<WSResponse> {
        return this._httpClient.delete<WSResponse>(environment.apiBaseUrl + "events/delete/" + Id + ".json");
    }
    // Using this api for public survey Pages 
}