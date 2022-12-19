export class Question {
	id: number;
	question: string;
	options: Array<{id: number, option: string }>;

	constructor(){
		this.reset()
	}

	public reset() {
		this.id = 0;
		this.question = "";
		this.options  =  [];
	}

	addOption(option:string="", id:number=0){
		this.options.push({id:id, option:option});
	}
}