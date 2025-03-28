/**
 * rubico v2.3.0
 * https://github.com/a-synchronous/rubico
 * (c) 2019-2023 Richard Tong
 * rubico may be freely distributed under the MIT license.
 */

const isPromise = value => value != null && typeof value.then == 'function'

const symbolIterator = Symbol.iterator

const MappingIterator = (iterator, mapper) => ({
  toString() {
    return '[object MappingIterator]'
  },
  [symbolIterator]() {
    return this
  },
  next() {
    const iteration = iterator.next()
    return iteration.done ? iteration
      : { value: mapper(iteration.value), done: false }
  },
})

const NextIteration = value => ({ value, done: false })

const symbolAsyncIterator = Symbol.asyncIterator

const MappingAsyncIterator = (asyncIterator, mapper) => ({
  [symbolAsyncIterator]() {
    return this
  },
  async next() {
    const iteration = await asyncIterator.next()
    if (iteration.done) {
      return iteration
    }
    const mapped = mapper(iteration.value)
    return isPromise(mapped)
      ? mapped.then(NextIteration)
      : { value: mapped, done: false }
  }
})

const __ = Symbol.for('placeholder')

// argument resolver for curry2
const curry2ResolveArg0 = (
  baseFunc, arg1,
) => function arg0Resolver(arg0) {
  return baseFunc(arg0, arg1)
}

// argument resolver for curry2
const curry2ResolveArg1 = (
  baseFunc, arg0,
) => function arg1Resolver(arg1) {
  return baseFunc(arg0, arg1)
}

const curry2 = function (baseFunc, arg0, arg1) {
  return arg0 == __
    ? curry2ResolveArg0(baseFunc, arg1)
    : curry2ResolveArg1(baseFunc, arg0)
}

const isArray = Array.isArray

const isObject = value => {
  if (value == null) {
    return false
  }

  const typeofValue = typeof value
  return (typeofValue == 'object') || (typeofValue == 'function')
}

const promiseAll = Promise.all.bind(Promise)

const arrayMap = function (array, mapper) {
  const arrayLength = array.length,
    result = Array(arrayLength)
  let index = -1,
    isAsync = false

  while (++index < arrayLength) {
    const resultItem = mapper(array[index], index, array)
    if (isPromise(resultItem)) {
      isAsync = true
    }
    result[index] = resultItem
  }
  return isAsync ? promiseAll(result) : result
}

// argument resolver for curry3
const curry3ResolveArg0 = (
  baseFunc, arg1, arg2,
) => function arg0Resolver(arg0) {
  return baseFunc(arg0, arg1, arg2)
}

// argument resolver for curry3
const curry3ResolveArg1 = (
  baseFunc, arg0, arg2,
) => function arg1Resolver(arg1) {
  return baseFunc(arg0, arg1, arg2)
}

// argument resolver for curry3
const curry3ResolveArg2 = (
  baseFunc, arg0, arg1,
) => function arg2Resolver(arg2) {
  return baseFunc(arg0, arg1, arg2)
}

const curry3 = function (baseFunc, arg0, arg1, arg2) {
  if (arg0 == __) {
    return curry3ResolveArg0(baseFunc, arg1, arg2)
  }
  if (arg1 == __) {
    return curry3ResolveArg1(baseFunc, arg0, arg2)
  }
  return curry3ResolveArg2(baseFunc, arg0, arg1)
}

const callPropUnary = (value, property, arg0) => value[property](arg0)

const stringMap = function (string, mapper) {
  const result = arrayMap(string, mapper)
  return isPromise(result)
    ? result.then(curry3(callPropUnary, __, 'join', ''))
    : result.join('')
}

const always = value => function getter() { return value }

const setMap = function (set, mapper) {
  const result = new Set(),
    promises = []
  for (const item of set) {
    const resultItem = mapper(item, item, set)
    if (isPromise(resultItem)) {
      promises.push(resultItem.then(curry3(callPropUnary, result, 'add', __)))
    } else {
      result.add(resultItem)
    }
  }
  return promises.length == 0
    ? result
    : promiseAll(promises).then(always(result))
}

// argument resolver for curry4
const curry4ResolveArg0 = (
  baseFunc, arg1, arg2, arg3,
) => function arg0Resolver(arg0) {
  return baseFunc(arg0, arg1, arg2, arg3)
}

// argument resolver for curry4
const curry4ResolveArg1 = (
  baseFunc, arg0, arg2, arg3,
) => function arg1Resolver(arg1) {
  return baseFunc(arg0, arg1, arg2, arg3)
}

// argument resolver for curry4
const curry4ResolveArg2 = (
  baseFunc, arg0, arg1, arg3,
) => function arg2Resolver(arg2) {
  return baseFunc(arg0, arg1, arg2, arg3)
}

// argument resolver for curry4
const curry4ResolveArg3 = (
  baseFunc, arg0, arg1, arg2,
) => function arg3Resolver(arg3) {
  return baseFunc(arg0, arg1, arg2, arg3)
}

const curry4 = function (baseFunc, arg0, arg1, arg2, arg3) {
  if (arg0 == __) {
    return curry4ResolveArg0(baseFunc, arg1, arg2, arg3)
  }
  if (arg1 == __) {
    return curry4ResolveArg1(baseFunc, arg0, arg2, arg3)
  }
  if (arg2 == __) {
    return curry4ResolveArg2(baseFunc, arg0, arg1, arg3)
  }
  return curry4ResolveArg3(baseFunc, arg0, arg1, arg2)
}

const callPropBinary = (value, property, arg0, arg1) => value[property](arg0, arg1)

const mapMap = function (value, mapper) {
  const result = new Map(),
    promises = []
  for (const [key, item] of value) {
    const resultItem = mapper(item, key, value)
    if (isPromise(resultItem)) {
      promises.push(resultItem.then(
        curry4(callPropBinary, result, 'set', key, __)))
    } else {
      result.set(key, resultItem)
    }
  }
  return promises.length == 0
    ? result
    : promiseAll(promises).then(always(result))
}

const promiseObjectAllExecutor = object => function executor(resolve) {
  const result = {}
  let numPromises = 0
  for (const key in object) {
    const value = object[key]
    if (isPromise(value)) {
      numPromises += 1
      value.then((key => function (res) {
        result[key] = res
        numPromises -= 1
        if (numPromises == 0) {
          resolve(result)
        }
      })(key))
    } else {
      result[key] = value
    }
  }
  if (numPromises == 0) {
    resolve(result)
  }
}

const promiseObjectAll = object => new Promise(promiseObjectAllExecutor(object))

const objectMap = function (object, mapper) {
  const result = {}
  let isAsync = false
  for (const key in object) {
    const resultItem = mapper(object[key], key, object)
    if (isPromise(resultItem)) {
      isAsync = true
    }
    result[key] = resultItem
  }
  return isAsync ? promiseObjectAll(result) : result
}

const funcConcat = (
  funcA, funcB,
) => function pipedFunction(...args) {
  const intermediate = funcA(...args)
  return isPromise(intermediate)
    ? intermediate.then(funcB)
    : funcB(intermediate)
}

const objectSet = function (object, property, value) {
  object[property] = value
  return object
}

const arrayMapSeriesAsync = async function (
  array, mapper, result, index,
) {
  const arrayLength = array.length
  while (++index < arrayLength) {
    const resultItem = mapper(array[index])
    result[index] = isPromise(resultItem) ? await resultItem : resultItem
  }
  return result
}

const arrayMapSeries = function (array, mapper) {
  const arrayLength = array.length,
    result = Array(arrayLength)
  let index = -1

  while (++index < arrayLength) {
    const resultItem = mapper(array[index])
    if (isPromise(resultItem)) {
      return resultItem.then(funcConcat(
        curry3(objectSet, result, index, __),
        curry4(arrayMapSeriesAsync, array, mapper, __, index)))
    }
    result[index] = resultItem
  }
  return result
}

const tapSync = func => function tapping(...args) {
  func(...args)
  return args[0]
}

const promiseRace = Promise.race.bind(Promise)

const arrayMapPoolAsync = async function (
  array, mapper, concurrencyLimit, result, index, promises,
) {
  const arrayLength = array.length
  while (++index < arrayLength) {
    if (promises.size >= concurrencyLimit) {
      await promiseRace(promises)
    }

    const resultItem = mapper(array[index])
    if (isPromise(resultItem)) {
      const selfDeletingPromise = resultItem.then(
        tapSync(() => promises.delete(selfDeletingPromise)))
      promises.add(selfDeletingPromise)
      result[index] = selfDeletingPromise
    } else {
      result[index] = resultItem
    }
  }
  return promiseAll(result)
}

const arrayMapPool = function (array, mapper, concurrentLimit) {
  const arrayLength = array.length,
    result = Array(arrayLength)
  let index = -1
  while (++index < arrayLength) {

    const resultItem = mapper(array[index])
    if (isPromise(resultItem)) {
      const promises = new Set(),
        selfDeletingPromise = resultItem.then(
          tapSync(() => promises.delete(selfDeletingPromise)))
      promises.add(selfDeletingPromise)
      result[index] = selfDeletingPromise
      return arrayMapPoolAsync(
        array, mapper, concurrentLimit, result, index, promises)
    }
    result[index] = resultItem
  }
  return result
}

const _curryArity = (arity, func, args) => function curried(...curriedArgs) {
  const argsLength = args.length,
    curriedArgsLength = curriedArgs.length,
    nextArgs = []
  let argsIndex = -1,
    curriedArgsIndex = -1,
    numCurriedPlaceholders = 0

  while (++argsIndex < argsLength) {
    const arg = args[argsIndex]
    if (arg == __ && (curriedArgsIndex += 1) < curriedArgsLength) {
      const curriedArg = curriedArgs[curriedArgsIndex]
      if (curriedArg == __) {
        numCurriedPlaceholders += 1
      }
      nextArgs.push(curriedArg)
    } else {
      nextArgs.push(arg)
    }
    if (nextArgs.length == arity) {
      return numCurriedPlaceholders == 0
        ? func(...nextArgs)
        : curryArity(arity, func, nextArgs)
    }
  }

  while (++curriedArgsIndex < curriedArgsLength) {
    const curriedArg = curriedArgs[curriedArgsIndex]
    if (curriedArg == __) {
      numCurriedPlaceholders += 1
    }
    nextArgs.push(curriedArg)
    if (nextArgs.length == arity) {
      return numCurriedPlaceholders == 0
        ? func(...nextArgs)
        : curryArity(arity, func, nextArgs)
    }
  }
  return curryArity(arity, func, nextArgs)
}

const curryArity = function (arity, func, args) {
  const argsLength = args.length
  if (argsLength < arity) {
    return _curryArity(arity, func, args)
  }
  let argsIndex = -1
  while (++argsIndex < argsLength) {
    const arg = args[argsIndex]
    if (arg == __) {
      return _curryArity(arity, func, args)
    }
  }
  return func(...args)
}

const spread2 = func => function spreading2([arg0, arg1]) {
  return func(arg0, arg1)
}

const objectMapEntries = function (object, mapper) {
  const result = {},
    promises = []
  for (const key in object) {
    const value = object[key],
      mapping = mapper([key, value])
    if (isPromise(mapping)) {
      promises.push(mapping.then(
        spread2(curryArity(3, objectSet, [result]))))
    } else {
      result[mapping[0]] = mapping[1]
    }
  }
  return promises.length == 0
    ? result
    : promiseAll(promises).then(always(result))
}

const mapSet = function setting(source, key, value) {
  return source.set(key, value)
}

// (mapper function, result Map, promises Array<Promise>) => (key any, value any) => ()
const mapMapEntriesForEachCallback = (
  mapper, result, promises,
) => function callback(value, key) {
  const mapping = mapper([key, value])
  if (isPromise(mapping)) {
    promises.push(mapping.then(spread2(curryArity(3, mapSet, [result]))))
  } else {
    result.set(mapping[0], mapping[1])
  }
}

const mapMapEntries = function (source, mapper) {
  const result = new Map(),
    promises = []
  source.forEach(mapMapEntriesForEachCallback(mapper, result, promises))
  return promises.length == 0
    ? result
    : promiseAll(promises).then(always(result))
}

const _map = function (value, mapper) {
  if (isArray(value)) {
    return arrayMap(value, mapper)
  }
  if (value == null) {
    return value
  }

  if (typeof value.then == 'function') {
    return value.then(mapper)
  }
  if (typeof value.map == 'function') {
    return value.map(mapper)
  }
  if (typeof value == 'string' || value.constructor == String) {
    return stringMap(value, mapper)
  }
  if (value.constructor == Set) {
    return setMap(value, mapper)
  }
  if (value.constructor == Map) {
    return mapMap(value, mapper)
  }
  if (typeof value[symbolIterator] == 'function') {
    return MappingIterator(value[symbolIterator](), mapper)
  }
  if (typeof value[symbolAsyncIterator] == 'function') {
    return MappingAsyncIterator(value[symbolAsyncIterator](), mapper)
  }
  if (value.constructor == Object) {
    return objectMap(value, mapper)
  }
  return mapper(value)
}

const map = (...args) => {
  const mapper = args.pop()
  if (args.length == 0) {
    return curry2(_map, __, mapper)
  }

  const collection = args[0]
  if (isPromise(collection)) {
    return collection.then(curry2(_map, __, mapper))
  }
  return _map(collection, mapper)
}

map.entries = function mapEntries(mapper) {
  return function mappingEntries(value) {
    if (value == null) {
      throw new TypeError('value is not an Object or Map')
    }
    if (value.constructor == Object) {
      return objectMapEntries(value, mapper)
    }
    if (value.constructor == Map) {
      return mapMapEntries(value, mapper)
    }
    throw new TypeError('value is not an Object or Map')
  }
}

map.series = mapper => function mappingInSeries(value) {
  if (isArray(value)) {
    return arrayMapSeries(value, mapper)
  }
  throw new TypeError(`${value} is not an Array`)
}

map.pool = (concurrencyLimit, mapper) => function concurrentPoolMapping(value) {
  if (isArray(value)) {
    return arrayMapPool(value, mapper, concurrencyLimit)
  }
  throw new TypeError(`${value} is not an Array`)
}

export default map
