import { get } from 'svelte/store'
import { suite } from 'uvu'
import * as assert from 'uvu/assert'
import { EntityStore, entityStore } from '../src/entity-store'
import { Normalized } from '../src/internal/normalize'

type Entity = {
    id: string
    description: string
    completed: boolean
}

const getID = (e: Entity) => e.id

// ---

const constructor = suite('constructor')

constructor('is a function', () => {
    assert.type(entityStore, 'function')
})

constructor('returns a subscriber function', () => {
    const store = entityStore<Entity>(getID)

    assert.type(store, 'object')
    assert.type(store.subscribe, 'function')
})

constructor("doesn't require initial state", () => {
    const store = entityStore<Entity>(getID)
    const state = get(store)

    assert.equal(state, {
        byId: {},
        allIds: [],
    })
})

constructor('normalizes initial items array', () => {
    const items: Entity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: true },
    ]
    const store = entityStore<EntityStore>(getID, items)
    const state = get(store)

    assert.equal(state, {
        byId: {
            abc: items[0],
            def: items[1],
        },
        allIds: ['abc', 'def'],
    })
})

constructor.run()

// ---

const reset = suite('reset')

reset('is a function', () => {
    const { reset } = entityStore<Entity>(getID)
    assert.type(reset, 'function')
})

reset('noop for an empty store', () => {
    const store = entityStore<Entity>(getID)
    store.reset()

    const state = get(store)

    assert.equal(state, { byId: {}, allIds: [] })
})

reset('removes all existing entities', () => {
    const items: Entity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: true },
    ]
    const store = entityStore<Entity>(getID, items)
    store.reset()

    const state = get(store)

    assert.equal(state, { byId: {}, allIds: [] })
})

reset("doesn't trigger subscribers for empty store", () => {
    const store = entityStore<Entity>(getID)

    let states: Normalized<Entity>[]
    const unsubscribe = store.subscribe((state) => states.push(state))

    store.reset()

    assert.is(states.length, 1)

    unsubscribe()
})

// ---
