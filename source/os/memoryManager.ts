/* ----------- 
    MemoryManager.ts

    Routines for the memory management unit in the client OS. Primary functionality includes allowcating
    and deallocating memory.
    ----------- */

module TSOS {

    export class MemoryManager {

        constructor( public segmentsList: MemorySegment[] = [],
                     public segmentSize: number = 0x100 ) {    
            this.segmentsInit();
        }

        // initialize the three segments in memory
        public segmentsInit(): void {
            // loop through sections of memory array of memory segment size
            for (let i=0; i<_Memory.memSize; i+=this.segmentSize) {

                // if another segment can still be traversed within memory...
                if (i+this.segmentSize <= _Memory.memSize) {

                    // ...create a segment in that section in memory
                    this.segmentsList.push(new MemorySegment(i, this.segmentSize+i-1))
                }
            }
        }

        // reset all segments to inactive
        resetSegments(): void {
            for (let i=0; i<this.segmentsList.length; i++) {
                this.segmentsList[i].isActive = false;
            }
        }

        // loads a static program into correct segment in memory array
        public load(program_str: string[]): void {
            let i = 0;
            let activeSegment = null;

            while (i < this.segmentsList.length && activeSegment == null) {
                // find the first inactive segment and set to active
                if (!this.segmentsList[i].isActive) {
                    activeSegment = this.segmentsList[i];
                    activeSegment.isActive = true;
                }
                i++;
            }

            let program = [];
            for (let i=0; i<program_str.length; i++) {
                // create an array of numeric opcodes
                program.push(parseInt(program_str[i], 16));
            }

            // write program to memory
            _MemoryManager.writeImmmediate(program, activeSegment);

            // assign the segment to the current process
            _CurrentPCB.assignedSegment = activeSegment;
            
            // check if all segments are active
            if (this.segmentsList[this.segmentsList.length-1].isActive) {
                _Memory.isFull = true;
            }

            // update the memory table
            Control.updateMemoryOutput();
        }

        // helper method that places a given opcode to the correct position within the correct segment
        public writeImmmediate(program: number[], segment: MemorySegment): void {
            let j = 0;
            let i = segment.base;

            while (i<segment.limit && j<program.length) { 
                this.getMemArr()[i++] = program[j++];  
            }
        }

        // calculates the MAR in one cycle
        // does so by finding high and low order bytes and adding them together
        public calcMAR(currPC: number): void {
            let nextPC = currPC + 1;

            let lob = _MemoryManager.getMemArr()[currPC];

            // Add in the segment base to stay within segment boundaries
            let hob = (_MemoryManager.getMemArr()[nextPC] * 0x0100) + _CurrentPCB.assignedSegment.base;

            this.setMAR(lob + hob);
        }

        // clear memory within any inactive segment
        public clearInactiveSegments(): void {
            for (let i=0; i<this.segmentsList.length; i++) {
                if (!this.segmentsList[i].isActive) {
                    for (let j=this.segmentsList[i].base; j<this.segmentsList[i].limit; j++) {
                        _Memory.memArr[j] = 0x00;
                    }
                }
            }
        }

        // all memory properties are reinitialized to zero
        public reset(): void {
            this.resetMAR();
            this.resetMDR();
            _Memory.arrInit();
        }

        public resetMAR(): void {
            this.setMAR(0x0000);
        }

        public resetMDR(): void {
            this.setMDR(0x0000);
        }

        /* Memory Getters and Setters */
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