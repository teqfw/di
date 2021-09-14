# TeqFW descriptor's options

## @teqfw/di

`@teqfw/di` plugin can parse these options of `./teqfw.json` descriptors of teq-plugins:

```json
{
  "@teqfw/di": {
    "autoload": {
      "ns": "Vnd_Prj",
      "path": "./src"
    },
    "replace": {
      "Vnd_Prj_Front_ISomeInterface": {"ns": "Vnd_Prj_Front_SomeImplementation", "area": "front"}
    }
  }
}
```

## `autoload`

Sources loader configuration of the DI container:

* `ns`: root namespace;
* `path`: relative path to the root folder of the namespace sources of a teq-plugin;

## `replace`

Es6-modules replacement configuration. One es6-module can be replaced with another one on the sources' loader level.

* object key equals to logical identifier of the es6-module to be replaced;
* `ns`: logical identifier of the es6-module that replaces original module;
* `area`: area where this replacement is available (`back`, `front`, `shared`)
