import {TimeSplit_Interface} from "./TimeSplitStrategy/class_TimeSplit_Interface";
import {TimeSplitSelector} from "./TimeSplitStrategy/class_TimeSplitSelector";
import {PopulationSelector} from "./PopulationStrategy/class_PopulationSelector";
import {Population_Interface} from "./PopulationStrategy/class_Population_Interface";


export class TimeframeContext {
    generatedBlocks: any[]
    timeframeTitle: string;
    startTime: Date;
    endTime: Date;
    staff: any[];

    timeSplit: any;
    population: any;
    /*
    * Creates a time canvas, instantiating timeSlots according to a split rule
    * Use of the bridge pattern to aggregate different interfaces of strategy
    * */
    constructor(input: any) {
        this.timeframeTitle = input.timeframeTitle;
        this.startTime = input.startTime;
        this.endTime = input.endTime;
        this.staff = input.staff;

        this.generatedBlocks = [];

        //initialize the interfaces with default strategies
        this.timeSplit = new TimeSplit_Interface(
            {
                startTime: this.startTime,
                endTime: this.endTime
            });
        this.timeSplit.setStrategy(
            {
                strategy: new TimeSplitSelector('defaultOneBlock'),
                params: input.params
            });
        this.population = new Population_Interface(
            {
                staff: this.staff
            });
        this.population.setStrategy(
            {
                strategy: new PopulationSelector('defaultNoStaff'),
                timeSlots: this.timeSplit.strategy.timeSlots,
                params: input.params
            });
    };
    setTimeSplitStrategy(input: any): void {
        this.timeSplit.setStrategy(
            {
                strategy: new TimeSplitSelector(input.strategy),
                params: input.params
            });
    };
    setPopulationStrategy(input: any): void {
        this.population.setStrategy(
            {
                strategy: new PopulationSelector(input.strategy),
                timeSlots: this.timeSplit.strategy.timeSlots,
                params: input.params
            });
    };
    generate(): void {
        //updates population strategy
        this.population.strategy.timeSlots = this.timeSplit.strategy.timeSlots;
        this.population.strategy.populate();
    };

    preview(): void {
        this.generate();
        this.generatedBlocks = [];

        this.generatedBlocks.push(
            ...this.population.strategy.timeSlots.map((timeSection: any) => {
                return {
                        date: timeSection.startTime,
                        duration: timeSection.duration,
                        staff: timeSection.worker
                    }
            })
        )
        this.generatedBlocks.push(
            ...this.population.strategy.timeSlots.map((timeSection: any) => {
                return{
                        date: timeSection.startTime,
                        duration: timeSection.duration,
                        staff: timeSection.available
                    }
            })
        )


        //TODO: ICI CHAOS
        /*
        this.generatedBlocks.push(
            ...this.population.strategy.timeSlots.map(timeSection => {
                return new No(
                    {
                        date: timeSection.startTime,
                        duration: timeSection.duration,
                        staff: timeSection.staff
                    });
            })
        )

         */
    };
}

