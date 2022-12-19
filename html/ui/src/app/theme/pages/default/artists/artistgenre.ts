import { Genres } from "./genres";

export class ArtistGenre {
    id: number;
    artistId: number;
    genreId: number;
    name: Array<any>;


    constructor() {
        this.reset();
    }

    public reset() {
        this.id = 0;
        this.artistId = 0;
        this.genreId = 0;
        this.name = [];

    }
}
