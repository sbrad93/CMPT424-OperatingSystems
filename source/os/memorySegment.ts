/* ----------- 
    MemorySegment.ts

    Class Constructor for a Memory Segment. 
    Implemented to simplify memory allocation/deallocation and CPU scheduling routines.
    ----------- */

module TSOS {

    export class MemorySegment {

        public static sidCounter = 0;
        public base: number = 0x00;
        public limit: number = 0x00;

        constructor(baseByte, 
                    limitByte,
                    public isActive: boolean = false,
                    public sid: number = MemorySegment.sidCounter) {
            this.base = baseByte;
            this.limit = limitByte;
            MemorySegment.sidCounter++;
        }
    }
}