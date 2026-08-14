import { search } from '../search.js'

// `search()` yields `{ range, excerpt }`; the range is turned into a DOM range
// by the caller, so these tests only cover the excerpts
const matches = (strs, query, options) =>
    Array.from(search(strs, query, options), ({ excerpt }) => excerpt)

// what `searchMatcher()` passes for a plain, case-insensitive search
const GRAPHEME = { granularity: 'grapheme', sensitivity: 'base' }

{
    // a match spanning more than two text runs must keep the runs in between;
    // `makeExcerpt()` used to index `strs` with the run contents rather than
    // the run indices, which silently dropped everything in the middle
    const [excerpt] = matches(
        ['Hello ', 'beautiful ', 'world'], 'lo beautiful wo', GRAPHEME)
    const a = excerpt?.match
    const b = 'lo beautiful wo'
    console.assert(a === b, `expected ${b}, got ${a}`)
}

{
    // two runs can hold identical text; the excerpt must be built from the run
    // positions, not by comparing the runs themselves
    const [excerpt] = matches(['abc', 'abc'], 'ca', GRAPHEME)
    const a = excerpt?.match
    const b = 'ca'
    console.assert(a === b, `expected ${b}, got ${a}`)
}

{
    // matches within a single run, and the surrounding context, are unaffected
    const [excerpt] = matches(['one two three'], 'two', GRAPHEME)
    for (const [key, b] of [['pre', 'one '], ['match', 'two'], ['post', ' three']]) {
        const a = excerpt?.[key]
        console.assert(a === b, `expected ${key} ${b}, got ${a}`)
    }
}
