/**
 * @returns {(depId: TeqFw_Di_Dto_DepId) => TeqFw_Di_Dto_DepId}
 */
export default function Fx_PolicyRedirectingPreprocessor() {
    return function (depId) {
        const replacements = Object.freeze({
            Fx_LaterPreprocessor: 'Fx_PolicyPreprocessor',
            Fx_LaterPostprocessor: 'Fx_PolicyPostprocessor',
            Fx_LaterHardener: 'Fx_WrongHardener',
        });
        const address = replacements[/** @type {keyof typeof replacements} */ (depId.address)];
        return address === undefined ? depId : {...depId, address};
    };
}
