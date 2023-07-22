export = arrayMap;
/**
 * @name arrayMap
 *
 * @synopsis
 * ```coffeescript [specscript]
 * arrayMap(
 *   array Array,
 *   mapper (item any, index number, array Array)=>Promise|any,
 * ) -> Promise|Array
 * ```
 *
 * @description
 * Apply a mapper to each item of an array, returning an array. Mapper may be asynchronous.
 */
declare function arrayMap(array: any, mapper: any): any;
