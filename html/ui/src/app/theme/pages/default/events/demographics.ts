export class Demographics {
    id: number;
    name: string;
    isDeleted: number;


    constructor() {
        this.reset();
    }

    public reset() {
        this.id = 0;
        this.name = "";
        this.isDeleted = 0;

    }
}