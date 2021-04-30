import { get } from 'svelte/store'
import { suite } from 'uvu'
import * as assert from 'uvu/assert'
import { entityStore } from '../src/entity-store'
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
    const store = entityStore<Entity>(getID, items)
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

const set = suite('set')

set('is a function', () => {
    const { set } = entityStore<Entity>(getID)
    assert.type(set, 'function')
})

set('accepts a single entity', () => {
    const store = entityStore<Entity>(getID)
    const entity: Entity = { id: 'abc', description: 'item 1', completed: false }

    store.set(entity)

    const state = get(store)

    assert.equal(state, {
        byId: {
            abc: entity,
        },
        allIds: ['abc'],
    })
})

set('accepts an array of entities', () => {
    const store = entityStore<Entity>(getID)
    const entities: Entity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: true },
    ]

    store.set(entities)

    const state = get(store)

    assert.equal(state, {
        byId: {
            abc: entities[0],
            def: entities[1],
        },
        allIds: ['abc', 'def'],
    })
})

set('updates an existing entity', () => {
    const entities: Entity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: true },
    ]
    const store = entityStore<Entity>(getID, entities)

    store.set({ ...entities[0], completed: true })

    const state = get(store)

    assert.equal(state, {
        byId: {
            abc: { ...entities[0], completed: true },
            def: entities[1],
        },
        allIds: ['abc', 'def'],
    })
})

set('handles a combination of new and existing entities', () => {
    const entities: Entity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: true },
    ]
    const store = entityStore<Entity>(getID, entities)

    const input: Entity[] = [
        { ...entities[0], completed: true },
        { id: 'ghi', description: 'item 3', completed: false },
    ]

    store.set(input)

    const state = get(store)

    assert.equal(state, {
        byId: {
            abc: { ...entities[0], completed: true },
            def: entities[1],
            ghi: input[1],
        },
        allIds: ['abc', 'def', 'ghi'],
    })
})

set('calls subscribers once after all entities are updated', () => {
    const entities: Entity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: true },
    ]
    const store = entityStore<Entity>(getID, entities)

    const input: Entity[] = [
        { ...entities[0], completed: true },
        { id: 'ghi', description: 'item 3', completed: false },
    ]

    const states: Normalized<Entity>[] = []
    const unsubscribe = store.subscribe((state) => states.push(state))

    store.set(input)

    assert.equal(states, [
        {
            byId: {
                abc: entities[0],
                def: entities[1],
            },
            allIds: ['abc', 'def'],
        },
        {
            byId: {
                abc: { ...entities[0], completed: true },
                def: entities[1],
                ghi: input[1],
            },
            allIds: ['abc', 'def', 'ghi'],
        },
    ])

    unsubscribe()
})

set("doesn't call subscribers if an empty array was provided", () => {
    const entities: Entity[] = [
        { id: 'abc', description: 'item 1', completed: false },
        { id: 'def', description: 'item 2', completed: true },
    ]
    const store = entityStore<Entity>(getID, entities)

    const states: Normalized<Entity>[] = []
    const unsubscribe = store.subscribe((state) => states.push(state))

    store.set([])

    assert.equal(states, [
        {
            byId: {
                abc: entities[0],
                def: entities[1],
            },
            allIds: ['abc', 'def'],
        },
    ])

    unsubscribe()
})

set.run()

// --
