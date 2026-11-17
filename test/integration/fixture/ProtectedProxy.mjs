export default function Fx_ProtectedProxy() {
    const target = {kind: 'protected-proxy'};
    return new Proxy(target, {
        defineProperty() {
            throw new Error('defineProperty is forbidden');
        },
        get(obj, prop, receiver) { return Reflect.get(obj, prop, receiver); }
    });
}
