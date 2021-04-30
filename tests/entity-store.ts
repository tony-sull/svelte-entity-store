import { get } from 'svelte/store'
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { EntityStore, entityStore } from '../src/entity-store'

type Entity = {
    id: string
    description: string
    completed: boolean
}

const getID = (e: Entity) => e.id

test('is a function', () => {
    assert.type(entityStore, 'function')
})

test('returns a subscriber function', () => {
    const store = entityStore<Entity>(getID)

    assert.type(store, 'object')
    assert.type(store.subscribe, 'function')
})

test("doesn't require initial state", () => {
    const store = entityStore<Entity>(getID)
    const state = get(store)

    assert.equal(state, {
        byId: {},
        allIds: [],
    })
})

test('normalizes initial items array', () => {
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

test.run()
