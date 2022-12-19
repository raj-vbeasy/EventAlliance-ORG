import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";
import { environment } from '../../../../../environments/environment';
import { Users } from "./users";
//import { TeamMember } from "./teammember";

import { WSResponse } from "../../../../ws-response";
import "rxjs/add/operator/map";

@Injectable()
export class UserService {
    private _userList: Array<Users>;



    constructor(private _httpClient: HttpClient) {
        this._userList = [];
    }


    public setUsersList(data: Array<any>): void {
        this._userList = [];
        var _user: Users;


        //console.log(data);

        for (var i = 0; i < data.length; i++) {
            // team list array
            var teamList: Array<any> = [];

            for (var g = 0; g < data[i].team_members.length; g++) {
                // create team object   
                let team: any = {
                    id: 0,
                    name: '',
                    role_name: '',
                    photo: ''
                }
                team.id = data[i].team_members[g].team_id;
                team.name = data[i].team_members[g].team["name"];
                team.role_name = data[i].team_members[g].team_role["role_name"];
                team.photo = data[i].team_members[g].team["photo"];
                teamList.push(team);
            }

            _user = new Users();
            for (var key in data[i]) {
                //console.log(key);
                if (_user.hasOwnProperty(key)) {
                    _user[key] = data[i][key];
                    _user.teamList = teamList;
                }

            }
            this._userList.push(_user);


        }
    }

    public getUsersList(): Array<Users> {
        return this._userList;
    }

    public getUsersById(userId: number): Users {
        for (var i = 0; i < this._userList.length; i++) {
            if (this._userList[i].id == userId) {
                return Object.assign(new Users(), this._userList[i]);
            }
        }
    }


    getAllGenres(): Observable<any> {
        return this._httpClient.get<any>(environment.apiBaseUrl + "masters/getGenres.json").map((response): Array<any> => {
            var _genres: Array<any> = [];
            //var _genre: any;
            for (var i = 0; i < response.data.length; i++) {
                let _genre: any = { id: "", name: "" }
                _genre.id = response.data[i]["id"];
                _genre.name = response.data[i]["name"];
                _genres.push(_genre);
                console.log(_genre);
            }
            return _genres;

        });
    }


    updateUser(Data: Users): Observable<WSResponse> {
        return this._httpClient.put<WSResponse>(environment.apiBaseUrl + "users/update.json", Data);
    }


    createUser(Data: Users): Observable<WSResponse> {
        return this._httpClient.post<WSResponse>(environment.apiBaseUrl + "users/create.json", Data);
    }

    removeUser(Id: number): Observable<WSResponse> {
        return this._httpClient.delete<WSResponse>(environment.apiBaseUrl + "users/delete/" + Id + ".json");
    }

    getUserById(userID: number): Observable<any> {
        return this._httpClient.get<any>(environment.apiBaseUrl + 'users/' + userID + '/getDetailsById.json');
    }



}