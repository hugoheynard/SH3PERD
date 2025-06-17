import {BaseMongoRepository} from "../../utils/repoAdaptersHelpers/BaseMongoRepository.js";
import type {TBaseMongoRepoDeps} from "../../types/mongo/mongo.types.js";

import type {
    IMusicReferenceRepository,
    TMusicReferenceDomainModel,
} from '../types/musicReferences.types.js';
import { failThrows500 } from '../../utils/errorManagement/tryCatch/failThrows500.js';
import type { Filter } from 'mongodb';

export class MusicReferenceMongoRepository
  extends BaseMongoRepository<TMusicReferenceDomainModel>
  implements IMusicReferenceRepository {
    constructor(input: TBaseMongoRepoDeps) {
        super(input);
    };

    @failThrows500('MUSIC_REFERENCE_SAVE_ERROR', 'Error while saving music reference')
    async saveOne(document: TMusicReferenceDomainModel): Promise<boolean> {
        const result = await this.collection.insertOne(document);

        if (!result.acknowledged) {
            return false;
        }
        return true;
    };


    //FIND METHODS
    @failThrows500('MUSIC_REFERENCE_FIND_ONE_ERROR', 'Error while finding music reference by id')
    async findOne(filter: Filter<TMusicReferenceDomainModel>): Promise<TMusicReferenceDomainModel | null> {
        return await this.findDocBy(filter);
    };

    @failThrows500('MUSIC_REFERENCE_FIND_MANY_ERROR', 'Error while finding music reference by filter')
    async findMany(filter: Filter<TMusicReferenceDomainModel>): Promise<TMusicReferenceDomainModel[] | null> {
        return await this.collection.find(filter).toArray();
    }

    async findAll(): Promise<TMusicReferenceDomainModel[]> {
        return await this.collection.find().toArray();
    };
}