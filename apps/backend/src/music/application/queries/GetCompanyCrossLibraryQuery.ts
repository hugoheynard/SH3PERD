import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  CONTRACT_REPO,
  MUSIC_REPERTOIRE_REPO,
  MUSIC_REFERENCE_REPO,
  MUSIC_VERSION_REPO,
  USER_PROFILE_REPO,
} from '../../../appBootstrap/nestTokens.js';
import type { IContractRepository } from '../../../contracts/repositories/ContractMongoRepository.js';
import type { IMusicRepertoireRepository } from '../../repositories/MusicRepertoireRepository.js';
import type { IMusicReferenceRepository } from '../../types/musicReferences.types.js';
import type { IMusicVersionRepository } from '../../repositories/MusicVersionRepository.js';
import type { IUserProfileRepository } from '../../../user/infra/UserProfileMongoRepo.repository.js';
import type {
  TCompanyId,
  TUserId,
  TCrossSearchResult,
  TCrossMember,
  TCrossReferenceResult,
  TCrossMemberVersion,
  TMusicReferenceId,
  TMusicReferenceDomainModel,
  TMusicVersionDomainModel,
  TContractRecord,
  TUserProfileRecord,
} from '@sh3pherd/shared-types';
import type { Filter } from 'mongodb';

export class GetCompanyCrossLibraryQuery {
  constructor(public readonly companyId: TCompanyId) {}
}

/**
 * Builds the cross search matrix for a company.
 *
 * Flow:
 * 1. Fetch all active contracts for the company → list of user_ids
 * 2. Fetch profiles for display names
 * 3. Fetch repertoire entries for ALL those users
 * 4. Fetch all referenced songs (music_references)
 * 5. Fetch all versions for those users
 * 6. Build the matrix: for each reference, which members have it
 *    and what are their versions?
 * 7. Sort by compatibleCount descending (most-shared songs first)
 */
@QueryHandler(GetCompanyCrossLibraryQuery)
export class GetCompanyCrossLibraryHandler implements IQueryHandler<
  GetCompanyCrossLibraryQuery,
  TCrossSearchResult
> {
  constructor(
    @Inject(CONTRACT_REPO) private readonly contractRepo: IContractRepository,
    @Inject(MUSIC_REPERTOIRE_REPO) private readonly repRepo: IMusicRepertoireRepository,
    @Inject(MUSIC_REFERENCE_REPO) private readonly refRepo: IMusicReferenceRepository,
    @Inject(MUSIC_VERSION_REPO) private readonly versionRepo: IMusicVersionRepository,
    @Inject(USER_PROFILE_REPO) private readonly profileRepo: IUserProfileRepository,
  ) {}

  async execute(query: GetCompanyCrossLibraryQuery): Promise<TCrossSearchResult> {
    const companyId = query.companyId;

    // 1. Get all active contracts for this company
    const contractFilter: Filter<TContractRecord> = { company_id: companyId, status: 'active' };
    const contracts =
      (await this.contractRepo.findMany({
        filter: contractFilter,
      })) ?? [];

    const memberUserIds = contracts.map((c) => c.user_id);

    if (memberUserIds.length === 0) {
      return { companyId, members: [], results: [], totalReferences: 0 };
    }

    // 2. Fetch profiles for display names
    const profileFilter: Filter<TUserProfileRecord> = { user_id: { $in: memberUserIds } };
    const profiles =
      (await this.profileRepo.findMany({
        filter: profileFilter,
      })) ?? [];

    const profileMap = new Map(profiles.map((p) => [p.user_id, p]));

    const members: TCrossMember[] = memberUserIds.map((uid) => {
      const profile = profileMap.get(uid);
      const firstName = profile?.first_name ?? '';
      const lastName = profile?.last_name ?? '';
      const displayName = `${firstName} ${lastName}`.trim() || uid;
      const initials =
        ((firstName?.charAt(0) ?? '') + (lastName?.charAt(0) ?? '')).toUpperCase() || '?';
      return { userId: uid, displayName, avatarInitials: initials };
    });

    // 3. Fetch repertoire entries for ALL members in parallel
    const allRepertoireEntries = await Promise.all(
      memberUserIds.map((uid) => this.repRepo.findByUserId(uid)),
    );

    // Build a map: referenceId → Set<userId>
    const refToUsers = new Map<TMusicReferenceId, Set<TUserId>>();
    for (let i = 0; i < memberUserIds.length; i++) {
      const uid = memberUserIds[i];
      const entries = allRepertoireEntries[i] ?? [];

      for (const entry of entries) {
        const refId = entry.musicReference_id;

        if (!refToUsers.has(refId)) refToUsers.set(refId, new Set());
        refToUsers.get(refId)!.add(uid);
      }
    }

    // 4. Fetch all referenced songs
    const allRefIds = [...refToUsers.keys()];
    if (allRefIds.length === 0) {
      return { companyId, members, results: [], totalReferences: 0 };
    }

    const references = await this.refRepo.findByIds(allRefIds);
    const refMap = new Map<string, TMusicReferenceDomainModel>(references.map((r) => [r.id, r]));

    // 5. Fetch all versions for all members in parallel
    const allVersionsByUser = await Promise.all(
      memberUserIds.map((uid) => this.versionRepo.findByOwnerId(uid)),
    );

    // Build a map: userId → referenceId → versions[]
    const userVersions = new Map<string, Map<string, TMusicVersionDomainModel[]>>();
    for (let i = 0; i < memberUserIds.length; i++) {
      const uid = memberUserIds[i];
      const versions = allVersionsByUser[i] ?? [];
      const byRef = new Map<string, TMusicVersionDomainModel[]>();

      for (const v of versions) {
        const refId = v.musicReference_id;
        if (!byRef.has(refId)) byRef.set(refId, []);
        byRef.get(refId)!.push(v);
      }

      userVersions.set(uid, byRef);
    }

    // 6. Build the cross matrix
    const results: TCrossReferenceResult[] = [];

    for (const [refId, userSet] of refToUsers) {
      const ref = refMap.get(refId);
      if (!ref) continue;

      const memberVersions: Record<string, TCrossMemberVersion> = {};

      for (const uid of memberUserIds) {
        const hasIt = userSet.has(uid);
        const versions = userVersions.get(uid)?.get(refId) ?? [];

        memberVersions[uid] = {
          hasVersion: hasIt,
          versions: versions.map((v) => ({
            id: v.id,
            label: v.label,
            bpm: v.bpm,
            key: v.tracks?.[0]?.analysisResult?.key ?? null,
            mastery: v.mastery,
            energy: v.energy,
            effort: v.effort,
            tracks: v.tracks,
          })),
        };
      }

      results.push({
        referenceId: ref.id,
        title: ref.title,
        originalArtist: ref.artist,
        members: memberVersions,
        compatibleCount: userSet.size,
      });
    }

    // 7. Sort: most-shared first, then alphabetically
    results.sort((a, b) => {
      if (b.compatibleCount !== a.compatibleCount) {
        return b.compatibleCount - a.compatibleCount;
      }
      return a.title.localeCompare(b.title);
    });

    return {
      companyId,
      members,
      results,
      totalReferences: results.length,
    };
  }
}
