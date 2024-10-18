/* -----------------------------------------------------------------------------
Copyright (c) 2023, Texas Instruments Incorporated
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

-  Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.

-  Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.

-  Neither the name of Texas Instruments Incorporated nor the names of
   its contributors may be used to endorse or promote products derived
   from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, combined, OR PROFITS;
OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
----------------------------------------------------------------------------- */
class Graph
{
    constructor() { this.adjacencyList = {}; this.labels = {}; this.colors = {}; this.shapes = {};}

    addVertex(vertex, color=undefined, shape=undefined, label=undefined)
    {
        if (vertex == undefined) return;
        if (!this.adjacencyList[vertex]) this.adjacencyList[vertex] = [];
        if (color) this.colors[vertex] = color;
        if (shape) this.shapes[vertex] = shape;
        if (label) this.labels[vertex] = label;
    }

    delVertex(vertex)
    {
        if (vertex == undefined) return;
        delete this.adjacencyList[vertex];

        for (let v of Object.keys(this.adjacencyList))
            this.adjacencyList[v] = this.adjacencyList[v].filter(x=>x!=vertex);
    }

    addEdge(v1, v2)
    {
        if (v1 == undefined || v2 == undefined) return;
        this.addVertex(v1);
        this.addVertex(v2);
        this.adjacencyList[v1].push(v2);
    }

    dfsTopSortHelper(v, n, visited, topNums)
    {
        visited[v] = true;
        const neighbors = this.adjacencyList[v];

        for (const neighbor of neighbors)
            if (!visited[neighbor])
                n = this.dfsTopSortHelper(neighbor, n, visited, topNums);

        topNums[v] = n;
        return n - 1;
    }

    dfsTopSort()
    {
        const vertices = Object.keys(this.adjacencyList);
        const visited  = {};
        const topNums  = {};
        let   n        = vertices.length - 1;

        for (const v of vertices)
            if (!visited[v])
                n = this.dfsTopSortHelper(v, n, visited, topNums);

        return topNums;
    }

    isCyclicUtil(v, visited, recStack)
    {
        if (recStack[v]) return v;
        if (visited[v])  return false;

        visited[v]  = true;
        recStack[v] = true;

        for (let child of this.adjacencyList[v]) {
            let res = this.isCyclicUtil(child, visited, recStack);
            if (res) return res;
        }

        delete recStack[v];
        return false;
    }

    isCyclic()
    {
        let recStack = {};
        let visited  = {};

        for (const v of Object.keys(this.adjacencyList)) {
            let res = this.isCyclicUtil(v, visited, recStack);
            if (res) return res;
        }
        return false;
    }

    print()
    {
        let graph = 'digraph d {';
        for (const [vertex, color] of Object.entries(this.colors))
            graph += `"${vertex}" [color=${color}, penwidth=2]\n`;

        for (const [vertex, shape] of Object.entries(this.shapes))
            graph += `"${vertex}" [shape=${shape}]\n`;

        for (const [vertex, label] of Object.entries(this.labels))
            graph += `"${vertex}" [label="${label}"]\n`;

        for (const [from, adjList] of Object.entries(this.adjacencyList))
            adjList.forEach(to => graph += `"${from}" -> "${to}"\n`);
        graph += '}';
        return graph;
    }
}

module.exports = Graph;