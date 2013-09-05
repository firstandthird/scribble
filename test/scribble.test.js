function cleanMess(){
  $('#fixture').empty().html('<canvas id="testCanvas"></canvas><div id="testDiv"></div>');
}

function startDrawing(fidel,x,y){
  var down = $.Event('mousedown');

  down.layerX = x;
  down.layerY = y;

  movePoint(fidel,x,y);
  fidel.shadowCanvas.trigger(down);
}

function stopDrawing(fidel){
  var up = $.Event('mouseup');
  fidel.shadowCanvas.trigger(up);
}

function drawLine1(fidel){
  startDrawing(fidel,0,0);
  for (var i = 0; i < 5; i++){
    movePoint(fidel,i,i);
  }
  stopDrawing(fidel);
  return fidel.toJSON();
}

function movePoint(fidel,x,y){
  var move = $.Event('mousemove');

  move.layerX = x;
  move.layerY = y;

  fidel.shadowCanvas.trigger(move);
}

suite('scribble', function() {
  var canvas, div, canvasFidel;
  var line1Mock = [{"points":[{"x":0,"y":0,"size":2,"color":"#000000","tool":"pencil"},{"x":0,"y":0,"size":2,"color":"#000000","tool":"pencil"},{"x":0,"y":0,"size":2,"color":"#000000","tool":"pencil"},{"x":1,"y":1,"size":2,"color":"#000000","tool":"pencil"},{"x":2,"y":2,"size":2,"color":"#000000","tool":"pencil"},{"x":3,"y":3,"size":2,"color":"#000000","tool":"pencil"},{"x":4,"y":4,"size":2,"color":"#000000","tool":"pencil"}]}];

  setup(function(){
    cleanMess();
    canvas = $('#testCanvas');
    div = $('#testDiv');
    canvas.scribble();
    canvasFidel = canvas.data('scribble');
    div.scribble();
  });
  suite('init',function(){
    test('scribble should exists in jQuery\'s namespace', function(){
      assert.equal(typeof $().scribble, 'function');
    });
    suite('structure creating',function(){
      suite('canvas attributes',function(){
        test('main canvas should have id attribute',function(){
          assert.notEqual(div.find('canvas').first().attr('id'),'');
        });
        test('last canvas should have id attribute',function(){
          assert.notEqual(div.find('canvas').last().attr('id'),'');
        });
        test('main canvas should have width attribute',function(){
          assert.notEqual(div.find('canvas').first().attr('width'),'');
        });
        test('last canvas should have width attribute',function(){
          assert.notEqual(div.find('canvas').last().attr('width'),'');
        });
        test('main canvas should have height attribute',function(){
          assert.notEqual(div.find('canvas').first().attr('height'),'');
        });
        test('last canvas should have height attribute',function(){
          assert.notEqual(div.find('canvas').last().attr('height'),'');
        });
      });
      suite('canvas target',function(){
        test('scribble should create a wrapper div', function(){
          assert.ok(canvas.parent().hasClass(canvasFidel.cssClasses['canvas-holder']));
        });
        test('scribble should create a shadow canvas next to the target one', function(){
          assert.ok(canvas.next().hasClass(canvasFidel.cssClasses['shadow-canvas']));
        });
        test('scribble should assign the correct class to the canvas',function(){
          assert.ok(canvas.hasClass(canvasFidel.cssClasses['main-canvas']));
        });
      });
      suite('div target',function(){
        test('scribble should two canvas inside', function(){
          assert.equal(div.find('canvas').length,2);
        });
        test('scribble should add class to div', function(){
          assert.ok(div.hasClass(canvasFidel.cssClasses['canvas-holder']));
        });
        test('scribble should create a shadow canvas next to the target one', function(){
          assert.equal(div.find('canvas.' +canvasFidel.cssClasses['shadow-canvas']).length,1);
        });
        test('scribble should assign the correct class to the canvas',function(){
          assert.equal(div.find('canvas.' +canvasFidel.cssClasses['main-canvas']).length,1);
        });
      });
    });
  });
  suite('feature',function(){
    setup(function(){
      cleanMess();
      canvas = $('#testCanvas');
      div = $('#testDiv');
      canvas.scribble();
      canvasFidel = canvas.data('scribble');
      div.scribble();
    });
    suite('drawing',function(){
      setup(function(){
        cleanMess();
        canvas = $('#testCanvas');
        canvas.scribble();
        canvasFidel = canvas.data('scribble');
        drawLine1(canvasFidel);
      });
      test('scribble should draw a line when user tries to',function(){
        assert.deepEqual(canvasFidel.toJSON(),line1Mock);
      });
      test('scribble should undo the drawing when calling undo',function(){
        canvasFidel.undo();
        assert.deepEqual(canvasFidel.toJSON(),[]);
      });
      test('scribble should redo the drawing when calling redo',function(){
        canvasFidel.undo();
        canvasFidel.redo();
        assert.deepEqual(canvasFidel.toJSON(),line1Mock);
      });
      test('scribble should empty the canvas on clear',function(){
        canvasFidel.clear();
        assert.deepEqual(canvasFidel.toJSON(),[]);
      });
    });
    suite('exporting',function(){
      setup(function(){
        cleanMess();
        canvas = $('#testCanvas');
        canvas.scribble();
        canvasFidel = canvas.data('scribble');
        drawLine1(canvasFidel);
      });
      test('scribble should export drawing to JSON',function(){
        assert.deepEqual(canvasFidel.toJSON(),line1Mock);
      });
      test('scribble should export drawing to base64',function(){
        assert.ok(canvasFidel.toDataURL().indexOf('data:image/png;base64') !== -1);
      });
    });
    suite('importing',function(){
      setup(function(){
        cleanMess();
        canvas = $('#testCanvas');
        canvas.scribble();
        canvasFidel = canvas.data('scribble');
      });
      test('scribble should import drawing from JSON',function(){
        canvasFidel.loadJSON(line1Mock);
        assert.deepEqual(canvasFidel.toJSON(),line1Mock);
      });
    });
  });
});
