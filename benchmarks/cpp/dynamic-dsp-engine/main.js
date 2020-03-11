const assert = require('assert')
const Engine = require('./build/MyDsp.js')
const engine = Engine()

const BLOCK_SIZE = 16
const CONSTANT = 40

const getBufferBlock = (nodeBuffer) => {
    const pointer = engine._wnode_state_get_pointer(nodeBuffer)
    const start = (pointer>>2)
    return engine.HEAPF32.subarray(start, start + BLOCK_SIZE)
}

const assertBufferOutput = (nodeBuffer, value) => {
    const block = getBufferBlock(nodeBuffer)
    assert.equal(block[0], value)
}

engine.then(() => {
    engine._initialize(10, BLOCK_SIZE)
        
    const node_1 = engine._wnode_create(0) // CONSTANT
    
    const node_A_2 = engine._wnode_create(1) // +10
    const node_A_3 = engine._wnode_create(1) // +10
    const node_A_4 = engine._wnode_create(2) // *3
    const node_buffer_A = engine._wnode_create(4) // buffer

    const node_B_2 = engine._wnode_create(2) // *3
    const node_buffer_B = engine._wnode_create(4) // buffer

    const node_triangle = engine._wnode_create(3) // triangle
    const node_buffer = engine._wnode_create(4) // buffer

    engine._wnode_ports_connect(node_1, 0, node_A_2, 0)
    engine._wnode_ports_connect(node_A_2, 0, node_A_3, 0)
    engine._wnode_ports_connect(node_A_3, 0, node_A_4, 0)
    engine._wnode_ports_connect(node_A_4, 0, node_buffer_A, 0)

    engine._wnode_ports_connect(node_1, 0, node_B_2, 0)
    engine._wnode_ports_connect(node_B_2, 0, node_buffer_B, 0)

    engine._wnode_ports_connect(node_1, 0, node_triangle, 0)
    engine._wnode_ports_connect(node_triangle, 0, node_buffer, 0)
    
    engine._wgraph_compile()
    engine._dsp_block(node_1)

    console.log(getBufferBlock(node_buffer)) 
    
    assertBufferOutput(node_buffer_A, (CONSTANT + 10 + 10) * 3)
    assertBufferOutput(node_buffer_B, CONSTANT * 3)

    console.log('TEST SUCCESS')
})