#ifndef ENGINE_H
#define ENGINE_H
#include "types.h"

void graph_initialize(int node_count);
void graph_compile(NodeId root);
void node_declare_builder(int key, NodeBuilder node_builder);
NodeId node_create(int node_type);
void node_ports_connect(NodeId source_id, PortId output, NodeId sink_id, PortId input);
void* node_read_output(NodeId node_id, PortId port_id);
void dsp_loop(NodeId root);

#endif /* ENGINE_H */