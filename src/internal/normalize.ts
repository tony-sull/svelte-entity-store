import { GetID, ID } from '../shared'

/**
 * Normalized state tracking entities by ID
 */
export type Normalized<T> = {
    /**
     * Map of entities by ID. EntityStore supports `string` and `number` ID types
     */
    byId: {
        [id: string]: T
        [id: number]: T
    }
    /**
     * List of all entities IDs, sorted in the order they were added
     */
    allIds: ID[]
}

/**
 * Takes a list of elements and normalizes them by ID
 *
 * @typeParam T Entity type being stored
 * @param getID {@link GetID<T>}
 * @returns {@link Normalized<T>} noramlized state holding the given items
 */
export const normalize = <T>(getID: GetID<T>) => (items: T[]): Normalized<T> => {
    return items.reduce(
        ({ byId, allIds }, next) => {
            const id = getID(next)

            byId[id] = next
            allIds.push(id)

            return { byId, allIds }
        },
        { byId: {}, allIds: [] } as Normalized<T>,
    )
}
