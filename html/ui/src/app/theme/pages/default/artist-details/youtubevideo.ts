
export class YouTubeVideo {

    videoId: string;
    thumbnailsUrl: string;
    channelId: string;
    channelTitle: string;
    videoTitle: string;
    videoDescription: string;

    constructor() {
        this.reset();
    }

    public reset() {
        this.videoId = "";
        this.thumbnailsUrl = "";
        this.channelId = "";
        this.channelTitle = "";
        this.videoTitle = "";
        this.videoDescription = "";
    }
}