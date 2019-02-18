const _ = require('lodash');
const FutureBattleSnake = require('./FutureBattleSnake.js');

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
  huntForFood(TeamRocket, food) {
    var dir, bestFood, pathsToFood = [],
      foundFood = false, huntForFood = true, i = 0;

    bestFood = this.prioritizeFood(TeamRocket.head, food);

    // Keep itorating to find ideal food.
    do {
      if (i > 0) TeamRocket.buildMatrix();

      pathsToFood[i] = TeamRocket.breadthFirstSearch(TeamRocket.head, bestFood[i]);

      // Is the food obtainable?
      if (pathsToFood[i].length === 0) {
        console.log("Can't reach food.");
        i++;
        continue;
      }

      // Will I die via collistion? If so try taking another route
      // && _.find(TeamRocket.food, function(f) { return f.x === pathsToFood[i][0].x && f.y === pathsToFood[i][0].y })
      if (!this.isSpotSafe(pathsToFood[i][0], TeamRocket.snake.length, TeamRocket.dangerZones)) {
        console.log("Spot isn't safe!");
        i++;
        continue;
      }

      // console.log("Pre pathsToFood", pathsToFood[i]);
      // Will I be stuck in a corner?
      if (i + 1 < bestFood.length) {
        console.log("Enough food");
        if (this.isFoodTrap(TeamRocket, pathsToFood[i], bestFood, i)) {
          console.log("It's a trap!");
          i++;
          continue;
        }
        else {
          console.log("Safe");
        }
      }


      // console.log("Post pathsToFood", pathsToFood[i]);

      dir = this.directionToImmediatePath(TeamRocket.head, pathsToFood[i][0]);
      
      // Spot is not immediate to head
      if (!dir) {
        console.log("Path to food was wrong.");
        i++;
        continue;
      }
      
      huntForFood = false; foundFood = true;
    } while(huntForFood && i < bestFood.length);

    console.log("HuntForFood - dir:", dir);

    if (foundFood) return dir;

    return false;
  },

  // Checks for an alternate route to the food
  // Returns false otherwise
  // let altRoute = this.alternateRoute(TeamRocket,bestFood[i], pathsToFood[i][0]);
  alternateRoute(TeamRocket, food, dangerSpot) {
    console.log("Danger: ", dangerSpot);
    TeamRocket.unavailableSpaces.push(dangerSpot);
    TeamRocket.buildMatrix();
    console.log(TeamRocket.matrix);
    let altRoute = TeamRocket.breadthFirstSearch(TeamRocket.head, food);
    _.pull(TeamRocket.unavailableSpaces, dangerSpot);
    // Does route exist and is it safe?
    if (altRoute.length === 0 && this.isSpotSafe(TeamRocket.head, TeamRocket.snake.length, TeamRocket.dangerZones)){
      console.log("No alt route");
      return false;
    }
    return altRoute;
  },

  // Returns true if obtaining a specific food places the snake in a corner
  // To do: This doesn't account for enemy movement.
  isFoodTrap(TeamRocket, foodPath, bestFood, i) {
    // console.log("bestFood", bestFood);

    var pathToFood = foodPath.slice(0);

    
    // console.log("Path to food: ", pathToFood);

    // Remove food at future head. Reprioritize food.

    var futureSnake = pathToFood.reverse().concat(TeamRocket.snake).slice(0, TeamRocket.snake.length + 1);

    futureSnake = new FutureBattleSnake(TeamRocket, futureSnake);
    // console.log("futureSnake", futureSnake.snake);

    // Find the best food based on future snake
    var futureBestFood = bestFood.slice(0);
    futureBestFood.splice(i, 1);
    futureBestFood = this.prioritizeFood(futureSnake.head, futureBestFood);
    
    // console.log("Furture unavailableSpaces", futureSnake.unavailableSpaces);
    // console.log("Furture matrix", futureSnake.matrix);

    // console.log("futureBestFood", futureBestFood);

    // Find path to next food.
    pathToFood = futureSnake.breadthFirstSearch(futureSnake.head, futureBestFood[0]);
    // console.log("Path to future food: ", pathToFood);

    if (pathToFood.length === 0) { 
      return true;
    }

    return false;
  },

  // Returns true if it's completely safe to enter a space
  isSpotSafe(spot, myLength, dangerZones) {
    let Z = _.find(dangerZones, function(z) {
      return spot.x === z.x && spot.y === z.y
    });
    
    if (Z && Z.length >= myLength) {
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

  lastResort(TeamRocket) {
    console.log("lastResort");
    TeamRocket.buildMatrix();
    let spot, head = TeamRocket.head,
        x = TeamRocket.head.x, y = TeamRocket.head.y;

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

  follow(TeamRocket) {
    console.log("follow");
    TeamRocket.buildMatrix();
    let dir, head = TeamRocket.head

    // Check if I can follow myself first
    dir = this.directionToImmediatePath(head, TeamRocket.body[TeamRocket.body.length - 1]);    
    if (dir) {
      console.log('FOLLOWING TAIL: Self');
      console.log("head: ", head, " Tail: ", tail);
      return dir;
    }
    // Then check enemies
    for (var i = 0; i < TeamRocket.enemies.length; i++) {
      var enemy = TeamRocket.enemies[i];
      var tail = enemy.body[enemy.body.length - 1];

      dir = this.directionToImmediatePath(head, tail);
      if (dir) {
        console.log('FOLLOWING TAIL: Enemy');
        console.log("head: ", head, " Tail: ", tail);
        return dir;
       }
    }

    return false;
  },
  
  // I can't stop... For testing purposes, Obviously.
  eternalLoop() {
    console.log("#####Eternal Loop#####");
    while (true){};
  }
}