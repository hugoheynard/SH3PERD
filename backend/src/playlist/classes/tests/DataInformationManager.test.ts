import { ObjectId } from "mongodb";
import {DataInformationManager, type IDataInformation} from "../DataInformationManager";

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
                .toThrow("creator_id is required");
        });

        it("should convert a string creator_id into ObjectId", () => {
            const stringId = new ObjectId().toString(); // Génère un ObjectId sous forme de string
            const dataInfo = manager.createDataInformationObject({ creator_id: stringId });

            expect(dataInfo).toBeDefined();
            expect(dataInfo?.creator_id).toBeInstanceOf(ObjectId);
            expect(dataInfo?.creator_id.toString()).toBe(stringId);
        });


        it("should throw an error for an invalid string creator_id", () => {
            expect(() => manager.createDataInformationObject({ creator_id: "invalid_id" as unknown as ObjectId }))
                .toThrow("Invalid creator_id format");
        });
    });

    describe("updateDataInformation", () => {
        it("should update last_modified date and increment updateNumber", () => {
            const dataInfo = manager.createDataInformationObject({ creator_id: validObjectId }) as IDataInformation;
            const updatedInfo = manager.updateDataInformation({ dataInformationObject: dataInfo });

            expect(updatedInfo).toBeDefined();
            expect(updatedInfo.last_modified).toBeInstanceOf(Date);

            // ✅ Utiliser "toBeGreaterThanOrEqual()" pour éviter les erreurs d'égalité exacte
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
});
