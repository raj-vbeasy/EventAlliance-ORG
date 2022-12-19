//import { TeamMember } from "./teammember";

export class Event {
    id: number;
    name: string;
    start_date: Date;
    end_date: Date;
    profile_picture: string;
    description: string;
    venue_name: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    zip: string;
    budget_id: number;
    artist_number: any;
    budget: any;
    event_genres: Array<any>;
    event_demographics: Array<any>;
    mode: string;
    url: string;
    public_survey_main_picture: string;
    public_survey_status: string;
    public_survey_title: string;
    welcome_message: string;
    legal_disclaimer: string;
    event_description: string;
    opt_in: number;
    opt_in_message: string;
    thanks_message: string;
    review_enable: number;
    updated_at: Date;
    number_of_artist: number;
    team_id: number;
    event_picture_temp_id: number;
    survey_main_picture_temp_id: number;
	survey_questions:Array<any>;
    team:Array<any>;
    event_team_members: Array<any>;

    constructor() {
        this.reset();
    }

    public reset() {
        this.id = 0;
        this.name = "";
        this.start_date = null;
        this.end_date = null;
        this.profile_picture = null;
        this.description = "";
        this.venue_name = "";
        this.address_line_1 = "";
        this.address_line_2 = "";
        this.city = "";
        this.state = "";
        this.zip = "";
        this.budget_id = 0;
        this.artist_number = {};
        this.budget = {};
        this.event_genres = [];
        this.event_demographics = [];
        this.mode = "";
        this.url = "";
        this.public_survey_main_picture = null;
        this.public_survey_status = "";
        this.public_survey_title = "";
        this.welcome_message = "";
        this.legal_disclaimer = "";
        this.event_description = "";
        this.opt_in = 0;
        this.opt_in_message = "";
        this.thanks_message = "";
        this.review_enable = 0;
        this.updated_at = null;
        this.number_of_artist = 0;
        this.team_id = 0;
        this.event_picture_temp_id = 0;
        this.survey_main_picture_temp_id = 0;
		this.survey_questions=[];
        this.team=[];
        this.event_team_members = [];
    }
}