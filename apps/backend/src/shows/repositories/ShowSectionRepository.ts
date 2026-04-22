import type { AnyBulkWriteOperation, Filter, UpdateFilter } from 'mongodb';
import type {
  TShowAxisCriterion,
  TShowId,
  TShowSectionDomainModel,
  TShowSectionId,
  TShowSectionItemDomainModel,
  TShowSectionTarget,
} from '@sh3pherd/shared-types';
import {
  BaseMongoRepository,
  type TBaseMongoRepoDeps,
} from '../../utils/repoAdaptersHelpers/BaseMongoRepository.js';

/**
 * Sections are persisted with their item list embedded — keeps item
 * reorder and item add/remove as a single document write, and means
 * we only hit two collections per show (shows + show_sections) instead
 * of three.
 */
type SectionRecord = TShowSectionDomainModel & {
  items: TShowSectionItemDomainModel[];
};

export type IShowSectionRepository = {
  saveOne(document: SectionRecord): Promise<boolean>;
  saveMany(documents: SectionRecord[]): Promise<boolean>;
  findOneById(sectionId: TShowSectionId): Promise<SectionRecord | null>;
  findByShowId(showId: TShowId): Promise<SectionRecord[]>;
  updateMeta(
    sectionId: TShowSectionId,
    patch: Partial<
      Pick<TShowSectionDomainModel, 'name' | 'position'> & {
        description: string | null;
        target: TShowSectionTarget | null;
        lastPlayedAt: number | null;
        startAt: number | null;
        axisCriteria: TShowAxisCriterion[] | null;
      }
    >,
  ): Promise<boolean>;
  updatePositions(updates: { id: TShowSectionId; position: number }[]): Promise<boolean>;
  replaceItems(sectionId: TShowSectionId, items: TShowSectionItemDomainModel[]): Promise<boolean>;
  deleteOneById(sectionId: TShowSectionId): Promise<boolean>;
  deleteManyByIds(ids: TShowSectionId[]): Promise<boolean>;
  deleteByShowId(showId: TShowId): Promise<boolean>;
};

export class ShowSectionMongoRepository
  extends BaseMongoRepository<SectionRecord>
  implements IShowSectionRepository
{
  constructor(input: TBaseMongoRepoDeps) {
    super(input);
  }

  async saveOne(document: SectionRecord): Promise<boolean> {
    return this.save(document);
  }

  async saveMany(documents: SectionRecord[]): Promise<boolean> {
    if (documents.length === 0) return true;
    return this.save(documents);
  }

  async findOneById(sectionId: TShowSectionId): Promise<SectionRecord | null> {
    const filter: Filter<SectionRecord> = { id: sectionId };
    return this.findOne({ filter });
  }

  async findByShowId(showId: TShowId): Promise<SectionRecord[]> {
    const filter: Filter<SectionRecord> = { show_id: showId };
    return this.findMany({ filter, options: { sort: { position: 1 } } });
  }

  async updateMeta(
    sectionId: TShowSectionId,
    patch: Partial<
      Pick<TShowSectionDomainModel, 'name' | 'position'> & {
        description: string | null;
        target: TShowSectionTarget | null;
        lastPlayedAt: number | null;
        startAt: number | null;
        axisCriteria: TShowAxisCriterion[] | null;
      }
    >,
  ): Promise<boolean> {
    const { description, target, lastPlayedAt, startAt, axisCriteria, ...rest } = patch;
    const update: UpdateFilter<SectionRecord> = {};
    const set: Record<string, unknown> = { ...rest };
    const unset: {
      description?: '';
      target?: '';
      lastPlayedAt?: '';
      startAt?: '';
      axisCriteria?: '';
    } = {};
    if (description === null) unset.description = '';
    else if (description !== undefined) set['description'] = description;
    if (target === null) unset.target = '';
    else if (target !== undefined) set['target'] = target;
    if (lastPlayedAt === null) unset.lastPlayedAt = '';
    else if (lastPlayedAt !== undefined) set['lastPlayedAt'] = lastPlayedAt;
    if (startAt === null) unset.startAt = '';
    else if (startAt !== undefined) set['startAt'] = startAt;
    if (axisCriteria === null) unset.axisCriteria = '';
    else if (axisCriteria !== undefined) set['axisCriteria'] = axisCriteria;
    if (Object.keys(set).length) update.$set = set as UpdateFilter<SectionRecord>['$set'];
    if (Object.keys(unset).length) update.$unset = unset as UpdateFilter<SectionRecord>['$unset'];
    if (!update.$set && !update.$unset) return true;
    const result = await this.collection.updateOne(
      { id: sectionId } as Filter<SectionRecord>,
      update,
    );
    return result.acknowledged;
  }

  async updatePositions(updates: { id: TShowSectionId; position: number }[]): Promise<boolean> {
    if (updates.length === 0) return true;
    const bulkOps: AnyBulkWriteOperation<SectionRecord>[] = updates.map((u) => ({
      updateOne: {
        filter: { id: u.id } as Filter<SectionRecord>,
        update: { $set: { position: u.position } as UpdateFilter<SectionRecord>['$set'] },
      },
    }));
    const result = await this.collection.bulkWrite(bulkOps);
    return result.ok === 1;
  }

  async replaceItems(
    sectionId: TShowSectionId,
    items: TShowSectionItemDomainModel[],
  ): Promise<boolean> {
    const filter: Filter<SectionRecord> = { id: sectionId };
    const update: UpdateFilter<SectionRecord> = {
      $set: { items } as UpdateFilter<SectionRecord>['$set'],
    };
    const result = await this.collection.updateOne(filter, update);
    return result.acknowledged;
  }

  async deleteOneById(sectionId: TShowSectionId): Promise<boolean> {
    const filter: Filter<SectionRecord> = { id: sectionId };
    return this.deleteOne(filter);
  }

  async deleteManyByIds(ids: TShowSectionId[]): Promise<boolean> {
    if (ids.length === 0) return true;
    const filter: Filter<SectionRecord> = {
      id: { $in: ids as unknown as SectionRecord['id'][] },
    };
    return this.deleteMany(filter);
  }

  async deleteByShowId(showId: TShowId): Promise<boolean> {
    const filter: Filter<SectionRecord> = { show_id: showId };
    return this.deleteMany(filter);
  }
}

export type { SectionRecord };
