import { Channel } from "./channel";

export class ArtistChannel {
    id: number;
    artistId: number;
    channelId: Array<Channel>;
    eventId: number;
    channel: Array<Channel>;



    constructor() {
        this.reset();
    }

    public reset() {
        this.id = 0;
        this.artistId = 0;
        this.channelId = [];
        this.eventId = 0;
        this.channel = [];
    }
}