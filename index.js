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
const TR = require('./TeamRocket.js');
const BattleSnake = require('./BattleSnake.js');


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
    color: '#'+(Math.random()*0xFFFFFF<<0).toString(16),
    //'#B93021',   // #741ECD - Nice purple
    head: 'fang',
    tail: 'regular'
  }

  return response.json(data)
})

//moveTest
app.post('/move', (request, response) => {
  const board = request.body.board;

  const snakes = board.snakes;
  const width = board.width - 1;
  const height = board.height - 1;
  const TRsnake = request.body.you;
  const food = board.food;

  console.log(`--Move ${TRsnake.name}--`);

  var TeamRocket, dir;

  console.log("Test 1")
  TeamRocket = new BattleSnake(width, height, TRsnake.id, snakes);
  console.log("Test 2")
  console.log(TeamRocket);

  C.eternalLoop();
  if (request.body.turn === 2) {
    TeamRocket.enemies.foreach((e) => {
      console.log(e.body);
    });
  }

  // Response data
  const data = {
    move: dir
  }

  return response.json(data);
})

// moveMain
app.post('/moveM', (request, response) => {
  const board = request.body.board;

  const snakes = board.snakes;
  const width = board.width - 1;
  const height = board.height - 1;
  const TRsnake = request.body.you;
  const food = board.food;
  
  console.log(`--Move ${TRsnake.name}--`);

  var TeamRocket, dir;
      
  TeamRocket = new BattleSnake(width, height, TRsnake.id, snakes);



  dir = C.huntForFood(TeamRocket, TRsnake, food);

  // Can't obtain food, find longest path
  if (!dir) {
    console.log("No food obtainable.");
  }

  // If all other algorithms fail, pick a direction
  if(!dir) {
    console.log("Last Resort.");
    dir = C.lastResort(TeamRocket, TRsnake.body[0]);
    if (!dir) console.log("No available direction");
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