/**
 * @returns {(value: unknown) => unknown}
 */
export default function Fx_PolicyPostprocessor() {
    return function (value) {
        return {...(/** @type {object} */ (value)), policyPostprocessed: true};
    };
}
