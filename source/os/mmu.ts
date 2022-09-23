/* ----------- 
    MMU.ts

    Routines for the memory management unit in the client OS. Primary functionality includes allowcating
    and deallocating memory.
    ----------- */

module TSOS {

    export class Mmu {

        constructor() {
        }

        // updates last two hex digits in MAR
        public setLowOrderByte(lob: number) {
            _Memory.setMAR(_Memory.getMAR() + lob);
            //console.log(this.getMAR().toString(16));
        }

        // updates first two hex digits in MAR
        public setHighOrderByte(hob: number) {
            let hob_mod = hob * 0x0100;
            _Memory.setMAR(hob_mod + _Memory.getMAR());
            //console.log(this.getMAR().toString(16));
        }

        // updates 16 bit MAR in one cycle
        public modMAR(lob: number) {
            _Memory.setMAR(0x0000);
            this.setLowOrderByte(lob);
        }

        // used to load a static program into memoery array
        // inserts given memory byte into specified memory address
        public writeImmmediate(addr: number, dat: number) {
            for (let i=0; i<_Memory.getMemArr().length; i++) { 
                if(i == addr) {
                    _Memory.getMemArr()[i] = dat;
                }
            }
        }
        
    }
}