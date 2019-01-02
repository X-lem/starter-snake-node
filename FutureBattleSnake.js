const _ = require('lodash');
const C = require('./Calculations.js');

module.exports = class FutureBattleSnake {
  constructor(width, height, unavailableSpaces, food) {
    this.width = width;
    this.height = height;
    this.food = food
    this.unavailableSpaces = unavailableSpaces;
    this.buildMatrix();
  }

  // Create the grid matrix
  buildMatrix() {
    const matrix = this.matrix = [];
    for (let y = 0; y <= this.height; ++y) {
      for (let x = 0; x <= this.width; ++x) {
        const obj = { x, y };
        obj.taken = this.existsWithin(this.unavailableSpaces, obj);
        matrix.push(obj);
      }
    }
  }

  breadthFirstSearch(start, food) {
    const queue = [start];
    const visited = new WeakSet;
    const closed = new WeakSet;
    let cursor = 0;
    while (queue.length > cursor) {
      const node = queue[cursor++];
      closed.add(node);
      if (node.x === food.x && node.y === food.y) {
        return this.pullRoute(node);
      }
      for (const next of this.immediateSpaces(node)) {
        if (visited.has(next) || closed.has(next)) continue;
        queue.push(next);
        visited.add(next);
        next.parent = node;
      }
    }
    
    return [];
  }

  immediateSpaces(node) {
    var x = node.x, y = node.y, spot, neighbors = [];
  
    // Up
    spot = this.isTraversable(x, y - 1)
    if (spot) neighbors.push(spot);
    // Down
    spot = this.isTraversable(x, y + 1);
    if (spot) neighbors.push(spot);
    // Left
    spot = this.isTraversable(x - 1, y);
    if (spot) neighbors.push(spot);
    // Right
    spot = this.isTraversable(x + 1, y);
    if (spot) neighbors.push(spot);

    return neighbors;
  }

  isTraversable(x, y) {
    // Is the spot in bounds?
    if ((x >= 0 && x <= this.width) && (y >= 0 && y <= this.height)) {
      let spot = _.find(this.matrix, function(m) { return m.x === x && m.y === y});
      // If the spot is not taken return spot.
      if (!spot.taken) {
        return spot;
      }
    }
    
    return false;
  }
  
  pullRoute(node) {
    var path = [{x: node.x, y: node.y}];
    while (node.parent) {
      node = node.parent;
      path.push({x: node.x, y: node.y});
    }
    path.pop(); // remove head
    return path.reverse();
  }
}

