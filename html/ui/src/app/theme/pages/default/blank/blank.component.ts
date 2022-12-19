import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({

    selector: 'app-blank',
    templateUrl: './blank.component.html',
    // encapsulation: ViewEncapsulation.None,
})
export class BlankComponent implements OnInit {

    x: "xxxx";
    constructor() {

    }

    ngOnInit() {
    }
}