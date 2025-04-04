import { expect, test } from 'vitest'
import { main } from './index'

test('adds 1 + 2 to equal 3', () => {
  expect(main('hello')).toBe('hello world')
})