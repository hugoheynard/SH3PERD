import {Void} from "../../Classes/Activity_classes/class_Void.js";
import {artistMockupDB} from "../../../db/fakeDB.js";


class TimeframeContext {
    /*Creates a time canvas, instantiating time sections according to a split rule*/
    constructor(input) {
        this.timeframeTitle = input.timeframeTitle;
        this.startTime = input.startTime;
        this.endTime = input.endTime;
        this.staffCategory = input.staffCategory;
        this.generatedBlocks = [];
    };

    setSplitStrategy(input) {
        this.timeSplitStrategy = new input.strategy(
            {
                startTime: this.startTime,
                endTime: this.endTime,
                params: input.params
            });
    };

    setPopulationStrategy(input) {
        this.populationStrategy = new input.strategy(
            {
                timeGrid: this.timeSplitStrategy.splitArray,
                staff: artistMockupDB.filter(member => member.category === 'dj'),
                params: input.params
            }
        )
    };

    preview() {
        this.generatedBlocks.push(
            ...this.timeSplitStrategy.splitArray.map(timeSection => {

                return new Void(
                    {
                        date: timeSection.startTime,
                        duration: timeSection.duration,
                        staff: artistMockupDB.filter(member=> member.category === 'dj')
                    });
                })
        )
    };






}

export {TimeframeContext};