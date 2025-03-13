import {ObjectValidator} from "./ObjectValidator";

export class AerialConfigValidator extends ObjectValidator{
    protected checkProps<T>(propsToValidate: Partial<T>): void {
        this.validatePerformancePosition(propsToValidate.performancePosition);

    };

    validatePerformancePosition(performancePosition: string | null | undefined): void {

        if (!performancePosition) {
            return;
        }

        if (!["start", "end", "manual"].includes(performancePosition)) {
            this.checkedProps.performancePosition = false;
            this.errors.performancePosition = "Invalid performance position";
            return;
        }

        this.checkedProps.performancePosition = true;
    };


}