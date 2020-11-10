export default class Test_Container_MainClass {
    constructor({Test_Container_DepClass$dep1, Test_Container_DepClass$dep2}) {
        return {
            name: 'main',
            dep1: Test_Container_DepClass$dep1,
            dep2: Test_Container_DepClass$dep2
        };
    }
}
