import {DateMethod} from "../../../utilities/DateHelperFunctions";
import {PopulationStrategy} from "./class_PopulationStrategy";

export class BestFit_GraphAnalytics extends PopulationStrategy{
    /*
    exclusionList: any;

    constructor(input: any) {
        super(input);
        this.exclusionList = [
            {
                staff: [],
                startTime: new Date(2024, 11, 19, 15, 0),
                duration: 30,
            }];
    };
    createGraph() {
        this.graphManager = new GraphManager(
            {
                staff: this.staff,
                timeSlots: this.timeSlots
            });
    };
    add_noConsecutiveSessions(): void {
        this.timeSlots[0].worker = []
        const graph = new Graph();
    };
    add_Unavailability() { // first criteria
        const exclusionCoversTimeSplitPeriod = (exclusion, timesplit) => {
            const compareStarts = (exclusion, timesplit) => timesplit.startTime <= exclusion.startTime;
            const compareEnds = (exclusion, timesplit) => DateMethod.addMinutes(timesplit.startTime, timesplit.duration) <= DateMethod.addMinutes(exclusion.startTime, exclusion.duration);

            return  compareStarts(exclusion, timesplit) && compareEnds(exclusion, timesplit);
        }

        for (const timeslot of this.timeSlots) {
            for (const exclusion of this.exclusionList) {
                if (exclusionCoversTimeSplitPeriod(exclusion, timeslot)) {
                    //edgeValue for exclusion artist is 0
                }
            }
        }
    }
    populate() {
        this.createGraph();

        this.add_Unavailability();
        this.add_noConsecutiveSessions();
        this.graphManager.run()
        return this.timeSlots
    };
*/
}
