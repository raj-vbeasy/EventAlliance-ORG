export class TeamRole {

    // Team Edit
    id: number;
    roleName: string;
    isDeleted: number;



    constructor() {
        this.reset();
    }

    public reset() {
        this.id = 0;
        this.roleName = "";
        this.isDeleted = 0;
    }
}