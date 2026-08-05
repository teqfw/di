export const __deps__ = {
    leaf: 'Fx_Leaf',
};

/**
 * @param {object} deps
 * @param {unknown} deps.leaf
 */
export default function Fx_Child({leaf}) {
    return {name: 'child', leaf};
}
