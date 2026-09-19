let callableCalls = 0;
let classCalls = 0;

export const __deps__ = {
    Callable: {missing: 'Fx_Missing$'},
    DirectClass: {missing: 'Fx_Missing$'},
};

export function Callable() {
    callableCalls += 1;
    return {kind: 'callable'};
}

export class DirectClass {
    constructor() {
        classCalls += 1;
    }
}

/**
 * @returns {number}
 */
export function getCallableCalls() {
    return callableCalls;
}

/**
 * @returns {number}
 */
export function getClassCalls() {
    return classCalls;
}

/**
 * @param {unknown} value
 * @returns {{wrapped: true, value: unknown}}
 */
export function wrapIdentity(value) {
    return {wrapped: true, value};
}
