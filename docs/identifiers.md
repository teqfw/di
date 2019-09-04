# Dependencies Identifiers

## Format

Regexp:
```ecmascript 6
const REG_EXP_VALID_ID = /^(([a-z]\w*)(\${2}))?([A-Za-z]\w*)(\$?)(\w*)$/;
```


## Lifestyle type
Let we have this simple function as dependency constructor:
```ecmascript 6
function dependency(name = 'new') {
    return {name};
}
````

and we have this function with dependencies:
```ecmascript 6
function main(dep1, dep2, dep3) {
    return {dep1, dep2, dep3};
}
```

We want to create object `obj` using `main` where:
* `dep1` is a new result of the `dependency` function execution (transient lifestyle);
* `dep2` is the default result of the `dependency` function execution (singleton lifestyle);
* `dep3` is the named result of the `dependency` function execution (singleton lifestyle, named);
```ecmascript 6
const dep1 = dependency();
const dep2 = dependency("default");
const dep3 = dependency("named");
const obj = main(dep1, dep2, dep3);
console.log(JSON.stringify(obj)); // {"dep1":{"name":"new"},"dep2":{"name":"default"},"dep3":{"name":"named"}}
````

There are 3 types of dependency identifiers in `TeqFw/DI:
* `dependency`: new instance of the class or new result of the function execution;
* `dependency$`: singleton object being created by the class or function;
* `dependency$name`: named singleton object being created by the class or function;


Let our DI-container can handle all these 3 cases:
```ecmascript 6
const container = new TeqFw_Di_Container();
// TODO: add setting of loaded sources for `dependency` function 
container.set("dependency$", dependency("default"));
container.set("dependency$named", dependency("named"));

const dep1 = container.get("dependency"); // create new instance
const dep2 = container.get("dependency$"); // get singleton
const dep3 = container.get("dependency$named"); // get singleton with name

const obj = main(dep1, dep2, dep3);
````

We can re-write `main` function using dependencies ids in `spec`-object:
```ecmascript 6
function main(spec) {
    const dep1 = spec.dependency;
    const dep2 = spec.dependency$;
    const dep3 = spec.dependency$named;
}

function main({dependency, dependency$, dependency$named}) {
    ...
}
```


## Plugin