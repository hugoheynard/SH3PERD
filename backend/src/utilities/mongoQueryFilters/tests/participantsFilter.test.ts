import { ObjectId } from "mongodb";
import {participantsFilter} from "../participantsFilter";

describe("participantsFilter", () => {
    it("should create a filter with ObjectIds", () => {
        const participantsIdArray = ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"];

        const result = participantsFilter({ participants: participantsIdArray });

        expect(result).toEqual({
            participants: {
                $in: [
                    new ObjectId("507f1f77bcf86cd799439011"),
                    new ObjectId("507f1f77bcf86cd799439012"),
                ],
            },
        });

    });

    it("should return an empty filter if no participants ID", () => {
        const participantsIdArray: string[] = [];

        const result = participantsFilter({ participants: participantsIdArray });

        expect(result).toEqual({});
    });
});
