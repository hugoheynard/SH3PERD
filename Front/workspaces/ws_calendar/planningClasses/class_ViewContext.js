import {CalendarIndiv} from "./class_CalendarIndiv.js";
import {CalendarPerCat} from "./class_CalendarPerCat.js";
import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {MiniCalendar} from "../../../frontElements/Classes/class_MiniCalendar.js";
import {PlanningFilters} from "./class_PlanningFilters.js";
import {CalendarAll} from "./class_CalendarAll.js";
import {addMinutes} from "../../../../BackEnd/Utilities/Date_functions.js";
import {IndividualPlanning} from "./class_IndividualPlanning.js";

class ViewContext {
    constructor(timetable, artistList) {

        this.timeTable = timetable;
        this.artistList = artistList;
        this.indivView = new CalendarIndiv(this.timeTable, this.artistList);
        this.perCatView = new CalendarPerCat(this.timeTable, this.artistList);
        this.allView = new CalendarAll(this.timeTable, this.artistList);

        this.wsPageContainer = new HTMLelem('div', 'wsPage_Calendars').render();
        this.calContainer = new HTMLelem('div', 'calContainer').render();
        this.leftSideContainer = new HTMLelem('div', 'leftSideElements', 'popMenu').render();
        this.wsPageContainer.appendChild(this.leftSideContainer);
        this.wsPageContainer.appendChild(this.calContainer);

        this.viewAll();
    };

    buildView() {
        this.undisplayCalendar();
        this.calContainer.appendChild(this.currentView.header);
        this.calContainer.appendChild(this.currentView.htmlElement);
        this.addMiniCalendar();
        this.addFilters();
        this.viewControls();
    };
    viewIndiv = () => this.currentView = this.indivView;
    viewPerCat = () => this.currentView = this.perCatView;
    viewAll = () => this.currentView = this.allView;
    viewControls() {
        document.addEventListener('keydown', (event)=>{

            switch(event.key){

                case '1':
                    this.viewIndiv();
                    break;

                case '2':
                    this.viewPerCat();
                    break;

                case '+':
                    this.viewAll();
                    break;

            }

        });

        //Navigation Controls
        //document.getElementById("next").addEventListener('click', () => this.currentView.navigateUpList());
        //document.getElementById("prev").addEventListener('click', () => this.currentView.navigateDownList());

        document.addEventListener('keydown', (event)=>{

            switch(event.key){

                case 'ArrowRight':
                    this.currentView.navigateUpList();
                    break;

                case 'ArrowLeft':
                    this.currentView.navigateDownList();
                    break;

            }

        });


        //Zoom Controls
        //document.getElementById("zoomUp").addEventListener('click', () => this.currentView.zoomUp());
        //document.getElementById("zoomDown").addEventListener('click', () => this.currentView.zoomDown());

        document.addEventListener('keydown', (event)=>{

            switch(event.key){

                case '+':
                    this.currentView.zoomUp();
                    break;

                case '-':
                    this.currentView.zoomDown();
                    break;

            }

        });

    };
    addMiniCalendar() {
        this.leftSideContainer.appendChild(new MiniCalendar('miniCal').render());
    };
    addFilters() {
        this.leftSideContainer.appendChild(new PlanningFilters(this.currentView).render());
    };
    undisplayCalendar() {
        this.leftSideContainer.innerHTML = '';
        this.calContainer.innerHTML = '';
    };
    render() {
        this.buildView();
        return this.wsPageContainer;
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

export {ViewContext};