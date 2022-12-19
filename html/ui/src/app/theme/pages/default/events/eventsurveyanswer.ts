export class EventSurveyAnswer {
    id: number;
    eventSurveyId: number; //Array;
    surveyQueryId: number; //Array; 
    surveyQueryAnswerId: number; //Array; 


    constructor() {
        this.reset();
    }

    public reset() {
        this.id = 0;
        this.eventSurveyId = 0; //[];
        this.surveyQueryId = 0; //[];
        this.surveyQueryAnswerId = 0; // [];

    }
}