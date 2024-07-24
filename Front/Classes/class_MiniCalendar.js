class MiniCalendar {
    constructor(calendarID, parentID) {

        //Define parent
        this.parent = document.getElementById(parentID);

        if (!this.parent) {
            throw new Error(`Parent element with ID ${parentID} not found.`);
        }

        //Create cal
        this.calendar = document.createElement('div');
        this.calendar.setAttribute('id', calendarID);

        this.parent.appendChild(this.calendar);

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

    newButton(text, css) {

        const button = document.createElement('button');
        button.setAttribute('class', css);
        button.appendChild(this.newTextNode(text));

        return button;
    };

    renderCalendar() {
        // Clear existing content
        this.calendar.innerHTML = '';

        const buildHeader = () => {
            // HEADER
            const header = this.newDiv();
            header.classList.add('calendar-header');

            header.appendChild(this.newButton('<', "prev-month miniCal_button"));
            header.appendChild(this.newSpan(`${this.getMonthName(this.currentMonth)} ${this.currentYear}`));
            header.appendChild(this.newButton('>', 'next-month miniCal_button'));

            // Add event listeners for navigation
            header.querySelector('.prev-month').addEventListener('click', () => this.prevMonth());
            header.querySelector('.next-month').addEventListener('click', () => this.nextMonth());

            this.calendar.appendChild(header);
        };
        const buildWeekDays = () => {
            // WEEKDAYS
            const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
            const daysRow = this.newDiv();
            daysRow.classList.add('days-of-week');

            for (const day of daysOfWeek) {

                const dayElement = this.newDiv();
                dayElement.classList.add('day-of-week');
                dayElement.textContent = day;

                daysRow.appendChild(dayElement);

            }



            this.calendar.appendChild(daysRow);
        };



        buildHeader()
        buildWeekDays()






        // Add days of the month
        const daysGrid = this.newDiv();
        daysGrid.classList.add('days-grid');

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

                if(day === this.today.getDate()) {

                    dayElement.classList.add('miniCal_focus');

                    //UNDERLINE DAY INITIAL :
                    const currentDayInit = Array.from(document.querySelectorAll('.day-of-week'))[this.today.getDay()];
                    currentDayInit.classList.add('underlineCurrentDay');

                }

            }

            dayElement.appendChild(this.newTextNode(day));



            //faire en sorte que le click change la date
            dayElement.addEventListener('click', () => this.selectDay(day));
            daysGrid.appendChild(dayElement);
        }



        this.calendar.appendChild(daysGrid);


    }

    getMonthName(monthIndex) {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
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


}

export {MiniCalendar};