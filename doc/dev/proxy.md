# Проксирование зависимостей

В случае многоуровневых зависимостей нужно "обрубать" некоторые "ветви" при загрузке иерархии зависимостей, чтобы
уменьшить время загрузки кода (особенно на фронте).

## Use container as service locator

В самом простом случае можно передавать в зависимости сам DI-контейнер и использовать его в качестве локатора служб:

```js
constructor(spec)
{
    const container = spec['TeqFw_Di_Shared_Container$'];
    // ...
    router.addRoute({
        path: DEF.DOOR_PUB_ROUTE_DEV_LOGIN,
        component: () => container.get('Fl32_Bwl_Front_Door_Pub_Ui_Dev_Login_Route$')
    });
}
```

Этот подход можно применять прямо сейчас, но он считается "некошерным".

## Use proxy object in DI

В JS есть специальный
объект [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy), который можно
использовать для "обёртывания" изначальной зависимости и её создания (и загрузки зависимостей зависимости) при
необходимости.

```js
const handler = {
    get: async function (base, sKey) {
        if (base.target === null) {
            base.target = await container.get(base.depId);
        }
        return base.target[sKey];
    }
};
const obj = new Proxy({depId}, handler);
```

Проблема в том, что создание нового объекта контейнером - процесс асинхронный. Поэтому вызов всех методов объекта,
запроскированного таким образом, выглядит примерно так:

```js
(await obj.say)(opts);
```

Можно добавить логики в `handler` и через `apply` уйти от лишних скобок, но от асинхронности уйти не получится. Лучшим
решением кажется (асинхронное) создание в коде нужных объектов при помощи фабрик и затем уже нормальное их
использование (асинхронное и синхронное).

Например, в случае запроса зависимости `Vnd_Plugin_Mod$` возвращать синглтон соответствующего объекта, а в случае
запроса зависимости `Vnd_Plugin_Mod@` возвращать фабрику, которая бы создавала нужную зависимость:

```js
constructor(spec)
{
    /** @type {TeqFw_Di_Shared_Api_IProxy} */
    const factRouteLogin = spec['Fl32_Bwl_Front_Door_Pub_Ui_Dev_Login_Route@'];
    // ...
    /** @type {Fl32_Bwl_Front_Door_Pub_Ui_Dev_Login_Route} */
    const routeLogin = await factRouteLogin.create(opt);
}
```

## Proxy factory to create objects

В таком случае прокси объект и его использование выглядели бы так.

Создание прокси в контейнере (реализовано):
```js
const handler = {
    get: async function (base) {
        return await container.get(base.id);
    }
};

/** @type {TeqFw_Di_Shared_Api_IProxy} */
const factory = new Proxy({id: 'Test_Product$'}, handler);
```

Получение фабрики для создания проксируемого объекта (в конструкторе класса или фабричной функции):
```javascript
/** @type {TeqFw_Di_Shared_Api_IProxy} */
const factory = container.get('Test_Product@');
```

Получение нужного объекта через фабрику (в рабочем коде):
```javascript
/** @type {Test_Product} */
const obj = await factory.create;
obj.act();
```
