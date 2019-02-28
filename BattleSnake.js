const _ = require('lodash');
const C = require('./Calculations.js');

module.exports = class BattleSnake {
  constructor(width, height, myId, snakes) {
    this.id = myId;
    this.width = width;
    this.height = height;
    this.unavailableSpaces = this.getUnavailableSpaces(snakes);

    // Must initialize in this order
    this.seperateSnakes(snakes, myId);
    this.buildMatrix();
    this.findDangerZones();
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

  // Seperates my snake from the others
  seperateSnakes(snakes, id) {
    const mySnake = _.remove(snakes, function(s) {
      return s.id === id;
    });

    this.snake = mySnake[0].body;
    this.head = mySnake[0].body[0];
    this.health = mySnake[0].health;
    this.enemies = snakes
  }

  findDangerZones() {
    const dangerZones = this.dangerZones = [];

    this.enemies.forEach((s) => {
      let head = s.body[0], spot;
      let x = head.x, y = head.y;

      // Get the 4 spaces around the head that are open
      // Don't add the neck

      // Up
      spot = this.isTraversable(x, y - 1);
      if (spot && !this.existsWithin(s.body, spot)) dangerZones.push({ x: spot.x, y: spot.y, length: s.body.length });
      // Down
      spot = this.isTraversable(x, y + 1);
      if (spot && !this.existsWithin(s.body, spot)) dangerZones.push({ x: spot.x, y: spot.y, length: s.body.length });
      // Left
      spot = this.isTraversable(x - 1, y);
      if (spot && !this.existsWithin(s.body, spot)) dangerZones.push({ x: spot.x, y: spot.y, length: s.body.length });
      // Right
      spot = this.isTraversable(x + 1, y);
      if (spot && !this.existsWithin(s.body, spot)) dangerZones.push({ x: spot.x, y: spot.y, length: s.body.length });
      
    });
  }

  // invisibleWall is two side by side nodes that can't be traversed.
  // This keeps the snake from going backwards into itself.
  breadthFirstSearch(start, food, invisibleWall = null) {
    const queue = [start];
    const visited = new WeakSet;
    const closed = new WeakSet;
    let cursor = 0;
    while (queue.length > cursor) {
      // console.log("Queue", queue);
      const node = queue[cursor++];
      closed.add(node);
      if (node.x === food.x && node.y === food.y) {
        // console.log("Destination found!");
        return this.pullRoute(node);
      }
      for (const next of this.immediateSpaces(node)) {
        if (visited.has(next) || closed.has(next)) continue;
        if (invisibleWall != null && this.isInvisibleWall(node, next, invisibleWall)) continue;

        queue.push(next);
        visited.add(next);
        next.parent = node;
      }
    }
    
    return [];
  }

  isInvisibleWall(node, next, invisibleWall) {
    let L = _.find(invisibleWall, function(w) {
      return w.x === node.x && w.y === node.y
    });

    let R = _.find(invisibleWall, function(w) {
      return w.x === next.x && w.y === next.y
    });

    if (L && R) return true;

    return false;
  }
  
  longestPath(start) {
    console.log("Longest Path.")
    const queue = [_.cloneDeep(start)];
    const visited = new WeakSet;
    const closed = new WeakSet;
    let cursor = 0;
        
    while (queue.length > cursor) {
      console.log("Queue: ", queue);
      const node = queue[cursor++];
      closed.add(node);
      console.log(node);
      for (const next of this.immediateSpaces(node)) {
        if (visited.has(next) || closed.has(next)) continue;
        queue.push(next);
        visited.add(next);
        next.parent = node;
      }
    }
    
    return this.pullRoute(node);
  }

  // ToDo: Don't push tail
  getUnavailableSpaces(snakes) {
    const spaces = [];
    for (const { body } of snakes)
    for (const b of body) {
      spaces.push(b);
    }
    return spaces;
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

  // Looks at all the variables within object
  // If a match exists in array return true
  // Otherwise return false
  existsWithin(array, object) {
    for (var i = 0; i < array.length; i++) {
      if(_.isEqual(array[i], object)){
        return true;
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