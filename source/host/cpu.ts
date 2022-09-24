/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5

     Nearly all of this code was used in my Org and Arch project. Glad I didn't have to write it twice.
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
                    public clockCnt: number = 0,
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
            this.step = 0x00;
            this.clockCnt = 0;
            this.out = "";
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
                    this.instructionReg = _MMU.getMemArr()[this.PC];
                    this.step = 1;
                    this.PC ++;
                    break;

                //decode
                case 1:
                    if (this.instructionReg == 0xA9) {              // A9: load accumulator with a constant
                        this.acc = _MMU.getMemArr()[this.PC];
                        this.step = 6;
                        this.PC ++;
                    } else if ((this.instructionReg == 0x8D)  ||    // 8D: store accumulator in memory
                                (this.instructionReg == 0x6D) ||    // 6D: add with carry
                                (this.instructionReg == 0xAC) ||    // AC: load the y register from memory
                                (this.instructionReg == 0xAD) ||    // AD: load the accumulator from memory
                                (this.instructionReg == 0xAE) ||    // AE: load the x register from memory
                                (this.instructionReg == 0xEC) ||    // EC: compare byte in memory to x register
                                (this.instructionReg == 0xEE)) {    // EE: increment the value of a byte
                        _MMU.setMAR(0x00);
                        _MMU.setLowOrderByte(_MMU.getMemArr()[this.PC]);
                        this.step = 2;
                        this.PC ++;
                    } else if (this.instructionReg == 0x8A) {       // 8A: load the accumulator from x register
                        this.acc = this.Xreg;
                        this.step = 6;
                    } else if (this.instructionReg == 0x98) {       // 98: load the accumulator from y register
                        this.acc = this.Yreg;
                        this.step = 6;
                    } else if (this.instructionReg == 0xA2) {       // A2: load x register with a constant
                        this.Xreg = _MMU.getMemArr()[this.PC];
                        this.step = 6;
                        this.PC ++;
                    } else if (this.instructionReg == 0xA0) {       // A0: load y register with a constant
                        this.Yreg = _MMU.getMemArr()[this.PC];
                        this.step = 6;
                        this.PC ++;
                    } else if (this.instructionReg == 0xAA) {       // AA: load x register from the accumulator
                        this.Xreg = this.acc;
                        this.step = 6;
                    } else if (this.instructionReg == 0xA8) {       // A8: load y register from the accumulator
                        this.Yreg = this.acc;
                        this.step = 6;
                    } else if (this.instructionReg == 0xD0) {       // D0: branch n bytes if zflag = 0
                        if (this.Zflag == 0) {
                            _MMU.modMAR(this.PC);
                            this.step = 3;
                        }
                        else {
                            this.step = 6;
                        }
                        this.PC ++;
                    } else if (this.instructionReg == 0xEA) {       // EA: no operation
                        this.step = 6;
                        this.PC ++;
                    } else if (this.instructionReg == 0xFF) {       // FF: system call
                        if (this.Xreg == 0x01) {                    // prints integer in y register
                            this.step = 3;
                        } else if (this.Xreg == 0x02) {             // prints 0x00 terminated string stored at address in y register
                            this.PC = this.Yreg;
                            this.step = 6;
                        } else if (this.Xreg == 0x03) {             // prints 0x00 terminated string stored from the adress in operand
                            _MMU.setMAR(0x00);
                            _MMU.setLowOrderByte(_MMU.getMemArr()[this.PC]);
                            this.step = 2;
                            this.PC ++;
                        }
                        
                    } else if (this.instructionReg == 0x00) {       // 00: break
                        this.isExecuting = false;
                    } else {
                        this.out += String.fromCharCode(this.instructionReg);
                        this.step = 6;
                    }
                    break;
                // decode 2
                case 2:
                    _MMU.setHighOrderByte(_MMU.getMemArr()[this.PC]);
                    this.PC ++;
                    this.step = 3;
                    break;
                
                //execute
                case 3:
                    if (this.instructionReg == 0x8D) {              // 8D: store the accumulator in memory
                        _MMU.setMDR(this.acc);
                        _MemAccessor.write();
                    } else if (this.instructionReg == 0x6D) {       // 6D: add with carry -- adds contents of memory address to accumulator, keeps result in accumulator
                        _MemAccessor.read();
                        this.acc += _MMU.getMDR();
                    } else if (this.instructionReg == 0xAC) {       // AC: load y register from memory
                        _MemAccessor.read();
                        this.Yreg = _MMU.getMDR();
                    } else if ((this.instructionReg == 0xAD) ||     // AD: load accumulator from memory
                                (this.instructionReg == 0xEE)) {    // EE: increment the value of a byte
                        _MemAccessor.read();
                        this.acc = _MMU.getMDR();
                    } else if (this.instructionReg == 0xAE) {       // AE: load x register from memory
                        _MemAccessor.read();
                        this.Xreg = _MMU.getMDR();
                    } else if (this.instructionReg == 0xEC) {       // EC: compare byte in memory to x register
                        _MemAccessor.read();
                        if (this.Xreg == _MMU.getMDR()) {
                            this.Zflag = 0x01;
                        }
                    } else if (this.instructionReg == 0xD0) {       // D0: branch n bytes if zflag = 0
                        _MemAccessor.read();
                        this.PC = this.offset(_MMU.getMDR());
                    } else if (this.instructionReg == 0xFF) {       // FF: system call
                        if (this.Xreg == 0x01) {
                            this.out+=this.Yreg.toString(16);
                        } else if (this.Xreg == 0x03) {
                            this.PC = _MMU.getMAR();
                        }
                        this.step = 6;
                    }

                    if (this.instructionReg == 0xEE) {              // EE: increment the value of a byte (requires second execute)
                        this.step = 4;
                    } else {
                        this.step = 6;
                    }
                    break;

            //execute 2
            case 4:
                this.acc ++;
                this.step = 5;
                break;

            //write to memory
            case 5:
                _MMU.setMDR(this.acc);
                _MemAccessor.write();
                this.step = 6;
                break;

            //interrupt check
            case 6:
                this.step = 0;
                // this.intContr.checkInterrupts();
                break;
            }
            this.cpuLog();
        }

        //logging information for each member of CPU class
        public cpuLog() {
            console.log("PC: " + Utils.hexLog(this.PC) + "\n" +
                        "IR: " + Utils.hexLog(this.instructionReg) + "\n" +
                        "Acc: " + Utils.hexLog(this.acc) + "\n" +
                        "xReg: " + Utils.hexLog(this.Xreg) + "\n" +
                        "yReg: " + Utils.hexLog(this.Yreg) + "\n" +
                        "zFlag: " + Utils.hexLog(this.Zflag) + "\n" +
                        "Step: " + Utils.hexLog(this.step) + "\n" +
                        "Out: " + this.out);
            console.log("---------------------------------------");
        }

        //returns loop start value from given offset value
        //used with branching (BNE)
        public offset(offVal : number) : number{
            let start : number;
            let start_str : string;
            
            //two's comp :))))
            //separate rightmost bits
            start = (~offVal)+1>>>0;

            //slice off the last two bytes and convert back to numeric
            start_str = start.toString(2).slice(start.toString(2).length-8);
            start = parseInt(start_str, 2);

            //subtract from current program count
            start = this.PC - start;

            return start;
        }



        /* ------------
            6502 Test Programs!!

            I wrote these nearly a year ago.
            Trying to understand what they mean again was fun.
            Brain damage: acquired
        -------------- */

        // program that adds 2 + 2
        // output: 4
        public basicAdd() {
            _MMU.writeImmmediate(0x0000, 0xA9);
            _MMU.writeImmmediate(0x0001, 0x02);

            _MMU.writeImmmediate(0x0002, 0x8D);
            _MMU.writeImmmediate(0x0003, 0x14);
            _MMU.writeImmmediate(0x0004, 0x00);

            _MMU.writeImmmediate(0x0005, 0x6D);
            _MMU.writeImmmediate(0x0006, 0x14);
            _MMU.writeImmmediate(0x0007, 0x00);

            _MMU.writeImmmediate(0x0008, 0xA2);
            _MMU.writeImmmediate(0x0009, 0x01);

            _MMU.writeImmmediate(0x000A, 0xA8);

            _MMU.writeImmmediate(0x000B, 0xFF);
            _MMU.writeImmmediate(0x000C, 0x00);
        }

        //program that prints powers of two up to 2^3
        //output: 1248
        public powersOfTwo() {
            _MMU.writeImmmediate(0x0000, 0xA9);
            _MMU.writeImmmediate(0x0001, 0x10);

            _MMU.writeImmmediate(0x0002, 0x8D);
            _MMU.writeImmmediate(0x0003, 0x31);
            _MMU.writeImmmediate(0x0004, 0x00);

            _MMU.writeImmmediate(0x0005, 0xA9);
            _MMU.writeImmmediate(0x0006, 0x01);

            _MMU.writeImmmediate(0x0007, 0x8D);
            _MMU.writeImmmediate(0x0008, 0x30);
            _MMU.writeImmmediate(0x0009, 0x00);

            _MMU.writeImmmediate(0x000A, 0xAC);
            _MMU.writeImmmediate(0x000B, 0x30);
            _MMU.writeImmmediate(0x000C, 0x00);

            _MMU.writeImmmediate(0x000D, 0xA2);
            _MMU.writeImmmediate(0x000E, 0x01);

            _MMU.writeImmmediate(0x000F, 0xFF);

            _MMU.writeImmmediate(0x0010, 0xAD);
            _MMU.writeImmmediate(0x0011, 0x30);
            _MMU.writeImmmediate(0x0012, 0x00);

            _MMU.writeImmmediate(0x0013, 0x6D);
            _MMU.writeImmmediate(0x0014, 0x30);
            _MMU.writeImmmediate(0x0015, 0x00);

            _MMU.writeImmmediate(0x0016, 0x8D);
            _MMU.writeImmmediate(0x0017, 0x30);
            _MMU.writeImmmediate(0x0018, 0x00);

            _MMU.writeImmmediate(0x0019, 0xAE);
            _MMU.writeImmmediate(0x001A, 0x30);
            _MMU.writeImmmediate(0x001B, 0x00);

            _MMU.writeImmmediate(0x001C, 0xEC);
            _MMU.writeImmmediate(0x001D, 0x31);
            _MMU.writeImmmediate(0x001E, 0x00);

            _MMU.writeImmmediate(0x001F, 0xD0);
            _MMU.writeImmmediate(0x0020, 0xE9);

            _MMU.writeImmmediate(0x0021, 0x00);
        }

        //program that prints powers of three up to 3^2
        //output: 139
        public powersOfThree() {
            _MMU.writeImmmediate(0x0000, 0xA9);
            _MMU.writeImmmediate(0x0001, 0x1B);

            _MMU.writeImmmediate(0x0002, 0x8D);
            _MMU.writeImmmediate(0x0003, 0x31);
            _MMU.writeImmmediate(0x0004, 0x00);

            _MMU.writeImmmediate(0x0005, 0xA9);
            _MMU.writeImmmediate(0x0006, 0x01);

            _MMU.writeImmmediate(0x0007, 0x8D);
            _MMU.writeImmmediate(0x0008, 0x30);
            _MMU.writeImmmediate(0x0009, 0x00);

            _MMU.writeImmmediate(0x000A, 0xAC);
            _MMU.writeImmmediate(0x000B, 0x30);
            _MMU.writeImmmediate(0x000C, 0x00);

            _MMU.writeImmmediate(0x000D, 0xA2);
            _MMU.writeImmmediate(0x000E, 0x01);

            _MMU.writeImmmediate(0x000F, 0xFF);

            _MMU.writeImmmediate(0x0010, 0xAD);
            _MMU.writeImmmediate(0x0011, 0x30);
            _MMU.writeImmmediate(0x0012, 0x00);

            _MMU.writeImmmediate(0x0013, 0x6D);
            _MMU.writeImmmediate(0x0014, 0x30);
            _MMU.writeImmmediate(0x0015, 0x00);

            _MMU.writeImmmediate(0x0016, 0x6D);
            _MMU.writeImmmediate(0x0017, 0x30);
            _MMU.writeImmmediate(0x0018, 0x00);

            _MMU.writeImmmediate(0x0019, 0x8D);
            _MMU.writeImmmediate(0x001A, 0x30);
            _MMU.writeImmmediate(0x001B, 0x00);

            _MMU.writeImmmediate(0x001C, 0xAE);
            _MMU.writeImmmediate(0x001D, 0x30);
            _MMU.writeImmmediate(0x001E, 0x00);

            _MMU.writeImmmediate(0x001F, 0xEC);
            _MMU.writeImmmediate(0x0020, 0x31);
            _MMU.writeImmmediate(0x0021, 0x00);

            _MMU.writeImmmediate(0x0022, 0xD0);
            _MMU.writeImmmediate(0x0023, 0xE6);
            
            _MMU.writeImmmediate(0x0024, 0x00);
        }

        //program that tests increment instruction
        //output: 12345
        public increment() {
            _MMU.writeImmmediate(0x0000, 0xA9);
            _MMU.writeImmmediate(0x0001, 0x06);

            _MMU.writeImmmediate(0x0002, 0x8D);
            _MMU.writeImmmediate(0x0003, 0x31);
            _MMU.writeImmmediate(0x0004, 0x00);

            _MMU.writeImmmediate(0x0005, 0xA9);
            _MMU.writeImmmediate(0x0006, 0x01);

            _MMU.writeImmmediate(0x0007, 0x8D);
            _MMU.writeImmmediate(0x0008, 0x30);
            _MMU.writeImmmediate(0x0009, 0x00);

            _MMU.writeImmmediate(0x000A, 0xAC);
            _MMU.writeImmmediate(0x000B, 0x30);
            _MMU.writeImmmediate(0x000C, 0x00);

            _MMU.writeImmmediate(0x000D, 0xA2);
            _MMU.writeImmmediate(0x000E, 0x01);

            _MMU.writeImmmediate(0x000F, 0xFF);

            _MMU.writeImmmediate(0x0010, 0xEE);
            _MMU.writeImmmediate(0x0011, 0x30);
            _MMU.writeImmmediate(0x0012, 0x00);

            _MMU.writeImmmediate(0x0013, 0xAE);
            _MMU.writeImmmediate(0x0014, 0x30);
            _MMU.writeImmmediate(0x0015, 0x00);

            _MMU.writeImmmediate(0x0016, 0xEC);
            _MMU.writeImmmediate(0x0017, 0x31);
            _MMU.writeImmmediate(0x0018, 0x00);

            _MMU.writeImmmediate(0x0019, 0xD0);
            _MMU.writeImmmediate(0x001A, 0xEF);

            _MMU.writeImmmediate(0x001B, 0x00);
        }

        // output: Hi how are you???
        public sysCallTwo() {
            _MMU.writeImmmediate(0x0000, 0xA2);
            _MMU.writeImmmediate(0x0001, 0x02);
    
            _MMU.writeImmmediate(0x0002, 0xA0);
            _MMU.writeImmmediate(0x0003, 0x06);
    
            _MMU.writeImmmediate(0x0004, 0xFF);
            _MMU.writeImmmediate(0x0005, 0x00);
    
            _MMU.writeImmmediate(0x0006, 0x48);
            _MMU.writeImmmediate(0x0007, 0x69);
    
            _MMU.writeImmmediate(0x0008, 0x20);
    
            _MMU.writeImmmediate(0x0009, 0x68);
            _MMU.writeImmmediate(0x000A, 0x6F);
            _MMU.writeImmmediate(0x000B, 0x77);
    
            _MMU.writeImmmediate(0x000C, 0x20);
    
            _MMU.writeImmmediate(0x000D, 0x61);
            _MMU.writeImmmediate(0x000E, 0x72);
            _MMU.writeImmmediate(0x000F, 0x65);
    
            _MMU.writeImmmediate(0x0010, 0x20);
    
            _MMU.writeImmmediate(0x0011, 0x79);
            _MMU.writeImmmediate(0x0012, 0x6F);
            _MMU.writeImmmediate(0x0013, 0x75);
            _MMU.writeImmmediate(0x0014, 0x3F);
            _MMU.writeImmmediate(0x0015, 0x3F);
            _MMU.writeImmmediate(0x0016, 0x3F);
    
            _MMU.writeImmmediate(0x0017, 0x00);
        }

        // output: 
        // Hello
        // World
        // :)
        public sysCallThree() {
            _MMU.writeImmmediate(0x0000, 0xA2);
            _MMU.writeImmmediate(0x0001, 0x03);
    
            _MMU.writeImmmediate(0x0002, 0xFF);
            _MMU.writeImmmediate(0x0003, 0x06);
            _MMU.writeImmmediate(0x0004, 0x00);
    
            _MMU.writeImmmediate(0x0005, 0x00);
    
            _MMU.writeImmmediate(0x0006, 0x0A);
            
            _MMU.writeImmmediate(0x0007, 0x48);
            _MMU.writeImmmediate(0x0008, 0x65);
            _MMU.writeImmmediate(0x0009, 0x6C);
            _MMU.writeImmmediate(0x000A, 0x6C);
            _MMU.writeImmmediate(0x000B, 0x6F);
    
            _MMU.writeImmmediate(0x000C, 0x0A);
    
            _MMU.writeImmmediate(0x000D, 0x57);
            _MMU.writeImmmediate(0x000E, 0x6F);
            _MMU.writeImmmediate(0x000F, 0x72);
            _MMU.writeImmmediate(0x0010, 0x6C);
            _MMU.writeImmmediate(0x0011, 0x64);
            _MMU.writeImmmediate(0x0012, 0x21);
    
            _MMU.writeImmmediate(0x0013, 0x0A);
    
            _MMU.writeImmmediate(0x0014, 0x3A);
            _MMU.writeImmmediate(0x0015, 0x29);
    
            _MMU.writeImmmediate(0x0016, 0x0A);
    
            _MMU.writeImmmediate(0x0017, 0x00);
        }
    }
}
