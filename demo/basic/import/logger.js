export default async function Factory() {
    return {
        error: (msg) => console.error(msg),
        info: (msg) => console.info(msg),
    };
};