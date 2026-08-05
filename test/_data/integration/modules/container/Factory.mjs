export const __deps__ = {child: 'child'};

/**
 * @param {Record<string, unknown>} deps
 */
export default function (deps) {
  return {mode: 'factory', child: deps.child};
}
