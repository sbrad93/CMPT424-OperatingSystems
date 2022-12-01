module TSOS {

    export class Swapper {

        constructor() {
        }

        public rollIn(pcb: PCB, segment: MemorySegment): void {
            if (pcb) {
                // read the swap file data
                let data = _krnDiskDriver.readFile('.swap' + pcb.pid);
                console.log('reading...')
                console.log(data)

                // load the data into memory and update location
                _MemoryManager.load(pcb, data.match(/.{1,2}/g), segment);
                pcb.location = 'memory';
            }
        }

        public rollOut(pcb: PCB): void {
            // get the pcb program data and write to a swap file
            let data = _MemAccessor.getSegmentData(pcb.assignedSegment);
            _krnDiskDriver.createSwapFile(pcb.pid, data.join(''));
            pcb.location = 'disk';

            // clear the memory segment
            _MemoryManager.clearSegment(pcb.assignedSegment);

            // make room in memory to roll in data
            _Memory.isFull = false;
            pcb.assignedSegment.isActive = false;
            pcb.assignedSegment = null;
        }
    }
}