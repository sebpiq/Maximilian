#include <stdio.h>
#include "types.h"
#include "engine.h"
#include "deps/graph.cpp"


Node NODES[100];
int NODE_ID_COUNTER = -1;
NodeBuilders NODE_BUILDERS;
graph* DSP_GRAPH;
Node* FLATTENED_GRAPH[100];

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

void graph_compile(NodeId root) {
  NodeId* flattened_graph_ids = new NodeId[_get_node_count()];
  DSP_GRAPH->bfs(root, flattened_graph_ids);
  for (int i = 0; i < _get_node_count(); i++) {
    FLATTENED_GRAPH[i] = _get_node_pointer(flattened_graph_ids[i]);
    // printf("%i : %p %p\n", flattened_graph_ids[i], FLATTENED_GRAPH[i], &NODES[i]);
  }
}

NodeId node_create(int node_type) {
  // printf ("ADD NODE TYPE %i\n", node_type);
  NodeBuilder node_builder = NODE_BUILDERS.at(node_type);
  return _store_node(node_builder());
}

void node_ports_connect(NodeId source_id, PortId output_id, NodeId sink_id, PortId input_id) {
  // printf("CONNECT %i -> %i \n", source, sink);
  Node source = *_get_node_pointer(source_id);
  Node sink = *_get_node_pointer(sink_id);
  sink.inputs[input_id] = source.outputs[output_id];
  DSP_GRAPH->addEdge(source_id, sink_id);
}

void dsp_loop(NodeId root) {
  int node_count = _get_node_count();
  // printf("%p %p", &FLATTENED_GRAPH[0], &NODES[0]);
  // printf("LOOP START %i\n", node_count);
	for (int i = 0; i < node_count; i++) {
    // printf("LOOP %p\n", &FLATTENED_GRAPH[i]);
    Node node = *FLATTENED_GRAPH[i];
    node.processor(node.state, node.inputs, node.outputs);
  }
}

void* node_read_output(NodeId node_id, PortId port_id) {
  Node node = *_get_node_pointer(node_id);
  return node.outputs[port_id];
}