module TSOS {

    export class Dispatcher {

        constructor(public runningPCB: PCB = null){
        }

        public contextSwitch() {
            if (this.runningPCB == null) {
                // No processes are running, so dequeue from the ready queue and set to current PCB
                _CurrentPCB = _Scheduler.readyQueue.dequeue();
                if (_CurrentPCB != null) {
                    if (_CurrentPCB.location == 'disk') {
                        let targetPCB = _MemoryManager.getSwapPCB();

                        // save target pcb to the disk
                        _Swapper.rollOut(targetPCB);

                        // roll in the current pcb from the disk to memory
                        _Swapper.rollIn(_CurrentPCB, targetPCB.assignedSegment);
                    }

                    _CurrentPCB.state = "running";
                    Control.updateReadyQueueTable();
                    _CPU.init();
                    _CPU.isExecuting = true;
                }
            } else {
                // Can't switch processes if there aren't any waiting to run
                if (_Scheduler.readyQueue.getSize() > 0) {
                    // Grab the running PCB and put it back in the ready queue
                    this.runningPCB.state = "ready";
                    Control.updatePCBStateInTable(this.runningPCB.pid, this.runningPCB.state);
                    _Scheduler.readyQueue.enqueue(this.runningPCB);
                    Control.updateReadyQueueTable();

                    // Incremement waiting and turn around cycles every time a process is placed back in ready queue
                    this.runningPCB.waitingCycles++;
                    this.runningPCB.turnAroundCycles++;
                    
                    // Dequeue the next PCB from ready queue and set to current PCB
                    _CurrentPCB = _Scheduler.readyQueue.dequeue();
                    Control.updateReadyQueueTable();
                    _CurrentPCB.state = "running";
                }
            }
            this.runningPCB = _CurrentPCB;

            // Set the CPU registers to the saved registers in the current PCB
            if (_CurrentPCB != null) {
                this.updateCPU();
            }
        }

        public updateCPU() {
            _CPU.PC = _CurrentPCB.PC;
            _CPU.instructionReg = _CurrentPCB.instructionReg;
            _CPU.acc = _CurrentPCB.acc;
            _CPU.Xreg = _CurrentPCB.Xreg;
            _CPU.Yreg = _CurrentPCB.Yreg;
            _CPU.Zflag = _CurrentPCB.Zflag;
        }
    }
}