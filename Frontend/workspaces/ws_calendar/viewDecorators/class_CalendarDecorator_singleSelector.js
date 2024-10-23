export class CalendarDecorator_singleSelector {
    constructor(input) {
        this.calendar = input.calendar;
        this.index = 0;

        this.updateSelection();
        this.displaySelection();
        this.undisplayNonSelectedPlannings();
        this.addNavigationListener();
    };

    nextIndexIsValid(index, list) {
        return index >= 0 && index <= list.length - 1;
    };
    updateSelection() {
        this.currentDisplay = this.calendar.planningList[this.index];
    };

    displaySelection() {
        this.currentDisplay.html.style.display = 'grid';
    };

    undisplayNonSelectedPlannings() {
        this.calendar.planningList.filter(planning => planning !== this.currentDisplay)
            .map(planning => planning.html.style.display = 'none');
    };

    addNavigationListener() {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowRight') {
                if (this.nextIndexIsValid(this.index + 1, this.calendar.planningList)) {
                    this.index++;
                    this.updateSelection();
                    this.displaySelection();
                    this.undisplayNonSelectedPlannings();
                }
            }

            if (event.key === 'ArrowLeft') {
                if (this.nextIndexIsValid(this.index - 1, this.calendar.planningList)) {
                    this.index--;
                    this.updateSelection();
                    this.displaySelection();
                    this.undisplayNonSelectedPlannings();
                }
            }

        });
    };
    moveUp() {

    }
}