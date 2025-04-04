import {mapMongoDocToDomainModel} from "../mapMongoDocToDomainModel";
import {ObjectId} from "mongodb";


describe('mapMongoDocToDomainModel', () => {
    it('should remove _id and return rest of object', () => {
        const doc = { _id: new ObjectId(), foo: 'bar' }
        const result = mapMongoDocToDomainModel<typeof doc>({ document: doc})
        expect(result).toEqual({ foo: 'bar' })
    })
})