import { runFromWorker } from '/common/mjs/benchmarking-utils.mjs'
import { benchmark__SimpleTriangleDspGraph } from '/common/mjs/dsp-engine-cpp.mjs'
runFromWorker(benchmark__SimpleTriangleDspGraph)