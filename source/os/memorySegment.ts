/* ----------- 
    MemorySegment.ts

    Class constructor for a Memory Segment. 
    Implemented to simplify memory allocation/deallocation routines in MemoryManager.ts.
    ----------- */


module TSOS {

    export class MemorySegment {

        public base: number = 0x00;
        public limit: number = 0x00;
        public isActive: boolean = false;

        constructor(baseByte, limitByte) {
            this.base = baseByte;
            this.limit = limitByte;
            this.isActive = false;
        }
    }
}