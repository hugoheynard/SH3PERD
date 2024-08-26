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

class GraphManager {
    constructor(input) {
        this.graph = new Graph()
        this.staff = input.staff;
        this.timeSlots = input.timeSlots;
        this.rulesList = [];
        this.numberOfPass = 0;


    };
    initMaxEdges() {
        for (const member of this.staff) {
            for (const period of this.timeSlots) {
                this.graph.addEdge(member.staffMember_id, period)
            }
        }

    }
    run() {
        this.initMaxEdges()


        this.numberOfPass++;
        console.log(this.numberOfPass)
    };
}
export {Graph, GraphManager};