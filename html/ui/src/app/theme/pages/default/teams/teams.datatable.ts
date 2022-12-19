import { Injectable, EventEmitter, Output } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Helpers } from '../../../../helpers';

import { Team } from './team';
import { TeamMember } from './teammember';
import { TeamService } from './teams.service';

declare var jQuery: any;

@Injectable()
export class TeamDataTable {

    @Output() dataTableAjaxDone: EventEmitter<any> = new EventEmitter<any>();

    private _table: any;

    constructor(private _teamService: TeamService) {
        // code...
    }


    public redraw(): void {
        Helpers.setLoading(true);
        this._table.reload();
    }

    public search(keyword:string) : void{
        Helpers.setLoading(true);
        this._table.search(keyword, "name");
    }


    public load(): void {
        var user_id = 0;
        //var is_admin = 0;

        var currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if(currentUser){
            user_id = currentUser.id;
        }

        var columns = [];
        columns.push({
            field: "id",
            title: "ID",
            sortable: !1,
            width: 40,
            selector: !1,
            textAlign: "center"
        });
        columns.push({
            field: "name",
            title: "Title",
            width: 300
        });
        columns.push({
            field: "owner",
            title: "Owner",
            width: 200,
            template: function(row) {
                var _ret: string = "N/A";
                for (var i = 0; i < row.team_members.length; i++) {
                    if (row.team_members[i].team_role_id == 1) {
                        _ret = row.team_members[i].user.first_name + " " + row.team_members[i].user.last_name;
                    }
                }
                return _ret;

            }
        });
        columns.push({
            field: "member",
            title: "Members",
            width: 100,
            template: function(row) {
                return row.team_members.length;
            }
        });
        columns.push({
            field: "event",
            title: "Events",
            width: 100,
            template: function(row) {
                return row.events.length;
            }
        });
        columns.push({
            field: "Actions",
            width: 100,
            title: "Actions",
            sortable: !1,
            overflow: "visible",
            template: function(t, e, a) {
                var html = "";
                var is_team_admin = false;
                var is_team_representative=false;
                for(var j=0; j<currentUser.team_members.length; j++){
                    if(currentUser.team_members[j].team_id == t.id){
                        if(currentUser.team_members[j].team_role_id == 1){
                            is_team_admin = true;                           
                        }
                        if(currentUser.team_members[j].team_role_id==3){
                             is_team_representative=true;   
                        }
                        break;
                    }
                }
                if(is_team_admin==true || currentUser.user_type==0 || is_team_representative==true){
                    html = '<a href="javascript:void(0)" class="m-portlet__nav-link btn m-btn m-btn--hover-accent m-btn--icon m-btn--icon-only m-btn--pill modal-activator" data-id="' + t.id + '" title="Edit details"><i class="la la-edit"></i></a>';
                    if(currentUser.user_type==0){
                        html += '<a href="javascript:void(0)" class="m-portlet__nav-link btn m-btn m-btn--hover-danger m-btn--icon m-btn--icon-only m-btn--pill btn-delete" data-id="' + t.id + '" title="Delete"><i class="la la-trash"></i></a>';
                    }
                } else {
                    html = '<span style="width: 120px;"><span class="m-badge m-badge--danger m-badge--wide">No Access</span></span>';
                }

                return html;
            }
        });

        var _self = this;


        this._table = jQuery("#team_datatable").mDatatable({
            data: {
                type: "remote",
                source: {
                    read: {
                        method: "GET",
                        url: environment.apiBaseUrl + "teams/list.json?user_id=" + user_id,
                        map: function(t: any) {
                            Helpers.setLoading(false);
                            _self._teamService.setTeamList(t.data);
                            var e = t;
                            return void 0 !== t.data && (e = t.data), e
                        }
                    }
                },
                pageSize: 10,
                serverPaging: !0,
                serverFiltering: !0,
                serverSorting: !0
            },
            layout: {
                scroll: !1,
                footer: !1
            },
            sortable: !0,
            pagination: !0,
            toolbar: {
                items: {
                    pagination: {
                        pageSizeSelect: [10, 20, 30, 50, 100]
                    }
                }
            },



            translate: {
                records: {
                    processing: 'Please wait...',
                    noRecords: 'No records found'
                },
                toolbar: {
                    pagination: {
                        items: {
                            default: {
                                first: 'First',
                                prev: 'Previous',
                                next: 'Next',
                                last: 'Last',
                                more: 'More pages',
                                input: 'Page number',
                                select: 'Select page size'
                            },                            
                            //info: 'Displaying {{start}} - {{end}} of {{total}} records'
                            info: 'Displaying total {{total}} records'
                        }
                    }
                }
            },
            
            search: {
                input: $("#generalSearch")
            },
            columns: columns
        });

        this._table.getDataSourceQuery();

        jQuery("#team_datatable").on("m-datatable--on-ajax-done", (e) => {
            this.dataTableAjaxDone.emit(e);
        });
    }
}