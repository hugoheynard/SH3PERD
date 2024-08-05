import {Calendar} from "./class_Calendar.js";
import {IndividualPlanning} from "./class_IndividualPlanning.js";
import {addMinutes} from "../../../../BackEnd/Utilities/Date_functions.js";


class CalendarIndiv extends Calendar{
    constructor(timeTable, staffList, baseIndex) {
        super(timeTable, staffList, baseIndex = 0);
    };

    listGranularity(staffList) {
        const matrixList = [];

        for (const staff of staffList) {
            matrixList.push( [staff] );
        }

        return matrixList;
    };

    //render(){

        //super.render();

        //this.buildPartnerCrossPlanning(this.timeTable, this.currentArtist);

    //};



    buildPartnerCrossPlanning(timeTable, artist) {
        //displays a planning of the performances timing interaction

        //FIND CROSS BLOCKS
        const artistBlockList = [];
        const partnerBlockList = [];
        const crossBlockList = [];

        for (const block of timeTable) {

            if(block.type === "show") {

                if(block.staff.includes(artist)) {

                    artistBlockList.push(block);

                } else {

                    partnerBlockList.push(block);

                }


            }

        }

        for (const artistBlock of artistBlockList) {

            const blockStartDate = artistBlock.date;
            const blockEndDate = addMinutes(artistBlock.date, artistBlock.duration);

            for (const partnerBlock of partnerBlockList) {

                const partnerBlockStepArray = [];

                //iterates by 5 mins increment to see if there is a part located between start and end of artist block
                for (let i = 0; i < partnerBlock.duration; i += 5 ) {

                    const partnerBlockIncrement = addMinutes(partnerBlock.date, i)

                    if(partnerBlockIncrement >= blockStartDate &&  partnerBlockIncrement <= blockEndDate) {

                        partnerBlockStepArray.push(partnerBlockIncrement);
                    }

                }

                /*if cross, make a copy of the object and assign the specs of the cross section*/

                if(partnerBlockStepArray.length){

                    const blockCopy = Object.assign({}, partnerBlock);

                    blockCopy.date = new Date(partnerBlockStepArray[0]);
                    blockCopy.duration = partnerBlockStepArray.length * 5;

                    crossBlockList.push(blockCopy)

                }

            }

        }

        //CREATES THE CROSS CALENDAR
        for (const member of this.staffList) {

            if(member !== artist) {

                const pcpContainer = document.createElement('div');
                pcpContainer.setAttribute('id', 'pcpContainer')

                document.getElementById('calendars').appendChild(pcpContainer)

                new IndividualPlanning("pcp", "pcpContainer", crossBlockList, member, this.offset);
            }

        }

    };

}

export {CalendarIndiv};