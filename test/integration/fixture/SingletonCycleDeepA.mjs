export const __deps__ = {
    b: 'Fx_SingletonCycleDeepB$',
};

/**
 * @param {object} deps
 * @param {unknown} deps.b
 * @returns {{name: string, b: unknown}}
 */
export default function Fx_SingletonCycleDeepA({b}) {
    return {name: 'singleton-cycle-deep-a', b};
}
