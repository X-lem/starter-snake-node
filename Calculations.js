const _ = require('lodash');

module.exports = {
  // Returns the food pellets in order of distance positionaly to head
  prioritizeFood(start, food) {
    food = _.sortBy(food, [function(f) {
      // Calculate the positive difference
      let X = (f.x > start.x ? f.x - start.x : start.x - f.x );
      let Y = (f.y > start.y ? f.y - start.y : start.y - f.y );
              
      // D^2 = X^2 + Y^2
      // Return the distance between the two points
      return Math.sqrt(Math.pow(X, 2) + Math.pow(Y, 2));
    }]);
    
    return food;
  },

  // Returns next movement in ideal path to obtain food.
  // Otherwise returns false
  huntForFood(TeamRocket, TRsnake, food) {
    var dir, bestFood, pathsToFood = [],
      foundFood = false, huntForFood = true, i = 0;

    bestFood = this.prioritizeFood(TRsnake.body[0], food);

    // Keep itorating to find ideal food.
    do {
      if (i > 0) TeamRocket.buildMatrix();

      // Check to make sure there food left to hunt for
      pathsToFood[i] = TeamRocket.breadthFirstSearch(TRsnake.body[0], bestFood[i]);

      // Is the food obtainable?
      if (pathsToFood[i].length === 0) {
        console.log("Can't reach food.");
        i++;
        continue;
      }

      dir = this.directionToImmediatePath(TRsnake.body[0], pathsToFood[i][0]);
      
      // Spot is not immediate to head
      if(!dir) {
        console.log("Path to food was wrong.");
        i++;
        continue;
      }
      console.log(dir);

      
      huntForFood = false; foundFood = true;
    } while(huntForFood && i < bestFood.length);

    if (foundFood) return dir

    return false;

  },

  // Returns false if obtaining a specific food places the snake in a corner
  futurePath(snakes, path) {

    var futureSnake = _.flatten(path).slice(0, s.length);


    console.log(futureSnake)

    return
  },

  // Returns true if it's completely safe to enter a space
  isSpotSafe(spot, myLength, dangerZones) {
    let Z = _.find(dangerZones, function(z) {
      return spot.x === z.x && spot.y === z.y
    });
    
    if (Z && Z.length >= myLength){
      return false;
    }

    return true;
  },

  // Returns the xy coordinates of immediate spots a snake can take
  // w = grid width; h = grid height
  immediatePath(head, unavailableSpaces, w, h) {
    var spots = new Array();

    // Immediate spots to go
    spots.push({ x: head.x + 1, y: head.y });
    spots.push({ x: head.x, y: head.y + 1 });
    spots.push({ x: head.x - 1, y: head.y });
    spots.push({ x: head.x, y: head.y - 1 });

    // Remove out of bounds
    _.remove(spots, function(s) {
      return s.x > w || s.x < 0 || s.y > h || s.y < 0;
    });

    // Remove unavailable spaces
    unavailableSpaces.forEach((space) => {
      _.remove(spots, function(s) {
          return _.isEqual(s, space);
      });
    });

    return spots;
  },

  // Returns the string representation of the
  // direction to get to the immediate path.
  // Returns false if immediate path isn't next to head
  // ____ use 2
  // Determins if two spots are immediately orthogonal
  // Returns false otherwise
  // Syntax { x: x, y: y }
  directionToImmediatePath(head, nextStep) {
    if (head.x == nextStep.x && head.y - 1 == nextStep.y)
      return "up"
    else if (head.x == nextStep.x && head.y + 1 == nextStep.y)
      return "down"
    else if (head.x - 1 == nextStep.x && head.y == nextStep.y)
      return "left"
    else if (head.x + 1 == nextStep.x&& head.y == nextStep.y)
      return "right"

    return false;
  },

  unavailableSpaces(snakes) {
    var unavailableSpaces = new Array();

    snakes.forEach((snake) => {
      snake.body.forEach((b) => {
        unavailableSpaces.push(b);
      })
    });

    return unavailableSpaces;
  },  

  lastResort(TeamRocket, head) {
    TeamRocket.buildMatrix();
    var x = head.x, y = head.y;

    // Up
    spot = TeamRocket.isTraversable(x, y - 1);
    if (spot) return this.directionToImmediatePath(head, spot);
    // Down
    spot = TeamRocket.isTraversable(x, y + 1);
    if (spot) return this.directionToImmediatePath(head, spot);
    // Left
    spot = TeamRocket.isTraversable(x - 1, y);
    if (spot) return this.directionToImmediatePath(head, spot);
    // Right
    spot = TeamRocket.isTraversable(x + 1, y);
    if (spot) return this.directionToImmediatePath(head, spot);

    // No available spot to go.    
    return false;
  },
  
  // I can't stop... For testing purposes, Obviously.
  eternalLoop() {
    console.log("#####Eternal Loop#####");
    while (true){};
  }
}