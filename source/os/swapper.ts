module TSOS {

    export class Swapper {

        constructor(public dataIn: string = "",
                    public dataOut: string = "") {

        }

        public rollIn(pcb: PCB, segment: MemorySegment) {
            // read the swap file data
            let data = _krnDiskDriver.readFile('.swap' + pcb.pid);

            // load the data into memory and update location
            _MemoryManager.load(pcb.pid, data.match(/.{1,2}/g))
            pcb.location = 'memory'
            pcb.assignedSegment = segment;
        }

        public rollOut(pcb: PCB) {
            // get the pcb program data and write to a swap file
            let data = _MemAccessor.getSegmentData(pcb.assignedSegment)
            _krnDiskDriver.createSwapFile(pcb.pid, data.join(''));
            pcb.location = 'disk';

            // clear the memory segment
            _MemoryManager.clearSegment(pcb.assignedSegment);

            // make room in memory to roll in data
            _Memory.isFull = false;
            pcb.assignedSegment.isActive = false;
        }
    }
}