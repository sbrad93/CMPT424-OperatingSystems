/* ----------- 
    Scheduler.ts

    Routines for the CPU Scheduler.
    ----------- */

module TSOS {

    export class Scheduler {

        constructor(public readyQueue = new TSOS.Queue()) {
        }

        public reset() {
            this.readyQueue = new TSOS.Queue();
        }

        public schedule() {
            if (this.readyQueue.getSize() > 0) {
                // _KernelInputQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, [_Scheduler.readyQueue.getAt(0)]));
                _CurrentPCB = this.readyQueue.dequeue();
                _CPU.init();
                _CPU.isExecuting = true;
            } else {
                _StdOut.advanceLine();
                _StdOut.putText("Execution completed.")
                _StdOut.advanceLine();
                _OsShell.putPrompt();
            }
        }

    }
}