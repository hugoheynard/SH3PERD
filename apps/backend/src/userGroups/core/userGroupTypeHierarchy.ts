export const typeHierarchyMap = {
  root: ['department', 'team', 'project'],
  department: ['team', 'project'],
  team: ['team', 'project'],
  project: [],
} as const;

type TGroupType = keyof typeof typeHierarchyMap;

export function getAllAllowedChildTypes(
  parentType: TGroupType,
  visited: Set<TGroupType> = new Set()
): TGroupType[] {
  const directChildren = typeHierarchyMap[parentType] ?? [];
  const allChildren = new Set<TGroupType>(directChildren);

  for (const child of directChildren) {
    if (!visited.has(child)) {
      visited.add(child);
      const subChildren = getAllAllowedChildTypes(child, visited);
      subChildren.forEach(sc => allChildren.add(sc));
    }
  }

  return Array.from(allChildren);
}