import { Injectable, EventEmitter, Output } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Helpers } from '../../../../helpers';
import { UserService } from './users.service';

declare var jQuery: any;

@Injectable()
export class UsersDataTable {

    @Output() dataTableAjaxDone: EventEmitter<any> = new EventEmitter<any>();

    private _table: any;

    constructor(private _userService: UserService) {
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
        var columns = [];

        var user_id = 0;
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if(currentUser){
            user_id = currentUser.id;
        }

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
            title: "Name",
            template: function(row) {
                return row.first_name + " " + row.last_name;
            }
        });
        columns.push({
            field: "teams",
            title: "Teams",
            template: function(row) {
                if (row.team_members.length > 0) {                    
                    var teams: Array<any> = [];
                    for (var g = 0; g < row.team_members.length; g++) {
                            teams.push(row.team_members[g].team.name);                           
                        }
                    return teams.join(',');
                } else {
                    return "N/A";
                }
            }
        });
        columns.push({
            field: "user_type",
            title: "Role",           
            template: function(row) {
                //1=Churn, 2=In-Review, 3=Quote Request, 4=Booked
                if (row.user_type == 0) {
                    return 'Super Admin';
                } else if (row.user_type == 1) {
                    return 'Team Admin';
                } else if (row.user_type == 2) {
                    return 'Team Member';
                } else if (row.user_type == 3) {
                    return 'EA Representative';
                } else {
                    return 'N/A';
                }
            }
        });
        columns.push({
            field: "phone_no",
            title: "Phone No"
        });
        columns.push({
            field: "email",
            title: "Email"
        });

         if(currentUser.user_type==0){
            columns.push({
                field: "Actions",
                width: 80,
                title: "Actions",
                sortable: !1,
                overflow: "visible",
                template: function(t, e, a) {
                    return '<a href="javascript:void(0)" class="m-portlet__nav-link btn m-btn m-btn--hover-accent m-btn--icon m-btn--icon-only m-btn--pill modal-activator" data-id="' + t.id + '" title="Edit details"><i class="la la-edit"></i></a><a href="javascript:void(0)" class="m-portlet__nav-link btn m-btn m-btn--hover-danger m-btn--icon m-btn--icon-only m-btn--pill btn-delete" data-id="' + t.id + '" title="Delete"><i class="la la-trash"></i></a>';
                }
            });
        }



        var _self = this;

        this._table = jQuery("#user_datatable").mDatatable({
            data: {
                type: "remote",
                source: {
                    read: {
                        method: "GET",
                        url: environment.apiBaseUrl + "users/list.json?user_id=" + user_id,
                        map: function(t: any) {  
                            Helpers.setLoading(false);                          
                            _self._userService.setUsersList(t.data);
                            var e = t;                            
                            return void 0 !== t.data && (e = t.data), e
                        }
                    }
                },
                pageSize: 10,
                serverPaging: !0,
                serverFiltering: !0,
                serverSorting: !0,
                stateSave: !1
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
                onEnter: false,
                input: jQuery("#userName")

            },
            columns: columns
        });

        jQuery("#userRole").on("change", function(e) {
            console.dir(this._table);
            //this._table.search(jQuery(this).val(),"Email");
        });


        this._table.getDataSourceQuery();

        jQuery("#user_datatable").on("m-datatable--on-ajax-done", (e) => {
            this.dataTableAjaxDone.emit(e);
        });
    }
}