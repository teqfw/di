# @teqfw/di releases

# 0.8.0

* [docs](./doc/teqfw.desc.md) for plugin's teq-descriptor;
* use object notation instead of array notation in namespace replacement statements of
  teq-descriptor (`@teqfw/di.replace` node format is changed in `./teqfw.json`);
* array is used as a container for upline dependencies in [SpecProxy](./src/Shared/SpecProxy.mjs) (object was);
