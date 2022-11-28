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
            if (_MemoryManager.getMAR() > _CurrentPCB.assignedSegment.limit) {
                // check for memory access violation
                this.memoryBoundsError();
            } else {
                _MemoryManager.setMDR(_Memory.memArr[_MemoryManager.getMAR()]);
            }
        }

        //writes the contents of the MDR to memory at the location indicated by the MAR
        public write() {
            if (_MemoryManager.getMAR() > _CurrentPCB.assignedSegment.limit) {
               // check for memory access violation
               this.memoryBoundsError();
            } else {
                _Memory.memArr[_MemoryManager.getMAR()] = _MemoryManager.getMDR();
            }
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

        public memoryBoundsError() {
            _CPU.isExecuting = false;

            // Terminate current process and set associated segment to inactive
            _CurrentPCB.state = "terminated";
            _CurrentPCB.assignedSegment.isActive = false;
            Control.updatePCBStateInTable(_CurrentPCB.pid, _CurrentPCB.state);

            // Clear the running process
            _Dispatcher.runningPCB = null;

            // Turn off single step mode
            Control.turnOffSingleStep();

            _Kernel.krnTrace(`Process ${_CurrentPCB.pid}: Process terminated.`)
            _StdOut.advanceLine();
            _StdOut.putText(`Process ${_CurrentPCB.pid}: Memory Bounds Error -- Process terminated`);

            if (_Scheduler.readyQueue.getSize() > 0) {
                _StdOut.advanceLine();
                _StdOut.putText("Execute 'runall' to finish running remaining processes.");
                _CPU.init();
                for (let i=0; i<_Scheduler.readyQueue.getSize(); i++) {
                    _Scheduler.readyQueue.getAt(i).state = "resident";
                    Control.updatePCBStateInTable(_Scheduler.readyQueue.getAt(i).pid, _Scheduler.readyQueue.getAt(i).state);
                }
                _Scheduler.readyQueue.reset();
                Control.updateReadyQueueTable();
            }

            _StdOut.advanceLine();
            _OsShell.putPrompt();
        }

        // returns all program data within a segment
        public getSegmentData(segment) {
            let i = segment.base;
            let data = [];

            while (i<segment.limit) { 
                if (_Memory.memArr[i] == 0 && _Memory.memArr[i+1] == 0) {
                    data.push(Utils.hexLog(_Memory.memArr[i]).slice(-2));
                    break;
                }
                data.push(Utils.hexLog(_Memory.memArr[i]).slice(-2));
                i++;
            }
            return data;
        }
    }
}