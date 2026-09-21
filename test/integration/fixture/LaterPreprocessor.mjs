/**
 * @returns {(depId: TeqFw_Di_Dto_DepId) => TeqFw_Di_Dto_DepId}
 */
export default function Fx_LaterPreprocessor() {
    return function (depId) {
        return depId.address === 'Fx_LaterAlias'
            ? {...depId, address: 'Fx_Root'}
            : depId;
    };
}
