export default function Test_ChildClass$factory(spec) {
    const BaseClass = spec['Test_BaseClass#'];

    class Test_ChildClass extends BaseClass {}

    return Test_ChildClass;
}
