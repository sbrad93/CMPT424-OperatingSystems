module TSOS {

    export class DeviceDriverDisk extends DeviceDriver {

        constructor(public disk: Disk = new Disk()) {
            super();
            this.driverEntry = this.krnKbdDriverEntry;
        }

        public krnKbdDriverEntry() {
            this.status = "loaded";
        }

        public format():boolean {
            let isFormatted = false;
            try {
                for (let i=0; i<this.disk.trackCtn; i++) {
                    for (let j=0; j<this.disk.sectorCnt; j++) {
                        for (let k=0; k<this.disk.blockCnt; k++) {
                            sessionStorage.setItem(this.createStorageKey(i, j, k), this.emptyBlockInit());
                        }
                    }
                }
                isFormatted = true;
            } catch(err) {
                console.log(err);
                isFormatted = false;
            }
            return isFormatted;
        }

        public createStorageKey(trackCnt:number, sectorCnt:number, blockCnt:number):string {
            return trackCnt+sectorCnt+blockCnt+"";
        }

        public emptyBlockInit():string {
            return "0".repeat(this.disk.blockSize);
        }

        public getNext(key:string):string {
            let res = "";
            let data = sessionStorage.getItem(key);
            if (data) {
                res = data.substring(1, 4);
            } else {
                res = "---";
            }
            return res;
        }

        // public readBlock(diskLocation)

    }
}