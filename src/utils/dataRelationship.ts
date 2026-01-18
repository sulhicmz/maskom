import type {
  DataRelationship,
  RelationshipValidationError,
  ReferentialIntegrityResult,
} from "@/types/data";

export function validateRelationships(
  relationships: DataRelationship[],
  collections: Record<string, unknown[]>
): ReferentialIntegrityResult {
  const errors: RelationshipValidationError[] = [];
  let relationshipsValidated = 0;

  for (const relationship of relationships) {
    relationshipsValidated++;

    const sourceCollection = collections[relationship.sourceCollection];
    const targetCollection = collections[relationship.targetCollection];

    if (!sourceCollection) {
      errors.push({
        relationship,
        error: `Source collection '${relationship.sourceCollection}' not found`,
      });
      continue;
    }

    if (!targetCollection) {
      errors.push({
        relationship,
        error: `Target collection '${relationship.targetCollection}' not found`,
      });
      continue;
    }

    const relationshipErrors = checkReferentialIntegrity(
      relationship,
      sourceCollection as Record<string, unknown>[],
      targetCollection as Record<string, unknown>[]
    );

    errors.push(...relationshipErrors);

    if (relationship.sourceCollection === relationship.targetCollection) {
      const circularCheck = checkSelfReferentialCircularDependencies(
        relationship,
        sourceCollection as Record<string, unknown>[]
      );

      if (circularCheck.hasCycles) {
        for (const cycle of circularCheck.cycles) {
          errors.push({
            relationship,
            error: `Circular dependency detected in self-referential relationship: ${cycle.join(' -> ')}`,
          });
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    relationshipsValidated,
  };
}

export function checkReferentialIntegrity<T extends Record<string, unknown>, U extends Record<string, unknown>>(
  relationship: DataRelationship,
  sourceCollection: T[],
  targetCollection: U[]
): RelationshipValidationError[] {
  const errors: RelationshipValidationError[] = [];
  const targetIds = new Set(
    targetCollection.map((item) => String(item[relationship.targetField] ?? ""))
  );

  for (const sourceItem of sourceCollection) {
    const sourceValue = sourceItem[relationship.sourceField];

    if (sourceValue === undefined || sourceValue === null) {
      if (relationship.optional === true) {
        continue;
      }
      errors.push({
        relationship,
        error: `Source field '${relationship.sourceField}' is missing or null`,
        sourceItemId: String(sourceItem.id ?? "unknown"),
      });
      continue;
    }

    const sourceValueStr = String(sourceValue);

    if (!targetIds.has(sourceValueStr)) {
      errors.push({
        relationship,
        error: `Referential integrity violation: '${sourceValueStr}' not found in target collection`,
        sourceItemId: String(sourceItem.id ?? "unknown"),
        targetId: sourceValueStr,
      });
    }
  }

  return errors;
}

export function getRelatedItems<T extends Record<string, unknown>, U extends Record<string, unknown>>(
  item: T,
  relationship: DataRelationship,
  targetCollection: U[]
): U[] {
  const sourceValue = item[relationship.sourceField];

  if (sourceValue === undefined || sourceValue === null) {
    return [];
  }

  const sourceValueStr = String(sourceValue);

  return targetCollection.filter(
    (targetItem) => String(targetItem[relationship.targetField] ?? "") === sourceValueStr
  );
}

export function getRelatedItem<T extends Record<string, unknown>, U extends Record<string, unknown>>(
  item: T,
  relationship: DataRelationship,
  targetCollection: U[]
): U | undefined {
  const relatedItems = getRelatedItems(item, relationship, targetCollection);

  if (relatedItems.length === 0) {
    return undefined;
  }

  if (relationship.type === "one-to-one") {
    return relatedItems[0];
  }

  return relatedItems[0];
}

export function getOneToManyRelations<T extends Record<string, unknown>, U extends Record<string, unknown>>(
  item: T,
  relationships: DataRelationship[],
  collections: Record<string, U[]>
): Map<string, U[]> {
  const result = new Map<string, U[]>();

  for (const relationship of relationships) {
    const targetCollection = collections[relationship.targetCollection];

    if (!targetCollection) {
      continue;
    }

    const relatedItems = getRelatedItems(item, relationship, targetCollection);
    result.set(relationship.targetCollection, relatedItems);
  }

  return result;
}

export function checkCircularDependencies(
  relationships: DataRelationship[]
): string[] {
  const graph = new Map<string, string[]>();
  const allCollections = new Set<string>();

  for (const relationship of relationships) {
    if (!graph.has(relationship.sourceCollection)) {
      graph.set(relationship.sourceCollection, []);
    }
    if (!graph.has(relationship.targetCollection)) {
      graph.set(relationship.targetCollection, []);
    }

    graph.get(relationship.sourceCollection)!.push(relationship.targetCollection);
    allCollections.add(relationship.sourceCollection);
    allCollections.add(relationship.targetCollection);
  }

  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycles: string[] = [];

  function visit(collection: string): boolean {
    visited.add(collection);
    recursionStack.add(collection);

    const neighbors = graph.get(collection) ?? [];

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (visit(neighbor)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        cycles.push(`${collection} -> ${neighbor}`);
        return true;
      }
    }

    recursionStack.delete(collection);
    return false;
  }

  for (const collection of allCollections) {
    if (!visited.has(collection)) {
      if (visit(collection)) {
        return cycles;
      }
    }
  }

  return cycles;
}

export function getRelationshipGraph(
  relationships: DataRelationship[]
): Map<string, DataRelationship[]> {
  const graph = new Map<string, DataRelationship[]>();

  for (const relationship of relationships) {
    if (!graph.has(relationship.sourceCollection)) {
      graph.set(relationship.sourceCollection, []);
    }

    graph.get(relationship.sourceCollection)!.push(relationship);
  }

  return graph;
}

export function findRelationshipsByCollection(
  relationships: DataRelationship[],
  collectionName: string,
  direction: "source" | "target" | "both" = "both"
): DataRelationship[] {
  return relationships.filter((relationship) => {
    if (direction === "source") {
      return relationship.sourceCollection === collectionName;
    }
    if (direction === "target") {
      return relationship.targetCollection === collectionName;
    }
    return (
      relationship.sourceCollection === collectionName ||
      relationship.targetCollection === collectionName
    );
  });
}

export function cascadeDelete<T extends Record<string, unknown>, U extends Record<string, unknown>>(
  item: T,
  relationships: DataRelationship[],
  collections: Record<string, U[]>
): { deletedItems: Map<string, U[]>; errors: string[] } {
  const deletedItems = new Map<string, U[]>();
  const errors: string[] = [];

  for (const relationship of relationships) {
    if (
      String(item.id ?? "") !==
      String(item[relationship.sourceField] ?? "")
    ) {
      continue;
    }

    const targetCollection = collections[relationship.targetCollection];

    if (!targetCollection) {
      errors.push(
        `Collection '${relationship.targetCollection}' not found for cascade delete`
      );
      continue;
    }

    const relatedItems = getRelatedItems(item, relationship, targetCollection);

    if (relatedItems.length > 0) {
      deletedItems.set(relationship.targetCollection, relatedItems);
    }
  }

  return { deletedItems, errors };
}

export function validateForeignKey<T extends Record<string, unknown>, U extends Record<string, unknown>>(
  item: T,
  relationship: DataRelationship,
  targetCollection: U[]
): { isValid: boolean; error?: string } {
  const sourceValue = item[relationship.sourceField];

  if (sourceValue === undefined || sourceValue === null) {
    if (relationship.optional === true) {
      return { isValid: true };
    }
    return {
      isValid: false,
      error: `Foreign key field '${relationship.sourceField}' is missing`,
    };
  }

  const sourceValueStr = String(sourceValue);
  const exists = targetCollection.some(
    (targetItem) =>
      String(targetItem[relationship.targetField] ?? "") === sourceValueStr
  );

  if (!exists) {
    return {
      isValid: false,
      error: `Foreign key '${sourceValueStr}' not found in target collection`,
    };
  }

  return { isValid: true };
}

export function checkSelfReferentialCircularDependencies<T extends Record<string, unknown>>(
  relationship: DataRelationship,
  collection: T[]
): { hasCycles: boolean; cycles: string[][] } {
  if (relationship.sourceCollection !== relationship.targetCollection) {
    return { hasCycles: false, cycles: [] };
  }

  const adjacencyMap = new Map<number, number[]>();
  
  for (const item of collection) {
    const id = item.id as number;
    const parentId = item[relationship.sourceField] as number | null | undefined;
    
    if (parentId !== null && parentId !== undefined && parentId !== 0) {
      if (!adjacencyMap.has(parentId)) {
        adjacencyMap.set(parentId, []);
      }
      adjacencyMap.get(parentId)!.push(id);
    }
  }

  const cycles: string[][] = [];
  const visited = new Set<number>();
  const recursionStack = new Set<number>();
  const path: number[] = [];

  function detectCycle(nodeId: number): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    const children = adjacencyMap.get(nodeId) ?? [];
    
    for (const childId of children) {
      if (!visited.has(childId)) {
        if (detectCycle(childId)) {
          return true;
        }
      } else if (recursionStack.has(childId)) {
        const cycleIndex = path.indexOf(childId);
        const cyclePath = path.slice(cycleIndex).concat(childId);
        cycles.push(cyclePath.map(id => String(id)));
        return true;
      }
    }

    path.pop();
    recursionStack.delete(nodeId);
    return false;
  }

  for (const item of collection) {
    const id = item.id as number;
    if (!visited.has(id)) {
      detectCycle(id);
    }
  }

  return { hasCycles: cycles.length > 0, cycles };
}

export type { DataRelationship, RelationshipValidationError, ReferentialIntegrityResult };
