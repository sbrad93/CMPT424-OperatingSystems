module TSOS {

    export class DeviceDriverDisk extends DeviceDriver {

        constructor(public disk: Disk = new Disk()) {
            super();
            this.driverEntry = this.krnKbdDriverEntry;
        }

        public krnKbdDriverEntry() {
            this.status = "loaded";
        }

        // Initializes all blocks
        public format():boolean {
            let isFormatted = false;
            try {
                for (let t=0; t<this.disk.trackCtn; t++) {
                    for (let s=0; s<this.disk.sectorCnt; s++) {
                        for (let b=0; b<this.disk.blockCnt; b++) {
                            sessionStorage.setItem(this.createStorageKey(t, s, b), this.emptyBlockInit());
                        }
                    }
                }
                isFormatted = true;
                this.disk.isFormatted = true;
            } catch(err) {
                console.log(err);
                isFormatted = false;
            }
            return isFormatted;
        }

        public createFile(fileName):boolean {
            let fileKey = this.getNextDirBlockKey();
            let created = false;

            let found = false;
            // Can have more than one untitled file
            if (fileName == "untitled") {
                found = false;
            } else {
                // Check if the file already exists
                found = this.findFile(fileName);
            }

            if (!found) {
                // Get the next available data block and set to in use
                let nextKey = this.getNextDataBlockKey();
                let next = sessionStorage.getItem(nextKey);
                this.setUseStatus(nextKey, true);

                // Put the file name in the file block and set to in use
                let file = sessionStorage.getItem(fileKey);
                sessionStorage.setItem(fileKey, Utils.replaceAt(file, 5, fileName))
                this.setUseStatus(fileKey, true);

                // Put the key of the file starting block in the file meta data
                file = sessionStorage.getItem(fileKey);
                sessionStorage.setItem(fileKey, Utils.replaceAt(file, 1, nextKey))

                created = true;
                console.log(sessionStorage.getItem(fileKey))
            }
            return created;
        }

        // Returns boolean indicating if a file already exists
        public findFile(fileName):boolean {
            let found = false;

            blockSearch:
            for (let t=0; t<1; t++) {
                for (let s=0; s<this.disk.sectorCnt; s++) {
                    for (let b=0; b<this.disk.blockCnt; b++) {
                        let potentialKey = this.createStorageKey(t, s, b);

                        let dataArr = sessionStorage.getItem(potentialKey).split(":");
                        if (dataArr) {
                            let metaData = dataArr[0];
                            let fileData = dataArr[1];
                            let isUsed = this.checkIfInUse(metaData);

                            if (isUsed && fileData.includes(fileName)) {
                                found = true;
                                break blockSearch;
                            }
                        }
                    }
                }
            }
            return found;
        }

        public checkIfInUse(metadata: string) {
            let isUsed = false;
            let dataArr = metadata.split("");
            if (dataArr[0] === "1") {
                isUsed = true;
            }
            return isUsed;
        }

        public setUseStatus(key, doUse) {
            let data = sessionStorage.getItem(key);
            console.log(data)
            if (data) {
                if (doUse) {
                    sessionStorage.setItem(key, Utils.replaceAt(data, 0, "1"));
                    // console.log(Utils.replaceAt(data, 0, "1"));
                } else {
                    sessionStorage.setItem(key, Utils.replaceAt(data, 0, "0"));
                    // console.log(Utils.replaceAt(data, 0, "0"));
                }
            }
        }

        // Creates a key value for a given TSB location
        public createStorageKey(track:number, sector:number, block:number):string {
            return track.toString() + sector.toString() + block.toString();
        }

        // Returns an empty block
        public emptyBlockInit():string {
            return "0".repeat(4) + ":" + "0".repeat(this.disk.blockSize-4);
        }

        // Returns the key of the next available block
        public getNextDataBlockKey():string {
            let nextKey = "";

            blockSearch:
            for (let t=1; t<this.disk.trackCtn; t++) {
                for (let s=0; s<this.disk.sectorCnt; s++) {
                    for (let b=0; b<this.disk.blockCnt; b++) {

                        let potentialKey = this.createStorageKey(t, s, b);
                        let block = sessionStorage.getItem(potentialKey);
                        if (block && this.isBlockEmpty(block)) {
                            nextKey = potentialKey;
                            // we found an empty block, so break from the routine
                            break blockSearch;
                        }
                    }
                }
            }
            return nextKey;
        }

        // Returns the key of the next available directory block
        public getNextDirBlockKey():string {
            let nextKey = "";

            blockSearch:
            for (let t=0; t<1; t++) {
                for (let s=0; s<this.disk.sectorCnt; s++) {
                    for (let b=0; b<this.disk.blockCnt; b++) {

                        let potentialKey = this.createStorageKey(t, s, b);
                        // Skip the master boot record
                        if (potentialKey == "000") {
                            continue;
                        }

                        let block = sessionStorage.getItem(potentialKey);
                        if (block && this.isBlockEmpty(block)) {
                            nextKey = potentialKey;
                            // we found an empty block, so break from the routine
                            break blockSearch;
                        }
                    }
                }
            }
            return nextKey;
        }

        // Returns boolean indicating if given block is empty
        public isBlockEmpty(block:string):boolean {
            return (block.charAt(0) == "0");
        }

        // public getNext(key:string):string {
        //     let res = "";
        //     let data = sessionStorage.getItem(key);
        //     if (data) {
        //         res = data.substring(1, 4);
        //     } else {
        //         res = "***";
        //     }
        //     return res;
        // }

        // public readBlock(diskLocation)

    }
}