/**
 * Enumeration for application areas.
 *
 * @deprecated areas should be defined outside this plugin.
 */
const TeqFw_Di_Shared_Api_Enum_Area = {
    BACK: 'back', // nodejs compatible 'import' is allowed
    FRONT: 'front', // browser compatible 'import' is allowed
    SHARED: 'shared', // relative 'import' only is allowed
}
Object.freeze(TeqFw_Di_Shared_Api_Enum_Area);
export default TeqFw_Di_Shared_Api_Enum_Area;
