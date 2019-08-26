# Dependencies Identifiers

Let we have this simple function as dependency:
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

Let we have application level singletons:
```ecmascript 6
const singleton = dependency("default");
const singleton_named = dependency("named");
````

We want to create object `obj` using `main` where
* `dep1` is a new result of the `dependency` function execution;
* `dep2` is the default result of the `dependency` function execution (app singleton);
* `dep3` is the named result of the `dependency` function execution (named app singleton);
```ecmascript 6
const dep1 = dependency();
const dep2 = singleton;
const dep3 = singleton_named;
const obj = main(dep1, dep2, dep3);
console.log(JSON.stringify(obj)); // {"dep1":{"name":"new"},"dep2":{"name":"default"},"dep3":{"name":"named"}}
````

There are 3 types of dependency identifiers in `TeqFw/DI:
* `dependency`: new instance of the class or new result of the function execution;
* `dependency$`: singleton object related to the class or function;
* `dependency$name`: named singleton object related to the class or function;


Let our DI-container can handle all these 3 cases:
```ecmascript 6
const container = new TeqFw_Di_Container();
container.set("dependency$", dependency("default"));
container.set("dependency$named", dependency("named"));

const dep1 = container.get("dependency"); // create new instance
const dep2 = container.get("dependency$"); // get singleton
const dep3 = container.get("dependency$named"); // get singleton with name

const obj = main(dep1, dep2, dep3);
````