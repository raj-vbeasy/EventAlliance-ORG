import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Helpers } from '../../../helpers';


@Component({
    selector: "app-footer",
    templateUrl: "./footer.component.html",
    encapsulation: ViewEncapsulation.None,
})
export class FooterComponent implements OnInit {

	public currentYear: any;

    constructor() {

    }
    ngOnInit() {
    	this.currentYear =  new Date();    	
    }

}