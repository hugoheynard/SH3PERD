class TriggerList{

    constructor(input) {
        this._triggerList = input.triggerList ?? [];
        this._validationCondition = input.condition;

    };

    get triggerList() {
        return this._triggerList;
    };

    get validationCondition() {
        return this._validationCondition;
    };

    isValid() {
       return this.triggerList[this.validationCondition](trigger => trigger.validationState);
    };

}

export {TriggerList};