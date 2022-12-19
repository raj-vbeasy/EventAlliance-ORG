import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from "rxjs";
import { environment } from '../../../../../environments/environment';
import { WSResponse } from "../../../../ws-response";


import { eventSurvey } from "./eventsurvey";

@Injectable()
export class EventSurveyService {

    // private ip_address: Array<any>;

    constructor(private _httpClient: HttpClient) {

    }

    createSurvey(Data: eventSurvey): Observable<WSResponse> {
        return this._httpClient.post<WSResponse>(environment.apiBaseUrl + "events/saveEventSurvey.json", Data);
    }



    getGenres(): Observable<any> {
        return this._httpClient.get<any>(environment.apiBaseUrl + 'masters/genres.json');
    }

    getIpAddress() {
        return this._httpClient.get<any>('http://freegeoip.net/json/?callback').map((response) => {
            return response["ip"];
        });

    }
}