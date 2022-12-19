export class Budgets {

    // Team Edit
    id: number;
    amount: string;
    is_deleted: number;


    constructor() {
        this.reset();
    }

    public reset() {
        this.id = 0;
        this.amount = "";
        this.is_deleted = 0;
    }
}