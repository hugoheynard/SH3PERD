class TriggerField {
    constructor(input) {
        this._id = input.id;
        this._condition = input.condition;
        this._validationState = false;
    };

    get id() {
        return this._id;
    };

    get condition() {
        return this._condition;
    };

    get validationState() {
        return this._validationState;
    };

    set validationState(value) {
        this._validationState = value;
    };
}

export {TriggerField};