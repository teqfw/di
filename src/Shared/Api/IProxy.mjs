/**
 * Interface for proxy factory to create objects using 'Vnd_Plugin_Single@' & 'Vnd_Plugin_Obj@@' dependency ID.
 * @interface
 */
export default class TeqFw_Di_Shared_Api_IProxy {
    /**
     * Get target object asynchronously.
     * @return {Promise<*>}
     */
    get create() { }
}
