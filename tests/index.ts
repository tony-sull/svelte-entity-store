import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { entityStore } from '../src'

test('exports the entityStore constructor', () => {
    assert.type(entityStore, 'function')
})

test.run()
