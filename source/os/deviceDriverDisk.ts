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

        // Returns boolean indicating if file was successfully created
        public createFile(fileName):boolean {
            let fileKey = this.getNextDirBlockKey();
            let created = false;

            let startingBlockKey = null;
            // Can have more than one untitled file
            if (fileName == "untitled") {
                startingBlockKey = null;
            } else {
                // Check if the file already exists
                startingBlockKey = this.findFile(fileName);
            }

            if (!startingBlockKey) {
                // Get the next available data block and set it at the end of the file chain
                let nextKey = this.getNextDataBlockKey();
                this.setFinalDataBlock(nextKey);

                // Put the file name in the file block
                let file = sessionStorage.getItem(fileKey);
                sessionStorage.setItem(fileKey, Utils.replaceAt(file, 5, Utils.textToHex(fileName)))

                // Put the key of the file starting block in the file meta data
                file = sessionStorage.getItem(fileKey);
                sessionStorage.setItem(fileKey, Utils.replaceAt(file, 1, nextKey))

                created = true;
            }
            return created;
        }

        // Returns all content within a file
        public readFile(fileName):string {
            let startingBlockKey = this.findFile(fileName);
            let dataStr = '';

            if (!startingBlockKey) {
                dataStr = null;
            } else {
                let block = sessionStorage.getItem(startingBlockKey);
                let blockArr = block.split(':');
                let metaData = blockArr[0];
                let data = blockArr[1];

                dataStr += this.readBlockData(data);

                // File contains more than 1 block
                if (metaData.slice(1,4) != '---') {
                    let nextKey = metaData.slice(1,4);
                    let nextData = sessionStorage.getItem(nextKey);

                    while (nextKey != '---') {
                        dataStr += this.readBlockData(nextData.split(':')[1]);
                        nextKey = nextData.split(':')[0].slice(1,4);
                        nextData = sessionStorage.getItem(nextKey);
                    }
                } 
                return Utils.hexToText(dataStr);
            }
        }

        // returns the hex string contained within a data block
        public readBlockData(data: string): string {
            // split the data into an array of hex pairings
            let hexCodesArr = data.match(/.{1,2}/g);
            let res = '';
            let i = 0;
            // loop through array and build res string until break is reached
            while (i < hexCodesArr.length) {
                if (hexCodesArr[i] != '00') {
                    res += hexCodesArr[i];
                } else {
                    break;
                }
                i++;
            }
            return res;
        }

        // returns a message indicating if input data was written to a file
        public writeFile(fileName, input) {
            let startingBlockKey = this.findFile(fileName);
            let returnMsg = '';

            // convert input string to hex
            input = Utils.textToHex(input);

            // check if file exists
            if (!startingBlockKey) {
                returnMsg = 'does not exist';
            } else {
                // get the block data
                let data = sessionStorage.getItem(startingBlockKey);

                // only write data if block is empty
                if (!this.doesBlockHaveData(data)) {
                    // check if input fits in one block
                    if (input.length <= 60) {
                        sessionStorage.setItem(startingBlockKey, '1---:' + this.writeDataToBlock(data, input));
                    } else {
                        // split the input into array, with each element having a max length of 60
                        let inputArr = input.match(/.{1,60}/g);
                        console.log(inputArr);

                        let currKey = startingBlockKey;
                        // loop through each input chunk
                        for (let i=0; i<inputArr.length; i++) {
                            let data = sessionStorage.getItem(currKey);
                            let nextKey = this.getNextDataBlockKey();

                            // last input chunk doesn't have a block to link to
                            if (i == inputArr.length-1) {
                                sessionStorage.setItem(currKey, '1---:' + this.writeDataToBlock(data, inputArr[i]));
                            } else {
                                sessionStorage.setItem(currKey, '1' + nextKey + ':' + this.writeDataToBlock(data, inputArr[i]));
                            }
                            currKey = nextKey;
                        }
                    }
                    returnMsg = 'success';
                } else {
                    returnMsg = 'overwrite';
                }
            }
            return returnMsg; 
        }

        // Writes hex data to a single block
        public writeDataToBlock(block, data): string {
            let blockArr = block.split(':');
            let blockData = blockArr[1].match(/.{1,2}/g);
            let dataArr = data.match(/.{1,2}/g);

            for (let i=0; i<dataArr.length; i++) {
                blockData[i] = dataArr[i];
            }
            return (blockData.join(''));
        }

        // Returns boolean indicating if a file already exists
        public findFile(fileName):string {
            let startingBlockKey = null;

            directorySearch:
            for (let t=0; t<1; t++) {
                for (let s=0; s<this.disk.sectorCnt; s++) {
                    for (let b=0; b<this.disk.blockCnt; b++) {
                        let potentialKey = this.createStorageKey(t, s, b);
                        let dataArr = sessionStorage.getItem(potentialKey).split(":");

                        if (dataArr) {
                            let metaData = dataArr[0];
                            let fileData = dataArr[1];
                            let isUsed = this.checkIfInUse(metaData);

                            if (isUsed && this.readBlockData(fileData) == (Utils.textToHex(fileName))) {
                                startingBlockKey = metaData.slice(1,4);
                                break directorySearch;
                            }
                        }
                    }
                }
            }
            return startingBlockKey;
        }

        // Returns boolean indicating if block is active
        public checkIfInUse(metadata: string) {
            let isUsed = false;
            let dataArr = metadata.split("");
            if (dataArr[0] === "1") {
                isUsed = true;
            }
            return isUsed;
        }

        // Sets block string as active, (indicated by '1')
        public setUseStatus(key, doUse) {
            let data = sessionStorage.getItem(key);
            if (data) {
                if (doUse) {
                    sessionStorage.setItem(key, Utils.replaceAt(data, 0, "1"));
                } else {
                    sessionStorage.setItem(key, Utils.replaceAt(data, 0, "0"));
                }
            }
        }

        // Sets block string as final block in chain (indicated by '---')
        public setFinalDataBlock(key) {
            let data = sessionStorage.getItem(key);
            if (data) {
                let tempData = data;
                for (let i=1; i<4; i++) {
                    sessionStorage.setItem(key, Utils.replaceAt(tempData, i, "-"));
                    tempData = sessionStorage.getItem(key);
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
                            this.setUseStatus(nextKey, true);
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

            directorySearch:
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
                            this.setUseStatus(nextKey, true);
                            // we found an empty block, so break from the routine
                            break directorySearch;
                        }
                    }
                }
            }
            return nextKey;
        }

        // Returns boolean indicating if given block is empty
        public isBlockEmpty(block): boolean {
            return (block.charAt(0) == "0");
        }

        public doesBlockHaveData(block): boolean {
            return block.split(':')[1] != '0'.repeat(60);
        }
    }
}