export interface IValidationObject {
    [key: string]: boolean | Record<string, string>;
    errors: Record<string, string>;
}




export class ObjectValidator {
    protected checkedProps: Partial<IValidationObject> = {};
    protected errors: Record<string, string> = {};

    getValidationObject<T>(input: { propsToValidate: Partial<T> }): IValidationObject {
        this.checkedProps = {};
        this.errors = {};

        const { propsToValidate } = input;

        if (!propsToValidate || Object.keys(propsToValidate).length === 0) {
            return { ...this.checkedProps, errors: { general: "No settings to validate" } };
        }

        //method to be extended in child classes
        this.checkProps(propsToValidate);

        return {
            ...this.checkedProps,
            errors: this.errors,
        };
    };

    /**
     * @method checkProps
     * method to be extended in child classes
     */
    protected checkProps<T>(_propsToValidate?: Partial<T>): void {};
}