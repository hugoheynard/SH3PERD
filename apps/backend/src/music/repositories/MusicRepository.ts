import {BaseMongoRepository} from "../../utils/repoAdaptersHelpers/BaseMongoRepository.js";
import type {TBaseMongoRepoDeps} from "../../types/mongo/mongo.types.js";

export class MusicMongoRepository extends BaseMongoRepository<any> {
    constructor(input: TBaseMongoRepoDeps) {
        super(input);
    };

    async findById(id: string): Promise<any | null> {
        return this.findDocBy({ _id: id });
    }

    async findAll(): Promise<any[]> {
        return this.collection.find().toArray();
    }
}