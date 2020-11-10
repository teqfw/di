# Описание процесса создания зависимостей


## `Container.getObject` function

Внутри контейнера определена асинхронная функция `getObject`, которая отвечает за извлечение объектов из контейнера (а также за загрузку контейнером ES-модулей и создание объектов). В качестве входных аргументов функция принимает ID извлекаемого/конструируемого объекта (или загружаемого модуля), а также список модулей для восходящей зависимости (цепочку объектов, создание которых привело к созданию текущего объекта). Для первого объекта цепочка является пустой. Контейнер предоставляет публичный метод для доступа к функции `getObject`:
```ecmascript 6
this.get = async function (depId) {
    return await getObject(depId, {});
};
``` 

Функция `getObject` сначала пытается найти запрошенный объект во внутренних хранилищах (если соответствующий объект был загружен в контейнер вручную через `container.set`):
```ecmascript 6
let result;
/** @type {TeqFw_Di_Api_ParsedId} */
const parsed = $parser.parse(mainId);
result = await getFromStorages(parsed);
```

а затем пытается загрузить исходник соответствующего ES-модуля и создать запрошенный объект из него:
```ecmascript 6
if (result === undefined) {
    // Sources for requested dependency are not imported before.
    // Get path to sources by module name then load ES module.
    const sourceFile = _resolver.getSourceById(parsed.moduleName);
    const module = await import(sourceFile);
    // save imported module in container storage
    _modules.set(parsed.mapKey, module);
    if (parsed.isModule) {
        result = module;
    } else {
        // use default export of loaded module as constructor
        const construct = module.default;
        _constructors.set(parsed.mapKey, construct);
        const object = await _useConstructor(construct);
        // save singleton object in container storage
        if (parsed.isSingleton) _singletons.set(parsed.mapKey, object);
        result = object;
    }
}
```


## Основы разрешения зависимостей в конструкторе 

В конструктор объекта передаётся специально создаваемый SpecProxy-объект:
```ecmascript 6
const spec = new SpecProxy(/*...*/);
const obj = construct(spec);
```

который отслеживает обращения функции-конструктора за зависимостями:
```ecmascript 6
function construct(spec) {
    const single = spec.namedSingleton;
    const mod = spec.Vendor_Module;
    const newObj = spec.Vendor_Module_Class$;
    const cfg = spec.Vendor_Module_Config$$;
}
```

## Spec Proxy

Класс `TeqFw_Di_SpecProxy` описывает объект, передаваемый в конструктор создаваемого объекта. SpecProxy возвращает требуемые зависимости конструктору, если они найдены в хранилище контейнера, либо загружает ES-модули, соответствующие запрошенной зависимости, сохраняет их в хранилище, создаёт необходимый объект, а затем выбрасывает специальное исключение (`TeqFw_Di_SpecProxy.EXCEPTION_TO_STEALTH`), чтобы функция `_useConstruct` повторила попытку создания основного объекта и инициировала.

Найденные и вновь созданные зависимости, необходимые для конструирования запрошенного объекта, SpecProxy сохраняет во внутреннем реестре:
```ecmascript 6
/** @type {Object<string, Object>} */
const deps = {};
```

При создании объекта этого класса в конструктор передаётся:

* `mainId`: идентификатор запрашиваемого объекта;
* `uplineDeps`: список восходящих зависимостей для предотвращения циклов; ключом зависимости является имя ES-модуля, содержащего исходники;
* `containerSingletons`: хранилище Контейнера для поиска уже созданных singleton-зависимостей;
* `fnCreate`: функция для создания запрашиваемого объекта; функция определяется вне SpecProxy и передаётся в конструктор при создании объекта SpecProxy; функция используется для инициирования повторного конструирования запрашиваемого объекта;
* `fnGetObject`: функция Контейнера для получения/создания зависимостей, требуемых для конструируемого объекта;



## `Container.getObject._useConstruct` function

Данная функция создаёт окружение для конструирования объекта вместе со всеми его зависимостями. Основой функции является обещание, которое разрешается при удачном создании запрашиваемого объекта:
```ecmascript 6
function _useConstructor(fnConstruct) {
    return new Promise(function (resolve) {});
}
```

Если параметр `fnConstruct` является объектом, то создаётся клон этого объекта и возвращается в качестве запрашиваемого объекта:
```ecmascript 6
const constructorType = typeof fnConstruct;
if (constructorType === 'object') {
    const objClone = Object.assign({}, fnConstruct);
    resolve(objClone);
}
```

Если параметр `fnConstruct` является функцией-конструктором, то создаётся ещё одна функция - для запуска процесса создания запрашиваемого объекта, если какая-либо зависимость отсутствует и должна быть создана:
```ecmascript 6
 const fnCreate = function () {/*...*/}
```

Также создаётся SpecProxy-объект, который передаётся в конструктор запрашиваемого объекта для разрешения зависимостей. В конструктор SpecProxy-объекта передаётся функция `fnCreate`:
```ecmascript 6
const spec = new SpecProxy(mainId, uplineDeps, _singletons, fnCreate, getObject);
```


## `Container.getObject._useConstruct.Promise.fnCreate` function

Именно эту функцию вызывает SpecProxy-объект, поставляющий зависимости для запрашиваемого объекта, после обнаружения отсутствующей зависимости, асинхронной загрузки соответствующего ES-модуля через динамический import и создание объекта для заполнения отсутствующей зависимости:
```ecmascript 6
const fnCreate = function () {
    try {
        // https://stackoverflow.com/a/29094018/4073821
        const proto = Object.getOwnPropertyDescriptor(constructor, 'prototype');
        const isClass = proto && !proto.writable;
        const instNew = (isClass) ? new fnConstruct(spec) : fnConstruct(spec);
        // code line below will be inaccessible until all deps will be created in `spec`
        // SpecProxy.EXCEPTION_TO_STEALTH will be thrown for every missed dep in `spec` 
        resolve(instNew);
    } catch (e) {
        // stealth constructor exceptions to prevent execution interrupt on missed dependency
        // see SpecProxy.get() accessor
        if (e !== SpecProxy.EXCEPTION_TO_STEALTH) throw e;
    }
};
```


## Синхронный конструктор и асинхронный import

Т.к. конструктор для создания объекта является [синхронным](https://stackoverflow.com/questions/43431550/async-await-class-constructor), а динамический импорт исходников - асинхронным, то при создании запрашиваемого объекта отрабатывают три части:
 * Функция `_useConstructor` создаёт обещание, которое выполняется только после создания запрашиваемого объекта;
 * Функция `fnCreate` позволяет запускать создание запрашиваемого объекта и отлавливать исключение, прерывающие синхронный процесс создания запрашиваемого объекта на асинхронный процесс загрузки исходников отсутствующей зависимости и её создание, завешивая таким образом завершение обещание из функции `_useConstructor`;
 * Акцессор `SpecProxy.get` позволяет анализировать запрашиваемые зависимости, получать их из Контейнера или создавать при помощи функции `getObject`, а также кэшировать используемые зависимости внутри самого SpecProxy-объекта; если нужно создание недостающей зависимости, то SpecProxy запускает асинхронный процесс загрузки исходников (import), а затем выбрасывает исключение, прерывающее функцию `fnCreate`; после завершения загрузки исходников создаётся недостающая зависимость, кэшируется внутри SpecProxy-объекта и вновь вызывается функция `fnCreate` для создания запрашиваемого объекта (но теперь в SpecProxy-объекте на одну недостающую зависимость меньше);
 
 Как только SpecProxy соберёт все зависимости, нужные для создания запрашиваемого объекта, объект будет создан в функции `fnCreate` и обещание, созданное функцией `_useConstructor` будет выполнено:
 ```ecmascript 6
const instNew = (isClass) ? new fnConstruct(spec) : fnConstruct(spec);
// code line below will be inaccessible until all deps will be created in `spec`
// SpecProxy.EXCEPTION_TO_STEALTH will be thrown for every missed dep in `spec`
resolve(instNew);
```
