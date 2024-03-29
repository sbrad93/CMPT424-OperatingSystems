/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc: ShellCommand;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clear the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellDate,
                                "date",
                                "- Displays the current date.");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new ShellCommand(this.shellLocation,
                                "whereami",
                                "- Displays your current location.");
            this.commandList[this.commandList.length] = sc;

            // imfeeling
            sc = new ShellCommand(this.shellSongs,
                                "imfeeling",
                                "<string> - Displays song recommendations based on your mood.");
            this.commandList[this.commandList.length] = sc;

            // status <string>
            sc = new ShellCommand(this.shellStatus,
                                "status",
                                "<string> - Sets the status message.");
            this.commandList[this.commandList.length] = sc;

            // bsod
            sc = new ShellCommand(this.shellTestKrnTrapError,
                                "bsod",
                                "- Tests when kernel traps an OS error and displays BSOD.");
            this.commandList[this.commandList.length] = sc;
            
            // load <string>
            sc = new ShellCommand(this.shellLoad,
                            "load",
                            "<string> - Loads a user program into the console.");
            this.commandList[this.commandList.length] = sc;

            // run <pid>
            sc = new ShellCommand(this.shellRun,
                            "run",
                            "<pid> - Runs a specified process.");
            this.commandList[this.commandList.length] = sc;

            // memdump
            sc = new ShellCommand(this.shellMemoryDump,
                            "memdump",
                            " - Displays memory in browser console.");
            this.commandList[this.commandList.length] = sc;

            // clearmem
            sc = new ShellCommand(this.shellClearMem,
                            "clearmem",
                            " - Clears all memory partitions.");
            this.commandList[this.commandList.length] = sc;

            // runall
            sc = new ShellCommand(this.shellRunAll,
                            "runall",
                            " - Run all loaded processes.");
            this.commandList[this.commandList.length] = sc;

            // ps
            sc = new ShellCommand(this.shellPS,
                            "ps",
                            " - Displays the PID and state of all processes.");
            this.commandList[this.commandList.length] = sc;

            // kill <pid>
            sc = new ShellCommand(this.shellKill,
                            "kill",
                            "<pid> - Kills a specified process.");
            this.commandList[this.commandList.length] = sc;

            // killall
            sc = new ShellCommand(this.shellKillAll,
                            "killall",
                            "<pid> - Kills all processes.");
            this.commandList[this.commandList.length] = sc;

            // quantum <int>
            sc = new ShellCommand(this.shellSetQuantum,
                            "quantum",
                            "<int> - Sets the quantum value.");
            this.commandList[this.commandList.length] = sc;

            // format
            sc = new ShellCommand(this.shellFormat,
                            "format",
                            "- Initializes all disk blocks.");
            this.commandList[this.commandList.length] = sc;

            // create <filename>
            sc = new ShellCommand(this.shellCreate,
                            "create",
                            "<filename> - Creates the file.");
            this.commandList[this.commandList.length] = sc;

            // read <filename>
            sc = new ShellCommand(this.shellRead,
                            "read",
                            "<filename> - Read and displays contents of <filename>.");
            this.commandList[this.commandList.length] = sc;

            // write <filename> "data"
            sc = new ShellCommand(this.shellWrite,
                            "write",
                            "<filename> \"data\" - Write data inside quotes to <filename>.");
            this.commandList[this.commandList.length] = sc;

            // delete <filename>
            sc = new ShellCommand(this.shellDelete,
                            "delete",
                            "<filename> - Remove <filename> from storage.");
            this.commandList[this.commandList.length] = sc;

            // copy <existing filename> <new filename>
            sc = new ShellCommand(this.shellCopy,
                            "copy",
                            "<existing filename> <new filename> - Copies an existing file.");
            this.commandList[this.commandList.length] = sc;

            // rename <existing filename> <new filename>
            sc = new ShellCommand(this.shellRename,
                            "rename",
                            "<existing filename> <new filename> - Renames an existing file.");
            this.commandList[this.commandList.length] = sc;

            // ls
            sc = new ShellCommand(this.shellLS,
                            "ls",
                            "- List the files currently stored on the disk.");
            this.commandList[this.commandList.length] = sc;

            // setschedule <newSchedule>
            sc = new ShellCommand(this.shellSetSchedule,
                            "setschedule",
                            "<newSchedule> - Sets the scheduling algorithm.");
            this.commandList[this.commandList.length] = sc;

            // getschedule
            sc = new ShellCommand(this.shellGetSchedule,
                "getschedule",
                "- Gets the current scheduling algorithm.");
            this.commandList[this.commandList.length] = sc;

            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match. 
            // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);  // Note that args is always supplied, though it might be empty.
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer: string): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            if (buffer.toLowerCase().includes("status")) {
                // 2. We want to maintain capitalization in the status message, so step 2 is not necessary

                // 3. Separate on spaces so we can determine the command and command-line args, if any.
                var tempList = buffer.split(" ");

                // 4. Take the first (zeroth) element and use that as the command.
                var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript. See the Queue class.

                // We only want to maintain caps in the arg, not the command
                cmd = cmd.toLowerCase();
            } else {
                // 2. Lower-case it.
                buffer = buffer.toLowerCase();

                // 3. Separate on spaces so we can determine the command and command-line args, if any.
                var tempList = buffer.split(" ");

                // 4. Take the first (zeroth) element and use that as the command.
                var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript. See the Queue class.
            }

            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.

        public shellVer(args: string[]) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args: string[]) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText(_OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args: string[]) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        }

        public shellCls(args: string[]) {         
            _StdOut.clearScreen();     
            _StdOut.resetXY();
        }

        public shellMan(args: string[]) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "ver":
                        _StdOut.putText("Ver displays the current version data.");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shutdown shuts down (duh) the virtual OS");
                        _StdOut.advanceLine();
                        _StdOut.putText("but leaves the underlying host/hardware simulation running.");
                        break;
                    case "cls":
                        _StdOut.putText("Cls clears the screen and resets the cursor position.");
                        break;
                    case "trace":
                        _StdOut.putText("Trace turns the OS trace on or off.");
                        break;
                    case "rot13":
                        _StdOut.putText("Rot13 does rot13 obfuscation on a given string.");
                        break;
                    case "prompt":
                        _StdOut.putText("Prompt promptly sets the prompt.");
                        _StdOut.advanceLine();
                        _StdOut.putText("Say that three times fast.");
                        break;
                    case "date":
                        _StdOut.putText("Date displays the current DateTime.");
                        break;
                    case "whereami":
                        _StdOut.putText("Whereami displays your current location.");
                        _StdOut.advanceLine();
                        _StdOut.putText("I'm always watching.");
                        break;
                    case "imfeeling":
                        _StdOut.putText("Imfeeling displays song recommendations based on your mood.");
                        break;
                    case "status":
                        _StdOut.putText("Status sets a user-defined status message.");
                        break;
                    case "bsod":
                        _StdOut.putText("Tests when the kernel traps and OS error and displays BSOD.");
                        break;
                    case "load":
                        _StdOut.putText("Loads a user program into the console.");
                        break;
                    case "run":
                        _StdOut.putText("Runs a specified process.");
                        break;
                    case "memdump":
                        _StdOut.putText("Displays memory in browser console.");
                        break;
                    case "clearmem":
                        _StdOut.putText("Clears all memory partitions.");
                        break;
                    case "clearmem":
                        _StdOut.putText("Runs all loaded processes.");
                        break;
                    case "ps":
                        _StdOut.putText("Displays the pid and state of all processes.");
                        break;
                    case "kill":
                        _StdOut.putText("Kills a specified process.");
                        break;
                    case "killall":
                        _StdOut.putText("Kills all processes.");
                        break;
                    case "quantum":
                        _StdOut.putText("Sets the quantum value. Default is 6 CPU cycles.");
                        break;
                    case "format":
                        _StdOut.putText("Initializes all disk blocks.");
                        break;
                    case "create":
                        _StdOut.putText("Creates a file.");
                        break;
                    case "read":
                        _StdOut.putText("Reads and displays contents of a given file.");
                        break;
                    case "write":
                        _StdOut.putText("Writes data to a file.");
                        break;
                    case "delete":
                        _StdOut.putText("Deletes an existing file.");
                        break;
                    case "copy":
                        _StdOut.putText("Copies an existing file.");
                        break;
                    case "rename":
                        _StdOut.putText("Renames an existing file.");
                        break;
                    case "ls":
                        _StdOut.putText("Lists all files on the disk.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args: string[]) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args: string[]) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args: string[]) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellDate(args: string[]) {
            let date: Date = new Date();
            _StdOut.putText("Date: " + date.toLocaleDateString());
            _StdOut.advanceLine();
            _StdOut.putText("Time: " + date.toLocaleTimeString());
        }

        public shellLocation(args: string[]) {
            _StdOut.putText("The relative end of your conscious timeline.");
            _StdOut.advanceLine();
            _StdOut.advanceLine();
            _StdOut.putText("Unless, of course, you're a time traveler.");
            _StdOut.advanceLine();
            _StdOut.putText("...Or your relative end is also your absolute end. Yikes.");
        }

        public shellSongs(args: string[]) {
            if (args.length > 0) {
                var mood = args[0];
                switch (mood) {
                    case "happy":
                        _StdOut.putText("Wired - Sonny Fodera, Ella Eyre")
                        _StdOut.advanceLine();
                        _StdOut.putText("A Lover's Holiday - Change");
                        _StdOut.advanceLine();
                        _StdOut.putText("Thunder Clatter - Wild Cub")

                        break;
                    case "sad":
                        _StdOut.putText("All Out of Love - Air Supply");
                        _StdOut.advanceLine();
                        _StdOut.putText("Not the Same Anymore - The Strokes");
                        _StdOut.advanceLine();
                        _StdOut.putText("If I Only Had the Words to Tell You- Billy Joel");
                        break;
                    case "angry":
                        _StdOut.putText("Daphne Did It - Cleopatrick");
                        _StdOut.advanceLine();
                        _StdOut.putText("Little Monster - Royal Blood");
                        _StdOut.advanceLine();
                        _StdOut.putText("Iron Man - Black Sabbath");
                        break;
                    case "heartbroken":
                        _StdOut.putText("All Too Well - Taylor Swift");
                        _StdOut.advanceLine();
                        _StdOut.putText("Heat Waves - Glass Animals");
                        _StdOut.advanceLine();
                        _StdOut.putText("Not Over You - Gavin DeGraw");
                        break;
                    case "stressed":
                        _StdOut.putText("Take It Easy - The Eagles");
                        _StdOut.advanceLine();
                        _StdOut.putText("You're Only Human - Billy Joel");
                        _StdOut.advanceLine();
                        _StdOut.putText("I'm Still Standing - Elton John");
                        break;
                    case "villainous":
                        _StdOut.putText("Swan Lake, Op. 20, Act II No. 10: Scene Moderato");
                        _StdOut.advanceLine();
                        _StdOut.putText("Lacrimosa - Mozart");
                        _StdOut.advanceLine();
                        _StdOut.putText("Symphony No. 7 in A Major, Op.92: II. Allegretto - Beethoven");
                        break;
                    default:
                        _StdOut.putText("Sorry, I've never felt " + args[0] + " before.");
                        _StdOut.advanceLine();
                }
            } else {
                _StdOut.putText("Usage: imfeeling <string>  Please supply a string.");
            }
        }

        public shellStatus(args: string[]) {
            if (args.length > 0) {
                var statusMsg = args.toString();
                for (let i=0; i<statusMsg.length; i++) {
                    statusMsg = statusMsg.replace(",", " ");
                }
                TSOS.Control.setStatus(statusMsg);
            } else {
                _StdOut.putText("Usage: status <string>  Please supply a string");
            }
        }

        public shellTestKrnTrapError(args: string[]) {
            _Kernel.krnTrapError("ChaOS has been shutdown.");
        }

        public shellLoad(args: string[]) {
            if (_CPU.isExecuting) {
                _StdOut.putText("Load Error: Please wait for the current process(s) to finish executing.");
            } else {
                // if ((_Memory.isFull) && (_CurrentPCB != null)) {
                //     _CurrentPCB.state = "terminated";
                //     // set the last segment to inactive and overwrite memory
                //     _MemoryManager.segmentsList[_MemoryManager.segmentsList.length-1].isActive = false;
                //     Control.updatePCBStateInTable(_CurrentPCB.pid, _CurrentPCB.state);
                //     _StdOut.putText(`Process ${_CurrentPCB.pid}: Overwriting Memory...`);
                //     _StdOut.advanceLine();
                // }
    
                // Clear memory of inactive segments
                // Implemented to improve memory output updating
                _MemoryManager.clearInactiveSegments();
                
                // Get da op codes
                var opcode_str = Control.getOpCodes();
    
                if (opcode_str != null) {
                    _CurrentPCB = new PCB(_PidCounter);

                    if (_Memory.isFull) {
                        if (_krnDiskDriver.disk.isFormatted) {
                            _CurrentPCB.location = "disk";
                        } else {
                            _StdOut.putText("Memory is full.");
                            _StdOut.advanceLine();
                            _StdOut.putText("Please format the disk to load another program.");
                            return;
                        }
                    }

                    _PidCounter += 1;
                    _PCBlist.push(_CurrentPCB);
    
                    // Add a new row to the Processes table
                    Control.addRowToPCBTable();
    
                    // Load the program into memory	
                    // Regex that splits hex string into a list of individual op codes
                    _MemoryManager.load(_CurrentPCB, opcode_str.match(/.{1,2}/g), null);
    
                    _StdOut.putText("Successfuly loaded program into memory.");
                    _StdOut.advanceLine();
                    _StdOut.putText(`PID: ${_CurrentPCB.pid}`);
                    _StdOut.advanceLine();
                    _StdOut.advanceLine();
                    _StdOut.putText(`Execute \'run ${_CurrentPCB.pid}\' to run your program.`)
                }
            } 
        }

        public shellRun(args: string[]) {
            let pid = parseInt(args[0]);
            let potentialPCB = _PCBlist.find(process => process.pid == pid);
            _Scheduler.numActiveProcesses = 0;

            if (Number.isNaN(pid)) {
                _StdOut.putText(`Please enter a valid process id.`);
                _StdOut.advanceLine();
                _StdOut.putText("Usage: run <pid>")
            } else if (!potentialPCB)  {
                _StdOut.putText(`Process ${pid} does not exist.`);
            } else if (potentialPCB.state === "running") {
                _StdOut.putText(`Process ${pid} is already running.`);
            }
            else if (potentialPCB.state === "terminated") {
                _StdOut.putText(`Process ${pid} is terminated.`);
            } else {
                // Our potential process is legit so we set it the current process
                // Update state to "ready"
                _CurrentPCB = potentialPCB;
                _CurrentPCB.state = "ready";

                // Add the process to the ready queue and schedule it
                _Scheduler.readyQueue.enqueue(_CurrentPCB);
                _Scheduler.numActiveProcesses++;
                // Control.addRowToReadyQueueTable();
                _Scheduler.schedule();
            }
        }

        public shellRunAll(args: string[]) {
            let processExists: boolean = false;
            _Scheduler.numActiveProcesses = 0;

            for (let i=0; i<_PCBlist.length; i++) {
                // Add all resident processes to the ready queue
                if (_PCBlist[i].state == "resident") {
                    _CurrentPCB = _PCBlist[i];
                    _CurrentPCB.state = "ready";
                    _Scheduler.readyQueue.enqueue(_CurrentPCB);
                    _Scheduler.numActiveProcesses++;
                    // Control.addRowToReadyQueueTable();
                    processExists = true;
                }
            }

            // Only schedule if a resident process exists
            if (processExists) {
                _Scheduler.schedule()
            } else {
                _StdOut.putText("There are no processes to run.")
            }
        }

        public shellMemoryDump(args: string[]) {
            _MemAccessor.displayMemory(0x300);
            _StdOut.putText("Done.");
        }

        public shellClearMem(args: string[]) {
            let i = 0;
            let canClearMem = false;
            while (i<_PCBlist.length) {
                if (_PCBlist[i].state == "running") {
                    canClearMem = false;
                    break;
                } else {
                    canClearMem = true;
                }
                i++;
            }

            if (canClearMem) {
                // Terminate all processes and update output
                for (let i=0; i<_PCBlist.length; i++) {
                    _PCBlist[i].state = "terminated";
                    Control.updatePCBStateInTable(_PCBlist[i].pid, _PCBlist[i].state);
                }

                // Reset memory and update output
                _Memory.reset();
                Control.updateMemoryOutput();

                // Clear the ready queue
                _Scheduler.reset();
                Control.updateReadyQueueTable();

                // Make all segments inactive
                _MemoryManager.resetSegments();

                // Reset current process to null
                _CurrentPCB = null;
            } else {
                _StdOut.putText("Cannot clear memory while processes are running. Not cool...");
            }
        }

        public shellPS(args: string[]) {
            _StdOut.putText("-----------------")
            _StdOut.advanceLine();
            if (_PCBlist.length == 0) {
                _StdOut.putText("No active processes.");
            } else {
                for (let i=0; i<_PCBlist.length; i++) {
                    _StdOut.putText(`PID: ${_PCBlist[i].pid}`);
                    _StdOut.advanceLine();
                    _StdOut.putText(`State: ${_PCBlist[i].state}`);
                    _StdOut.advanceLine();
                    if (i!=_PCBlist.length-1) {
                        _StdOut.advanceLine();
                    }
                }
                _StdOut.putText("-----------------")
            }
        }

        public shellKill(args: string[]) {
            let pid = parseInt(args[0]);
            let targetPCB = _PCBlist.find(process => process.pid == pid);

            if (Number.isNaN(pid)) {
                _StdOut.putText(`Please enter a valid process id.`);
                _StdOut.advanceLine();
                _StdOut.putText("Usage: kill <pid>")
            } else if (!targetPCB)  {
                _StdOut.putText(`Process ${pid} does not exist.`);
            } else if (targetPCB.state != "terminated") {
                // Set the current process to null and reset the CPU if target process is running
                if (targetPCB.state == "running") {
                    _CPU.init();
                    _CurrentPCB = null;
                    _Dispatcher.runningPCB = null;
                    _Scheduler.schedule();
                }
                // Set the target state to terminated and remove it from the ready queue
                targetPCB.state = "terminated";
                _Scheduler.readyQueue.remove(targetPCB);
                targetPCB.assignedSegment.isActive = false;

                // Update all tables
                Control.updatePCBStateInTable(targetPCB.pid, targetPCB.state);
                Control.updateMemoryOutput();
                Control.updateCPUtable();
                Control.updateReadyQueueTable();

                _StdOut.putText(`Process ${targetPCB.pid} has been successfully terminated.`);
            } else if (targetPCB.state == "terminated") {
                _StdOut.putText(`Process ${targetPCB.pid} is already terminated.`);
            }
        }

        public shellKillAll(args: string[]) {
            let processExists: boolean = false; 

            for (let i=0; i<_PCBlist.length; i++) {
                // Set the state of all non-terminated processes to terminated
                if (_PCBlist[i].state != "terminated") {
                    _PCBlist[i].state = "terminated";
                    Control.updatePCBStateInTable(_PCBlist[i].pid, _PCBlist[i].state);
                    processExists = true;
                }
            }

            // Only clear the ready queue if a non-terminated process exists
            if (processExists) {
                // Reset the ready queue and clear quanta count
                _Scheduler.readyQueue.reset();
                Control.updateReadyQueueTable();
                _Scheduler.quantaCount = 0;

                // No processes are running so...
                _Dispatcher.runningPCB = null;
                _CurrentPCB = null;

                // Clear memory segments and reintialize CPU
                _MemoryManager.resetSegments();
                _CPU.init();
                Control.updateCPUtable();

                if (!Kernel.isShutdown && !_krnDiskDriver.disk.isFull ) {
                    _StdOut.putText("All processes have been killed.")
                }
            } else {
                if (!Kernel.isShutdown && !_krnDiskDriver.disk.isFull) {
                    _StdOut.putText("There are no processes to kill.");
                }
            }
        }

        public shellSetQuantum(args: string[]) {
            if (Number.isNaN(Number(args[0])) || Number(args[0])<=0) {
                _StdOut.putText("Please enter a valid quantum value.");
            } else {
                console.log(args);
                _StdOut.putText("Quantum change successful.");
                _StdOut.advanceLine();
                _StdOut.putText(`Switching quantum ${_Scheduler.quantum} to ${parseInt(args[0], 10)}.`);
                _Scheduler.quantum = parseInt(args[0], 10);
            }
        }

        public shellFormat(args: string[]) {
            let isFormatted = _krnDiskDriver.format();
            if (isFormatted) {
                _StdOut.putText("Disk successfully formatted.");
            } else {
                _StdOut.putText("ERR: Could not format disk.");
            }
        }

        public shellCreate(args: string[]) {
            // check if disk is formatted
            if (!_krnDiskDriver.disk.isFormatted) {
                _StdOut.putText("Please format the disk first.");
            } else {
                let fileName = args[0];
                if (!fileName) {
                    _StdOut.putText("Invalid input: Usage -- create <filename>");
                } else {
                    // false returned if file already exists
                    let created = _krnDiskDriver.createFile(fileName);
                    if (created) {
                        _StdOut.putText(`File ${fileName} successfully created.`);
                    } else {
                        _StdOut.putText(`ERR: File ${fileName} already exists.`);
                    }
                }
            }
            
        }

        public shellRead(args: string[]) {
            if (_krnDiskDriver.disk.isFormatted) {
                if (args.length > 0) {
                    let data = Utils.hexToText(_krnDiskDriver.readFile(args[0]));
                    if (data == null) {
                        _StdOut.putText("\'" + args[0] + "\' does not exist.");
                    } else if (data == '') {
                        _StdOut.putText("\'" + args[0] + "\' has no content.");
                    } else {
                        _StdOut.putText(data);
                    }
                } else {
                    _StdOut.putText('Invalid input: Usage -- read <filename>');
                }
            } else {
                _StdOut.putText("Please format the disk first.");
            }
        }

        public shellWrite(args: string[]) {
            // check if disk is formatted
            if (!_krnDiskDriver.disk.isFormatted) {
                _StdOut.putText("Please format the disk first.");
            } else {
                if (args.length >= 2) {
                    if (args[1] == '\"\"') {
                        _StdOut.putText('Invalid input: Please supply a valid data string');
                        _StdOut.advanceLine();
                        _StdOut.putText('Usage -- write <filename> "data"');
                    } else if (args[1].startsWith('"') && args[args.length-1].endsWith('"')) {
                            let fileName = args[0];

                            // get the array of input data
                            let dataArr = args.slice(1, args.length);

                            // combine the array into a single string
                            let data = dataArr.join(' ').slice(1, -1);
                            data = Utils.textToHex(data);

                            let msg = _krnDiskDriver.writeFile(fileName, data);
                            if (msg == 'success') {
                                _StdOut.putText("\'" + fileName + "\' successfully edited (yay).");
                            } else if (msg == 'does not exist') {
                                _StdOut.putText("\'" + fileName + "\' doesn't exist.");
                            }
                    } else {
                        _StdOut.putText('Input must be wrapped in quotations.');
                        _StdOut.advanceLine();
                        _StdOut.putText('Usage -- write <filename> "data"');
                    }
                } else {
                    _StdOut.putText('Invalid input: Usage -- write <filename> "data"');
                }
            }
        }

        public shellDelete(args: string[]) {
            if (!_krnDiskDriver.disk.isFormatted) {
                _StdOut.putText("Please format the disk first.");
            } else {
                if (args.length > 0) {
                    let isDeleted = _krnDiskDriver.deleteFile(args[0]);
                    if (isDeleted) {
                        _StdOut.putText(args[0] + ' successfully deleted.');
                    } else {
                        _StdOut.putText(args[0] + ' does not exist.');
                    }
                } else {
                    _StdOut.putText('Invalid input: Usage -- delete <filename>');
                }
            } 
        }

        public shellCopy(args: string[]) {
            if (!_krnDiskDriver.disk.isFormatted) {
                _StdOut.putText("Please format the disk first.");
            } else {
                if (args.length == 2) {
                    let msg = _krnDiskDriver.copyFile(args[0], args[1]);
                    if (msg == 'success') {
                        _StdOut.putText('Copy successful.');
                    } else if (msg == 'new file exists') {
                        _StdOut.putText("\'" + args[1] + '\' already exists.');
                    } else {
                        _StdOut.putText("\'" + args[0] + '\' does not exist.');
                    }
                } else {
                    _StdOut.putText('Invalid input: Usage -- copy <existing filename> <new filename>');
                }
            }
        }

        public shellRename(args: string[]) {
            if (!_krnDiskDriver.disk.isFormatted) {
                _StdOut.putText("Please format the disk first.");
            } else {
                if (args.length > 0) {
                    let msg = _krnDiskDriver.renameFile(args[0], args[1])
                    if (msg == 'success') {
                        _StdOut.putText('Rename successful. ' + args[0] + ' => ' + args[1]);
                    } else if (msg == 'cannot find file') {
                        _StdOut.putText(args[0] + ' does not exist.');
                    } else {
                        _StdOut.putText(args[1] + ' already exists.');
                    }
                } else {
                    _StdOut.putText('Invalid input: Usage -- rename <existing filename> <new filename>');
                }
            }    
        }

        public shellLS(args: string[]) {
            let files = _krnDiskDriver.getAllFiles();
            if (!_krnDiskDriver.disk.isFormatted) {
                _StdOut.putText("Please format the disk first.");
            } else {
                if (files.length > 0) {
                    _StdOut.putText('Files currently stored on the disk:');
                    _StdOut.advanceLine();
                    for (let i=0; i<files.length; i++) {
                        _StdOut.putText(files[i]);
                        _StdOut.advanceLine();
                    }
                } else {
                    _StdOut.putText('There are no files currently stored on the disk.');
                }
            }
        }

        public shellSetSchedule(args: string[]) {
            if (args.length > 0) {
                args[0] = args[0].toUpperCase();
                if (args[0] == ROUND_ROBIN) {
                    _Scheduler.schedulingAlgorithm = args[0];
                    _Scheduler.quantum = 6;
                    _StdOut.putText("Scheduling algorithm set to Round Robin.");
                } else if (args[0] == FCFS) {
                    _Scheduler.schedulingAlgorithm = args[0];
                    _StdOut.putText("Scheduling algorithm set to First Come First Serve.");
                } else {
                    _StdOut.putText("Invalid input: Possible algorithms include");
                    _StdOut.advanceLine();
                    _StdOut.putText("RR - Round Robin");
                    _StdOut.advanceLine();
                    _StdOut.putText("FCFS - First Come First Serve");
                }
            } else {
                _StdOut.putText("Invalid input: Possible algorithms include");
                _StdOut.advanceLine();
                _StdOut.putText("RR - Round Robin");
                _StdOut.advanceLine();
                _StdOut.putText("FCFS - First Come First Serve");
            }
        }

        public shellGetSchedule() {
            if (_Scheduler.schedulingAlgorithm == ROUND_ROBIN) {
                _StdOut.putText("Round Robin");
            } else if (_Scheduler.schedulingAlgorithm == FCFS) {
                _StdOut.putText("First Come First Serve");
            }
        }
    }
}