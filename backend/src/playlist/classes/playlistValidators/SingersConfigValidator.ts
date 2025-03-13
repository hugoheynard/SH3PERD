import {ObjectValidator} from "./ObjectValidator";

export class SingersConfigValidator extends ObjectValidator{

    protected checkProps<T>(propsToValidate: Partial<T>): void {
        this.validateSingersConfig()
    };

    validate()
}