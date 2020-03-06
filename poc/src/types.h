#ifndef TYPES_H
#define TYPES_H
#include <map>

typedef int NodeType;
typedef int NodeId;
typedef int PortId;
typedef void** PortList;

typedef void(*NodeProcessor)(void*, PortList, PortList);

struct Node {
  NodeProcessor processor;
  void* state;
  PortList inputs;
  PortList outputs;
};

typedef Node*(*NodeBuilder)();

typedef std::map<NodeType, NodeBuilder> NodeBuilders;

#endif /* TYPES_H */