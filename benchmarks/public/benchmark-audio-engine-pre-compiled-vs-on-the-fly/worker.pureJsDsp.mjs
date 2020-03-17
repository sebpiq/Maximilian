import { runFromWorker } from '/common/mjs/runner-worker.mjs'
import { benchmark__SimpleTriangleDspGraph } from '/common/mjs/dsp-engine-pure-js.mjs'
runFromWorker(benchmark__SimpleTriangleDspGraph)