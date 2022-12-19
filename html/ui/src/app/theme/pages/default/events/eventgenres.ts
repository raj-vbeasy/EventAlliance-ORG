export class EventGenres {
    id: number;
    eventId: number; //Array;
    genreId: number; //Array;  


    constructor() {
        this.reset();
    }

    public reset() {
        this.id = 0;
        this.eventId = 0; //[];
        this.genreId = 0; //[];

    }
}