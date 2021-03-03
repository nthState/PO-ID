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
    }
    
    /**
    An active drawing is full color
    */
    public draw(isActive: boolean, context) {
        let clickX = this.clickX;
        let clickY = this.clickY;
        for (let i = 0; i < clickX.length; ++i) {
            context.beginPath();
            context.moveTo(clickX[i] - 1, clickY[i]);
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

    // Reference to the HTML canvas element
    private canvas: HTMLCanvasElement;
    
    // drawing Context
    private context: CanvasRenderingContext2D;
    
    // mode of operation
    private operatorMode: PocketOperatorMode;
    
    // drawing per layer
    private buttonDrawings: Array<Drawing> = [new Drawing(),new Drawing(),new Drawing(),new Drawing(),
                                                new Drawing(),new Drawing(),new Drawing(),new Drawing(),
                                                new Drawing(),new Drawing(),new Drawing(),new Drawing(),
                                                new Drawing(),new Drawing(),new Drawing(),new Drawing()];

    // currently selected layer
    private activeButton: number = 0;
    
    // Animatable active button
    private activeAnimationLayer = 0;
    
    // Is the user drawing?
    private drawing: boolean = false;
    
    // number of pocket operator buttons
    private maxButtons: number = 16;
    
    // Limited to just a single pattern for proof of concept
    private pattern: Array<Drawing> = new Array(16);
    
    // background fill of the canvas
    private canvasBackgroundColor = "#DCDCDC";
    
    // beats per minute
    private beatsPerMinuteInMiliseconds = 60000 / 120;
    
    // Used when animating
    private animationTimer;
    
    // MARK: - Constructor

    constructor() {
        let canvas = document.getElementById('canvas') as
                     HTMLCanvasElement;
        let context = canvas.getContext("2d");
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.lineWidth = 2;
        
        this.buttonDrawings.push(new Drawing());

        this.canvas = canvas;
        this.context = context;

        this.createUserEvents();
        
        this.clearCanvas()
        
        this.operatorMode = PocketOperatorMode.Drawing;
//PocketOperatorMode.Playing
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
        document.getElementById('play').addEventListener("click", this.playHandler);
        
        // Pads
        for (let i = 0; i < this.maxButtons; i++) {
            document.getElementById('pad' + i).addEventListener("click", this.onChangeButtondHandler);
            
            if (i == this.activeButton) {
                document.getElementById('pad' + i).className = "active";
            }
        }
    }
    
    private clearHandler = () => {
    
        if (this.operatorMode == PocketOperatorMode.Playing) {
            return
        }
    
        this.buttonDrawings = [new Drawing(),new Drawing(),new Drawing(),new Drawing(),
                                new Drawing(),new Drawing(),new Drawing(),new Drawing(),
                                new Drawing(),new Drawing(),new Drawing(),new Drawing(),
                                new Drawing(),new Drawing(),new Drawing(),new Drawing()];
    
        this.clearCanvas()
    }
    
    private exportHandler = () => {
        alert('Maybe we can ask Teenage Engineering nicely to add this feature?');
    }
    
    private playHandler = () => {
        if (this.operatorMode != PocketOperatorMode.Playing) {
            this.operatorMode = PocketOperatorMode.Playing;
            document.getElementById('play').className = "active";
            this.playAnimation();
        } else {
            this.operatorMode = PocketOperatorMode.Drawing;
            document.getElementById('play').className = "inactive";
            this.stopAnimation();
        }
    }
    
    private onDownHandler = (e: MouseEvent | TouchEvent) => {
    
        if (this.operatorMode != PocketOperatorMode.Drawing) {
            return
        }
    
        let position = this.calculateCursorPosition(e);
        
        this.drawing = true;
        
        this.buttonDrawings[this.activeButton].addPoint(position);
    }
    
    private onDragHandler = (e: MouseEvent | TouchEvent) => {
    
        if (this.operatorMode != PocketOperatorMode.Drawing) {
            return
        }
    
        if (!this.drawing) {
            return;
        }
    
        let position = this.calculateCursorPosition(e);
        
        this.buttonDrawings[this.activeButton].addPoint(position);
        
        this.draw(this.activeButton);
    
        e.preventDefault();
    }
    
    private onUpHandler = (e: MouseEvent | TouchEvent) => {
        let position = this.calculateCursorPosition(e);
        
        this.drawing = false;
        
        this.draw(this.activeButton);
    }
    
    private onCancelledHandler = () => {
        this.drawing = false;
        
        this.draw(this.activeButton);
    }
    
    private onChangeButtondHandler = (e) => {
        
        // Convert string identifier to an index
        let padIdentifier = +e.target.id.replace("pad", "")
        
        this.activeButton = padIdentifier;
        
        this.draw(this.activeButton);
        
        this.changeSelectedButton(padIdentifier);
    }
    
    // MARK: - Drawing
    
    /**
    Depending on whether we are manually drawing or not
    depends on which is the active layer
    */
    private draw(activeLayer:number) {
    
        let context = this.context;
        let canvas = this.canvas;
        
        context.rect(0, 0, canvas.width, canvas.height);
        context.fillStyle = this.canvasBackgroundColor;
        context.fill();
    
        let buttonDrawingsCount = this.buttonDrawings.length;
        for (let i = 0; i < buttonDrawingsCount; i++) {
            let buttonDrawing = this.buttonDrawings[i];
            buttonDrawing.draw(activeLayer == i, context);
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
    
    // MARK: - UI Button updates
    
    private changeSelectedButton(to) {
        for (let i = 0; i < this.maxButtons; i++) {  
            if (i != to) {
               document.getElementById('pad' + i).className = "inactive";
            } else {
              document.getElementById('pad' + i).className = "active";
            }
        }
    }
    
    // MARK: - Animation
    
    private playAnimation() {
        this.stopAnimation();
        this.activeAnimationLayer = 0;
        var localThis = this
        this.animationTimer = setInterval(function() {
            localThis.animateView(localThis);
        }, this.beatsPerMinuteInMiliseconds);
    }
    
    private stopAnimation() {
        clearInterval(this.animationTimer);
        this.animationTimer = undefined;
        this.changeSelectedButton(this.activeButton);
    }
    
    private animateView(executer) {
    
        executer.draw(this.activeAnimationLayer);

        executer.changeSelectedButton(this.activeAnimationLayer);

        executer.activeAnimationLayer = this.activeAnimationLayer + 1;

        if (executer.activeAnimationLayer > executer.maxButtons) {
            executer.activeAnimationLayer = 0;
        }
    }
}

new PocketOperatorIDApp();