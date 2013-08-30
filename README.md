#scribble

Turn a canvas element into a scribble pad that supports bouth mouse and touch.

##Installation

###Bower

`bower install scribble`

###Manual Download

- [Development]()
- [Production]()

##Usage

In order to initialize the module, you'll need to target either a `canvas` or a `div`. The module will wrap the `canvas` with a `div` or create a `canvas` inside the supplied `div`.

Finally, you need to just call `scribble` on top of the jQuery element:

	$('#myAwesomeCanvas').scribble();
	
And that's it! Well, I lied a little. You have some methods and options available!

### Available options

| Option       | Explanation                             | Default     |
| ------------ |:---------------------------------------:|:-----------:|
| `color`      | Color in which you'll draw              | `#000000`   |
| `size`       | Size of the stroke                      | `2`         |
| `readMode`   | Sets whether the canvas is in read mode | `false`     |
| `tool`       | Selected tool at beginning              | `pencil`    |
| `cssClasses` | Object that holds css classes to style  | *See below* |

`cssClasses` have this configurable properties:

* `canvas-holder` : Class for the `div` that wraps the canvas. (*Default*: `scribble-canvas-holder`)
* `main-canvas` : Class for the main `canvas`. (*Default*: `scribble-main-canvas`)
* `shadow-canvas` : Class for the auxiliar canvas used. (*Default*: `scribble-main-canvas`)

**Note**: Aside from `cssClases`, all the options can be change with methods after initialization. 

### Available methods

Several methods are exposed through Fidel for you to use that allows you to do fancy things.

#### `changeColor(color)`

With this method you can… change the stroke color. What did you expect? There is no validation performed on plugin side so you should be sure you're passing a good value.

#### `changeSize(size)`

Changes the size of the stroke. Size has to be an integer.

#### `changeReadMode(mode)`

Changes the read mode to whatever value you pass. If you pass `true`, you'll enable read mode and `false` will disable it.

#### `undo`

This method will undo the latest drawing.

#### `redo`

This method will redo the latest undone action.

#### `clear`

This method will clear the drawing canvas.

#### `changeTool(tool)`

This method allows you to change "drawing" tool. Currently there are only two possible values. Plugin will yell if you pass something which is not implemented.

* `pencil` : This is the default value and is what you expect.
* `eraser` : This is what you expect too… It will erase as you draw.


#### Export methods

There are 2 exports methods with their counterpart that will import as well:

* `toJSON` : It returns an object literall with all the points.
* `loadJSON` : It loads that object and draws everything back.
* `toDataURL` : Converts the canvas to base64 string
* `loadDataUrl` : Loads the canvas from a base64 string

##Development

###Requirements

- node and npm
- bower `npm install -g bower`
- grunt `npm install -g grunt-cli`

###Setup

- `npm install`
- `bower install`

###Run

`grunt dev`

or for just running tests on file changes:

`grunt ci`

###Tests

`grunt mocha`
