import {CalendarIndiv} from "./class_CalendarIndiv.js";
import {CalendarPerCat} from "./class_CalendarPerCat.js";
import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {MiniCalendar} from "../../../frontElements/Classes/class_MiniCalendar.js";
import {PlanningFilters} from "./class_PlanningFilters.js";
import {CalendarAll} from "./class_CalendarAll.js";

class ViewContext {
    constructor(timetable, artistList) {

        this.timeTable = timetable;
        this.artistList = artistList;
        this.indivView = new CalendarIndiv(this.timeTable, this.artistList);
        this.perCatView = new CalendarPerCat(this.timeTable, this.artistList);
        //this.allView = new CalendarAll(this.timeTable, this.artistList);


        this.viewIndiv();
        this.wsPageContainer = new HTMLelem('div', 'wsPage_Calendars').render();
        this.calContainer = new HTMLelem('div', 'calContainer').render();


        this.leftSideContainer = new HTMLelem('div', 'leftSideElements', 'popMenu').render();

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
        this.undisplayCalendar();
        this.currentView.buildCalendar();


        this.wsPageContainer.appendChild(this.leftSideContainer);

        this.calContainer.appendChild(this.currentView.header);
        this.calContainer.appendChild(this.currentView.render());

        this.wsPageContainer.appendChild(this.calContainer);
        this.addMiniCalendar();
        this.addFilters();
        this.viewControls();

        return this.wsPageContainer;
    };
}

export {ViewContext};