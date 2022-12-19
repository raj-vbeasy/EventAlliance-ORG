//import { Genre } from "./genre";
import { ArtistGenre } from "./artistgenre";
import { ArtistChannel } from "./artistchannel";

export class Artist {
    id: number;
    profilePicture: string;
    name: string;
    genres: Array<ArtistGenre>;
    totalview: number;
    subscribers: number;
    budget: string;
	budgetId:number;
    channel: Array<ArtistChannel>;
	channelIds:string;

    constructor() {
        this.reset();
    }

    public reset() {
        this.id = 0;
        this.profilePicture = "./assets/eventalliance/media/img/no-image.jpg";
        this.name = "";
        this.genres = [];
        this.totalview = 0;
        this.subscribers = 0;
        this.budget = "";
		this.budgetId=0;
        this.channel = [];
		this.channelIds="";
    }
}