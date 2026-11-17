let calls = 0;

/** @returns {{call: number}} */
export default function Fx_TransientTarget() {
    return {call: ++calls};
}
