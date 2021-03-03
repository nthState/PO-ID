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
    PocketOperatorMode[PocketOperatorMode["Default"] = 0] = "Default";
    PocketOperatorMode[PocketOperatorMode["Drawing"] = 1] = "Drawing";
    PocketOperatorMode[PocketOperatorMode["RecordingAPattern"] = 2] = "RecordingAPattern";
    PocketOperatorMode[PocketOperatorMode["Playing"] = 3] = "Playing";
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
        //this.clickDrag.push(dragging);
    };
    /**
    An active drawing is full color
    */
    Drawing.prototype.draw = function (isActive, context) {
        var clickX = this.clickX;
        //let clickDrag = this.clickDrag;
        var clickY = this.clickY;
        for (var i = 0; i < clickX.length; ++i) {
            context.beginPath();
            // if (clickDrag[i] && i) {
            //                 context.moveTo(clickX[i - 1], clickY[i - 1]);
            //             } else {
            context.moveTo(clickX[i] - 1, clickY[i]);
            //}
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
        this.buttonDrawings = [new Drawing(), new Drawing(), new Drawing(), new Drawing(),
            new Drawing(), new Drawing(), new Drawing(), new Drawing(),
            new Drawing(), new Drawing(), new Drawing(), new Drawing(),
            new Drawing(), new Drawing(), new Drawing(), new Drawing()];
        this.activeButton = 0;
        this.drawing = false;
        this.maxButtons = 16;
        // Limited to just a single pattern for proof of concept
        this.pattern = new Array(16);
        this.canvasBackgroundColor = "#DCDCDC";
        this.clearHandler = function () {
            _this.clearCanvas();
        };
        this.exportHandler = function () {
            alert('Maybe we can ask Teenage Engineering nicely to add this feature?');
        };
        this.onDownHandler = function (e) {
            var position = _this.calculateCursorPosition(e);
            _this.drawing = true;
            _this.buttonDrawings[_this.activeButton].addPoint(position);
        };
        this.onDragHandler = function (e) {
            if (!_this.drawing) {
                return;
            }
            var position = _this.calculateCursorPosition(e);
            _this.buttonDrawings[_this.activeButton].addPoint(position);
            _this.draw();
            e.preventDefault();
        };
        this.onUpHandler = function (e) {
            var position = _this.calculateCursorPosition(e);
            _this.drawing = false;
            _this.draw();
        };
        this.onCancelledHandler = function () {
            _this.drawing = false;
            _this.draw();
        };
        this.onChangeButtondHandler = function (e) {
            // Convert string identifier to an index
            var padIdentifier = +e.target.id.replace("pad", "");
            _this.activeButton = padIdentifier;
            _this.draw();
        };
        var canvas = document.getElementById('canvas');
        var context = canvas.getContext("2d");
        context.lineCap = 'round';
        context.lineJoin = 'round';
        //context.strokeStyle = 'black';
        context.lineWidth = 2;
        this.buttonDrawings.push(new Drawing());
        this.canvas = canvas;
        this.context = context;
        this.createUserEvents();
        this.clearCanvas();
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
        // Pads
        for (var i = 0; i < this.maxButtons; i++) {
            document.getElementById('pad' + i).addEventListener("click", this.onChangeButtondHandler);
        }
    };
    // MARK: - Drawing
    PocketOperatorIDApp.prototype.draw = function () {
        var context = this.context;
        var canvas = this.canvas;
        context.rect(0, 0, canvas.width, canvas.height);
        context.fillStyle = this.canvasBackgroundColor;
        context.fill();
        var buttonDrawingsCount = this.buttonDrawings.length;
        for (var i = 0; i < buttonDrawingsCount; i++) {
            var buttonDrawing = this.buttonDrawings[i];
            buttonDrawing.draw(this.activeButton == i, context);
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
    return PocketOperatorIDApp;
}());
new PocketOperatorIDApp();
