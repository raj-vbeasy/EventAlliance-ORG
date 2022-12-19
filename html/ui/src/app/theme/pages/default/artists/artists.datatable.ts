import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Helpers } from '../../../../helpers';
import { Artist } from './artist';
import { ArtistGenre } from './artistgenre'
 

declare var jQuery: any;

@Injectable()
export class ArtistDataTable {

    private _table: any;

    constructor() {
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
        var columns = [];

        var is_admin = 0;
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
       // console.log(currentUser);

        if(currentUser){
            is_admin = currentUser.is_admin;
        }

        columns.push({
            field: "",
            title: "ID",
            width: 15,
            template: function(row) {               
                    return '<input type="checkbox" class="deleteRow" value="' + row.id + '">';            

            }
        });
        columns.push({
            field: "name",
            title: "Name",
            width: 300,
            template: function(row) {
                var _img;
                if (row.profilePicture != null && row.profilePicture != "") {
                    _img = row.profilePicture;
                } else {
                    _img = "./assets/eventalliance/media/img/no-image.jpg";
                }

                return '<a href="artist-details/' + row.id + '"  class="m-menu__link"> <img src="' + _img + '" style="border-radius: 50%; height:50px; width:50px; float:left" alt="" /><span style="display: block; padding-left: 60px; padding-top: 13px;"><strong>' + row.name + '</strong></span></a>';
            }
        });
        columns.push({
            field: "Genres",
            title: "Genres",
            width: 150,
            template: function(row) {
                if (row.genres.length > 0) {
                    return row.genres.join(", ");
                } else {
                    return "N/A";
                }

            }
        });
        columns.push({
            field: "totalview",
            title: "Total Views",
            width: 80,
            template: function(row) {
                return row.totalview;
            }
        });
        columns.push({
            field: "Subscriber",
            title: "Subscriber",
            width: 80,
            template: function(row) {
                return row.subscribers;
            }
        });
        columns.push({
            field: "Budget",
            title: "Budget",
            width: 100,
            template: function(row) {
                return row.budget;
            }
        });

        if(currentUser.user_type==0){
            columns.push({
                field: "Actions",
                width: 100,
                title: "Actions",
                sortable: !1,
                overflow: "visible",
                template: function(t, e, a) {
                    //return '<a href="javascript:void(0)" class="m-portlet__nav-link btn m-btn m-btn--hover-accent m-btn--icon m-btn--icon-only m-btn--pill modal-activator" data-id="' + t.id + '" title="Edit details"><i class="la la-edit"></i></a><a href="javascript:void(0)" class="m-portlet__nav-link btn m-btn m-btn--hover-danger m-btn--icon m-btn--icon-only m-btn--pill" title="Delete"><i class="la la-trash"></i></a>'
                    return '<a href="javascript:void(0)" class="m-portlet__nav-link btn m-btn m-btn--hover-accent m-btn--icon m-btn--icon-only m-btn--pill modal-activator" data-id="' + t.id + '" title="Edit details"><i class="la la-edit"></i></a><a href="javascript:void(0)" class="m-portlet__nav-link btn m-btn m-btn--hover-accent m-btn--icon m-btn--icon-only m-btn--pill modal-activator-events" data-id="' + t.id + '" title="Add Event"><i class="la la-plus-circle"></i></a><a href="javascript:void(0)" class="m-portlet__nav-link btn m-btn m-btn--hover-danger m-btn--icon m-btn--icon-only m-btn--pill btn-delete" data-id="' + t.id + '" title="Delete"><i class="la la-trash"></i></a>'
                }
            });
        }

        this._table = jQuery("#artist_datatable").mDatatable({
            data: {
                type: "remote",
                source: {
                    read: {
                        method: "GET",
                        url: environment.apiBaseUrl + "artists/list.json",
                        map: function(t: any) {
                            Helpers.setLoading(false);
                            var artists: Array<Artist> = [];
                            var _artist: Artist;
                            var _artistGenre = ArtistGenre;

                            for (var i = 0; i < t.data.length; i++) {
                                _artist = new Artist();
                                _artist.id = t.data[i].id;
                                _artist.profilePicture = t.data[i].profile_picture;
                                _artist.name = t.data[i].name;

                                _artist.budget = t.data[i].budget ? t.data[i].budget.amount : 0;
                                //console.log(t.data[i]);
                                // artist genres
                                for (var g = 0; g < t.data[i].artist_genres.length; g++) {
                                    _artist.genres.push(t.data[i].artist_genres[g].genre.name);
                                }

                                // artist channel
                                var _totalView = 0;
                                var _totalSubscribe = 0;
                                for (var c = 0; c < t.data[i].artist_channels.length; c++) {
                                    _totalView += t.data[i].artist_channels[c].channel.channel_view_count;
                                    _totalSubscribe += t.data[i].artist_channels[c].channel.channel_subscriber_count;

                                }
                                _artist.totalview = _totalView;
                                _artist.subscribers = _totalSubscribe;


                                artists.push(_artist);
                            }
                            return artists;
                        }
                    }
                },
                pageSize: 100,
                serverPaging: !0,
                serverFiltering: !0,
                serverSorting: !0               
            },
            layout: {
                scroll: !1,
                footer: !1
            },
            sortable: !1,
            pagination: !0,
            toolbar: {
                items: {
                    pagination: {
                        pageSizeSelect: [100, 500, 1000]
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
    }
}