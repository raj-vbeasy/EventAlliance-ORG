import { Injectable } from '@angular/core';
//import { RouterLink } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { Helpers } from '../../../../helpers';

import { EventService } from './events.service';

declare var jQuery: any;

@Injectable()
export class EventDataTable {

    private _table: any;

    constructor(private _eventService: EventService) {
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

    load() {

        var user_id = 0;
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if(currentUser){
            user_id = currentUser.id;
        }

        var columns = [];
        var image: string;
        columns.push({
            field: "name",
            title: "Title",
            width: 300,
            template: function(row) {

                if (row.profile_picture != null && row.profile_picture != "") {
                    image = environment.graphicsBaseUrl + "event/" + row.profile_picture;
                } else {
                    image = "./assets/eventalliance/media/img/no-image.jpg";
                }
                return '<a href="event-summary/' + row.id + '"  class="m-menu__link"> <img src="' + image + '" style="border-radius: 50%; height:50px; width:50px; float:left" alt="" /><span style="display: block; padding-left: 60px; padding-top: 10px;"><strong>' + row.name + '</strong></span></a>';
            }
        });
        /*
        columns.push({
            field: "status",
            title: "Status",
            width: 120,
            template: function(row) {
                //1=Churn, 2=In-Review, 3=Quote Request, 4=Booked
                if (row.status == 1) {
                    return '<span class="m-badge m-badge--brand m-badge--wide">Churn</span>';
                } else if (row.status == 2) {
                    return '<span class="m-badge m-badge--brand m-badge--wide">In-Review</span>';
                } else if (row.status == 3) {
                    return '<span class="m-badge m-badge--brand m-badge--wide">Quote Request</span>';
                } else if (row.status == 4) {
                    return '<span class="m-badge m-badge--brand m-badge--wide">Booked</span>';
                } else {
                    return '<span class="m-badge m-badge--brand m-badge--wide">Unknown</span>';
                }
            }
        });
        */
        columns.push({
            field: "team_id",
            title: "Team",
            template: function(row) {
                return row.team.name;
            }
        });
        columns.push({
            field: "start_date",
            title: "EventDate",
            width: 180,
            template: function(row) {
                var start_date_time = new Date(row.start_date);
                var startDate = (start_date_time.getMonth() + 1) + '/' + start_date_time.getDate() + '/' + start_date_time.getFullYear();

                var end_date_time = new Date(row.end_date);
                var endDate = (end_date_time.getMonth() + 1) + '/' + end_date_time.getDate() + '/' + end_date_time.getFullYear();
                return startDate + ' - ' + endDate;
            }
        });
        columns.push({
            field: "ea_representative",
            title: "EARep",
            template: function(t, e, a) {
                for (var i = 0; i < t.team.team_members.length; i++) {
                    if (t.team.team_members[i].team_role_id == 3) { /* roleid=3 means EA Representative */
                        return t.team.team_members[i].user.first_name + " " + t.team.team_members[i].user.last_name;
                    }
                }
                return "N/A";
            }
        });
        columns.push({
            field: "updated_at",
            title: "LastActivity",
            width: 100,
            template: function(row) {
                var updated_date_time = new Date(row.updated_at);
                var updateDate = (updated_date_time.getMonth() + 1) + '/' + updated_date_time.getDate() + '/' + updated_date_time.getFullYear();
                return updateDate;
            }
        });
        columns.push({
            field: "Actions",
            title: "Actions",
            width: 80,
            overflow: "visible",
            template: function(t, e, a) {
                var html = "";
                var is_team_admin = false;
                var is_team_representative = false;
                for(var j=0; j<currentUser.team_members.length; j++){
                    if(currentUser.team_members[j].team_id == t.team_id){
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
                    html = '<a href="#" class="m-portlet__nav-link btn m-btn m-btn--hover-accent m-btn--icon m-btn--icon-only m-btn--pill modal-activator"  data-id="' + t.id + '" title="Edit details"><i class="la la-edit"></i></a>';
                    if(currentUser.user_type==0){
                        html += '<a href="javascript:void(0)" class="m-portlet__nav-link btn m-btn m-btn--hover-danger m-btn--icon m-btn--icon-only m-btn--pill btn-delete" data-id="' + t.id + '" title="Delete"><i class="la la-trash"></i></a>';
                    }
                } else {
                    html = '<span style="width: 120px;"><span class="m-badge m-badge--danger m-badge--wide">No Access</span></span>';
                }

                return html;


               // return '<a href="#" class="m-portlet__nav-link btn m-btn m-btn--hover-accent m-btn--icon m-btn--icon-only m-btn--pill modal-activator"  data-id="' + t.id + '" title="Edit details"><i class="la la-edit"></i></a><a href="javascript:void(0)" class="m-portlet__nav-link btn m-btn m-btn--hover-danger m-btn--icon m-btn--icon-only m-btn--pill" title="Delete"><i class="la la-trash"></i></a>'
            }
        });

        var _self = this;

       

        this._table = jQuery("#event_datatable").mDatatable({
            data: {
                type: "remote",
                source: {
                    read: {
                        method: "GET",
                        url: environment.apiBaseUrl + "events/list.json?user_id=" + user_id,
                        map: function(t) {
                            Helpers.setLoading(false);
                            _self._eventService.setEventList(t.data);
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
            serverFiltering: true,
            columns: columns
        });

        this._table.getDataSourceQuery();
    }
}