export default function Factory(spec) {
    const BaseClass = spec['Test_BaseClass#'];

    class Test_ChildClass extends BaseClass {}

    return Test_ChildClass;
}
