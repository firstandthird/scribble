(function($){
  function capitalize (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  $.declare('scribble',{
    defaults : {
      color : '#000000',
      size : 2,
      readMode : false,
      stopDrawingTime : 500,
      tool : 'pencil',
      cssClasses : {
        'canvas-holder' : 'scribble-canvas-holder',
        'main-canvas' : 'scribble-main-canvas',
        'shadow-canvas' : 'scribble-shadow-canvas'
      }
    },
    tools : [
      'pencil','eraser'
    ],
    _isCanvas : function () {
      var htmlNode = this.el[0],
          result = true;

      if (htmlNode.nodeType !== 1 || htmlNode.nodeName.toLowerCase() !== 'canvas'){
        result = false;
      }

      return result;
    },
    _createCanvas : function(){
      var canvas = $('<canvas>');
      canvas.appendTo(this.el);
      this.canvasHolder = this.el;
      this.el = canvas;
    },
    _getId : function() {
      var i = 0,id = null, auxID;

      while (id === null) {
        auxID = 'fidel_scribble_' + i;

        if ($('#' + auxID).length === 0){
          id = auxID;
        }
        else {
          i++;
        }
      }

      return id;
    },
    _createWrapper : function(){
      var div = $('<div>');
      div.insertBefore(this.el);
      this.el.appendTo(div);
      this.canvasHolder = div;
    },
    _applyClasses : function(){
      this.canvasHolder.addClass(this.cssClasses['canvas-holder']);
      this.el.addClass(this.cssClasses['main-canvas']);
      this.shadowCanvas.addClass(this.cssClasses['shadow-canvas']);
      var computedStyle = getComputedStyle(this.canvasHolder[0]);

      this.el[0].width = parseInt(computedStyle.width,10);
      this.el[0].height = parseInt(computedStyle.height,10);
      this.shadowCanvas[0].width = parseInt(computedStyle.width,10);
      this.shadowCanvas[0].height = parseInt(computedStyle.height,10);
    },
    _getContexts : function(){
      this.shadowContext = this.shadowCanvas[0].getContext('2d');
      this.context = this.el[0].getContext('2d');
    },
    _createShadowCanvas : function(){
      this.shadowCanvas = $('<canvas>');
      this.shadowCanvas[0].id = this._getId();
      this.shadowCanvas.insertAfter(this.el);
    },
    _bindEvents: function () {
      this.shadowCanvas.on('mousemove touchmove', this.proxy(this._saveMouse,this));
      this.shadowCanvas.on('mousedown touchstart', this.proxy(this._startDrawing,this));
      this.shadowCanvas.on('mouseup touchend', this.proxy(this._stopDrawing,this));

      $('body').on('mouseup touchend', this.proxy(this._stopDrawing,this));
    },
    _unbindEvents : function(){
      this.shadowCanvas.off('mousemove touchmove', this.proxy(this._saveMouse,this));
      this.shadowCanvas.off('mousedown touchstart', this.proxy(this._startDrawing,this));
      this.shadowCanvas.off('mouseup touchend', this.proxy(this._stopDrawing,this));

      $('body').off('mouseup', this.proxy(this._stopDrawing,this));
    },
    _startDrawing : function(e){
      this.shadowCanvas.on('mousemove touchmove', this.proxy(this._draw,this));
      this.drawing = true;
      this._saveMouse(e);
      this._savePoint();
      this._draw();
    },
    _savePoint : function(){
      this.points.push({
        x : this.mousePosition.x,
        y : this.mousePosition.y,
        size : this.size,
        color : this.color,
        tool : this.tool
      });
    },
    _saveMouse : function(e){
      if (e.type === 'touchmove'){
        e.preventDefault();
      }

      var position = this._getXY(e);
      this.mousePosition.x = position.x;
      this.mousePosition.y = position.y;

      if (this.drawing){
        this._savePoint();
      }
    },
    _saveStep : function(){
      var aux = { points: this.points.splice(0) };
      this.doneSteps.push(aux);
    },
    _stopDrawing : function(e){
      if (this.drawing){
        e.stopImmediatePropagation();
        this.shadowCanvas.off('mousemove touchmove', this.proxy(this._draw,this));
        this._copyShadowToReal();
        this.drawing = false;
        this._emitDrawingChanged();
      }
    },
    _emitDrawingChanged : function(){
      if (this.stopTimer){
        clearTimeout(this.stopTimer);
      }
      var self = this;
      this.stopTimer = setTimeout(function(){
        self.emit('drawing.changed');
      }, this.stopDrawingTime);
    },
    _copyShadowToReal : function(){
      this.context.drawImage(this.shadowCanvas[0],0,0);
      this._clearCanvas(this.shadowCanvas,this.shadowContext);
      if (this.drawing){
        this._saveStep();
      }
      this.points = [];
    },
    _getXY : function(e){
      var x, y, touchEvent = { pageX : 0, pageY : 0};

      if (typeof e.changedTouches !== 'undefined'){
        touchEvent = e.changedTouches[0];
      }
      else if ( typeof e.originalEvent !== 'undefined' && typeof e.originalEvent.changedTouches !== 'undefined'){
        touchEvent = e.originalEvent.changedTouches[0];
      }

      x = e.offsetX || e.layerX || touchEvent.pageX;
      y = e.offsetY || e.layerY || touchEvent.pageY;

      return {
        x : x,
        y : y
      };
    },
    _draw : function(){
      var length = this.points.length,
          aux = this.points[0],
          erasing = aux.tool === 'eraser',
          context =  erasing ? this.context : this.shadowContext,
          previousTool = '',
          revertTool = false;

      if (this.tool !== aux.tool){
        revertTool = true;
        previousTool = this.tool;
        this.changeTool(aux.tool);
      }

      context.lineWidth = aux.size;
      context.strokeStyle = aux.color;
      context.fillStyle = aux.color;

      if (length !== 0){
        if (length < 3){
          context.beginPath();
          context.arc(aux.x,aux.y, context.lineWidth / 2, 0, Math.PI * 2, true);
          context.fill();
          context.closePath();
        }
        else {
          if (!erasing){
            this._clearCanvas(this.shadowCanvas,this.shadowContext);
          }

          context.beginPath();
          context.moveTo(this.points[0].x,this.points[0].y);

          for (var i = 1; i < length -2; i++){
            var x = (this.points[i].x + this.points[i+1].x) / 2,
                y = (this.points[i].y + this.points[i+1].y) / 2;

            context.quadraticCurveTo(this.points[i].x,this.points[i].y,x,y);
          }

          context.quadraticCurveTo(this.points[i].x,this.points[i].y,this.points[i+1].x,this.points[i+1].y);
          context.stroke();
        }
      }

      // Only used in undo / redo
      return {
        'toolUsed' : aux.tool,
        'previousTool' : previousTool,
        'revertTool' : revertTool
      };
    },
    _drawFromSteps : function(actions){
      if (actions){
        this.clear(true);

        for (var i = 0, len = actions.length; i < len; i++){
          this.points = actions[i].points;
          var result = this._draw();

          if (result.toolUsed !== 'eraser'){
            this._copyShadowToReal();
          }
          if (result.revertTool){
            this.changeTool(result.previousTool);
          }
        }
      }
    },
    init : function(){
      if (!this._isCanvas()){
        this._createCanvas();
      }
      else {
        this._createWrapper();
      }
      this._createShadowCanvas();
      
      this._applyClasses();
      this._getContexts();
      
      this.shadowContext.lineJoin = 'round';
      this.body = $('body');

      this.mousePosition = {
        x : 0,
        y : 0
      };
      this.points = [];
      this.drawing = false;
      this.unDoneSteps = [];
      this.doneSteps = [];

      this.clear(true);

      if (!this.readMode){
        this._bindEvents();
      }
      this.oldColor = this.color;
      this.changeTool(this.tool);
    },
    changeColor: function(color){
      this.color = color;
      this.shadowContext.strokeStyle = this.color;
    },
    changeSize : function(size){
      this.size = size;
      this.shadowContext.lineWidth = this.size;
    },
    changeReadMode : function(mode){
      if (mode){
        this._bindEvents();
      }
      else {
        this._unbindEvents();
      }

      this.readMode = mode;
    },
    toJSON : function(){
      return this.doneSteps;
    },
    loadJSON : function(obj){
      this._drawFromSteps(obj);
      this.doneSteps = obj;
    },
    toDataURL : function(){
      return this.el[0].toDataURL();
    },
    loadDataURL : function(dataurl){
      var image = new Image();
      image.src = dataurl.toString();
      this.context.drawImage(image,0,0);
    },
    undo : function(){
      if (this.doneSteps.length){
        var lastStep = this.doneSteps.pop();
        this.unDoneSteps.push(lastStep);
        this._drawFromSteps(this.doneSteps);
      }
    },
    redo : function(){
      if (this.unDoneSteps.length){
        var lastUndone = this.unDoneSteps.pop();
        this.doneSteps.push(lastUndone);
        this._drawFromSteps(this.doneSteps);
      }
    },
    _setPencil : function(){
      this.context.globalCompositeOperation = 'source-over';
      this.color = this.oldColor;
    },
    _setEraser : function(){
      this.context.globalCompositeOperation = 'destination-out';
      this.oldColor = this.color;
      this.color = 'rgba(0,0,0,1)';
    },
    changeTool : function(tool){
      if (this.tools.indexOf(tool) !== -1){
        var method = '_set' + capitalize(tool);
        this[method].call(this);
        this.tool = tool;
      }
      else {
        console.error(tool + ' is not implemented');
      }
    },
    _clearCanvas : function(canvas, context){
      context.clearRect(0,0,canvas[0].width,canvas[0].height);
    },
    clear : function(intern){
      intern = intern || false;

      this._clearCanvas(this.el,this.context);

      if (!intern){
        this.emit('clear');
        this.doneSteps = [];
      }
    }
  });
})(jQuery);