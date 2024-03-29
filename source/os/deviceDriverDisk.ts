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
            Control.updateDiskTable();
            return isFormatted;
        }

        // creates the swap file based on given pid
        public createSwapFile(pid, data) {
            let fileName = '.swap' + pid;

            // file data will be overwritten if file already exists
            this.createFile(fileName);
            this.writeFile(fileName, data);
        }

        // deletes all swap files on disk
        public deleteSwapFiles() {
            let files = this.getAllFiles();
            for (let i in files) {
                if (files[i].includes('swap')) {
                    this.deepDeleteFile(files[i]);
                }
            }
        }

        // Returns boolean indicating if file was successfully created
        public createFile(fileName):boolean {
            let created = false;

            let startingBlockKey = this.findFile(fileName)[1];
            if (!startingBlockKey) {
                let fileKey = this.getNextDirBlockKey();
                // Get the next available data block and set it at the end of the file chain
                let nextKey = this.getNextDataBlockKey();
                this.setFinalDataBlock(nextKey);

                // Put the file name in the file block
                let file = sessionStorage.getItem(fileKey);
                sessionStorage.setItem(fileKey, Utils.replaceAt(file, 5, Utils.textToHex(fileName)));

                // Put the key of the file starting block in the file meta data
                file = sessionStorage.getItem(fileKey);
                sessionStorage.setItem(fileKey, Utils.replaceAt(file, 1, nextKey))

                created = true;
            }
            Control.updateDiskTable();
            return created;
        }

        // Returns all content within a file
        public readFile(fileName):string {
            let startingBlockKey = this.findFile(fileName)[1];
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
            }
            return dataStr;
        }

        // returns the hex string contained within a data block
        public readBlockData(data: string): string {
            // split the data into an array of hex pairings
            let hexCodesArr = data.match(/.{1,2}/g);
            let res = '';
            let i = 0;
            // loop through array and build res string
            while (i < hexCodesArr.length) {
                res += hexCodesArr[i];
                i++;
            }
            return res;
        }

        // returns a message indicating if input data was written to a file
        public writeFile(fileName, input) {
            let startingBlockKey = this.findFile(fileName)[1];
            let returnMsg = '';

            // check if file exists
            if (!startingBlockKey) {
                returnMsg = 'does not exist';
            } else {
                // get the block data
                let data = sessionStorage.getItem(startingBlockKey);

                // remove all file data before overwriting
                if (this.doesBlockHaveData(data)) {
                    // deep delete ensures that the original file is overwritten
                    // not simple just clearing the directory (like normal deleting)
                    this.deepDeleteFile(fileName)
                    this.createFile(fileName);
                    startingBlockKey = this.findFile(fileName)[1];
                    data = sessionStorage.getItem(startingBlockKey);
                }

                if (input.length <= 60) {
                    sessionStorage.setItem(startingBlockKey, '1---:' + this.writeDataToBlock(data, input));
                } else {
                    // split the input into array, with each element having a max length of 60
                    let inputArr = input.match(/.{1,60}/g);

                    let currKey = startingBlockKey;
                    // loop through each input chunk
                    for (let i=0; i<inputArr.length; i++) {
                        let nextKey;
                        data = sessionStorage.getItem(currKey);

                        // last input chunk doesn't have a block to link to
                        if (i == inputArr.length-1) {
                            sessionStorage.setItem(currKey, '1---:' + this.writeDataToBlock(data, inputArr[i]));
                        } else {
                            nextKey = this.getNextDataBlockKey();
                            if (nextKey) {
                                sessionStorage.setItem(currKey, '1' + nextKey + ':' + this.writeDataToBlock(data, inputArr[i]));
                            } else {
                                returnMsg = 'no more data';
                                this.disk.isFull = true;
                                _OsShell.shellKillAll(null);

                                _StdOut.advanceLine();
                                _StdOut.putText('ERR: Disk is full.')
                                _StdOut.advanceLine();
                                _OsShell.putPrompt();
                                break;
                            }
                        }
                        currKey = nextKey;
                    }
                }
                returnMsg = 'success';
            }
            Control.updateDiskTable();
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

        // returns an array of file info
        // including the key of the directory and the key of the starting block
        public findFile(fileName):string[] {
            let startingBlockKey = null;
            let fileArr = [];

            directorySearch:
            for (let t=0; t<1; t++) {
                for (let s=0; s<this.disk.sectorCnt; s++) {
                    for (let b=0; b<this.disk.blockCnt; b++) {
                        let potentialKey = this.createStorageKey(t, s, b);
                        let dataArr = sessionStorage.getItem(potentialKey).split(":");

                        if (dataArr) {
                            let metaData = dataArr[0];
                            let fileData = this.trimData(dataArr[1]);
                            let isUsed = this.checkIfInUse(metaData);

                            if (isUsed && this.readBlockData(fileData) == (Utils.textToHex(fileName))) {
                                startingBlockKey = metaData.slice(1,4);
                                // directory key
                                fileArr.push(potentialKey);
                                // starting block key
                                fileArr.push(metaData.slice(1,4));
                                break directorySearch;
                            }
                        }
                    }
                }
            }
            return fileArr;
        }

        // removes trailing zeros from block
        public trimData(data: string) {
            let hexCodesArr = data.match(/.{1,2}/g);
            let i = 0;
            let res = ''
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

        // returns boolean indicating if file was deleted
        public deleteFile(fileName) {
            let key = this.findFile(fileName)[0];
            let isDeleted = false;

            if (key) {
                sessionStorage.setItem(key, this.emptyBlockInit());
                isDeleted = true;
            }
            Control.updateDiskTable();
            return isDeleted;
        }

        // removes all data within a file
        public deepDeleteFile(fileName) {
            let startingBlockKey = this.findFile(fileName)[1];

            if (startingBlockKey) {
                let block = sessionStorage.getItem(startingBlockKey);
                let blockArr = block.split(':');
                let metaData = blockArr[0];

                sessionStorage.setItem(startingBlockKey, this.emptyBlockInit());
                let nextKey = metaData.slice(1,4);
                let nextData = sessionStorage.getItem(nextKey);

                // File contains more than 1 block
                while (nextKey != '---') {
                    sessionStorage.setItem(nextKey, this.emptyBlockInit());
                    nextKey = nextData.split(':')[0].slice(1,4);
                    nextData = sessionStorage.getItem(nextKey);
                }
                // clear the directory once all data has been removed
                this.deleteFile(fileName);
            }
        }

        // returns message indicating if copy command was sccessful
        public copyFile(fileName, newName) {
            let returnMsg = '';
            // find the existing file
            if (this.findFile(fileName)[0]) {
                // create the new file
                let isCreated = this.createFile(newName);
                if (isCreated) {
                    // get all the file date in the existing file
                    let fileData = this.readFile(fileName);
                    // write the file data to the new file
                    let msg = this.writeFile(newName, fileData);
                    if (msg == 'success') {
                        returnMsg = 'success';
                    }
                } else {
                    returnMsg = 'new file exists';
                }
            } else {
                returnMsg = 'no existing file';
            }
            Control.updateDiskTable();
            return returnMsg;
        }

        // returns message indicating if file was successfully renamed
        public renameFile(fileName, newName) {
            let returnMsg = '';
            let key = this.findFile(fileName)[0];
            let otherKey = this.findFile(newName)[0];

            // make sure existing file actually exists and new file name isn't already in use
            if (key && !otherKey) {
                let data = sessionStorage.getItem(key);
                sessionStorage.setItem(key, Utils.replaceAt(data, 5, '0'.repeat(60)));

                data = sessionStorage.getItem(key);
                sessionStorage.setItem(key, Utils.replaceAt(data, 5, Utils.textToHex(newName)));

                returnMsg = 'success';
            } else if (!key) {
                returnMsg = 'cannot find file'
            } else if (otherKey) {
                returnMsg = 'name taken';
            }
            Control.updateDiskTable();
            return returnMsg;
        }

        // returns an array of all active filenames
        public getAllFiles() {
            let files = []
            for (let t=0; t<1; t++) {
                for (let s=0; s<this.disk.sectorCnt; s++) {
                    for (let b=0; b<this.disk.blockCnt; b++) {
                        let file = sessionStorage.getItem(this.createStorageKey(t, s, b));

                        if (file && this.checkIfInUse(file)) {
                            let fileName = Utils.hexToText(this.readBlockData(file.split(':')[1]));
                                files.push(fileName);
                        }
                    }
                }
            }
            return files;
        }

        // Returns boolean indicating if block is active
        public checkIfInUse(data: string) {
            let isUsed = false;
            let dataArr = data.split("");
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
                        if (block && this.isBlockInUse(block)) {
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
                        if (block && this.isBlockInUse(block)) {
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

        // Returns boolean indicating if given block is being used
        public isBlockInUse(block): boolean {
            return (block.charAt(0) == "0");
        }

        // Returns boolean indicating is there is data within a block
        public doesBlockHaveData(block): boolean {
            return block.split(':')[1] != '0'.repeat(60);
        }
    }
}