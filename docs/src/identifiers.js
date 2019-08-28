// this is function to create dependencies
function dependency(name = 'new') {
    return {name};
}

// this is function with dependencies
function main(dep1, dep2, dep3) {
    return {dep1, dep2, dep3};
}

// application level singletons
const singleton = dependency("default");
const singleton_named = dependency("named");

// create deps then create main function and inject deps manually
const dep1 = dependency();
const dep2 = singleton;
const dep3 = singleton_named;
const obj = main(dep1, dep2, dep3);
console.log(JSON.stringify(obj));
