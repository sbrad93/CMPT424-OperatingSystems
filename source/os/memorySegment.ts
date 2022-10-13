/* ----------- 
    MemorySegment.ts

    Class constructor for a Memory Segment. 
    Implemented to simplify memory allocation/deallocation routines in MemoryManager.ts.
    ----------- */


module TSOS {

    export class MemorySegment {

        public firstByte: number = 0x00;
        public lastByte: number = 0x00;
        public isActive: boolean = false;

        constructor(first, last) {
            this.firstByte = first;
            this.lastByte = last;
            this.isActive = false;
        }
    }
}