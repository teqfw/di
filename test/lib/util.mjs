/**
 * 'true' if 'obj' is a class definition (can be used as 'new obj()').
 * @param {*} obj
 * @return {boolean}
 */
function isClass(obj) {
    let result = false;
    if (typeof obj === 'function') {
        const proto = Object.getOwnPropertyDescriptor(obj, 'prototype');
        result = (proto && !proto.writable);
    }
    return result;
}

export {
    isClass
}
