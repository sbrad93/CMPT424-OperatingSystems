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
                _CPU.init();
                _CPU.isExecuting = true;
            }
        }

    }
}