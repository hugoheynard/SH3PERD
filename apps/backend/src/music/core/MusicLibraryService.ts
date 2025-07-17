import type { TMusicReferenceId, TUserId, TUserMusicLibraryItem } from '@sh3pherd/shared-types';


export class MusicLibraryService {
  /**
   * Calculates the cross-references between different music catalogues.
   * @param catalogues - A map of user IDs to their respective music library items.
   * @returns An array of music library items with cross-references calculated.
   */
  calculateMusicGlobalCrossRefs(catalogues: Map<TUserId, TUserMusicLibraryItem[]>
  ): any {
    const refMap = new Map<TMusicReferenceId, { users: Set<TUserId>, items: TUserMusicLibraryItem[] }>();

    for (const [userId, items] of catalogues) {
      for (const item of items) {
        const refId = item.reference?.musicReference_id;

        if (!refId) {
          continue;
        }

        const entry = refMap.get(refId) ?? { users: new Set(), items: [] };
        entry.users.add(userId);
        entry.items.push(item);
        refMap.set(refId, entry);
      }
    }

    const result: any = [];

    for (const { users, items } of refMap.values()) {
      if (users.size <= 1) {
        continue;
      }

      const userArray = Array.from(users);
      for (const item of items) {
        result.push({
          ...item,
          crossReferences: userArray.filter(u => u !== item.repertoireEntry?.user_id)
        });
      }
    }

    return result;
    /*
    should return an object with the following structure:
    {
      referenceId: {
        users: TUserId[],
        items: TUserMusicLibraryItem[]
      }
     */
  };
}
