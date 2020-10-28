/**
 * rubico v1.6.8
 * https://github.com/a-synchronous/rubico
 * (c) 2019-2020 Richard Tong
 * rubico may be freely distributed under the MIT license.
 */

(function (root, not) {
  if (typeof module == 'object') (module.exports = not) // CommonJS
  else if (typeof define == 'function') define(() => not) // AMD
  else (root.not = not) // Browser
}(typeof globalThis == 'object' ? globalThis : this, (function () { 'use strict'

const isPromise = value => value != null && typeof value.then == 'function'

// true -> false
const _not = value => !value

const not = func => function logicalInverter(...args) {
  const boolean = func(...args)
  return isPromise(boolean) ? boolean.then(_not) : !boolean
}

const notSync = func => function notSync(...args) {
  return !func(...args)
}

not.sync = notSync

return not
}())))
