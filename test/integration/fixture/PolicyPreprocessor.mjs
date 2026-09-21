/**
 * @returns {(depId: TeqFw_Di_Dto_DepId) => TeqFw_Di_Dto_DepId}
 */
export default function Fx_PolicyPreprocessor() {
    return function (depId) {
        return depId.address === 'Fx_ConfigAlias'
            ? {...depId, address: 'Fx_Root'}
            : depId;
    };
}
