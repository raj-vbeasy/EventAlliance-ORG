import { TeamMember } from "./teammember";
import { Event } from '../events/event';

export class Team {
    id: number;
    name: string;
    photo: string;
    members: Array<TeamMember>;
    owner: TeamMember;
    events: Array<Event>;
    representative: TeamMember;
    photo_temp_id: number;
   // status: number;

    constructor() {
        this.reset();
    }

    public reset() {
        this.id = 0;
        this.name = "";
        this.photo = null;
        this.members = [];
        this.owner = null;
        this.representative = null;
        this.events = [];
        this.photo_temp_id = 0;
        //this.status = 0;
    }
}
