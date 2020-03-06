#ifndef TYPES_H
#define TYPES_H
#include <map>

typedef int NodeKey;
typedef int PortKey;
typedef void** PortList;

typedef void(*NodeProcessor)(void*, PortList, PortList);

struct Node {
  NodeProcessor processor;
  void* state;
  PortList inputs;
  PortList outputs;
};

typedef Node*(*NodeBuilder)();

typedef std::map<int, NodeBuilder> NodeBuilders;

#endif /* TYPES_H */