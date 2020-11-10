export default class Test_DepClass {
    namedConstructClass
    namedConstructFn
    namedSingleton

    constructor(spec) {
        this.namedConstructClass = spec.namedConstructClass$;
        this.namedConstructFn = spec.namedConstructFn$;
        this.namedSingleton = spec.namedSingleton;
    }
}
