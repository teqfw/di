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
      "Base_Interface": "Plugin_Impl",
      "Other_Interface": {
        "back": "Other_Back_Impl",
        "front": "Other_Front_Impl"
      }
    }
  }
}
```

## `autoload`

```json
{
  "autoload": {
    "ns": "Vnd_Prj",
    "path": "./src"
  }
}
```

Sources loader configuration of the DI container:

* `ns`: root namespace;
* `path`: relative path to the root folder of the namespace sources of a teq-plugin;

## `replace`

Es6-modules replacement configuration. One es6-module can be replaced with another one on the sources' loader level.

There are 2 forms of the replacement:

* simple
* with areas

This is structures definition only, `@teqfw/di` does not parse `teqfw.json` descriptors. `@teqfw/core` does it.

### Simple

```json
{
  "replace": {
    "Base_Interface": "Plugin_Impl"
  }
}
```

Replace es6-module `Base_Interface` with `Plugin_Impl` on injection.

### With areas

```json
{
  "replace": {
    "Other_Interface": {
      "back": "Other_Back_Impl"
    }
  }
}
```

Replace es6-module `Other_Interface` with `Other_Back_Impl` on injection when DI-container is used in `back` area.
