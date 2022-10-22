module TSOS {

    export class Dispatcher {

        constructor(public runningPCB: PCB = null){
        }

        public contextSwitch() {
            if (this.runningPCB == null) {
                // No processes are running, so dequeue from the ready queue and set to current PCB
                _CurrentPCB = _Scheduler.readyQueue.dequeue();
                _CurrentPCB.state = "running";
                this.runningPCB = _CurrentPCB;

                _CPU.init();
                _CPU.isExecuting = true;
            } else {
                // Grab the running PCB and put it back in the ready queue
                this.runningPCB.state = "ready";
                _Scheduler.readyQueue.enqueue(this.runningPCB);

                // Dequeue from ready queue and set to current PCB
                _CurrentPCB = _Scheduler.readyQueue.dequeue();
                _CurrentPCB.state = "running";
            }

            // Set the CPU registers to the saved registers in the current PCB
            this.updateCPU();
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