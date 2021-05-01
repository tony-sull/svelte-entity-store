/**
 * EntityStore supports `string` and `number` values for unique IDs
 */
export type ID = string | number

/**
 * Type guard used to check if any value is a valid entity ID
 *
 * @param value {unknown}
 * @returns {boolean} true if the value is an ID (string or number), false otherwise
 */
export function isID(value: unknown): value is ID {
    const type = typeof value

    return type === 'string' || type === 'number'
}

/**
 * Function used to get the unique ID of an entity
 */
export type GetID<T> = (t: T) => ID

/**
 * Predicate used for filtering entities
 */
export type Predicate<T> = (t: T) => boolean
