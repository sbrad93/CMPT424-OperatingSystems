/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        // stack containing iterative 'images' of the console canvas
        static imgStack = [];
        // stack containing iterative instances of this.prevXPosition
        static positionStack = [];

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "",
                    public prevCanvas = null,
                    public prevXPosition = 0) {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        public clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        public resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                } else if (chr === '\b') {
                    if (this.buffer != "") {
                        // Remove the last letter from the buffer
                        this.buffer = this.buffer.slice(0, -1);

                        // Get the most recent canvas image iteration
                        this.prevCanvas = Console.imgStack.pop();

                        // Clear the canvas
                        this.clearScreen();

                        // Replace the current canvas image
                        _DrawingContext.putImageData(this.prevCanvas, 0, 0);

                        // Update the x position
                        this.currentXPosition = Console.positionStack.pop();
                    }
                } else if (chr === '\t') {
                    this.chkCommandCompletion(this.buffer);
                } else {
                    if (chr != '\0') {
                        // This is a "normal" character, so ...
                        // ... draw it on the screen...
                        this.putText(chr);

                        // ... and add it to our buffer.
                        this.buffer += chr;
                    }
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        }

        public putText(text): void {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.

                // Capture the canvas image data
                // Push this image data to the stack
                this.prevCanvas = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height);
                Console.imgStack.push(this.prevCanvas);

                // Update previous x position
                // Push this position to the stack
                this.prevXPosition = this.currentXPosition;
                Console.positionStack.push(this.prevXPosition);

                // Draw the new letter
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);

                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
         }

        public advanceLine(): void {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize + 
                                     _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                                     _FontHeightMargin;

            // TODO: Handle scrolling. (iProject 1)
        }

        public chkCommandCompletion(_buffer): void {
            var possMatches = []

            // Check if current buffer is a beginning substring of any shell commands
            for (var i in _OsShell.commandList) {
                if (_OsShell.commandList[i].command.startsWith(_buffer)) {
                    possMatches.push(_OsShell.commandList[i].command);
                }
            }

            // Action is only taken if there's one potential match
            if (possMatches.length == 1) {
                // Get the remaining letters of potential command match
                var remaining = possMatches[0].slice(_buffer.length);

                // Print remaining letters and add to input buffer
                for (var i in remaining) {
                    this.putText(remaining[i]);
                    this.buffer += remaining[i];
                }
            }
        }
    }
 }
