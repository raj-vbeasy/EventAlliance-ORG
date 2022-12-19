import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Helpers } from '../../../../helpers';
import { ScriptLoaderService } from '../../../../_services/script-loader.service';


@Component({
    selector: "app-insights",
    templateUrl: "./insights.component.html",
    encapsulation: ViewEncapsulation.None,
})
export class InsightsComponent implements OnInit {


    constructor(private _script: ScriptLoaderService) {

    }
    ngOnInit() {

    }
    ngAfterViewInit() {
        this._script.loadScripts('app-insights',
            ['assets/app/js/dashboard.js']);

    }

}