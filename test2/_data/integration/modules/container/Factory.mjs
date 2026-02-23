export const __deps__ = {child: 'child'};

export default function (deps) {
  return {mode: 'factory', child: deps.child};
}
