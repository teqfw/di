export default function Test_Main(spec) {
    const depClass = spec.Test_DepClass$;
    const depFn = spec.Test_DepFunc$;
    return {name: 'Test_Main', depClass, depFn};
}
