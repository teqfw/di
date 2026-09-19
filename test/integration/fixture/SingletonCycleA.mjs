export const __deps__ = {
    b: 'Fx_SingletonCycleB$',
};

/**
 * @param {object} deps
 * @param {unknown} deps.b
 * @returns {{name: string, b: unknown}}
 */
export default function Fx_SingletonCycleA({b}) {
    return {name: 'singleton-cycle-a', b};
}
