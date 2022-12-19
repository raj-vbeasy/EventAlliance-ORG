import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Helpers } from '../../../../helpers';


@Component({
    selector: "app-summary",
    templateUrl: "./summary.component.html",
    encapsulation: ViewEncapsulation.None,
})
export class SummaryComponent implements OnInit {

	
    constructor() {

    }
	
	ReloadDatatable(){
		console.log('hello');
	}
    ngOnInit() {

    }

}