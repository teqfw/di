let defaultCalls = 0;
let factoryCalls = 0;

export default function () {
    defaultCalls += 1;
    return {kind: 'default', calls: defaultCalls};
}

export function Factory() {
    factoryCalls += 1;
    return {kind: 'factory', calls: factoryCalls};
}

