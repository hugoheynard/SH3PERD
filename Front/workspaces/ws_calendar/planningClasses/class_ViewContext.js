import {CalendarIndiv} from "./class_CalendarIndiv.js";
import {CalendarPerCat} from "./class_CalendarPerCat.js";


class ViewContext {
    constructor(timetable, artistList) {

        this.timeTable = timetable;
        this.artistList = artistList;
        this.indivView = new CalendarIndiv(this.timeTable, this.artistList);
        this.perCatView = new CalendarPerCat(this.timeTable, this.artistList);
        //this.allView = new AllView(this.timeTable, this.artistList);


        this.viewIndiv();
        //this.viewControls();
    }

    viewIndiv = () => this.currentView = this.indivView;
    viewPerCat = () => this.currentView = this.perCatView;


    viewAll() {
        //this.allView.renderMatrix();
        //this.currentView = this.allView;
    };

    viewControls() {
        //View Controls
        document.getElementById("viewIndiv_launch").addEventListener('click', () => this.viewIndiv());
        document.getElementById("viewPerCat_launch").addEventListener('click', () => this.viewPerCat());
        document.getElementById("viewAll_launch").addEventListener('click', () => this.viewAll());

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
        document.getElementById("next").addEventListener('click', () => this.currentView.navigateUpList());
        document.getElementById("prev").addEventListener('click', () => this.currentView.navigateDownList());

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
        document.getElementById("zoomUp").addEventListener('click', () => this.currentView.zoomUp());
        document.getElementById("zoomDown").addEventListener('click', () => this.currentView.zoomDown());

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

    render() {
        return this.currentView.render()
    }
}

export {ViewContext};