let producerCalls = 0;

/**
 * @returns {{producerCalls: number, steps: string[]}}
 */
export default function Fx_ObservedSingleton() {
    producerCalls += 1;
    return {producerCalls, steps: ['producer']};
}

/**
 * @param {{producerCalls: number, steps: string[]}} value
 * @returns {{producerCalls: number, steps: string[]}}
 */
export function wrapTag(value) {
    return {...value, steps: [...value.steps, 'wrapper']};
}

/**
 * @returns {number}
 */
export function getProducerCalls() {
    return producerCalls;
}
