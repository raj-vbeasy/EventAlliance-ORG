export class TeamMember {

    id: number;
    user_id: number;
    team_id: number;
    team_role_id: number;
    team: Array<any>;


    constructor() {
        this.reset();
    }

    public reset() {
        this.id = 0;
        this.user_id = 0;
        this.team_id = 0;
        this.team_role_id = 0;
        this.team = [];
    }
}