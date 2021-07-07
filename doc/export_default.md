# Export in `@teqfw/di`

[Export in EcmaScript.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export)

`@teqfw/di` container expects that all loaded modules have `default` export defined. Only these 3 export results are valid in `@teqfw/di`:
```ecmascript 6
// object
export default {}
```
```ecmascript 6
// function
export default function funcName() {}
```
```ecmascript 6
// class
export default class ClassName{}
```

These variants may be written as:
```ecmascript 6
// object
const ObjectName = {};
export default ObjectName;
```
```ecmascript 6
// function
function funcName() {}
export default funcName;
```
```ecmascript 6
// class
class ClassName {}
export default ClassName;
```
