export class TeamMember {

    id: number;
    image: string;
    name: string;
    roleId: number;
    role: string;
    userId: number;
    status: number;

    constructor() {
        this.reset();
    }

    public reset() {
        this.id = 0;
        this.userId = 0;
        this.roleId = 0;
        this.image = "";
        this.name = "";
        this.role = "";
        this.status = 0;
    }
}