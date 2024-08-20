class PopulationStrategy{
    constructor(input) {
        this.timeGrid = input.timeGrid;
        this.staff = input.staff;
        this.params = input.params;
    };

}

class LinearPopulation extends PopulationStrategy{
    constructor(input) {
        super(input);
        this.offset = this.params.offset;
        this.populate();
    };
    populate() {
        const availablePeople = [...this.staff]
        const assignedPeople = [];

        this.timeGrid.forEach(section => {

        })
    };
}

export {LinearPopulation};