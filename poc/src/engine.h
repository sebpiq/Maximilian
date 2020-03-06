#ifndef ENGINE_H
#define ENGINE_H
#include "types.h"

void graph_initialize(int node_count);
void graph_compile(NodeKey root);
void node_declare_builder(int key, NodeBuilder node_builder);
NodeKey node_create(int node_type);
void node_ports_connect(NodeKey source_key, PortKey output, NodeKey sink_key, PortKey input);
void* node_read_output(NodeKey node_key, PortKey port_key);
void dsp_loop(NodeKey root);

#endif /* ENGINE_H */