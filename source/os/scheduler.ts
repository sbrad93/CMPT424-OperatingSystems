/* ----------- 
    Scheduler.ts

    Routines for the CPU Scheduler.
    ----------- */

module TSOS {

    export class Scheduler {

        constructor(public readyQueue: Queue = new TSOS.Queue(),
                    public schedulingAlgorithm: string = ROUND_ROBIN, // default scheduling system
                    public quantum: number = 6, // default quanta value
                    public quantaCount: number = 0
                    ) {
        }

        public reset() {
            this.readyQueue = new TSOS.Queue();
        }

        public schedule() {
            if (this.readyQueue.getSize() > 0) {
                switch (this.schedulingAlgorithm) {
                    case ROUND_ROBIN:
                        // Generate a software interrupt to implement a context switch
                        this.generateInterrupt()
                        break;
                }
            } else {
                _StdOut.advanceLine();
                _StdOut.putText("Execution completed.")
                _StdOut.advanceLine();
                _OsShell.putPrompt();
            }
        }

        public quantumSurveillance() {
            console.log(this.quantaCount);
            this.quantaCount++;
            // Quantum has been used up
            if (this.schedulingAlgorithm == ROUND_ROBIN && this.quantaCount == this.quantum) {
                this.generateInterrupt();
                this.quantaCount = 0;
            }
        }

        public generateInterrupt() {
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, [this.readyQueue.getAt(0)]));
        }
    }
}