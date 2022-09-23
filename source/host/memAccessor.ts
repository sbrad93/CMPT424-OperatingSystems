/* ----------- 
    MemAccessor.ts

    Routines for the memory accessor in the host OS. Primary functionality includes reading
    and writing to memory.
    ----------- */

module TSOS {

    export class MemAccessor {

        constructor() {
        }

        // all memory properties are reinitialized to zero
        public reset() {
            _Memory.mar = 0x0000;
            _Memory.mdr = 0x00;
            _Memory.arrInit();
        }

        //reads memory at the location in the MAR and updates the MDR accordingly
        public read() {
            _Memory.setMDR(_Memory.memArr[_Memory.getMAR()]);
        }

        //writes the contents of the MDR to memory at the location indicated by the MAR
        public write() {
            _Memory.memArr[_Memory.getMAR()] = _Memory.getMDR();
        }

        //displays the memory content up to a given address
        public displayMemory(address: number) {
            console.log();
            console.log();
            console.log("---------------------------------------");
            for(let i=0; i<address; i++) {
                if (_Memory.memArr[i] === undefined) {
                    console.log("Address: " + Utils.hexLog(i) + " " +
                                "contains value: ERR [hexVal conversion]: number undefined");
                }
                else {
                    console.log("Address: " + Utils.hexLog(i) + " " +
                    "contains value: " + Utils.hexLog(_Memory.memArr[i]));
                }
            }
            console.log("---------------------------------------");
            console.log("Memory Dump: Complete");
        }
    }
}