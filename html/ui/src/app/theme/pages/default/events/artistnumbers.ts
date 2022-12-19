export class ArtistNumbers {

    // Team Edit
    id: number;
    number_of_artist: string;
    is_deleted: number;


    constructor() {
        this.reset();
    }

    public reset() {
        this.id = 0;
        this.number_of_artist = "";
        this.is_deleted = 0;
    }
}