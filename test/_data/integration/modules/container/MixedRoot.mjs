export const __deps__ = {path: 'nodePath', npm: 'npmChild'};

/**
 * @param {Record<string, unknown>} deps
 */
export default function (deps) {
  return {
    hasNodeJoin: (typeof (/** @type {{join?: Function}} */ (deps.path)).join === 'function'),
    npmValue: (/** @type {{value?: unknown}} */ (deps.npm)).value,
  };
}
