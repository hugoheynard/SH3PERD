import type { TTeamId, TTeamDomainModel, TTeamRole, TUserId } from '@sh3pherd/shared-types';

/**
 * Walks the parent chain upward from a given team to the root.
 * Returns an ordered list of ancestor IDs (closest parent first).
 *
 * @param teamId - Starting team
 * @param allTeams - All teams in the company (flat list)
 * @returns Ancestor IDs from direct parent → root
 */
export function resolveAncestors(
  teamId: TTeamId,
  allTeams: Pick<TTeamDomainModel, 'id' | 'parent_id'>[],
): TTeamId[] {
  const ancestors: TTeamId[] = [];
  const teamMap = new Map(allTeams.map(t => [t.id, t]));

  let current = teamMap.get(teamId);
  while (current?.parent_id) {
    ancestors.push(current.parent_id);
    current = teamMap.get(current.parent_id);
  }

  return ancestors;
}

/**
 * Walks the tree downward from a given team.
 * Returns all descendant IDs (breadth-first).
 *
 * @param teamId - Starting team
 * @param allTeams - All teams in the company (flat list)
 * @returns All descendant team IDs
 */
export function resolveDescendants(
  teamId: TTeamId,
  allTeams: Pick<TTeamDomainModel, 'id' | 'parent_id'>[],
): TTeamId[] {
  const descendants: TTeamId[] = [];
  const queue: TTeamId[] = [teamId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = allTeams.filter(t => t.parent_id === currentId);
    for (const child of children) {
      descendants.push(child.id);
      queue.push(child.id);
    }
  }

  return descendants;
}

/**
 * Resolves a user's effective team role in a target team,
 * considering the parent hierarchy.
 *
 * Resolution order:
 * 1. Direct membership in the target team → use that role (override)
 * 2. Walk ancestors upward → use the first inherited role found
 * 3. No membership found → return null
 *
 * @param userId - The user to resolve
 * @param targetTeamId - The team to check access for
 * @param allTeams - All teams in the company with their members
 * @returns The effective team role, or null if no access
 */
export function resolveTeamRole(
  userId: TUserId,
  targetTeamId: TTeamId,
  allTeams: Pick<TTeamDomainModel, 'id' | 'parent_id' | 'members'>[],
): TTeamRole | null {
  const teamMap = new Map(allTeams.map(t => [t.id, t]));

  // 1. Direct membership (overrides inherited)
  const targetTeam = teamMap.get(targetTeamId);
  if (!targetTeam) return null;

  const directMember = targetTeam.members.find(
    m => m.user_id === userId && !m.leftAt,
  );
  if (directMember) return directMember.team_role;

  // 2. Walk ancestors upward
  const ancestors = resolveAncestors(targetTeamId, allTeams);
  for (const ancestorId of ancestors) {
    const ancestor = teamMap.get(ancestorId);
    if (!ancestor) continue;

    const inheritedMember = ancestor.members.find(
      m => m.user_id === userId && !m.leftAt,
    );
    if (inheritedMember) return inheritedMember.team_role;
  }

  // 3. No membership in the hierarchy
  return null;
}
