export class TimeSplit_Strategy{
    startTime: Date;
    endTime: Date;
    timeSlots: any[]
    constructor(input: any){
        this.startTime = input.startTime;
        this.endTime = input.endTime;
        this.timeSlots = [];
    };
}
