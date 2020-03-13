import { runFromAudioWorklet } from '/common/mjs/runner-worker.mjs'
import { benchmark__SimpleTriangleDspGraph } from '/common/mjs/dsp-engine-cpp-maxi.mjs'
runFromAudioWorklet(benchmark__SimpleTriangleDspGraph)