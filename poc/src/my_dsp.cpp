#include <stdio.h>
#include "types.h"
#include "engine.h"
#include "maximilian.h"

extern "C" {
  void initialize(int node_count, int block_size);
  float* dsp_block(NodeKey root, NodeKey leaf);
  NodeKey wcreate_node(int node_type);
  void wconnect_ports(NodeKey source_key, PortKey output, NodeKey sink_key, PortKey input);
  void* wget_node_outputs(NodeKey node_key);
}

void triangle(maxiOsc* osc, float** inputs, float** outputs) {
  // printf("triangle\n");
  outputs[0][0] = osc->triangle(inputs[0][0]);
}

Node* setup_triangle() {
  Node* node_pointer = new Node();
  node_pointer->state = new maxiOsc();
  node_pointer->inputs = new void*[1];
  node_pointer->outputs = (PortList) new float*[1] {new float[1]};
  node_pointer->processor = (NodeProcessor) &triangle;
  return node_pointer;
}

void fixed_4(float* state, float** inputs, float** outputs) {
  // printf("fixed_value %p \n", outputs[0]);
  outputs[0][0] = 4;
}

Node* setup_fixed_4() {
  Node* node_pointer = new Node();
  node_pointer->outputs = (PortList) new float*[1] {new float[1]};
  node_pointer->processor = (NodeProcessor) &fixed_4;
  return node_pointer;
}

void plus_10(float* state, float** inputs, float** outputs) {
  // printf("%p %f plus_10\n", inputs[0], inputs[0][0]);
  outputs[0][0] = inputs[0][0] + 10;
}

Node* setup_plus_10() {
  Node* node_pointer = new Node();
  node_pointer->inputs = new void*[1];
  node_pointer->outputs = (PortList) new float*[1] {new float[1]};
  node_pointer->processor = (NodeProcessor) &plus_10;
  return node_pointer;
}

void times_3(float* state, float** inputs, float** outputs) {
  // printf("times_3\n");
  outputs[0][0] = inputs[0][0] * 3;
}

Node* setup_times_3() {
  Node* node_pointer = new Node();
  node_pointer->inputs = new void*[1];
  node_pointer->outputs = (PortList) new float*[1] {new float[1]};
  node_pointer->processor = (NodeProcessor) &times_3;
  return node_pointer;
}

int BLOCK_SIZE = 0;
float* BLOCK;
float* dsp_block(NodeKey root, NodeKey leaf) {
  float* leaf_output = (float*) get_node_output(leaf, 0);
  for (int i = 0; i < BLOCK_SIZE; i++) {
    dsp_loop(root);
    BLOCK[i] = *leaf_output;
  }
  return BLOCK;
};

void wconnect_ports(NodeKey source_key, PortKey output, NodeKey sink_key, PortKey input) {
  return connect_ports(source_key, output, sink_key, input);
};

NodeKey wcreate_node(int node_type) {
  return create_node(node_type);
};

void* wget_node_outputs(NodeKey node_key) {
  return get_node_output(node_key, 0);
}

void initialize(int node_count, int block_size) {
  printf("INITIALIZE %i nodes \n", node_count);
  initialize_graph(node_count);
  declare_node_builder(0, &setup_fixed_4);
  declare_node_builder(1, &setup_plus_10);
  declare_node_builder(2, &setup_times_3);
  declare_node_builder(3, &setup_triangle);
  BLOCK_SIZE = block_size;
  BLOCK = new float[BLOCK_SIZE];
}
