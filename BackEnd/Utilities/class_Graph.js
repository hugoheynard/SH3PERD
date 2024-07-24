class Graph {
    constructor() {
        this.adjacencyList = {};
    };

    addNode(node) {
        this.adjacencyList[node] = this.adjacencyList[node] || [];
    };

    addEdge(fromNode, toNode) {
        this.addNode(fromNode);
        this.addNode(toNode);
        this.adjacencyList[fromNode].push(toNode);
    };

    getEdges(node) {
        return this.adjacencyList[node];
    };

}

export {Graph};