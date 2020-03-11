// REF : https://gist.github.com/Roy19/5f9754cb899c9aeabee1e1ce9ce4b1a5
/*Program to demonstrate Breadth First Search
on a graph.
*/

#include <iostream>
#include <queue>
#include <list>
using namespace std;

class graph{
	int V;				// Total no. of vertices
	list<int> *adj;		// Pointer to the array of adjacency lists of the graph
public:
	graph(int V){
		this->V = V;
		adj = new list<int> [V];
	}
	~graph(){
		delete [] adj;
	}
	void addEdge(int u,int v);	// adds an edge between u and v
	void bfs(int s, int* traversal);			// do a breadth first search on the graph from s
};

void graph::addEdge(int u,int v){
	adj[u].push_back(v);
}

void graph::bfs(int s, int* traversal){
	int traversal_counter = 0;
	bool *visited = new bool[V];	// create an array to store which vertices are visited
	queue<int> q;		// queue for bfs
	list<int>::iterator it;	// Adjacency list iterator
	
	for(int i = 0;i < V;i++){
		visited[i] = false;
	}

    traversal[traversal_counter++] = s;
	q.push(s);	// push the starting node to be visited
	visited[s] = true;	// visit the starting node
	
	while(!q.empty()){
		int u = q.front();	// pop the next node to be visited
		q.pop();
		// cout << u << " ";	// print the node
		
		// while the poped node has elements to visit
		for(it = adj[u].begin();it != adj[u].end();it++){
			// and is not already visited
			if(visited[*it] == false){
				visited[*it] = true;	// visit it
				traversal[traversal_counter++] = *it;
				q.push(*it);	// enqueue it to the queue
			}
		}
	}
	
	delete [] visited;
}

// void handle_traversal(int parent, int child) {
//     printf("%i ---> %i\n", parent, child);
// }

// int main(){
// 	graph g(4);		// instantiate a graph of 4 vertices
	
// 	// Add the edges of the directed graph
// 	g.addEdge(0, 1);
//     g.addEdge(0, 2);	
//     g.addEdge(1, 2);
//     g.addEdge(2, 0);
//     g.addEdge(2, 3);
//     g.addEdge(3, 3);
	
// 	g.bfs(2, &handle_traversal);
	
// 	return 0;
// }