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
        this.staffMax = this.params.staffMax;
    };
    populate(timeSplitArray) {
        const availablePeople = [...this.staff]
        const assignedPeople = [];

        this.timeGrid.forEach((section, index) => {
            section.worker = [this.staff[(index + this.offset) % this.staff.length]];
            section.available = this.staff.filter(member => JSON.stringify(member) !== JSON.stringify(...section.worker));
        });
        return this.timeGrid
    };
}

export {LinearPopulation};