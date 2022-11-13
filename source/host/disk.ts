module TSOS {

    export class Disk {
        constructor(public trackCtn: number = 4,
                    public sectorCnt: number = 8,
                    public blockCnt: number = 8,
                    public blockSize: number = 64) {
        }
    }
}