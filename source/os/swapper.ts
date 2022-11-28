module TSOS {

    export class Swapper {

        constructor(public dataIn: string = "",
                    public dataOut: string = "") {

        }

        public rollIn() {

        }

        public rollOut(pcb: PCB) {
            console.log(pcb)

            let program = _MemAccessor.getSegmentData(pcb.assignedSegment)
            console.log(program)

            _krnDiskDriver.createSwapFile(pcb.pid, program.join(''));
        }
    }
}