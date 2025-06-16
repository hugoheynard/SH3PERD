import {BaseMongoRepository} from "../../utils/repoAdaptersHelpers/BaseMongoRepository.js";
import type {TBaseMongoRepoDeps} from "../../types/mongo/mongo.types.js";

import type {
    IMusicReferenceRepository, TFindMusicReferenceByFilterFn,
    TMusicReferenceDomainModel, TMusicReferenceId,
    TSaveMusicReferenceFn,
} from '../types/musicReferences.types.js';
import { failThrows500 } from '../../utils/errorManagement/tryCatch/failThrows500.js';
import type { Filter } from 'mongodb';

export class MusicReferenceMongoRepository
  extends BaseMongoRepository<TMusicReferenceDomainModel>
  implements IMusicReferenceRepository<TMusicReferenceDomainModel> {
    constructor(input: TBaseMongoRepoDeps) {
        super(input);
    };

    @failThrows500('MUSIC_REFERENCE_SAVE_ERROR', 'Error while saving music reference')
    async save(input: { musicRefDomainModel: TMusicReferenceDomainModel }): Promise<boolean> {
        const result = await this.collection.insertOne(input.musicRefDomainModel);

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

    @failThrows500('FIND_ERROR', 'Error while finding music reference by filter')
    async findMany(filter: Filter<TMusicReferenceDomainModel>): Promise<TMusicReferenceDomainModel[] | null> {
        return await this.collection.find(filter).toArray();
    }

    async findAll(): Promise<TMusicReferenceDomainModel[]> {
        return await this.collection.find().toArray();
    };
}