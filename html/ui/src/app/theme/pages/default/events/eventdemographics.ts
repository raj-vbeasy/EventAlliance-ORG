export class EventDemographics {
    id: number;
    eventId: number; //Array;
    demographicId: number; //Array;  


    constructor() {
        this.reset();
    }

    public reset() {
        this.id = 0;
        this.eventId = 0; //[];
        this.demographicId = 0; //[];

    }
}