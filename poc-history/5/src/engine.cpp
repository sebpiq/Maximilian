#include <stdio.h>
#include <vector>
#include "types.h"
#include "engine.h"
#include "deps/graph.cpp"

Node NODES[100];
int NODE_ID_COUNTER = -1;
NodeBuilders NODE_BUILDERS;
graph* DSP_GRAPH;
std::vector<Operation*> COMPILED_OPERATIONS;

NodeId _get_free_node_id() {
  NODE_ID_COUNTER++;
  return NODE_ID_COUNTER;
}

int _get_node_count() {
  return NODE_ID_COUNTER + 1;
}

NodeId _store_node(Node* node_pointer) {
  NodeId node_id = _get_free_node_id();
  NODES[node_id] = *node_pointer;
  return node_id;
}

Node* _get_node_pointer(NodeId node_id) {
  return &NODES[node_id];
}

void node_declare_builder(NodeType node_type, NodeBuilder node_builder) {
  NODE_BUILDERS.insert(NodeBuilders::value_type(node_type, node_builder));
}

void graph_initialize(int node_count) {
  DSP_GRAPH = new graph(node_count);
}

void graph_compile(NodeId root, int block_size) {
  int node_count = _get_node_count();
  int compiled_operations_length = block_size * node_count;

  NodeId* flattened_graph_ids = new NodeId[node_count];

  DSP_GRAPH->bfs(root, flattened_graph_ids);

  Node* node_pointer;
  Operation* operation;  
  for (int i = 0; i < compiled_operations_length; i++) {
    // printf("COMPILE LOOP %i -> %i : %i \n", i, i % node_count, flattened_graph_ids[i % node_count]);
    node_pointer = _get_node_pointer(flattened_graph_ids[i % node_count]);
    operation = new Operation();
    COMPILED_OPERATIONS.push_back(operation);
    operation->node_pointer = node_pointer;
    operation->frame_index = i / node_count;
  }
}

OperationPointerIterator operations_get_iterator_begin() {
  return COMPILED_OPERATIONS.begin();
}

OperationPointerIterator operations_get_iterator_end() {
  return COMPILED_OPERATIONS.end();
}

NodeId node_create(int node_type) {
  // printf ("ADD NODE TYPE %i\n", node_type);
  NodeBuilder node_builder = NODE_BUILDERS.at(node_type);
  return _store_node(node_builder());
}

void node_ports_connect(NodeId source_id, PortId output_id, NodeId sink_id, PortId input_id) {
  // printf("CONNECT %i -> %i \n", source, sink);
  Node* source = _get_node_pointer(source_id);
  Node* sink = _get_node_pointer(sink_id);
  DSP_GRAPH->addEdge(source_id, sink_id);
  sink->input_pointers[input_id] = &(source->outputs[output_id]);
}

void* node_state_get_pointer(NodeId node_id) {
  Node node = *_get_node_pointer(node_id);
  return node.state;
}
