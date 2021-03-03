//
//  main.ts
//  PO-ID
//
//  Copyright © 2021 Chris Davis, www.chrisdavis.com.
//  Released under the Apache 2 License.
//
//  See https://github.com/nthState/PO-ID/blob/master/LICENSE for license information.
//
/**
Device state
*/
var PocketOperatorMode;
(function (PocketOperatorMode) {
    PocketOperatorMode[PocketOperatorMode["Drawing"] = 0] = "Drawing";
    PocketOperatorMode[PocketOperatorMode["RecordingAPattern"] = 1] = "RecordingAPattern";
    PocketOperatorMode[PocketOperatorMode["Playing"] = 2] = "Playing";
})(PocketOperatorMode || (PocketOperatorMode = {}));
/**
Drawing per button
*/
var Drawing = /** @class */ (function () {
    function Drawing() {
        this.clickX = [];
        this.clickY = [];
        this.inactiveColor = "#A9A9A9";
        this.activeColor = "#696969";
    }
    Drawing.prototype.addPoint = function (point) {
        this.clickX.push(point.x);
        this.clickY.push(point.y);
    };
    /**
    An active drawing is full color
    */
    Drawing.prototype.draw = function (isActive, context) {
        var clickX = this.clickX;
        var clickY = this.clickY;
        for (var i = 0; i < clickX.length; ++i) {
            context.beginPath();
            context.moveTo(clickX[i] - 1, clickY[i]);
            context.strokeStyle = isActive ? this.activeColor : this.inactiveColor;
            context.lineTo(clickX[i], clickY[i]);
            context.stroke();
        }
        context.closePath();
    };
    return Drawing;
}());
/**
Main application
*/
var PocketOperatorIDApp = /** @class */ (function () {
    // MARK: - Constructor
    function PocketOperatorIDApp() {
        var _this = this;
        // drawing per layer
        this.buttonDrawings = [new Drawing(), new Drawing(), new Drawing(), new Drawing(),
            new Drawing(), new Drawing(), new Drawing(), new Drawing(),
            new Drawing(), new Drawing(), new Drawing(), new Drawing(),
            new Drawing(), new Drawing(), new Drawing(), new Drawing()];
        // currently selected layer
        this.activeButton = 0;
        // Animatable active button
        this.activeAnimationLayer = 0;
        // Is the user drawing?
        this.drawing = false;
        // number of pocket operator buttons
        this.maxButtons = 16;
        // Limited to just a single pattern for proof of concept
        this.pattern = new Array(16);
        // background fill of the canvas
        this.canvasBackgroundColor = "#DCDCDC";
        // beats per minute
        this.beatsPerMinuteInMiliseconds = 60000 / 120;
        this.clearHandler = function () {
            if (_this.operatorMode == PocketOperatorMode.Playing) {
                return;
            }
            _this.buttonDrawings = [new Drawing(), new Drawing(), new Drawing(), new Drawing(),
                new Drawing(), new Drawing(), new Drawing(), new Drawing(),
                new Drawing(), new Drawing(), new Drawing(), new Drawing(),
                new Drawing(), new Drawing(), new Drawing(), new Drawing()];
            _this.clearCanvas();
        };
        this.exportHandler = function () {
            alert('Maybe we can ask Teenage Engineering nicely to add this feature?');
        };
        this.playHandler = function () {
            if (_this.operatorMode != PocketOperatorMode.Playing) {
                _this.operatorMode = PocketOperatorMode.Playing;
                document.getElementById('play').className = "active";
                _this.playAnimation();
            }
            else {
                _this.operatorMode = PocketOperatorMode.Drawing;
                document.getElementById('play').className = "inactive";
                _this.stopAnimation();
            }
        };
        this.onDownHandler = function (e) {
            if (_this.operatorMode != PocketOperatorMode.Drawing) {
                return;
            }
            var position = _this.calculateCursorPosition(e);
            _this.drawing = true;
            _this.buttonDrawings[_this.activeButton].addPoint(position);
        };
        this.onDragHandler = function (e) {
            if (_this.operatorMode != PocketOperatorMode.Drawing) {
                return;
            }
            if (!_this.drawing) {
                return;
            }
            var position = _this.calculateCursorPosition(e);
            _this.buttonDrawings[_this.activeButton].addPoint(position);
            _this.draw(_this.activeButton);
            e.preventDefault();
        };
        this.onUpHandler = function (e) {
            var position = _this.calculateCursorPosition(e);
            _this.drawing = false;
            _this.draw(_this.activeButton);
        };
        this.onCancelledHandler = function () {
            _this.drawing = false;
            _this.draw(_this.activeButton);
        };
        this.onChangeButtondHandler = function (e) {
            // Convert string identifier to an index
            var padIdentifier = +e.target.id.replace("pad", "");
            _this.activeButton = padIdentifier;
            _this.draw(_this.activeButton);
            _this.changeSelectedButton(padIdentifier);
        };
        var canvas = document.getElementById('canvas');
        var context = canvas.getContext("2d");
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.lineWidth = 2;
        this.buttonDrawings.push(new Drawing());
        this.canvas = canvas;
        this.context = context;
        this.createUserEvents();
        this.clearCanvas();
        this.operatorMode = PocketOperatorMode.Drawing;
        //PocketOperatorMode.Playing
    }
    // MARK:- Event Handlers
    PocketOperatorIDApp.prototype.createUserEvents = function () {
        var canvas = this.canvas;
        // Desktop
        canvas.addEventListener("mousedown", this.onDownHandler);
        canvas.addEventListener("mousemove", this.onDragHandler);
        canvas.addEventListener("mouseup", this.onUpHandler);
        canvas.addEventListener("mouseout", this.onCancelledHandler);
        // iPhone 
        canvas.addEventListener("touchstart", this.onDownHandler);
        canvas.addEventListener("touchmove", this.onDragHandler);
        canvas.addEventListener("touchend", this.onUpHandler);
        canvas.addEventListener("touchcancel", this.onCancelledHandler);
        // HTML buttons
        document.getElementById('clear').addEventListener("click", this.clearHandler);
        document.getElementById('export').addEventListener("click", this.exportHandler);
        document.getElementById('play').addEventListener("click", this.playHandler);
        // Pads
        for (var i = 0; i < this.maxButtons; i++) {
            document.getElementById('pad' + i).addEventListener("click", this.onChangeButtondHandler);
            if (i == this.activeButton) {
                document.getElementById('pad' + i).className = "active";
            }
        }
    };
    // MARK: - Drawing
    /**
    Depending on whether we are manually drawing or not
    depends on which is the active layer
    */
    PocketOperatorIDApp.prototype.draw = function (activeLayer) {
        var context = this.context;
        var canvas = this.canvas;
        context.rect(0, 0, canvas.width, canvas.height);
        context.fillStyle = this.canvasBackgroundColor;
        context.fill();
        var buttonDrawingsCount = this.buttonDrawings.length;
        for (var i = 0; i < buttonDrawingsCount; i++) {
            var buttonDrawing = this.buttonDrawings[i];
            buttonDrawing.draw(activeLayer == i, context);
        }
    };
    // MARK: - Screen calculations
    /**
    Given the mouse/touch event, calculate the real co-ordinates
    in the canvas.
    */
    PocketOperatorIDApp.prototype.calculateCursorPosition = function (e) {
        var mouseX = e.changedTouches ?
            e.changedTouches[0].pageX :
            e.pageX;
        var mouseY = e.changedTouches ?
            e.changedTouches[0].pageY :
            e.pageY;
        mouseX -= this.canvas.offsetLeft;
        mouseY -= this.canvas.offsetTop;
        return { x: mouseX, y: mouseY };
    };
    /**
     Clear the screen
     */
    PocketOperatorIDApp.prototype.clearCanvas = function () {
        var context = this.context;
        var canvas = this.canvas;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.rect(0, 0, canvas.width, canvas.height);
        context.fillStyle = this.canvasBackgroundColor;
        context.fill();
    };
    // MARK: - UI Button updates
    PocketOperatorIDApp.prototype.changeSelectedButton = function (to) {
        for (var i = 0; i < this.maxButtons; i++) {
            if (i != to) {
                document.getElementById('pad' + i).className = "inactive";
            }
            else {
                document.getElementById('pad' + i).className = "active";
            }
        }
    };
    // MARK: - Animation
    PocketOperatorIDApp.prototype.playAnimation = function () {
        this.stopAnimation();
        this.activeAnimationLayer = 0;
        var localThis = this;
        this.animationTimer = setInterval(function () {
            localThis.animateView(localThis);
        }, this.beatsPerMinuteInMiliseconds);
    };
    PocketOperatorIDApp.prototype.stopAnimation = function () {
        clearInterval(this.animationTimer);
        this.animationTimer = undefined;
        this.changeSelectedButton(this.activeButton);
    };
    PocketOperatorIDApp.prototype.animateView = function (executer) {
        executer.draw(this.activeAnimationLayer);
        executer.changeSelectedButton(this.activeAnimationLayer);
        executer.activeAnimationLayer = this.activeAnimationLayer + 1;
        if (executer.activeAnimationLayer > executer.maxButtons) {
            executer.activeAnimationLayer = 0;
        }
    };
    return PocketOperatorIDApp;
}());
new PocketOperatorIDApp();
