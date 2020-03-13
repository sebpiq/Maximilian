import { runFromAudioWorklet } from '/common/mjs/benchmarking-utils.mjs'
import { benchmark__SimpleTriangleDspGraph } from '/common/mjs/dsp-engine-cpp.mjs'
runFromAudioWorklet(benchmark__SimpleTriangleDspGraph)