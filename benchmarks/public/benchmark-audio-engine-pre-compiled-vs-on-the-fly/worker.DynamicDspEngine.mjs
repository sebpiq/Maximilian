import { runFromWorker } from '/common/mjs/runner-worker.mjs'
import { benchmark__SimpleTriangleDspGraph } from '/common/mjs/dsp-engine-cpp.mjs'
runFromWorker(benchmark__SimpleTriangleDspGraph)