export const __deps__ = {
    a: 'Fx_SingletonCycleA$',
};

/**
 * @param {object} deps
 * @param {unknown} deps.a
 * @returns {{name: string, a: unknown}}
 */
export default function Fx_SingletonCycleB({a}) {
    return {name: 'singleton-cycle-b', a};
}
