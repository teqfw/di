# @teqfw/di releases

## 0.11.0

* Restructure `/@teqfw/di/replace` node in `teqfw.json`.
* `TeqFw_Di_Shared_Api_Enum_Area` enumeration is removed;

## 0.10.0

* Improve error messaging.
* Use '.' instead of '#' in depIDs (Vnd_Plugin#export => Vnd_Plugin.export). Both variants are available for now.
* Experimental proxy for deps are added (Vnd_Plugin.export@@).

## 0.9.0

* `TeqFw_Di_Shared_Api_Enum_Area` enumeration is added;

## 0.8.0

* docs for plugin's teq-descriptor (see in `main` branch);
* use object notation instead of array notation in namespace replacement statements of
  teq-descriptor (`@teqfw/di.replace` node format is changed in `./teqfw.json`);
* array is used as a container for upline dependencies in [SpecProxy](./src/Shared/SpecProxy.mjs) (object was);
