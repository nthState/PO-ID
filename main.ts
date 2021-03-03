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
enum PocketOperatorMode {
  Default,
  Drawing,
  RecordingAPattern,
  Playing,
}

/**
Drawing per button
*/
class Drawing {
    private clickX: number[] = [];
    private clickY: number[] = [];
    
    private inactiveColor = "#A9A9A9";
    private activeColor = "#696969";
    
    public addPoint(point) {
        this.clickX.push(point.x);
        this.clickY.push(point.y);
        //this.clickDrag.push(dragging);
    }
    
    /**
    An active drawing is full color
    */
    public draw(isActive: boolean, context) {
        let clickX = this.clickX;
        //let clickDrag = this.clickDrag;
        let clickY = this.clickY;
        for (let i = 0; i < clickX.length; ++i) {
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
    }
}

/**
Main application
*/
class PocketOperatorIDApp {

    // MARK: - Properties

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private operatorMode: PocketOperatorMode;
    
    private buttonDrawings: Array<Drawing> = [new Drawing(),new Drawing(),new Drawing(),new Drawing(),
                                                new Drawing(),new Drawing(),new Drawing(),new Drawing(),
                                                new Drawing(),new Drawing(),new Drawing(),new Drawing(),
                                                new Drawing(),new Drawing(),new Drawing(),new Drawing()];
    
    private activeButton: number = 0;
    
    private drawing: boolean = false;
    
    private maxButtons: number = 16;
    
    // Limited to just a single pattern for proof of concept
    private pattern: Array<Drawing> = new Array(16);
    
    private canvasBackgroundColor = "#DCDCDC";
    
    // MARK: - Constructor

    constructor() {
        let canvas = document.getElementById('canvas') as
                     HTMLCanvasElement;
        let context = canvas.getContext("2d");
        context.lineCap = 'round';
        context.lineJoin = 'round';
        //context.strokeStyle = 'black';
        context.lineWidth = 2;
        
        this.buttonDrawings.push(new Drawing());

        this.canvas = canvas;
        this.context = context;

        this.createUserEvents();
        
        this.clearCanvas()
    }
    
    // MARK:- Event Handlers
    
    private createUserEvents() {
        let canvas = this.canvas;

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
        for (let i = 0; i < this.maxButtons; i++) {
            document.getElementById('pad' + i).addEventListener("click", this.onChangeButtondHandler);
        }
    }
    
    private clearHandler = () => {
        this.clearCanvas()
    }
    
    private exportHandler = () => {
        alert('Maybe we can ask Teenage Engineering nicely to add this feature?');
    }
    
    private onDownHandler = (e: MouseEvent | TouchEvent) => {
        let position = this.calculateCursorPosition(e);
        
        this.drawing = true;
        
        this.buttonDrawings[this.activeButton].addPoint(position);
    }
    
    private onDragHandler = (e: MouseEvent | TouchEvent) => {
    
        if (!this.drawing) {
            return;
        }
    
        let position = this.calculateCursorPosition(e);
        
        this.buttonDrawings[this.activeButton].addPoint(position);
        
        this.draw();
    
        e.preventDefault();
    }
    
    private onUpHandler = (e: MouseEvent | TouchEvent) => {
        let position = this.calculateCursorPosition(e);
        
        this.drawing = false;
        
        this.draw();
    }
    
    private onCancelledHandler = () => {
        this.drawing = false;
        
        this.draw();
    }
    
    private onChangeButtondHandler = (e) => {
        
        // Convert string identifier to an index
        let padIdentifier = +e.target.id.replace("pad", "")
        
        this.activeButton = padIdentifier;
        
        this.draw();
    }
    
    // MARK: - Drawing
    
    private draw() {
    
        let context = this.context;
        let canvas = this.canvas;
        
        context.rect(0, 0, canvas.width, canvas.height);
        context.fillStyle = this.canvasBackgroundColor;
        context.fill();
    
        let buttonDrawingsCount = this.buttonDrawings.length;
        for (let i = 0; i < buttonDrawingsCount; i++) {
            let buttonDrawing = this.buttonDrawings[i];
            buttonDrawing.draw(this.activeButton == i, context);
        }
    
    }
    
    // MARK: - Screen calculations
    
    /**
    Given the mouse/touch event, calculate the real co-ordinates 
    in the canvas.
    */
    private calculateCursorPosition(e: MouseEvent | TouchEvent) {
        let mouseX = (e as TouchEvent).changedTouches ?
                 (e as TouchEvent).changedTouches[0].pageX :
                 (e as MouseEvent).pageX;
        let mouseY = (e as TouchEvent).changedTouches ?
                     (e as TouchEvent).changedTouches[0].pageY :
                     (e as MouseEvent).pageY;
        mouseX -= this.canvas.offsetLeft;
        mouseY -= this.canvas.offsetTop;
        
        return {x: mouseX, y: mouseY};
    }
    
    /**
     Clear the screen
     */
    private clearCanvas() {
        let context = this.context;
        let canvas = this.canvas;
    
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.rect(0, 0, canvas.width, canvas.height);
        context.fillStyle = this.canvasBackgroundColor;
        context.fill();
    }
    
    // MARK: - Animation
}

new PocketOperatorIDApp();