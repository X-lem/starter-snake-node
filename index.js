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
// const TR = require('./TeamRocket.js');
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

// Handle POST request to '/start'
app.post('/start', (request, response) => {
  // NOTE: Do something here to start the game

  console.log("#######################\n*****Start program*****");
  
  // Response data
  const data = {
    name: 'Team Rocket',
    color: '#bb3322',   // #741ECD - Nice purple
    // color: '#'+(Math.random()*0xFFFFFF<<0).toString(16),
    head: 'fang',
    tail: 'regular'
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

  console.log(`--Move ${TRsnake.name}--`);

  var TeamRocket, futureSnake, dir, pathToFood, pathToFood2;


  TeamRocket = new BattleSnake(width, height, TRsnake.id, snakes);
  var bestFood = C.prioritizeFood(TeamRocket.head, food);

  // console.log("Best food", bestFood[0], "Second best food", bestFood[1]);

  pathToFood = TeamRocket.breadthFirstSearch(TeamRocket.head, bestFood[0]);
  futureSnake = pathToFood.reverse().concat(TeamRocket.snake).slice(0, TeamRocket.snake.length + 1);
  futureSnake = new FutureBattleSnake(TeamRocket, futureSnake);

  var newBestFood = bestFood.slice(0);
  newBestFood.splice(0, 1);

  
  console.log("Best food", bestFood)
  console.log("pre newBestFood", newBestFood)

  newBestFood = C.prioritizeFood(futureSnake.head, newBestFood);

  console.log("post newBestFood", newBestFood)

  C.eternalLoop();

  console.log("pathToFood", pathToFood);
  
  

  console.log("futureSnake.snake", futureSnake.snake);
  console.log("futureSnake.unavailable", futureSnake.unavailableSpaces);
  pathToFood2 = futureSnake.breadthFirstSearch(futureSnake.head, bestFood[1]);

  console.log("future pathtofood", pathToFood2);




  dir = C.directionToImmediatePath(TeamRocket.snake[0], pathsToFood[0]);

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
  
  console.log(`--Move ${TRsnake.name}--`);
  var TeamRocket, dir;


  TeamRocket = new BattleSnake(width, height, TRsnake.id, snakes);

  dir = C.huntForFood(TeamRocket, food);

  // Can't obtain food, find longest path
  if (!dir) {
    console.log("No food obtainable.");
  }

  // If all other algorithms fail, pick a direction
  // TODO: See if I can follow my tail for a bit.
  if(!dir) {
    dir = C.lastResort(TeamRocket);
    if (!dir) console.log("No available direction.");
  }

  // Response data
  const data = {
    move: dir
  }

  return response.json(data);
})

app.post('/end', (request, response) => {
  console.log("xxxx", request.body.you.name, "xxxx");
  // NOTE: Do something to end the game
})

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'))
})