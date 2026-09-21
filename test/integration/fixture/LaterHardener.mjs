/**
 * @returns {(value: unknown) => unknown}
 */
export default function Fx_LaterHardener() {
    return function (value) {
        return {...(/** @type {object} */ (value)), policyHardener: 'later'};
    };
}
