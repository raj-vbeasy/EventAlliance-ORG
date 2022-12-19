export class eventSurvey {
    id: number;
    ip: string;
    event_id: number;
    take_survey: number;
    artist_rate: number;
    question_option1_id: number;
    question_option2_id: number;
    artist_id: number;
    survey_create: number;
    email: string;
    survey_date: Date;

    constructor() {
        this.reset();
    }

    public reset() {
        this.id = 0;
        this.ip = "";
        this.event_id = 0;
        this.take_survey = 0;
        this.artist_rate = 0;
        this.question_option1_id = 0;
        this.question_option2_id = 0;
        this.artist_id = 0;
        this.survey_create = 0;
        this.email = "";
        this.survey_date = null;
    }
}