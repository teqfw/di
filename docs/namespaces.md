# Namespaces

Данный проект работает только с ES-модулями.

Отдельный файл в проекте соответствует отдельному ES-модулю.

Группы ES-модулей собираются в пакеты, которые управляются менеджером пакетов. Менеджер пакетов обеспечивает уникальность имени пакета среди всех остальных пакетов. Приложение состоит из отдельных пакетов, которые собираются в единое приложение менеджером пакетов. Каждый пакет состоит из какого-то количества ES-модулей, находящихся, как правило, в каком-то подкаталоге (допустим,  `src`):

```
* node_modules
    * @vendor
        * package1
            * src
                * module1.js
                * ...
                * moduleN.js
        * ...
        * packageN
            * src
                * module1.mjs
                * ...
                * moduleN.mjs
```

В файловой структуре исходный код любого ES-модуля адресуется путём к файлу относительно корня приложения:
* `./node_modules/@vendor/package1/src/module1.js`
* ...
* `./node_modules/@vendor/packageN/src/moduleN.mjs`

В рамках загрузчика модулей nodejs-приложения часть `./node_modules/` уходит:
```ecmascript 6
import SomeThing from '@vendor/package1/src/module1.js';
``` 

Если обращаться к модулям в рамках одного пакета, то отпадает и имя пакета, а адресация становится относительной точки вызова:
```ecmascript 6
import SomeThing from './module1.js';
``` 

Если развернуть web-сервер так, чтобы корень web-приложения указывал на папку `node_modules`, то с индексной страницы web-приложения можно будет загружать ES-модули, используя почти такие же адреса, как и в nodejs:
```ecmascript 6
import('./@vendor/package1/src/module1.js').then((mod) => {
    mod.fn();
});
```

Разница в том, что для web'а нужно использовать `./` в самом начале.

Таким образом, при импорте имеется три варианта адресации одного и того же ES-модуля:
* локальный (внутри пакета): `./module1.js`
* серверный (nodejs): `@vendor/package1/src/module1.js`
* браузерный (web): `./@vendor/package1/src/module1.js`

Если "натянуть сову на глобус" (провести аналогию с другими ЯП, в которых есть namespace'ы - такими, как java и PHP), то каждому ES-модулю в структуре приложения можно поставить в соответствие некоторую строку (логический адрес), которая бы могла однозначно адресовать положение ES-модуля в пространстве исходных файлов приложения, одинаковую, как для nodejs, так и для браузера.

Например, мы можем опустить символы `./`, которые требуются в браузере, а также расширение (как правило, внутри пакета используется одно и то же расширение для исходников):
```ecmascript 6
@vendor/package1/src/module1
``` 

Обычно в пакете исходники находятся в каком-то каталоге: `./src/`, `./lib/`, `./dist/`. Эту часть также можно опустить из адреса модуля - очень редко, когда все исходники в пакете размазывают по разным каталогам, а не помещают в один:
```ecmascript 6
@vendor/package1/module1
``` 

Чтобы подобная адресация заработала, нужно составить карту соответствия адресов пакетам и расширениям, в них используемым. Можно даже добавить какой-нибудь промежуточный каталог для web-карты, если на `node_modules` указывает не корневой каталог web-сервера (в примере - `./packages/`):
```ecmascript 6
const node = {
    '@vendor/package1': {path: '/.../node_modules/@vendor/package1/src', ext: 'js'},
    '@vendor/packageN': {path: '/.../node_modules/@vendor/packageN/src', ext: 'mjs'},
};
const browser = {
    '@vendor/package1': {path: 'https://.../packages/@vendor/package1/src', ext: 'js'},
    '@vendor/packageN': {path: 'https://.../packages/@vendor/packageN/src', ext: 'mjs'},
};
```

Можно создать загрузчик, который бы сопоставлял 'логические' адреса модулей типа `@vendor/package1/module1` их физическим адресам в зависимости от среды использования (node или браузер):
```ecmascript 6
@vendor/package1/module1 => /.../node_modules/@vendor/package1/src/module1.js       // node
@vendor/packageN/moduleN => https://.../packages/@vendor/packageN/src/moduleN.mjs   // browser
``` 

и использовать его для динамического импорта модулей:
```ecmascript 6
const loader = new Es6ModuleLoader();
loader.addNamespace('@vendor/package1', {path: '/.../node_modules/@vendor/package1/src', ext: 'js'});
// ...
loader.addNamespace('@vendor/packageN', {path: '/.../node_modules/@vendor/packageN/src', ext: 'js'});
const module1 = await loader.import('@vendor/package1/module1');
```

Вот таким элегантным образом можно перейти от физической адресации ES-модулей при импорте к их логической адресации и использовать один и тот же код для импорта соответствующего модуля, как локально (в пределах пакета), так и в nodejs-приложении, и в браузере.
