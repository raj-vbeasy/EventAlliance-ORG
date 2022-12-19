export class Channel {
    id: number;
    channelIds: string;
    channelTitle: string;
    channelDescription: string;
    channelViewCount: number;
    channelSubscriberCount: number;
    channelVideoCount: number;
    channelCommentCount: number;
    createdAt: number;
    isDeleted: number;




    constructor() {
        this.reset();
    }

    public reset() {
        this.id = 0;
        this.channelIds = "";
        this.channelTitle = "";
        this.channelDescription = "";
        this.channelViewCount = 0;
        this.channelSubscriberCount = 0;
        this.channelVideoCount = 0;
        this.channelCommentCount = 0;
        this.createdAt = null;
        this.isDeleted = 0;


    }
}