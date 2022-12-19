export class ArtistStatus {
    id: number;
    status: string;
    isDeleted: number;


    constructor() {
        this.reset();
    }

    public reset() {
        this.id = 0;
        this.status = "";
        this.isDeleted = 0;

    }
}