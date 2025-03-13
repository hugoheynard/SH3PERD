import { ObjectUpdater } from "./ObjectUpdater";


//exemple interface for test
interface TestObject {
    name: string;
    age: number;
    email: string;
}

//emulates a validator class
class TestValidator {
    getValidationObject(input: { propsToValidate: Partial<TestObject> }): Partial<Record<keyof TestObject, boolean>> {
        return {
            name: typeof input.propsToValidate.name === "string" && input.propsToValidate.name.trim() !== "",
            age: typeof input.propsToValidate.age === "number" && input.propsToValidate.age > 0,
            email: typeof input.propsToValidate.email === "string" && input.propsToValidate.email.includes("@"),
        };
    }
}

describe("ObjectUpdater", () => {
    let updater: ObjectUpdater<TestObject>;
    let validator: (input: { propsToValidate: Partial<TestObject>; }) => Partial<Record<keyof TestObject, boolean>>;;

    beforeEach(() => {
        updater = new ObjectUpdater<TestObject>();
        validator = (input) => new TestValidator().getValidationObject(input);
    });

    test("should update only valid fields", () => {
        const referenceObject: TestObject = {
            name: "John",
            age: 25,
            email: "john@example.com",
        };

        const updateObject: Partial<TestObject> = {
            name: "Jane",
            age: -5, // ❌ Invalid
            email: "jane@example.com",
        };

        const result = updater.update({ referenceObject, updateObject, validator });

        expect(result).toEqual({
            name: "Jane", // ✅ Updated
            age: 25, // ❌ Not updated (invalid)
            email: "jane@example.com", // ✅ Updated
        });
    });

    test("should return the original object if no valid fields", () => {
        const referenceObject: TestObject = {
            name: "John",
            age: 25,
            email: "john@example.com",
        };

        const updateObject: Partial<TestObject> = {
            name: "", // ❌ Invalid
            age: -10, // ❌ Invalid
            email: "invalidemail", // ❌ Invalid
        };

        const result = updater.update({ referenceObject, updateObject, validator });

        expect(result).toEqual(referenceObject); // ✅ Nothing changed
    });

    test("should return the reference object if updateObject is empty", () => {
        const referenceObject: TestObject = {
            name: "John",
            age: 25,
            email: "john@example.com",
        };

        const updateObject: Partial<TestObject> = {}; // Empty update

        const result = updater.update({ referenceObject, updateObject, validator });

        expect(result).toEqual(referenceObject); // ✅ Nothing changed
    });

    test("should handle errors and return the reference object if an exception occurs", () => {
        const referenceObject: TestObject = {
            name: "John",
            age: 25,
            email: "john@example.com",
        };

        const updateObject: Partial<TestObject> = {
            name: "Jane",
            email: "jane@example.com",
        };

        const brokenValidator = (input: { propsToValidate: Partial<TestObject>; }) => {
            throw new Error("Unexpected error");
        };

        // 🔹 Capture les erreurs dans la console pour s'assurer qu'elles sont bien gérées
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        const result = updater.update({ referenceObject, updateObject, validator: brokenValidator });

        expect(result).toEqual(referenceObject); // ✅ Vérifie que l'objet d'origine est retourné
        expect(consoleErrorSpy).toHaveBeenCalledWith("Validator error:", expect.any(Error)); // ✅ Vérifie que l'erreur est loggée

        consoleErrorSpy.mockRestore(); // 🔹 Nettoie le spy après le test
    });
});