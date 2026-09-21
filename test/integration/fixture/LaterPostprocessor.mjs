/**
 * @returns {(value: unknown) => unknown}
 */
export default function Fx_LaterPostprocessor() {
    return function (value) {
        return {...(/** @type {object} */ (value)), policyPostprocessor: 'later'};
    };
}
