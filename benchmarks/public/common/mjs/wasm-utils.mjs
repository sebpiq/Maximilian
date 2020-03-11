export const getFloat32Array = (wasmModule, pointer, length) => {
    const start = (pointer>>2)
    return wasmModule.HEAPF32.subarray(start, start + length)
}