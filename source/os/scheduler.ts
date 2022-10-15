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

    }
}