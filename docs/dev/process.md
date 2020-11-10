# Описание процесса создания зависимостей


## `Container.getObject` function

Внутри контейнера определена асинхронная функция `getObject`, которая отвечает за извлечение объектов из контейнера (а также за загрузку контейнером модулей и создание объектов). В качестве входных аргументов функция принимает ID извлекаемого/конструируемого объекта (или загружаемого модуля), а также список модулей для восходящей зависимости (цепочку объектов, создание которых привело к созданию текущего объекта). Для первого объекта цепочка является пустой. Контейнер предоставляет публичный метод для доступа к функции `getObject`:
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
    const sourceFile = _resolver.getSourceById(parsed.moduleName);
    const module = import(sourceFile);
    // save imported module in container storage
    _modules.set(parsed.moduleName, module);
    if (parsed.isModule) {
        result = module;
    } else {
        // use default export as constructor
        const construct = module.default;
        _constructors.set(parsed.moduleName, construct);
        const object = _useConstructor(construct);
        // save singleton object in container storage
        if (parsed.isSingleton) _singletons.set(parsed.moduleName, object);
        result = object;
    }
}
```


## `Container.getObject._useConstruct` function

Данная функция создаёт окружение для конструирования объекта вместе со всеми его зависимостями. В конструктор объекта передаётся специально создаваемый spec-прокси:
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

Класс `TeqFw_Di_SpecProxy` описывает объект, передаваемый в конструктор создаваемого объекта. Spec-прокси возвращает требуемые зависимости конструктору, если они найдены в хранилище контейнера, либо загружает ES-модули, соответствующие запрошенной зависимости, сохраняет их в хранилище, создаёт необходимый объект, а затем выбрасывает специальное исключение (`TeqFw_Di_SpecProxy.EXCEPTION_TO_STEALTH`), чтобы функция `_useConstruct` повторила попытку создания основного объекта и инициировала.

Найденные и вновь созданные зависимости, необходимые для конструирования запрошенного объекта, spec-прокси сохраняет во внутреннем реестре:
```ecmascript 6
/** @type {Object<string, Object>} */
const deps = {};
```

При создании объекта этого класса в конструктор передаётся:

* `mainId`: идентификатор конструируемого объекта;
* `containerSingletons`: хранилище Контейнера для размещения singleton-зависимостей, создаваемых в процессе конструирования текущего объекта;
* `createFuncs`: реестр функций по созданию объектов, находящихся выше в цепочке зависимостей, приведшей к созданию текущего объекта; ключом для регистрации функции в реестре является имя модуля, в котором находится код конструктора
соответствующего объекта; если имя модуля текущего объекта встречается в качестве ключа в реестре - фиксируется циклическая зависимость;
* `fnGetObject`: функция Контейнера для получения/создания зависимостей, требуемых для конструируемого объекта;
* `fnMainObjectReject`


### Создание зависимости

* 
