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

            // .. enable the Halt, Reset, and Single Step buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnToggleSingleStep")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // Create and initialize our memory prototype
            _Memory = new Memory();
            _Memory.arrInit();

            // Create the Memory Accessor
            _MemAccessor = new MemAccessor();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.
            
            // Display empty memory
            Control.updateMemoryOutput();
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            (<HTMLButtonElement> document.getElementById("btnHaltOS")).style.backgroundColor = "red";
            Kernel.isShutdown = true;
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

        public static hostBtnToggleSingleStep_click(btn): void {
            if ((<HTMLButtonElement> document.getElementById("btnToggleSingleStep")).value == "Single Step Off") {
                (<HTMLButtonElement> document.getElementById("btnToggleSingleStep")).value = "Single Step On";
                (<HTMLButtonElement> document.getElementById("btnToggleSingleStep")).style.backgroundColor = "#3e8e41";
                (<HTMLButtonElement> document.getElementById("btnNextStep")).disabled = false;
                (<HTMLButtonElement> document.getElementById("btnNextStep")).value = "Step >>";
                _IsSingleStep = true;
            } else {
                (<HTMLButtonElement> document.getElementById("btnToggleSingleStep")).value = "Single Step Off";
                (<HTMLButtonElement> document.getElementById("btnToggleSingleStep")).style.backgroundColor = "white";
                (<HTMLButtonElement> document.getElementById("btnNextStep")).disabled = true;
                (<HTMLButtonElement> document.getElementById("btnNextStep")).value = "Step";
                _IsSingleStep = false;
            }
            
        }

        public static hostBtnNextStep_click(btn): void {
            _CanTakeNextStep = true;
        }

        public static turnOffSingleStep() {
            (<HTMLButtonElement> document.getElementById("btnToggleSingleStep")).value = "Single Step Off";
            (<HTMLButtonElement> document.getElementById("btnToggleSingleStep")).style.backgroundColor = "white";
            (<HTMLButtonElement> document.getElementById("btnNextStep")).disabled = true;
            (<HTMLButtonElement> document.getElementById("btnNextStep")).value = "Step";
            _IsSingleStep = false;
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
                _StdOut.putText("Nothing to load. Seriously...");
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

        public static updateCPUtable(): void {
            // Updates the cell values in the CPU table

            const table = <HTMLTableElement> document.getElementById("cpu-table");

            const pc = table.rows[1].cells[0];
            const ir = table.rows[1].cells[1];
            const acc = table.rows[1].cells[2];
            const x = table.rows[1].cells[3];
            const y = table.rows[1].cells[4];
            const z = table.rows[1].cells[5];

            pc.style.borderRight = "1px solid white";
            ir.style.borderRight = "1px solid white";
            acc.style.borderRight = "1px solid white";
            x.style.borderRight = "1px solid white";
            y.style.borderRight = "1px solid white";

            pc.innerHTML = Utils.hexLog(_CPU.PC);
            ir.innerHTML = Utils.hexLog(_CPU.instructionReg);
            acc.innerHTML = Utils.hexLog(_CPU.acc);
            x.innerHTML = Utils.hexLog(_CPU.Xreg);
            y.innerHTML =Utils.hexLog(_CPU.Yreg);
            z.innerHTML = Utils.hexLog(_CPU.Zflag);
        }

        public static updatePCBtable(currPID: number): void {
            // Updates the cell values in the Processes table

            const table = <HTMLTableElement> document.getElementById("pcb-table");

            const pid = table.rows[currPID+1].cells[0];
            const state = table.rows[currPID+1].cells[1];
            const pc = table.rows[currPID+1].cells[2];
            const ir = table.rows[currPID+1].cells[3];
            const acc = table.rows[currPID+1].cells[4];
            const x = table.rows[currPID+1].cells[5];
            const y = table.rows[currPID+1].cells[6];
            const z = table.rows[currPID+1].cells[7];

            pid.innerHTML = _CurrentPCB.pid+"";
            state.innerHTML = _CurrentPCB.state;
            pc.innerHTML = Utils.hexLog(_CPU.PC);
            ir.innerHTML = Utils.hexLog(_CPU.instructionReg);
            acc.innerHTML = Utils.hexLog(_CPU.acc);
            x.innerHTML = Utils.hexLog(_CPU.Xreg);
            y.innerHTML =Utils.hexLog(_CPU.Yreg);
            z.innerHTML = Utils.hexLog(_CPU.Zflag);
        }

        public static updatePCBStateInTable(pid: number, state_str: string): void {
            const table = <HTMLTableElement> document.getElementById("pcb-table");
            const state = table.rows[pid+1].cells[1];
            state.innerHTML = state_str;
        }

        public static addRowToPCBTable(): void {
            // Creates a new row in the Processes table each time a new program is loaded into memory

            const table = <HTMLTableElement> document.getElementById("pcb-table");
            const row = table.insertRow(-1);

            const pid = row.insertCell(0);
            const state = row.insertCell(1);
            const pc = row.insertCell(2);
            const ir = row.insertCell(3);
            const acc = row.insertCell(4);
            const x = row.insertCell(5);
            const y = row.insertCell(6);
            const z = row.insertCell(7);

            pid.style.borderRight = "1px solid white";
            state.style.borderRight = "1px solid white";
            pc.style.borderRight = "1px solid white";
            ir.style.borderRight = "1px solid white";
            acc.style.borderRight = "1px solid white";
            x.style.borderRight = "1px solid white";
            y.style.borderRight = "1px solid white";

            pid.innerHTML = _CurrentPCB.pid+"";
            state.innerHTML = _CurrentPCB.state;
            pc.innerHTML = Utils.hexLog(0x00);
            ir.innerHTML = Utils.hexLog(0x00);
            acc.innerHTML = Utils.hexLog(0x00);
            x.innerHTML = Utils.hexLog(0x00);
            y.innerHTML =Utils.hexLog(0x00);
            z.innerHTML = Utils.hexLog(0x00);
        }

        public static updateMemoryOutput(): void {
            var table = <HTMLTableElement> document.getElementById("memory-table");
            var rowByte = 0x00;
            let i = 0;

            // Since memory is actively changing,
            // delete all rows first...
            while(table.rows.length > 0) {
                table.deleteRow(0);
            }

            while (i<_Memory.memSize) {
                let row = table.insertRow(-1);
                let byteVal = row.insertCell(0);
                let bit = null;

                byteVal.style.backgroundColor = "#087098";
                byteVal.style.borderRadius = "15px";
                byteVal.innerHTML = '0x' + ('00' + rowByte.toString(16).toUpperCase()).slice(-3);

                // Base case
                if (i == 0x00) {
                    bit = row.insertCell(-1);
                    bit.style.borderRight = "1px solid white";
                    bit.innerHTML = Utils.hexLog(_Memory.memArr[i]).slice(-2);
                    i++;
                }

                // Loop through each byte
                let k = 1;
                while (k%8 != 0) {
                    bit = row.insertCell(-1);
                    bit.style.borderRight = "1px solid white";
                    bit.innerHTML = Utils.hexLog(_Memory.memArr[i]).slice(-2);
                    i++;

                    // Edge cases -- Include the 8th element of each row before loop terminates
                    if (k==7 && i!=8) {
                        bit = row.insertCell(-1);
                        bit.style.borderRight = "1px solid white";
                        bit.innerHTML = Utils.hexLog(_Memory.memArr[i]).slice(-2);
                        i++;
                    }
                    k++;
                }
                
                // Add empty row in between memory segments
                if (rowByte == 0x0F8 || rowByte == 0x1F8) {
                    row = table.insertRow(-1);
                    byteVal = row.insertCell(0);
                    byteVal.innerHTML = "-------";
                }

                rowByte += 0x08;
            }
        }

        public static addRowToReadyQueueTable():void {
            // Creates a new row in the Ready Queue table each time a new program is run

            const table = <HTMLTableElement> document.getElementById("queue-table");
            const row = table.insertRow(-1);

            const state = row.insertCell(0);
            const location = row.insertCell(1);
            const base = row.insertCell(2);
            const limit = row.insertCell(3);
            const segment = row.insertCell(4);
            const priority = row.insertCell(5);
            const quantum = row.insertCell(6);

            state.style.borderRight = "1px solid white";
            location.style.borderRight = "1px solid white";
            base.style.borderRight = "1px solid white";
            limit.style.borderRight = "1px solid white";
            segment.style.borderRight = "1px solid white";
            priority.style.borderRight = "1px solid white";

            state.innerHTML = _CurrentPCB.state+"";
            location.innerHTML = "memory";
            base.innerHTML = Utils.hexLog(_CurrentPCB.assignedSegment.base);
            limit.innerHTML = Utils.hexLog(_CurrentPCB.assignedSegment.limit);
            segment.innerHTML = _CurrentPCB.assignedSegment.sid+"";
            priority.innerHTML = "";
            quantum.innerHTML = _Scheduler.quantum+"";
        }

        public static updateReadyQueueTable():void {
            // Updates the cell values in the Ready Queue table

            const table = <HTMLTableElement> document.getElementById("queue-table");

            // Since the ready queue size is actively changing,
            // delete all rows first...
            while(table.rows.length > 1) {
                table.deleteRow(1);
            }

            // ... then recreate new rows according to the processes currently in the queue
            let i = 0;
            while (i < _Scheduler.readyQueue.getSize()) {
                const row = table.insertRow(-1);

                const state = row.insertCell(0);
                const location = row.insertCell(1);
                const base = row.insertCell(2);
                const limit = row.insertCell(3);
                const segment = row.insertCell(4);
                const priority = row.insertCell(5);
                const quantum = row.insertCell(6);

                state.style.borderRight = "1px solid white";
                location.style.borderRight = "1px solid white";
                base.style.borderRight = "1px solid white";
                limit.style.borderRight = "1px solid white";
                segment.style.borderRight = "1px solid white";
                priority.style.borderRight = "1px solid white";

                state.innerHTML = _Scheduler.readyQueue.getAt(i).state+"";
                location.innerHTML = "memory";
                base.innerHTML = Utils.hexLog(_Scheduler.readyQueue.getAt(i).assignedSegment.base);
                limit.innerHTML = Utils.hexLog(_Scheduler.readyQueue.getAt(i).assignedSegment.limit);
                segment.innerHTML = _Scheduler.readyQueue.getAt(i).assignedSegment.sid+"";
                priority.innerHTML = "";
                quantum.innerHTML = _Scheduler.quantum+"";

                i++;
            }
        }
    }
}

// // Base case
// if (j==0) {
//     console.log("base case")
//     bit = row.insertCell(-1);
//     bit.style.borderRight = "1px solid white";
//     bit.innerHTML = Utils.hexLog(_Memory.memArr[j]).slice(-2);
//     j++;
//     console.log(j)
// }

// // Loop through each byte
// console.log("start loop")
// while (j%8 != 0) {
//     bit = row.insertCell(-1);
//     bit.style.borderRight = "1px solid white";
//     bit.innerHTML = Utils.hexLog(_Memory.memArr[j]).slice(-2);

//     // Prevent very last bit from being skipped
//     // if (j == _Memory.memSize-1) {
//     //     bit = row.insertCell(-1);
//     //     bit.style.borderRight = "1px solid white";
//     //     bit.innerHTML = Utils.hexLog(_Memory.memArr[j]).slice(-2);
//     // }
//     j++;
//     console.log(j)
// }
// console.log("end loop")

// // Edge cases
// // if (j!= _Memory.memSize && j!=8) {
// //     console.log(j)
// //     bit = row.insertCell(-1);
// //     bit.style.borderRight = "1px solid white";
// //     bit.innerHTML = Utils.hexLog(_Memory.memArr[j]).slice(-2);
// // }