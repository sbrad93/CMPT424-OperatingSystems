/* ----------- 
    Memory.ts

    Routines for the memory prototype in the host OS.
    ----------- */

module TSOS {
   
    export class Memory {

        constructor(public memArr: number [] = null,
                    public memSize: number = 0x300, // 768 in decimal
                    public segmentSize: number = 0x100, // 256 in decimal
                    public tempArr: string[] = null,
                    public mar: number = 0x0000,
                    public mdr: number = 0x00) {
        }

        // initializes all elements in the memory array
        public arrInit():number[] {
            interface Array<T> {
                fill(number: T): Array<T>;
            }
            //array length is total size of addressable memory (in hexadecimal notation)
            //each element is initialized to 0x00
            this.memArr = Array<number>(this.memSize).fill(0x00);
    
            return this.memArr;
        }

        //all memory properties are reinitialized to zero
        public reset() {
            this.mar = 0x0000;
            this.mdr = 0x00;
            this.arrInit();
        }
    }
}