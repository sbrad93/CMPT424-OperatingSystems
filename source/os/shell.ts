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
                                  "- Clears the screen and resets the cursor position.");
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

            // status
            sc = new ShellCommand(this.shellStatus,
                                "status",
                                "<string> - Sets the status message.");
            this.commandList[this.commandList.length] = sc;

            // test kernel trap error
            sc = new ShellCommand(this.shellTestKrnTrapError,
                                "bsod",
                                "- Tests when kernel traps an OS error and displays BSOD.");
            this.commandList[this.commandList.length] = sc;

            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.

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
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
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
                        _StdOut.putText("Tests when the kernel traps and OS error and displays BSOD.")
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
            _StdOut.putText("Unless, of course, you're a time traveller.");
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
    }
}