export class LayoutBuilder {
    build({ plannings, timestamps, internalCollisions }) {
        const planningColumnNumbers = this.getPlanningsColumnNumber(internalCollisions);
        return {
            gridTotalColNumber: planningColumnNumbers * plannings.length,
            planningsColNumber: planningColumnNumbers,
            planningsGridIndexes: this.getPlanningGridCoordinates(plannings, planningColumnNumbers)
        };
    }
    ;
}
//# sourceMappingURL=LayoutBuilder.js.map