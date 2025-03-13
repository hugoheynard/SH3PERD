/**
 * ObjectUpdater class
 * takes an object and updates it with the values of another object if this object passes validation
 */

export class ObjectUpdater<T> {
    /**
     *
     * @param input
     * referenceObject: object to update
     * updateObject: object with new values
     * validator: tool that analyzes the updateObject and returns a validation object with a structure like { key: boolean } + errors: { key: string }
     */
    update(input: {
            referenceObject: T;
            updateObject: Partial<T>;
            validator: (input: { propsToValidate: Partial<T> }) => Partial<Record<keyof T, boolean>>;
    }): T {
        try {
            const { referenceObject, updateObject, validator } = input;

            let validationResult: Partial<Record<keyof T, boolean>> = {};

            // captures errors from validator
            try {
                validationResult = validator({ propsToValidate: updateObject });
            } catch (e) {
                console.error("Validator error:", e);
                return referenceObject; // ✅ Retourner l'objet original si le validateur échoue
            }

           // new object based on reference
            const updatedObject: T = { ...referenceObject };

            // 🔹 Updates only valid fields
            (Object.keys(updateObject) as Array<keyof T>).forEach((key): void => {
                if (validationResult[key] === true) {
                    updatedObject[key] = updateObject[key]!;
                }
            });

            return updatedObject;
        } catch (e) {
            console.error("Error updating object:", e);
            return input.referenceObject;
        }
    }
}
