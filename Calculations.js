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
    console.log("Hunt For Food");
    var dir, bestFood, pathsToFood = [],
      foundFood = false, huntForFood = true, i = 0;

    bestFood = this.prioritizeFood(TeamRocket.head, food);

    // Keep itorating to find ideal food.
    do {
      if (i > 0) TeamRocket.buildMatrix();

      pathsToFood[i] = TeamRocket.breadthFirstSearch(TeamRocket.head, bestFood[i]);

      // Is the food obtainable?
      if (pathsToFood[i].length === 0) {
        console.log("Can't reach food:", bestFood[i]);
        i++;
        continue;
      }

      // Will I die via collistion?
      // TODO: Test find alternate path
      if (!this.isSpotSafe(pathsToFood[i][0], TeamRocket.snake.length, TeamRocket.dangerZones)) {
        console.log("Spot isn't safe!", pathsToFood[i][0]);

        // If food spot is the danger spot, skip
        if (_.isEqual(pathsToFood[i][0], bestFood[i])) {
          console.log("The danger spot equals food.");
          i++;
          continue;
        }

        // See if there is an alternate route to food
        var immediateDanger = [];

        TeamRocket.dangerZones.forEach((D) => {
          var S = this.directionToImmediatePath(TeamRocket.head, D);
          if (S) immediateDanger.push(D);
        });

        pathsToFood[i] = this.alternateRoute(TeamRocket, immediateDanger, bestFood[i]);
        if (!pathsToFood[i]) {
          console.log("No alt food path found");
          i++;
          continue;
        }
      }

      // Will I be stuck in a corner?
      if (this.isFoodTrap2(TeamRocket, pathsToFood[i])) {
        if (i + 1 < bestFood.length) {
        // Can I get another food?
        if (this.isFoodTrap(TeamRocket, pathsToFood[i], bestFood, i)) {
          // Can I follow my tail
            console.log("It's a trap!");
            i++;
            continue;
          }
        }
      }

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

  // Finds shortest path to tail.
  // If no path is found find to tail - 1
  // And so on

  // ToDo: If two segments are in the tail can't immediatly follow tail.
  huntForTail(TeamRocket, turn) {
    console.log("Hunt For Tail");
    var length = TeamRocket.snake.length,
        invisibleWall, tail, path, dir;

    // Index starts at 1 because to ensure out of bounds doesn't happen on looking for tail.
    for (var i = 1; i < length - 1; i++) {
      TeamRocket.buildMatrix();

      tail = TeamRocket.snake[length - i];

      // Allow snake part to be reached
      var spot = _.find(TeamRocket.matrix, function(m) { return m.x === tail.x && m.y === tail.y });
      spot.taken = false;

      // Create an invisble wall between the two nodes
      // Snake can't turn back on itself turn 1
      // or immediatly try and eat itself.
      if (turn === 1 || i > 1)
        invisibleWall = [TeamRocket.head, tail];

      path = TeamRocket.breadthFirstSearch(TeamRocket.head, tail, invisibleWall);

      if (path.length > 0) {
        if (!this.isSpotSafe(path[0], TeamRocket.snake.length, TeamRocket.dangerZones)) {
          console.log("Spot isn't safe!", path[0]);

          var immediateDanger = [];

          TeamRocket.dangerZones.forEach((D) => {
            var S = this.directionToImmediatePath(TeamRocket.head, D);
            if (S) immediateDanger.push(D);
          });

          path = this.alternateRoute(TeamRocket, immediateDanger, tail, invisibleWall);
          if (!path) {
            console.log("No alt tail path found");
            continue;
          }
        }

        // Snake will trap itself
        if (path.length < i) {
          console.log("Sanke will trap itself");
          return false;
        }


        dir = this.directionToImmediatePath(TeamRocket.head, path[0]);
        if (dir) {
          console.log("HuntForTail - dir:", dir);
          return dir;
        }
      }

      spot.taken = true;
    }

    return false;
  },

  // Checks for an alternate route
  // Returns false otherwise
  // Note: dangerSpots does not have to be the same as TeamRocket.dangerZones
  alternateRoute(TeamRocket, dangerSpots, destination, invisibleWall = null) {
    console.log("Looking for alternate route");
    var addedDangers = [];
    TeamRocket.buildMatrix();

    // Add danger spots to unavailableSpaces
    dangerSpots.forEach((spot) => {
      if (spot.length >= TeamRocket.snake.length) {
        var obj = { x: spot.x, y: spot.y }
        addedDangers.push(obj);
        TeamRocket.unavailableSpaces.push(obj);
      }
    });
    TeamRocket.buildMatrix();


    // Find alternative route
    var altRoute = TeamRocket.breadthFirstSearch(TeamRocket.head, destination, invisibleWall);

    // Remove danger spots to unavailableSpaces
    addedDangers.forEach((spot) => {
      _.pull(TeamRocket.unavailableSpaces, spot);
    });

    if (altRoute.length === 0) {
      console.log("No alt route");
      return false;
    }
    return altRoute;
  },

  // Returns true if obtaining a specific food places the snake in a corner
  // To do: This doesn't account for enemy movement.
  isFoodTrap(TeamRocket, foodPath, bestFood, i) {
    console.log("Is food trap?");

    var pathToFood = foodPath.slice(0);

    // Remove food at future head. Reprioritize food.
    // Create snake in future position
    var futureSnake = pathToFood.reverse().concat(TeamRocket.snake).slice(0, TeamRocket.snake.length + 1);
    futureSnake = new FutureBattleSnake(TeamRocket, futureSnake);

    // Find the best food based on future snake
    var futureBestFood = bestFood.slice(0);
    futureBestFood.splice(i, 1);
    futureBestFood = this.prioritizeFood(futureSnake.head, futureBestFood);
    

    // Find path to next food.
    pathToFood = futureSnake.breadthFirstSearch(futureSnake.head, futureBestFood[0]);

    if (pathToFood.length === 0) {
      return true;
    }

    return false;
  },

  // Can I get to my tail?
  isFoodTrap2(TeamRocket, foodPath) {
    console.log("Can I get to my tail?");

    var pathToFood = foodPath.slice(0);

    // Remove food at future head. Reprioritize food.
    // Create snake in future position
    var futureSnake = pathToFood.reverse().concat(TeamRocket.snake).slice(0, TeamRocket.snake.length + 1);
    futureSnake = new FutureBattleSnake(TeamRocket, futureSnake);

    // Find path to next food.
    pathToFood = futureSnake.breadthFirstSearch(futureSnake.head, futureSnake.snake[futureSnake.snake.length - 1]);
    
    if (pathToFood.length === 0) {
      return true;
    }

    return false;    
  },

  // Returns true if it's completely safe to enter a space
  isSpotSafe(spot, myLength, dangerZones) {
    console.log("Is spot safe?");
    let Z = _.find(dangerZones, function(z) {
      return spot.x === z.x && spot.y === z.y
    });

    if (Z && Z.length >= myLength) {
      return false;
    }

    return true;
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

    followEnemy(TeamRocket) {
    console.log("Follow Enemy");
    TeamRocket.buildMatrix();
    let dir, head = TeamRocket.head

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

  // ToDo: See if there's a spot that is absolutely free.
  lastResort(TeamRocket) {
    console.log("Last Resport");
    TeamRocket.buildMatrix();
    let spot, head = TeamRocket.head,
        x = TeamRocket.head.x, y = TeamRocket.head.y;

    console.log("Yolo");
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