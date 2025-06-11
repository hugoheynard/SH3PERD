import { ObjectId } from "mongodb";
import { DataInformationManager, type IDataInformation } from "../DataInformationManager";

describe("DataInformationManager", () => {
    let manager: DataInformationManager;
    let validObjectId: ObjectId;

    beforeEach(() => {
        validObjectId = new ObjectId();
        manager = new DataInformationManager();
    });

    describe("createDataInformationObject", () => {
        it("should create a valid DataInformation object", () => {
            const dataInfo = manager.createDataInformationObject({ creator_id: validObjectId });

            expect(dataInfo).toBeDefined();
            expect(dataInfo.creation_date).toBeInstanceOf(Date);
            expect(dataInfo.creator_id).toBeInstanceOf(ObjectId);
            expect(dataInfo.creator_id.toString()).toBe(validObjectId.toString());
            expect(dataInfo.last_modified).toBeInstanceOf(Date);
            expect(dataInfo.updateNumber).toBe(0);
        });

        it("should throw an error when creator_id is missing", () => {
            expect(() => manager.createDataInformationObject({ creator_id: null as unknown as ObjectId }))
                .toThrow("[DataInformationManager -createDataInformationObject]:creator_id is required");
        });

        it("should convert a string creator_id into ObjectId", () => {
            const stringId = new ObjectId().toString();
            const dataInfo = manager.createDataInformationObject({ creator_id: stringId });

            expect(dataInfo).toBeDefined();
            expect(dataInfo.creator_id).toBeInstanceOf(ObjectId);
            expect(dataInfo.creator_id.toString()).toBe(stringId);
        });

        it("should throw an error for an invalid string creator_id", () => {
            expect(() => manager.createDataInformationObject({ creator_id: "invalid_id" as unknown as ObjectId }))
                .toThrow("Invalid creator_id format");
        });
    });

    describe("updateDataInformation", () => {
        it("should update last_modified date and increment updateNumber", () => {
            const dataInfo = manager.createDataInformationObject({ creator_id: validObjectId });
            const updatedInfo = manager.updateDataInformation({ dataInformationObject: dataInfo });

            expect(updatedInfo).toBeDefined();
            expect(updatedInfo.last_modified).toBeInstanceOf(Date);
            expect(updatedInfo.last_modified.getTime()).toBeGreaterThanOrEqual(dataInfo.last_modified.getTime());
            expect(updatedInfo.updateNumber).toBe(dataInfo.updateNumber + 1);
        });

        it("should throw an error when updating with an invalid creator_id", () => {
            const invalidDataInfo = {
                creation_date: new Date(),
                creator_id: "invalid_id" as unknown as ObjectId,
                last_modified: new Date(),
                updateNumber: 0
            };

            expect(() => manager.updateDataInformation({ dataInformationObject: invalidDataInfo }))
                .toThrow("Invalid creator_id format");
        });
    });

    describe("manageDataInformation", () => {
        it("should create a new DataInformation object when object has no dataInformation", () => {
            const newObject = { someData: "test" };
            const result = manager.manageDataInformation({ object: newObject, creator_id: validObjectId });

            expect(result).toBeDefined();
            expect(result.creator_id.toString()).toBe(validObjectId.toString());
            expect(result.updateNumber).toBe(0);
        });

        it("should update an existing DataInformation object when object already has dataInformation", () => {
            const existingObject = {
                someData: "test",
                dataInformation: manager.createDataInformationObject({ creator_id: validObjectId })
            };

            const result = manager.manageDataInformation({ object: existingObject, creator_id: validObjectId });

            expect(result).toBeDefined();
            expect(result.updateNumber).toBe(1);
        });

        it("should throw an error if object or creator_id is missing", () => {
            expect(() => manager.manageDataInformation({ object: null as unknown as any, creator_id: validObjectId }))
                .toThrow("[DataInformationManager - manageDataInformation]: object and creator_id are required");

            expect(() => manager.manageDataInformation({ object: {}, creator_id: null as unknown as any }))
                .toThrow("[DataInformationManager - manageDataInformation]: object and creator_id are required");
        });
    });
});
