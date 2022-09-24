/* ----------- 
    Memory.ts

    Routines for the memory prototype in the host OS.
    ----------- */

module TSOS {
   
    export class Memory {

        constructor(public memArr: number [] = null,
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
            this.memArr = Array<number>(0x10000).fill(0x00);
    
            return this.memArr;
        }
    }
}