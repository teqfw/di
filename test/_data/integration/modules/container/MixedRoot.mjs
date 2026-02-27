export const __deps__ = {path: 'nodePath', npm: 'npmChild'};

export default function (deps) {
  return {
    hasNodeJoin: (typeof deps.path.join === 'function'),
    npmValue: deps.npm.value,
  };
}
