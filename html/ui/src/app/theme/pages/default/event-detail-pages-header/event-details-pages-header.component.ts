import { Component, ViewEncapsulation,Output,EventEmitter, Input, SimpleChanges, OnChanges } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { environment } from "../../../../../environments/environment";

declare var jQuery: any;

@Component({
    selector: "event-details-page-header",
    templateUrl: "./event-details-pages-header.component.html",
    encapsulation: ViewEncapsulation.None
})

export class EventDetailsPagesHeaderComponent implements OnChanges {

	@Input() eventDetails: any = {};
    @Input() page:string = "";

	public environment: any = environment;
    public step: number = 0;

	@Output() onSummaryModalClose: EventEmitter<void> = new EventEmitter<void>();
	@Output() onApprovalModalClose: EventEmitter<void> = new EventEmitter<void>();
	@Output() onPublicSurveyModalClose: EventEmitter<void> = new EventEmitter<void>();
	@Output() onPicksModalClose: EventEmitter<void> = new EventEmitter<void>();
    constructor(private _activatedRoute: ActivatedRoute) {
		
    }

    ngOnChanges(changes: SimpleChanges) {
        console.log(changes);
    }

    public stepChange(step){
        this.step = step;
    }

    public privateSurveyModal(team_review){
    	if(team_review == 1 ) {
	        this.step = 0;
	        console.log(this.step);
	        jQuery("#privateSurvey").modal("show").on("hidden.bs.modal", (e) => {
				console.log(this.page);
				
				switch(this.page){
					case "picks":
					 this.onPicksModalClose.emit();
					break;
					case "survey":
					console.log(this.page);
					 this.onPublicSurveyModalClose.emit();
					break;
					case "approval":
					 this.onApprovalModalClose.emit();
					break;
					case "summary":
					console.log(this.page);
					 this.onSummaryModalClose.emit();
					break;
				}
				
	        });
	    } else {
	    	alert("Team survey has been closed");
	    }
    }
}