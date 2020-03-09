const assert = require('assert')
const Engine = require('./build/MyDsp.js')
const engine = Engine()

const BLOCK_SIZE = 16
const CONSTANT = 40

engine.then(() => {
    engine._initialize(10, BLOCK_SIZE)
        
    const node_1 = engine._wnode_create(0) // CONSTANT
    
    const node_A_2 = engine._wnode_create(1) // +10
    const node_A_3 = engine._wnode_create(1) // +10
    const node_A_4 = engine._wnode_create(2) // *3
    
    const node_B_2 = engine._wnode_create(2) // *3

    const node_triangle = engine._wnode_create(3) // triangle

    const node_buffer = engine._wnode_create(4) // buffer

    engine._wnode_ports_connect(node_1, 0, node_A_2, 0)
    engine._wnode_ports_connect(node_A_2, 0, node_A_3, 0)
    engine._wnode_ports_connect(node_A_3, 0, node_A_4, 0)

    engine._wnode_ports_connect(node_1, 0, node_B_2, 0)

    engine._wnode_ports_connect(node_1, 0, node_triangle, 0)
    engine._wnode_ports_connect(node_triangle, 0, node_buffer, 0)
    
    let outputsPointer, outputValue

    engine._wgraph_compile()
    engine._dsp_block(node_1)

    const output_block_pointer = engine._wnode_state_get_pointer(node_buffer)
    const start = (output_block_pointer>>2)
    const block = engine.HEAPF32.subarray(start, start + BLOCK_SIZE)
    console.log(block) 
    
    outputsPointer = engine._wnode_output_get_pointer(node_A_3)
    outputValue = engine.getValue(outputsPointer, 'float')
    assert.equal(outputValue, CONSTANT + 10 + 10)

    outputsPointer = engine._wnode_output_get_pointer(node_A_4)
    outputValue = engine.getValue(outputsPointer, 'float')
    assert.equal(outputValue, (CONSTANT + 10 + 10) * 3)

    outputsPointer = engine._wnode_output_get_pointer(node_B_2)
    outputValue = engine.getValue(outputsPointer, 'float')
    assert.equal(outputValue, CONSTANT * 3)
})