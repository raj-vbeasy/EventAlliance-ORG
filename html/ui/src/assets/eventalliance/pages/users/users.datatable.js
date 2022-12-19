var UserDatatableAjax = {
    init: function () {
        var t;
        (t = $(".m_datatable").mDatatable({
            data: {
                type: "remote",
                source: {
                    read: {
                        method: "GET",                       
                        url: "http://ea.rabidminds.com/staging/api/api_user.php", 
                        map: function (t) {
                            var e = t;
                            return void 0 !== t.data && (e = t.data), e
                        }
                    }
                },
                pageSize: 5,
                serverPaging: !1,
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
            search: {
                input: $("#generalSearch")
            },
            columns: [{
                field: "ID",
                title: "#",
                sortable: !0,
                width: 40,
                selector: !1,
                textAlign: "center"
            },{
                field: "ProfilePic",
                title: "",
                width: 75,
                template: function (t) {
                    return "<img style='border-radius: 50%' src="+t.ProfilePic+"/>"
                }
            }, {
                field: "FirstName",
                title: "Name",
                width: 150,
                template: function (t) {
                    return "<b>"+t.FirstName + "  " + t.LastName+"</b>"
                }
            }, {
                field: "Teams",
                title: "Teams"
            }, {
                field: "Role",
                title: "Role",
                width: 100
            }, {
                field: "Actions",
                width: 110,
                title: "Actions",
                sortable: !1,
                overflow: "visible",
                template: function (t, e, a) {
                    return '\t\t\t\t\t\t<div class="dropdown ' + (a.getPageSize() - e <= 4 ? "dropup" : "") + '">\t\t\t\t\t\t\t<a href="#" class="btn m-btn m-btn--hover-accent m-btn--icon m-btn--icon-only m-btn--pill" data-toggle="dropdown">                                <i class="la la-ellipsis-h"></i>                            </a>\t\t\t\t\t\t  \t<div class="dropdown-menu dropdown-menu-right">\t\t\t\t\t\t    \t<a class="dropdown-item" href="#"><i class="la la-edit"></i> Edit Details</a>\t\t\t\t\t\t    \t<a class="dropdown-item" href="#"><i class="la la-leaf"></i> Update Status</a>\t\t\t\t\t\t    \t<a class="dropdown-item" href="#"><i class="la la-print"></i> Generate Report</a>\t\t\t\t\t\t  \t</div>\t\t\t\t\t\t</div>\t\t\t\t\t\t<a href="#" class="m-portlet__nav-link btn m-btn m-btn--hover-accent m-btn--icon m-btn--icon-only m-btn--pill" title="Edit details">\t\t\t\t\t\t\t<i class="la la-edit"></i>\t\t\t\t\t\t</a>\t\t\t\t\t\t<a href="#" class="m-portlet__nav-link btn m-btn m-btn--hover-danger m-btn--icon m-btn--icon-only m-btn--pill" title="Delete">\t\t\t\t\t\t\t<i class="la la-trash"></i>\t\t\t\t\t\t</a>\t\t\t\t\t'
                }
            }]
        })).getDataSourceQuery(), $("#m_form_status").on("change", function () {
            t.search($(this).val().toLowerCase(), "Status")
        }), $("#m_form_type").on("change", function () {
            t.search($(this).val().toLowerCase(), "Type")
        }), $("#m_form_status, #m_form_type").selectpicker()
    }
};
jQuery(document).ready(function () {
    UserDatatableAjax.init()
});