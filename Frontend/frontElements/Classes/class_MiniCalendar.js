import {HTMLelem} from "./HTMLClasses/class_HTMLelem.js";

class MiniCalendar {
    constructor(calendarID) {
        //Create cal
        this.calendar = new HTMLelem('div', calendarID, 'monthlyCal').render();

        //Init
        this.today = new Date();
        this.currentYear = this.today.getFullYear();
        this.currentMonth = this.today.getMonth();

        // Render calendar
        this.renderCalendar();
    };

    newDiv() {
        return document.createElement('div');
    };

    newSpan(text) {
        const span =  document.createElement('span');
        const content = document.createTextNode(text);
        span.appendChild(content);
        return span;
    };

    newTextNode(text) {

        return document.createTextNode(text);

    };

    renderCalendar() {
        // Clear existing content
        this.calendar.innerHTML = '';

        const buildHeader = () => {
            const header = new HTMLelem('div', 'miniCal_header', 'calendar-header').render();

            const prevButton = new HTMLelem('button', 'prevMonthButton', 'prev-month miniCal_button')
            prevButton.setText('<');
            header.appendChild(prevButton.render())

            header.appendChild(this.newSpan(`${this.getMonthName(this.currentMonth)} ${this.currentYear}`));

            const nextButton = new HTMLelem('button', 'prevMonthButton', 'next-month miniCal_button')
            nextButton.setText('>');
            header.appendChild(nextButton.render())

            // Add event listeners for navigation
            prevButton.render().addEventListener('click', () => this.prevMonth());
            nextButton.render().addEventListener('click', () => this.nextMonth());

            this.calendar.appendChild(header);
        };

        const buildWeekDays = () => {
            // WEEKDAYS
            const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
            const daysRow = new HTMLelem('div', '', 'days-of-week').render();

            for (const day of daysOfWeek) {
                const dayElement = new HTMLelem('div', '', 'day-of-week');
                dayElement.setText(day);
                daysRow.appendChild(dayElement.render());
            }

            this.calendar.appendChild(daysRow);
        };

        buildHeader();
        buildWeekDays();

        // Add days of the month
        const daysGrid = new HTMLelem('div', undefined, 'days-grid').render();

        // Get first day of the month and number of days in month
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

        // Fill initial empty slots
        for (let i = 0; i < firstDay; i++) {

            const emptySlot = this.newDiv();
            emptySlot.classList.add('day', 'empty');
            daysGrid.appendChild(emptySlot);

        }

        // Fill days of the month
        for (let day = 1; day <= daysInMonth; day++) {

            const dayElement = this.newDiv();
            dayElement.classList.add('day');

            if(this.currentMonth === this.today.getMonth()) {

                if (day === this.today.getDate()) {
                    dayElement.classList.add('miniCal_focus');
                    //UNDERLINE DAY INITIAL :
                    const currentDayInit = Array.from(this.calendar.querySelectorAll('.day-of-week'))[this.today.getDay()];
                    currentDayInit.classList.add('underlineCurrentDay');
                }

            }

            dayElement.appendChild(this.newTextNode(day));

            //click changes date
            dayElement.addEventListener('click', () => this.selectDay(day));
            daysGrid.appendChild(dayElement);
        }

        this.calendar.appendChild(daysGrid);
    };

    getMonthName(monthIndex) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return monthNames[monthIndex];
    };

    prevMonth() {
        if (this.currentMonth === 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else {
            this.currentMonth--;
        }
        this.renderCalendar();
    };

    nextMonth() {
        if (this.currentMonth === 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else {
            this.currentMonth++;
        }
        this.renderCalendar();
    };

    selectDay(dayNumberToReach) {

        this.today = new Date(this.currentYear, this.currentMonth, dayNumberToReach);
        this.renderCalendar();

    };

    render() {
        return this.calendar
    };
}

export {MiniCalendar};