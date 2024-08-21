import {Void} from "../../Classes/Activity_classes/class_Void.js";
import {WorkSlot} from "../../Classes/Activity_classes/class_WorkSlot.js";


class TimeframeContext {
    /*Creates a time canvas, instantiating time sections according to a split rule*/
    constructor(input) {
        this.timeframeTitle = input.timeframeTitle;
        this.startTime = input.startTime;
        this.endTime = input.endTime;
        this.staff = input.staff;
        this.generatedBlocks = [];
    };

    setSplitStrategy(input) {

        this.timeSplitStrategy = new input.strategy(
            {
                startTime: this.startTime,
                endTime: this.endTime,
                params: input.params
            });
        this.timeSplitArray = this.timeSplitStrategy.split();

        if (this.populationStrategy) {
            //updates the timeSplitArray inside the populationStrategy
            this.populationStrategy.timeGrid = this.timeSplitArray
            //reapplies the current population strategy
            this.populatedTimeSplit = this.populationStrategy.populate();
            this.preview();
        }

    };

    setPopulationStrategy(input) {
        this.populationStrategy = new input.strategy(
            {
                timeGrid: this.timeSplitArray,
                staff: this.staff,
                params: input.params
            }
        )
        this.populatedTimeSplit = this.populationStrategy.populate()
        this.preview();
    };


    preview() {
        this.generatedBlocks = [];
        this.generatedBlocks.push(
            ...this.populatedTimeSplit.map(timeSection => {

                return new WorkSlot(
                    {
                        date: timeSection.startTime,
                        duration: timeSection.duration,
                        staff: timeSection.worker
                    });
                })
        )
        this.generatedBlocks.push(
            ...this.populatedTimeSplit.map(timeSection => {

                return new Void(
                    {
                        date: timeSection.startTime,
                        duration: timeSection.duration,
                        staff: timeSection.available
                    });
            })
        )
    };






}

export {TimeframeContext};