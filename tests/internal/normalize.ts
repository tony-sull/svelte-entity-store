import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { normalize } from '../../src/internal/normalize'

type Entity = {
    id: string
    description: string
}

const getID = (e: Entity) => e.id

test('is a function', () => {
    assert.type(normalize, 'function')
})

test('handles an empty array', () => {
    const state = normalize(getID)([])

    assert.equal(state, {
        byId: {},
        allIds: [],
    })
})

test('handles an array of one item', () => {
    const item: Entity = { id: 'abc', description: 'item 1' }

    const state = normalize(getID)([item])

    assert.equal(state, {
        byId: {
            abc: item,
        },
        allIds: ['abc'],
    })
})

test('maintains item order', () => {
    const items: Entity[] = [
        { id: 'abc', description: 'item 1' },
        { id: 'def', description: 'item 2' },
    ]

    const state = normalize(getID)(items)

    assert.equal(state, {
        byId: {
            abc: items[0],
            def: items[1],
        },
        allIds: ['abc', 'def'],
    })
})

test.run()
