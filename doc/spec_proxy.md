# Dependencies Specification

`@teqfw/di` works only with functions/classes where dependencies are packed into one `spec` object given as alone parameter:
```ecmascript 6
// function with anonymous object as specification
function main_obj({dep1, dep2, dep3}) {

}

// function with `spec` object
function main_obj(spec) {
    const dep1 = spec.dep1;
    const dep2 = spec.dep2;
    const dep3 = spec.dep3;
}

// class with anonymous object as specification
class MainObj {
    constructor({dep1, dep2, dep3}) {

    }
}

// class with `spec` object
class MainObj {
    constructor(spec) {
        // private members for the instance
        const _dep1 = spec.dep1;
        const _dep2 = spec.dep2;
        const _dep3 = spec.dep3;
    }
}

````
