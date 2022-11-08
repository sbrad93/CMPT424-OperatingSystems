module TSOS {

    export class DeviceDriverDisk extends DeviceDriver {

        constructor(public disk: Disk = new Disk()) {
            super();
            this.driverEntry = this.krnKbdDriverEntry;
        }

        public krnKbdDriverEntry() {
            this.status = "loaded";
        }

        public format() {
            for (let i=0; i<this.disk.trackCtn; i++) {
                for (let j=0; j<this.disk.sectorCnt; j++) {
                    for (let k=0; k<this.disk.blockCnt; k++) {
                        sessionStorage.setItem(this.createStorageKey(i, j, k), this.emptyBlockInit());
                    }
                }
            }
        }

        public createStorageKey(trackCnt, sectorCnt, blockCnt):string {
            return trackCnt+sectorCnt+blockCnt+"";
        }

        public emptyBlockInit() {
            return "0".repeat(this.disk.blockSize);
        }

    }
}