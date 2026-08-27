export const __deps__ = {
    left: 'Fx_ContextLeft$',
    right: 'Fx_ContextRight$',
};

/**
 * @param {{left: unknown, right: unknown}} deps
 * @returns {{name: string, left: unknown, right: unknown}}
 */
export default function Fx_ContextRoot({left, right}) {
    return {name: 'root', left, right};
}
