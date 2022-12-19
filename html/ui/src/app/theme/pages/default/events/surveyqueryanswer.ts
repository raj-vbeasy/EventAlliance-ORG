export class SurveyQueryAnswer {
    id: number;
    answerTitle: string;
    surveyQueryId: number;
    isDeleted: number;


    constructor() {
        this.reset();
    }

    public reset() {
        this.id = 0;
        this.answerTitle = "";
        this.surveyQueryId = 0;
        this.isDeleted = 0;

    }
}