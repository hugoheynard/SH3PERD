class TriggerList{
    constructor(input) {
        this._triggerList = input.triggerList ?? [];
        //this._validationCondition = input.condition;

    };
    get triggerList() {
        return this._triggerList;
    };

    addTrigger(trigger) {
        this.triggerList.push(trigger);
    };

    isValid() {
       return this.triggerList.every(trigger => trigger.validationState);
    };

}

export {TriggerList};