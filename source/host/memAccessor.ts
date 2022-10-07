/* ----------- 
    MemAccessor.ts

    Routines for the memory accessor in the host OS. Primary functionality includes reading
    and writing to memory.
    ----------- */

module TSOS {

    export class MemAccessor {

        constructor() {
        }

        //reads memory at the location in the MAR and updates the MDR accordingly
        public read() {
            _MemoryManager.setMDR(_Memory.memArr[_MemoryManager.getMAR()]);
        }

        //writes the contents of the MDR to memory at the location indicated by the MAR
        public write() {
            _Memory.memArr[_MemoryManager.getMAR()] = _MemoryManager.getMDR();
        }

        //displays the memory content up to a given address in browser console
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