const bodyParser = require('body-parser');
const express = require('express');
const logger = require('morgan');
const app = express();
const {
  fallbackHandler,
  notFoundHandler,
  genericErrorHandler,
  poweredByHandler
} = require('./handlers.js')
const path = require('path')
const _ = require('lodash');
const C = require('./Calculations.js');
const BattleSnake = require('./BattleSnake.js');
const FutureBattleSnake = require('./FutureBattleSnake.js');


// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set('port', (process.env.PORT || 9001));

app.enable('verbose errors');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(poweredByHandler);
app.use(express.static(path.join(__dirname, 'UI')));

app.get('/', function(req, res) {
  res.sendFile(__dirname + "/UI/home.html");
});


// --- SNAKE LOGIC GOES BELOW THIS LINE ---

app.post('/ping', (request, response) => {
  // Used for checking if this snake is still alive.
  return response.json({});
})

// Handle POST request to '/start'
app.post('/start', (request, response) => {
  // NOTE: Do something here to start the game

  console.log("#######################\n*****Start program*****");
  
  // Response data
  const data = {
    // name: 'Team Rocket',
    color: '#bb3322', // #741ECD - Nice purple
    // color: '#'+(Math.random()*0xFFFFFF<<0).toString(16),
    headType: 'evil',
    tailType: 'bolt'
  }

  return response.json(data)
})

//moveTest
app.post('/moveT', (request, response) => {
  const board = request.body.board;

  const snakes = board.snakes;
  const width = board.width - 1;
  const height = board.height - 1;
  const TRsnake = request.body.you;
  const food = board.food;

  console.log(`--Turn ${request.body.turn} ${TRsnake.name}--`);

  var TeamRocket, futureSnake, dir, pathToFood;


  TeamRocket = new BattleSnake(width, height, TRsnake.id, snakes);

  console.log("TeamRocket.snake", TeamRocket.snake);

  var danger = [ { x: food[0].x, y: food[0].y + 1, length: 10 } ];

  console.log(food[0], danger);

  var path = C.alternateRoute(TeamRocket, danger, food[0]);

  var dir = C.directionToImmediatePath(TeamRocket.head, path[0]);

  console.log("Final direction:", dir);
  // Response data
  const data = {
    move: dir
  }

  return response.json(data);
})

// moveMain
app.post('/move', (request, response) => {
  const board = request.body.board;

  const snakes = board.snakes;
  const width = board.width - 1;
  const height = board.height - 1;
  const TRsnake = request.body.you;
  const food = board.food;
  
  console.log(`--Turn ${request.body.turn} ${TRsnake.name}--`);
  var TeamRocket, dir;

  TeamRocket = new BattleSnake(width, height, TRsnake.id, snakes);

  // Find closest food
  if (food[0]) {
    dir = C.huntForFood(TeamRocket, food);

    // Can't obtain food, find longest path
    if (!dir) {
      console.log("No food reachable.");
    }
  }
  else { console.log("No food to eat.") }


  // Follow tail
  if (!dir) {
    dir = C.huntForTail(TeamRocket, request.body.turn);
  }

  // If all other algorithms fail, pick a direction
  if(!dir) {
    dir = C.followEnemy(TeamRocket);
    if (!dir) {
      dir = C.lastResort(TeamRocket);
      if (!dir) console.log("No available direction.");
    }
  }

  console.log("Final direction:", dir);
  // Response data
  const data = {
    move: dir
  }

  return response.json(data);
})

app.post('/end', (request, response) => {
  console.log("xxxx", request.body.you.name, "xxxx");
  console.log("Team Rocket is blasting off again...");
  // NOTE: Do something to end the game

  return response.json({})
})

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'))
})