export default function Fx_MockTarget() {
    return {steps: ['fixture']};
}

/**
 * @param {{steps: string[]}} value
 * @returns {{steps: string[]}}
 */
export function wrapFirst(value) {
    return {...value, steps: [...value.steps, 'wrapFirst']};
}
