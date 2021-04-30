import { getEntities } from './get-entities'
import type { Normalized } from './normalize'
import type { GetID, ID, Predicate } from '..'

export function removeEntities<T>(
    getId: GetID<T>,
): (input: ID | ID[] | Predicate<T>) => (state: Normalized<T>) => Normalized<T> {
    /**
     * Removes an entity by ID, if found.
     *
     * @param id {@link ID} ID of the entity to remove
     */
    function withInput(id: ID): (state: Normalized<T>) => Normalized<T>

    /**
     * Removes one or more entities from the state, if found.
     *
     * @param ids Array of {@link ID}s to remove
     */
    function withInput(ids: ID[]): (state: Normalized<T>) => Normalized<T>

    /**
     * Removes all entities that match the filter function.
     *
     * @param pred {@link Predicate<T>} filter function that returns true for every entity that should be removed
     */
    function withInput(pred: Predicate<T>): (state: Normalized<T>) => Normalized<T>

    function withInput(input: ID | ID[] | Predicate<T>) {
        return function fromState(state: Normalized<T>): Normalized<T> {
            let toRemove: T[]

            if (Array.isArray(input)) {
                toRemove = getEntities<T>(input)(state)
            } else if (input instanceof Function) {
                toRemove = getEntities<T>(input)(state)
            } else {
                toRemove = [getEntities<T>(input)(state)].filter(Boolean)
            }

            return toRemove.reduce(
                ({ byId, allIds }, next) => {
                    const id = getId(next)
                    delete byId[id]

                    return {
                        byId,
                        allIds: allIds.filter((i) => i !== id),
                    }
                },
                {
                    byId: { ...state.byId },
                    allIds: [...state.allIds],
                },
            )
        }
    }

    return withInput
}
