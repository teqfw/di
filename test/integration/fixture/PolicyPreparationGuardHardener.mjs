/**
 * @returns {(value: unknown) => unknown}
 */
export default function Fx_PolicyPreparationGuardHardener() {
    return function (value) {
        if (typeof value === 'function') {
            throw new Error('Configured Hardener leaked into policy materialization.');
        }
        return {...(/** @type {object} */ (value)), policyHardener: 'guard'};
    };
}
