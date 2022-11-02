/* ----------- 
    PCB.ts

    Class constructor for Process Control Block. 
    ----------- */

module TSOS {

    export class PCB {

        public pid: number = 0;

        constructor(_pid,
                    public state: string = "resident",
                    public PC: number = 0x00,
                    public acc: number = 0x00,
                    public Xreg: number = 0x00,
                    public Yreg: number = 0x00,
                    public Zflag: number = 0x00,
                    public isExecuting: boolean = false,
                    public instructionReg: number = 0x00,
                    public assignedSegment: MemorySegment = null,
                    public waitingCycles: number = 0,
                    public turnAroundCycles: number = 0) {

            this.pid = _pid;
        }
    }
}