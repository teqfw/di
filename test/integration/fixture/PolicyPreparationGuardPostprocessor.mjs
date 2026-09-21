/**
 * @returns {(value: unknown) => unknown}
 */
export default function Fx_PolicyPreparationGuardPostprocessor() {
    return function (value) {
        if (typeof value === 'function') {
            throw new Error('Configured Postprocessor leaked into policy materialization.');
        }
        return value;
    };
}
