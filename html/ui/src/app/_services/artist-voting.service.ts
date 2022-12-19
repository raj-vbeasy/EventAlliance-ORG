import { Injectable, ErrorHandler } from "@angular/core";
import { Observable } from 'rxjs';

@Injectable()
export class ArtistVoting {

    private _observer: any;
    public VotingStream: Observable<Vote>;

    constructor() {
        this.VotingStream = Observable.create((observer) => {
            this._observer = observer;
        });
    }

    public vote(vote: number /*0,1*/, artistId: number = null) {
        var _vote = new Vote();
        _vote.artistId = artistId;
        _vote.vote = vote;
        this._observer.next(_vote);
    }

}

export class Vote {
    public artistId: number;
    public vote: number;
}