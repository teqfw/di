export default function Fx_Wrapped() {
    return {steps: ['core']};
}

export function wrapFirst(value) {
    value.steps.push('wrapFirst');
    return value;
}

export function wrapSecond(value) {
    value.steps.push('wrapSecond');
    return value;
}

export function wrapThenable(value) {
    return Promise.resolve(value);
}
