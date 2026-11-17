export const namedPromise = Promise.resolve({kind: 'named-promise'});
export const frozenCarrier = Object.freeze(Promise.resolve({kind: 'frozen-carrier'}));
export const nestedThenable = Object.freeze({
    /** @param {(value: unknown) => void} resolve */
    then(resolve) {
        resolve({then(/** @type {(value: unknown) => void} */ next) { next({kind: 'nested-thenable'}); }});
    },
});
export const rejected = Object.freeze({
    /** @param {(value: unknown) => void} resolve @param {(reason: Error) => void} reject */
    then(resolve, reject) {
        void resolve;
        reject(new Error('adapted value rejected'));
    },
});
