/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0x00,
                    public acc: number = 0x00,
                    public Xreg: number = 0x00,
                    public Yreg: number = 0x00,
                    public Zflag: number = 0x00,
                    public isExecuting: boolean = false,
                    public instructionReg: number = 0x00,
                    public clockCnt: number = 0,
                    public currentPCB: PCB = new PCB(_PidCounter),
                    // for testing purposes
                    public out: string = "") {
        }

        public init(): void {
            this.PC = 0x00;
            this.acc = 0x00;
            this.Xreg = 0x00;
            this.Yreg = 0x00;
            this.Zflag = 0x00;
            this.isExecuting = false;
            this.instructionReg = 0x00;
            this.clockCnt = 0;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            _CurrentPCB.state = "running";
            this.clockCnt++;
            this.fetch();
            this.decodeNExecute();

            // browser console logging
            this.cpuLog();

            // update Processes table, CPU table, and Memory table at the end of each cpu cycle
            Control.updatePCBtable(_CurrentPCB.pid);
            Control.updateCPUtable();
            Control.updateMemoryOutput();

            if (_IsSingleStep) {
                // check if in single step mode
                _CanTakeNextStep = false;
            }
        }

        public fetch() {
            this.instructionReg = _MemoryManager.getMemArr()[this.PC + _CurrentPCB.assignedSegment.base];
        }

        public decodeNExecute() {
            switch(this.instructionReg) {
                case 0xA9:
                    this.loadAccWConstant();
                    break;
                case 0xAD:
                    this.loadAccFromMemory();
                    break;
                case 0x8D:
                    this.storeAccInMemory();
                    break;
                case 0x6D:
                    this.addWithCarry();
                    break;
                case 0xA2:
                    this.loadXWithConstant();
                    break;
                case 0xAE:
                    this.loadXFromMemory();
                    break;
                case 0xA0:
                    this.loadYWithConstant();
                    break;
                case 0xAC:
                    this.loadYFromMemory();
                    break;
                case 0xEA:
                    this.noOp();
                    break;
                case 0x00:
                    this.brk();
                    break;
                case 0xEC:
                    this.compareWithX();
                    break;
                case 0xD0:
                    this.branch();
                    break;
                case 0xEE:
                    this.increment();
                    break;
                case 0xFF:
                    this.sysCall();
                    break;
                default:
                    this.isExecuting = false;
                    _CurrentPCB.state = "terminated";
                    _StdOut.advanceLine();
                    _StdOut.putText(`Process ${_CurrentPCB.pid}: Invalid Op Code Error.`);
                    _StdOut.advanceLine();
                    _StdOut.putText("CPU stopped and process terminated.");
                    _StdOut.advanceLine();
                    _OsShell.putPrompt();
            }
        }

        // A9
        public loadAccWConstant() {
            this.PC ++;
            this.acc = _MemoryManager.getMemArr()[this.PC + _CurrentPCB.assignedSegment.base];
            this.PC ++;
        }
        // AD
        public loadAccFromMemory() {
            this.PC ++;
            _MemoryManager.calcMAR(this.PC + _CurrentPCB.assignedSegment.base);
            this.PC ++;
            this.PC ++;
            _MemAccessor.read();
            this.acc = _MemoryManager.getMDR();
        }
        // 8D
        public storeAccInMemory() {
            this.PC ++;
            _MemoryManager.calcMAR(this.PC + _CurrentPCB.assignedSegment.base);
            this.PC ++;
            this.PC ++;
            _MemoryManager.setMDR(this.acc);
            _MemAccessor.write();
        }
        // 6D
        public addWithCarry() {
            this.PC ++;
            _MemoryManager.calcMAR(this.PC + _CurrentPCB.assignedSegment.base);
            this.PC ++;
            this.PC ++;
            _MemAccessor.read();
            this.acc += _MemoryManager.getMDR();
        }
        // A2
        public loadXWithConstant() {
            this.PC ++;
            this.Xreg = _MemoryManager.getMemArr()[this.PC + _CurrentPCB.assignedSegment.base];
            this.PC ++;
        }
        // AE
        public loadXFromMemory() {
            this.PC ++;
            _MemoryManager.calcMAR(this.PC + _CurrentPCB.assignedSegment.base);
            this.PC ++;
            this.PC ++;
            _MemAccessor.read();
            this.Xreg = _MemoryManager.getMDR();
        }
        // A0
        public loadYWithConstant() {
            this.PC ++;
            this.Yreg = _MemoryManager.getMemArr()[this.PC + _CurrentPCB.assignedSegment.base];
            this.PC ++;
        }
        // AC
        public loadYFromMemory() {
            this.PC ++;
            _MemoryManager.calcMAR(this.PC + _CurrentPCB.assignedSegment.base);
            this.PC ++;
            this.PC ++;
            _MemAccessor.read();
            this.Yreg = _MemoryManager.getMDR();
        }
        // EA
        public noOp() {
            this.PC ++;
        }
        // 00
        public brk() {
            this.PC ++;
            this.isExecuting = false;
            this.out = "";

            // Current process is now terminated so...
            _CurrentPCB.state = "terminated";
            // ...the assigned segment can now be reused
            _CurrentPCB.assignedSegment.isActive = false;

            // Single step mode turned off once program executes
            Control.turnOffSingleStep();

            _StdOut.advanceLine();
            _StdOut.putText("Execution completed.")
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        }
        // EC
        public compareWithX() {
            this.PC ++;
            _MemoryManager.calcMAR(this.PC + _CurrentPCB.assignedSegment.base);
            this.PC ++;
            this.PC ++;
            _MemAccessor.read();
            if (this.Xreg == _MemoryManager.getMDR()) {
                this.Zflag = 0x01;
            } else {
                this.Zflag = 0x00;
            }
        }
        // D0
        public branch() {
            this.PC++;
            if (this.Zflag == 0) {
                _MemoryManager.setMAR(this.PC + _CurrentPCB.assignedSegment.base);
                _MemAccessor.read();
                this.PC += _MemoryManager.getMDR();
                if (this.PC > 0x100) {
                    this.PC = (this.PC % 0x100);
                }
            }
            this.PC++;
        }
        // EE
        public increment() {
            this.PC ++;
            _MemoryManager.calcMAR(this.PC + _CurrentPCB.assignedSegment.base);
            this.PC ++;
            this.PC ++;
            _MemAccessor.read();
            this.acc = _MemoryManager.getMDR();
            this.acc ++;
            _MemoryManager.setMDR(this.acc);
            _MemAccessor.write();
        }
        // FF
        public sysCall() {
            this.PC ++;
            if (this.Xreg == 0x01) {                                                // prints integer in y register
                _StdOut.putText(this.Yreg.toString(16));
                this.out += this.Yreg.toString(16);
            } else if (this.Xreg == 0x02) {                                         // prints 0x00 terminated string stored at address in y register;
                // location in memory where string begins
                let startingPoint = this.Yreg;
                let output = "";
                for (let i=_CurrentPCB.assignedSegment.base; i+startingPoint < _Memory.memSize; i++) {
                    // loop until string is terminated with 0x00
                    let byte = _MemoryManager.getMemArr()[startingPoint+i];
                    if (byte == 0x00) {
                        break;
                    } else {
                        output += String.fromCharCode(byte);
                    }
                }
                // print output to console and reset y register
                _StdOut.putText(output);
                this.out += output;
                this.Yreg = 0x00;
            } 
        }

        public cpuLog() {
            //logging information for each member of CPU class
            console.log("PC: " + Utils.hexLog(this.PC) + "\n" +
                        "IR: " + Utils.hexLog(this.instructionReg) + "\n" +
                        "Acc: " + Utils.hexLog(this.acc) + "\n" +
                        "xReg: " + Utils.hexLog(this.Xreg) + "\n" +
                        "yReg: " + Utils.hexLog(this.Yreg) + "\n" +
                        "zFlag: " + Utils.hexLog(this.Zflag) + "\n" +
                        "Out: " + this.out);
            console.log("---------------------------------------");
        }
    }
}
