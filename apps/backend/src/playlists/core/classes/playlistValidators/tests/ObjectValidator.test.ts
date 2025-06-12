import {ObjectValidator} from "../ObjectValidator.js";

describe("ObjectValidator", () => {
    let validator: ObjectValidator;

    beforeEach(() => {
        validator = new ObjectValidator();
    });

    test("should return an object with an error when no propsToValidate are provided", () => {
        const validationObject = validator.getValidationObject({ propsToValidate: {} });
        expect(validationObject).toEqual({ errors: { general: "No settings to validate" } });
    });

    test("should return an object with checkedProps and errors", () => {
        const validationObject = validator.getValidationObject({ propsToValidate: { someKey: true } });
        expect(validationObject).toHaveProperty("errors");
        expect(validationObject.errors).toEqual({}); // Since checkProps is not implemented, errors should be empty
    });

    test("should initialize checkedProps and errors on call", () => {
        validator.getValidationObject({ propsToValidate: { someKey: true } });
        expect(validator["checkedProps"]).toEqual({});
        expect(validator["errors"]).toEqual({});
    });

    test("checkProps should be extendable in child classes", () => {
        class CustomValidator extends ObjectValidator {
            protected checkProps() {
                this.checkedProps = { validated: true };
                this.errors = { someError: "Invalid data" };
            }
        }

        const customValidator = new CustomValidator();
        const validationObject = customValidator.getValidationObject({ propsToValidate: { someKey: "value" } });

        expect(validationObject).toEqual({ validated: true, errors: { someError: "Invalid data" } });
    });
});
