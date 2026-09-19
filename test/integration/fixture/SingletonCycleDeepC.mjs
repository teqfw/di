export const __deps__ = {
    a: 'Fx_SingletonCycleDeepA$',
};

/**
 * @param {object} deps
 * @param {unknown} deps.a
 * @returns {{name: string, a: unknown}}
 */
export default function Fx_SingletonCycleDeepC({a}) {
    return {name: 'singleton-cycle-deep-c', a};
}
