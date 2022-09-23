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
                    public step: number = 0x00,
                    public clockCnt: number = 0) {

        }

        public init(): void {
            this.PC = 0x00;
            this.acc = 0x00;
            this.Xreg = 0x00;
            this.Yreg = 0x00;
            this.Zflag = 0x00;
            this.isExecuting = false;
            this.instructionReg = 0x00;
            this.step = 0x00;
            this.clockCnt = 0;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            this.clockCnt++;

            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.

            // evaluates based on the current step in the instruction cycle
            //      0: Fetch
            //      1: Decode
            //      2: Decode 2
            //      3: Execute
            //      4: Execute 2
            //      5: Write to Memory
            //      6: Interrupt Check

            switch (this.step) {

                // fetch
                case 0:
                    this.instructionReg = _Memory.getMemArr()[this.PC];
                    this.step = 1;
                    this.PC ++;

                    console.log("PC: " + this.PC);
                    console.log("Instruction Reg: " + Utils.hexLog(this.instructionReg));
                    break;

                //decode
                case 1:
                    //load accumulator with a constant
                    if (this.instructionReg == 0xA9) {
                        this.acc = _Memory.getMemArr()[this.PC];
                        this.step = 6;
                        this.PC ++;

                        console.log("PC: " + this.PC);
                        console.log("Instruction Reg: " + Utils.hexLog(this.instructionReg));
                        console.log("Acc: " + this.acc);
                        break;
                    }
            }
        }

        public test() {
            _MMU.writeImmmediate(0x0000, 0xA9);
            _MMU.writeImmmediate(0x0001, 0x02);
            _MemAccessor.displayMemory(0x11);
        }

    }
}
