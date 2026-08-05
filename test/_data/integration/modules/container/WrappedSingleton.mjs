let calls = 0;

export default function () {
  return {base: true};
}

/**
 * @param {object} value
 */
export function wrap(value) {
  calls += 1;
  return {...value, wrapped: true};
}

export function wrapCalls() {
  return calls;
}
