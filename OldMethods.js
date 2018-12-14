// Test Stuff

// const coords = [
  //   { id: '123', body: [{ x: 1, y: 2 }, { x: 1, y: 3 }] },
  //   { id: '456', body: [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }] }
  // ];
  // const myClass = new Grid(5, 5, coords);
  // const end = { x: 4, y: 4 };
  // const path = myClass.breadthFirstSearch(coords[0].body[0], end);

// var unavailableSpaces = [ { x: 3, y: 3 }, { x: 0, y: 1 }, { x: 2, y: 0 }];
// var end = {x:0, y:0 };
// var start = {x:0, y:0 }; // {x:2, y:2 };
// var h = 3;
// var w = 3;

// var start = {x:3, y:13 };
// var food = [ { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 8, y: 13 }, { x: 6, y: 1 }, { x: 1, y: 0 }];

  var start = {x:13, y:3 };
  var food = [ { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 8, y: 13 }, { x: 6, y: 1 }, { x: 1, y: 0 }]


// var list = C.breadthFirstSearch(start, end, unavailableSpaces, w, h);
// console.log("LIST: ", list);



// Builds the board from 1 - n where n = width * height
// and what possible movements can be taken.
// Probably usless
buildGrid(width, height) {

  let grid = {};
  let length = 0;

  for (var h = 1; h <= height; h++) {
    for (var w = 1; w <= width; w++) {
      length++
      
      // Top row
      if (h == 1) {
        // Top Left Corner
        if (w == 1) {
          grid["s" + length] = ["down", "right"];
        }
        // Top Right Corner
        else if (w == width) {
          grid["s" + length] = ["down", "left"]
        }
        else {
          grid["s" + length] = ["down", "left", "right"]
        }
      }

      // Bottom row
      else if (h == height) {
        // Bottom Left Corner
        if (w == 1) {
          grid["s" + length] = ["up", "right"]
        }
        // Bottom Right Corner
        else if (w == width) {
          grid["s" + length] = ["up", "left"]
        }
        else {
          grid["s" + length] = ["up", "left", "right"]
        }
      }

      // Left side
      else if (w == 1){
        grid["s" + length] = ["up", "down", "right"]
      }

      // Right side
      else if (w == width){
        grid["s" + length] = ["up", "down", "left"]
      }

      // Inner
      else {
        grid["s" + length] = ["up", "down", "left", "right"];
      }
    }
  }

  // console.log(grid);

  return grid;
},

// Retrieve possible direction from any given space
// Possibly usless
possDir(x, y, w, h) {
  //Account for grid starting at 0
  w--; h--

  // Top left corner
  if (x == 0 && y ==0)
    return ["down", "right"];
  // Top Right Corner
  else if (x == w && y == 0)
    return ["down", "left"];
  // Bottom Left Corner
  else if (x == 0 && y == h)
    return ["up", "right"];
  // Bottom Right Corner
  else if (x == w && y == h)
    return ["up", "left"];
  // Top
  else if (y == 0)
    return ["down", "left", "right"];
  // Right side
  else if (x == w)
    return ["up", "down", "left"];
  // Bottom
  else if (y == h)
    return ["up", "left", "right"];
  // Left side
  else if (x == 0)
    return ["up", "down", "right"];
  // Inner
  else 
    return ["up", "down", "left", "right"];
},

// Remove the neck position from possible directions to turn
notNeck(head, neck, possDir) {
  console.log("PRE possDir: ", possDir)

  // Moving up
  if (head.x == neck.x && head.y < neck.y)
    return possDir.filter(e => e !== 'down');
  // Moving down
  else if (head.x == neck.x && head.y > neck.y)
    return possDir.filter(e => e !== 'up');
  // Moving left
  else if (head.y == neck.y && head.x > neck.x)
    return possDir.filter(e => e !== 'right');
  // Moving right
  else if (head.y == neck.y && head.x < neck.x)
    return possDir.filter(e => e !== 'left');
  // ahhhhhh wut
  else
    return possDir;
},