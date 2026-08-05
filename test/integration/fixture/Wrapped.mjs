export default function Fx_Wrapped() {
    return {steps: ['core']};
}

/**
 * @param {{steps: string[]}} value
 */
export function wrapFirst(value) {
    value.steps.push('wrapFirst');
    return value;
}

/**
 * @param {{steps: string[]}} value
 */
export function wrapSecond(value) {
    value.steps.push('wrapSecond');
    return value;
}

/**
 * @param {{steps: string[]}} value
 */
export function wrapThenable(value) {
    return Promise.resolve(value);
}
