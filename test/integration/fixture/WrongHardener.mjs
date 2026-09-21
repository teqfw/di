/**
 * @returns {(value: unknown) => unknown}
 */
export default function Fx_WrongHardener() {
    return function (value) {
        return {...(/** @type {object} */ (value)), policyHardener: 'wrong'};
    };
}
