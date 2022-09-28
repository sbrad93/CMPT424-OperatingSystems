/* ----------- 
    MemoryManager.ts

    Routines for the memory management unit in the client OS. Primary functionality includes allowcating
    and deallocating memory.
    ----------- */

module TSOS {

    export class MemoryManager {

        constructor() {
        }

        // updates last two hex digits in MAR
        public setLowOrderByte(lob: number) {
            this.setMAR(this.getMAR() + lob);
        }

        // updates first two hex digits in MAR
        public setHighOrderByte(hob: number) {
            let hob_mod = hob * 0x0100;
            this.setMAR(hob_mod + this.getMAR());
        }

        // updates 16 bit MAR in one cycle
        public modMAR(lob: number) {
            this.setMAR(0x0000);
            this.setLowOrderByte(lob);
        }

        // used to load a static program into memory array
        // inserts given memory byte into specified memory address
        public writeImmmediate(addr: number, dat: number) {
            for (let i=0; i<this.getMemArr().length; i++) { 
                if(i == addr) {
                    this.getMemArr()[i] = dat;
                }
            }
        }

        // all memory properties are reinitialized to zero
        public reset() {
            this.setMAR(0x0000);
            this.setMDR(0x00);
            _Memory.arrInit();
        }

        /* Memory Getters and Setters */
        // Initially had this is memory.ts, but I started to think it made more sense if the MMU 
        // was the entity making changes to the MAR and MDR.
        public getMAR() {
            return _Memory.mar;
        } // getMAR

        public getMDR() {
            return _Memory.mdr;
        } // getMDR

        public getMemArr() {
            return _Memory.memArr;
        } // getMemArr

        public setMAR(mar_mod: number) {
            _Memory.mar = mar_mod;
        } // setMAR

        public setMDR(mdr_mod: number) {
            _Memory.mdr = mdr_mod;
        } // setMDR
        
    }
}