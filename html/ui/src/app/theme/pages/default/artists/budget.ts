export class Budget {
    id: number;
    amount: string;
    isDeleted: number;


    constructor() {
        this.reset();
    }

    public reset() {
        this.id = 0;
        this.amount = "";
        this.isDeleted = 0;

    }
}