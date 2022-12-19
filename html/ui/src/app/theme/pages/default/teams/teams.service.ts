import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";
import { environment } from '../../../../../environments/environment';
import { Team } from "./team";
import { TeamMember } from "./teammember";

import { TeamRole } from './teamrole';
import { WSResponse } from "../../../../ws-response";
import "rxjs/add/operator/map";

@Injectable()
export class TeamService {
    private _teamList: Array<Team>;

    constructor(private _httpClient: HttpClient) {
        this._teamList = [];

    }


    public setTeamList(data: Array<any>): void {
        this._teamList = [];
        var _team: Team;
        for (var i = 0; i < data.length; i++) {
            _team = new Team();
            for (var key in data[i]) {
                if (_team.hasOwnProperty(key)) {
                    _team[key] = data[i][key];
                }
            }
            _team.members = [];
            var _teamMember: TeamMember;

            for (var j = 0; j < data[i].team_members.length; j++) {
                _teamMember = new TeamMember();
                _teamMember.id = data[i].team_members[j]["id"];
                _teamMember.userId = data[i].team_members[j]["user"]["id"];
                _teamMember.image = data[i].team_members[j]["user"]["profile_pic"];
                _teamMember.name = data[i].team_members[j]["user"]["first_name"] + " " + data[i].team_members[j]["user"]["last_name"];;
                _teamMember.roleId = data[i].team_members[j]["team_role"]["id"];
                _teamMember.role = data[i].team_members[j]["team_role"]["role_name"];
                _teamMember.status = data[i].team_members[j]["status"];
                _team.members.push(_teamMember);

            }
            this._teamList.push(_team);
        }
    }

    public getTeamList(): Array<Team> {
        return this._teamList;
    }

    public getTeamById(teamId: number): Team {
        for (var i = 0; i < this._teamList.length; i++) {
            if (this._teamList[i].id == teamId) {
                return Object.assign(new Team(), this._teamList[i]);
            }
        }
    }


    loadTeams(userId: number = null): Observable<Array<Team>> {
        var url:string = environment.apiBaseUrl + "teams/list.json";
        if(userId != null){
            url = url + "?user_id=" + userId;
        } 
        return this._httpClient.get<any>(url).map((t: any): Array<Team> => {
            var teams: Array<Team> = [];
            var _team: Team;
            var _teamMember: TeamMember;
            for (var i = 0; i < t.data.length; i++) {
                _team = new Team();
                _team.id = t.data[i].id;
                _team.name = t.data[i].name;
                _team.photo = t.data[i].photo;

                for (var j = 0; j < t.data[i].team_members.length; j++) {
                    _teamMember = new TeamMember();
                    
                    _teamMember.id = t.data[i].team_members[j]["id"];
                    _teamMember.userId = t.data[i].team_members[j]["user"]["id"];
                    _teamMember.image = t.data[i].team_members[j]["user"]["profile_pic"];
                    _teamMember.name = t.data[i].team_members[j]["user"]["first_name"] + " " + t.data[i].team_members[j]["user"]["last_name"];;
                    _teamMember.roleId = t.data[i].team_members[j]["team_role"]["id"];
                    _teamMember.role = t.data[i].team_members[j]["team_role"]["role_name"];
                    

                    _team.members.push(_teamMember);

                    if (t.data[i].team_members[j]["team_role"]["id"] == 1) {
                        _team.owner = _teamMember;
                    } else if (t.data[i].team_members[j]["team_role"]["id"] == 3) {
                        _team.representative = _teamMember;
                    }
                }
                teams.push(_team);
            }
            return teams;
        });
    }



    updateTeam(Data: Team): Observable<WSResponse> {
        return this._httpClient.put<WSResponse>(environment.apiBaseUrl + "teams/update.json", Data);
    }


    createTeam(Data: Team): Observable<WSResponse> {
        return this._httpClient.post<WSResponse>(environment.apiBaseUrl + "teams/create.json", Data);
    }

    removeTeam(teamId: number): Observable<WSResponse> {
        return this._httpClient.delete<WSResponse>(environment.apiBaseUrl + "teams/delete/" + teamId + ".json");
    }

    getMembers(): Observable<Array<TeamMember>> {
        return this._httpClient.get<Array<TeamMember>>(environment.apiBaseUrl + "teams/members/");
    }

    addMember(teamId: number, userId: number, roleId: number): Observable<WSResponse> {
        return this._httpClient.post<WSResponse>(environment.apiBaseUrl + "teams/" + teamId + "/members.json", { userId: userId, roleId: roleId });
    }

    removeMember(teamId: number, memberId: number): Observable<WSResponse> {
        return this._httpClient.delete<WSResponse>(environment.apiBaseUrl + "teams/" + teamId + "/members/" + memberId + ".json");
    }

    getTeamMembers(userID:number): Observable<Array<any>> {
        return this._httpClient.get<Array<TeamMember>>(environment.apiBaseUrl + "teams/list.json?user_id="+userID);
    }

    changeMemberStatus(member_id: number, status: number): Observable<WSResponse> {
        return this._httpClient.post<WSResponse>(environment.apiBaseUrl + "teams/changeUserStatusForTeam.json", { team_member_id: member_id, status: status });
    }



    getTeamRole(): Observable<Array<TeamRole>> {
        return this._httpClient.get<any>(environment.apiBaseUrl + "teams/roles.json").map((response): Array<TeamRole> => {
            var _roles: Array<TeamRole> = [];
            var _role: TeamRole;
            for (var i = 0; i < response.data.length; i++) {
                _role = new TeamRole();
                _role.id = response.data[i]["id"];
                _role.roleName = response.data[i]["role_name"];
                _roles.push(_role);
            }
            return _roles;
        });
    }
}