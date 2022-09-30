/* ------------
     Control.ts

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {

    export class Control {

        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }

            // Display current DateTime and updates every second.
            const setDate = setInterval(this.refreshTime, 1000);

            // Check if kernel trapped an OS error
            document.addEventListener("keydown", function(event) {
                if (event.key === "Enter") {
                    if (Kernel.isShutdown) {
                        location.reload();
                    }
                }
            });
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;

            // TODO in the future: Optionally update a log database or some streaming service.
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.

            // Create and initialize our memory prototype
            _Memory = new Memory();
            _Memory.arrInit();

            // Create the Memory Accessor
            _MemAccessor = new MemAccessor();
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload();
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }

        public static refreshTime(): void {
            // Create new Date object and properly format string value
            var dateDisplay = <HTMLInputElement> document.getElementById("datetime");
            var dt = new Date();
            var dateString = dt.toLocaleString();

            dateString = dateString.replace(", ", " - ");
            dateDisplay.innerHTML = dateString;
        }

        public static setStatus(msg): void {
            // Displays user-defined status message
            var statusEle = <HTMLInputElement> document.getElementById("status");
            statusEle.innerHTML = msg;
        }

        public static getOpCodes(): string {
            // Loads valid hex codes in the console

            var _input = <HTMLInputElement> document.getElementById("taProgramInput");

            // Remove whitespace
            _input.value = (_input.value).replace(/\s+/g, '');

            // Make op codes upper case for formatting purposes
            _input.value = _input.value.toUpperCase();

            // Remove leading and trailing whitespace
            _input.value = _input.value.trim();

            // Check if op codes are valid
            var opcode_str = Control.validateUserInput(_input.value);

            // Reset textarea value
            _input.value = "";

            return opcode_str;
        }

        public static validateUserInput(str): string {
            // Digits must be hex and in pairs
            if (str != "") {
                if ((isHex(str)) && (str.length%2==0)) {
                    return str;
                } else {
                    _StdOut.putText("Invalid op code(s). Try again :/");
                    return null;
                }
            } else {
                _StdOut.putText("Nothing to load, sir.");
                return null;
            }

            function isHex(hex_str) {
                // Checks if valid hex value
                // Since toString(16) loses precision after a certain amount of digits, I decided to convert opcodes individually

                hex_str = hex_str.toLowerCase();

                // Regex that splits hex string into a list of individual op codes
                var opCodes = hex_str.match(/.{1,2}/g);

                for (var i=0; i<opCodes.length; i++) {
                    var temp = parseInt(opCodes[i], 16);

                    if ((opCodes[i].startsWith("0")) && (temp.toString(16) === opCodes[i].slice(-1))) {     // case of a single int that lost leading zero
                        // keep looping
                    } else if (temp.toString(16) === opCodes[i]) {
                        // keep looping
                    } else {
                        return false;
                    }
                }
                return true;
            }
        }

        public static updatePCBtable(currPID: number) {
            // Updates the cell values in the Processes table

            const table = <HTMLTableElement> document.getElementById("pcb-table");

            const pid = table.rows[currPID+1].cells[0];
            const state = table.rows[currPID+1].cells[1];
            const seg = table.rows[currPID+1].cells[2];
            const pc = table.rows[currPID+1].cells[3];
            const ir = table.rows[currPID+1].cells[4];
            const acc = table.rows[currPID+1].cells[5];
            const x = table.rows[currPID+1].cells[6];
            const y = table.rows[currPID+1].cells[7];
            const z = table.rows[currPID+1].cells[8];

            pid.innerHTML = _CurrentPCB.pid+"";
            state.innerHTML = _CurrentPCB.state;
            seg.innerHTML = 0+"";
            pc.innerHTML = Utils.hexLog(_CPU.PC);
            ir.innerHTML = Utils.hexLog(_CPU.instructionReg);
            acc.innerHTML = Utils.hexLog(_CPU.acc);
            x.innerHTML = Utils.hexLog(_CPU.Xreg);
            y.innerHTML =Utils.hexLog(_CPU.Yreg);
            z.innerHTML = Utils.hexLog(_CPU.Zflag);
        }

        public static addRowToPCBTable() {
            // Creates a new row in the Processes table each time a new program is loaded into memory

            const table = <HTMLTableElement> document.getElementById("pcb-table");
            const row = table.insertRow(-1);

            const pid = row.insertCell(0);
            const state = row.insertCell(1);
            const seg = row.insertCell(2);
            const pc = row.insertCell(3);
            const ir = row.insertCell(4);
            const acc = row.insertCell(5);
            const x = row.insertCell(6);
            const y = row.insertCell(7);
            const z = row.insertCell(8);

            pid.innerHTML = _CurrentPCB.pid+"";
            seg.innerHTML = 0+"";
            pc.innerHTML = Utils.hexLog(0x00);
            ir.innerHTML = Utils.hexLog(0x00);
            acc.innerHTML = Utils.hexLog(0x00);
            x.innerHTML = Utils.hexLog(0x00);
            y.innerHTML =Utils.hexLog(0x00);
            z.innerHTML = Utils.hexLog(0x00);
            state.innerHTML = _CurrentPCB.state;
        }


    }
}
