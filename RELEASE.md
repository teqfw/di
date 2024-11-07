# @teqfw/di releases

## 0.30.2

* Enhanced the README with updates from ChatGPT.
* Unified JSDoc annotations.

## 0.30.1

* Improve the README.

## 0.30.0

* New format of the depId for default parser (`Ns_Module.export$$(post)`).
* The rollup is added.

## 0.22.0

* Add Windows paths to the Resolver.

## 0.21.1

* Fix the dependency key signature in `TeqFw_Di_Container_A_Parser_Chunk_Def`.

## 0.21.0

* Restructured modules in the package.
* Documentation update.

## 0.20.1

* Changed regex for parameter extraction in the Spec Analyzer.
* Removed leading namespace separator in the Resolver.
* Added `teqfw.json` descriptor to add npm-package to DI container as a sources root in `teqfw/web`.

## 0.20.0

* Fully redesigned package with simplified composition of objects in the container. Spec Analyzer is used instead of a
  proxy object.

## 0.12.1

* Hotfix for Windows delimiters.

## 0.12.0

* Standardized comments style for improved code readability and maintenance.

## 0.11.0

* Restructure `/@teqfw/di/replace` node in `teqfw.json`.
* Remove `TeqFw_Di_Shared_Api_Enum_Area` enumeration.
* Fix example code (`npm run example`).

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
* array is used as a container for upline dependencies in the 'SpecProxy' (object was);
