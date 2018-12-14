const _ = require('lodash');
const C = require('./Calculations.js');

var TeamRocket = function (width, height, TRsnake, snakes) {
  this.width = width;
  this.height = height;
  // this.TRsnake = TRsnake;
  this.unavailableSpaces = C.unavailableSpaces(snakes);
  // this.snakes = snakes; // This includes my snake
  this.matrix = this.buildMatrix();  
}

TeamRocket.prototype.test = function() {
};

TeamRocket.prototype.buildMatrix = function() {
  var matrix = [];
  
  // Create the grid matrix
  for (var h = 0; h <= this.height; h++) {
    for (var w = 0; w <= this.width; w++) {
      if (C.existsWithin(this.unavailableSpaces, {x: w, y: h})) {
        matrix.push({ x: w, y: h, taken: true });
      }
      else {
        matrix.push({ x: w, y: h, taken: false });
      }
    }
  }
  
  return matrix;
};

// {x: w, y: h} coordinant of the start position and food pellet.
TeamRocket.prototype.breadthFirstSearch = function(start, food) {
  var queue = [], immediateSpaces, node, next;
  // console.log("start", start);
  // console.log("food", food);
  
  queue.push(start);
  start.visited = true;

  while (queue.length) {
    // take the front node from the queue
    node = queue.shift();
    node.closed = true;

    // reached the food pellet
    if (_.isEqual({x: node.x, y: node.y}, food)) {
      return this.pullRoute(node);
    }

    //console.log("node: ", node);
    immediateSpaces = this.immediateSpaces(node);
    //console.log("immediateSpaces: ", immediateSpaces);
    for (var i = 0; i < immediateSpaces.length; ++i) {
      next = immediateSpaces[i];

      // skip this neighbor if it has been inspected before
      if (next.closed || next.visited) {
        continue;
      }
      
      queue.push(next);
      next.visited = true;
      next.parent = node;
    }
  }

  return []; // Path not possible
};

TeamRocket.prototype.immediateSpaces = function(node) {
  var x = node.x, y = node.y, spot,
      neighbors = [];
  
  // Up
  spot = this.isTraversable(x, y - 1)
  if (spot) {
    //console.log("UP");
    neighbors.push(spot);
  }
  // Down
  spot = this.isTraversable(x, y + 1);
  if (spot) {
    //console.log("DOWN");
    neighbors.push(spot);
  }
  // Left
  spot = this.isTraversable(x - 1, y);
  if (spot) {
    //console.log("LEFT");
    neighbors.push(spot);
  }
  // Right
  spot = this.isTraversable(x + 1, y);
  if (spot) {
    //console.log("RIGHT");
    neighbors.push(spot);
  }

  return neighbors;
};

TeamRocket.prototype.isTraversable = function(x, y) {
  
  // Is the spot in bounds?
  if ((x >= 0 && x <= this.width) && (y >= 0 && y <= this.height)) {    
    let spot = _.find(this.matrix, function(m) { return m.x == x && m.y == y});
    
    // Is the spot taken?
    if (!spot.taken) {
      return spot;
    }
  }
  
  return false;
};

TeamRocket.prototype.pullRoute = function(node) {
  var path = [{x: node.x, y: node.y}];
  while (node.parent) {
    node = node.parent;
    path.push({x: node.x, y: node.y});
  }
  return path.reverse();
};

module.exports = TeamRocket;