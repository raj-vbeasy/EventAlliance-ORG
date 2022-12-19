export class EventSurvey {
    id: number;
    ip: string;
    eventId: number;
    artistId: number;
    artistRate: number;
    surveyCreate: number; // Team Id
    optInEmailId: string;



    constructor() {
        this.reset();
    }

    public reset() {
        this.id = 0;
        this.ip = "";
        this.eventId = 0;
        this.artistId = 0;
        this.artistRate = 0;
        this.surveyCreate = 0;
        this.optInEmailId = "";
    }
}