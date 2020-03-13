import { runFromWorker } from '/common/mjs/benchmarking-utils.mjs'
import { benchmark__SimpleTriangleDspGraph } from '/common/mjs/dsp-engine-cpp-maxi.mjs'
runFromWorker(benchmark__SimpleTriangleDspGraph)