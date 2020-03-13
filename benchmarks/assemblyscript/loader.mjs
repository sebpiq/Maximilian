// REF : https://docs.assemblyscript.org/basics/loader
import loader from "@assemblyscript/loader"

globalThis.loadAsc = (wasmBinary) => {
    return loader.instantiateSync(wasmBinary)
}