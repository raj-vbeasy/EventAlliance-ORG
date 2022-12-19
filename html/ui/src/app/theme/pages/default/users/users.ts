export class Users {
    id: number;
    first_name: string;
    last_name: string;
    phone_no: string;
    email: string;
    is_admin: number;
    password: string;
    profile_pic: string;
    created_at: Date;
    updated_at: Date;
    token: string;
    user_type: number;
    teamList: Array<any>;
    temp_photo_id: number;
    team_ids:Array<any>;
    

    constructor() {
        this.reset();
    }
    
    public reset() {
        this.id = 0;
        this.first_name = "";
        this.last_name = "";
        this.email = "";
        this.phone_no = "";
        this.is_admin = 0;
        this.password = "";
        this.profile_pic = null;
        this.created_at = null;
        this.updated_at = null;
        this.token = "";
        this.user_type = 0;
        this.teamList = [];
        this.temp_photo_id = 0;
        this.team_ids = [];
        
    }
}
