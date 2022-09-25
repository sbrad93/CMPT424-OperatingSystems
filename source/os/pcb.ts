module TSOS {

    export class PCB {

        public pid: number = 0;

        constructor(_pid,
                    public state: string = "ready",
                    public PC: number = 0x00,
                    public acc: number = 0x00,
                    public Xreg: number = 0x00,
                    public Yreg: number = 0x00,
                    public Zflag: number = 0x00,
                    public isExecuting: boolean = false,
                    public instructionReg: number = 0x00) {

            this.pid = _pid;
        }
    }
}