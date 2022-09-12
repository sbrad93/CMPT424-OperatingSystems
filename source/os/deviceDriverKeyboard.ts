/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.
            var keyCode = params[0];
            var isShifted = params[1];
            if ((typeof keyCode === "number") && (typeof isShifted === "boolean")) {
                // Check that the params are valid, else OS Trap Error 
                _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
                var chr = "";
                // Check to see if we even want to deal with the key that was pressed.
                if (keyCode == 8) {
                    _KernelInputQueue.enqueue('\b');
                } else if (keyCode == 9) {
                    _KernelInputQueue.enqueue('\t');
                } else if ((keyCode >= 65) && (keyCode <= 90)) { // letter
                    if (isShifted === true) { 
                        chr = String.fromCharCode(keyCode); // Uppercase A-Z
                    } else {
                        chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
                    }
                    // TODO: Check for caps-lock and handle as shifted if so.
                    _KernelInputQueue.enqueue(chr);
                } else if (((keyCode >= 48) && (keyCode <= 57)) ||   // digits and symbols (if shifted)
                            (keyCode == 32)                     ||   // space
                            (keyCode == 13)) {                       // enter
                    if (isShifted === true) {
                        keyCode = this.convertSpecialCases(keyCode);
                    } 
                    chr = String.fromCharCode(keyCode);
                    _KernelInputQueue.enqueue(chr);
                } else if ((keyCode >= 186)                     || // more symbols
                            (keyCode <= 191)) {
                    if (isShifted === true) {
                        // Didn't want to make converSpecialCases also have boolean parameter so I just made the key event value negative
                        // Not sure which alternative is better, since now I have more switch cases
                        keyCode = this.convertSpecialCases(keyCode * -1);
                    } else {
                        keyCode = this.convertSpecialCases(keyCode);
                    }
                    chr = String.fromCharCode(keyCode);
                    _KernelInputQueue.enqueue(chr);
                }
            } else {
                TSOS.Kernel.krnTrapError("msg");
            }
        }

        public convertSpecialCases(_keyCode): number {
            // Convert key event value to unicode value for all instances where the two values are not equivalent
            var uni;
            switch (_keyCode) {
                // )
                case 48:
                    uni = 41;
                    break;
                // !
                case 49:
                    uni = 33;
                    break;
                // #
                case 51:
                    uni = 35;
                    break;
                // $
                case 52:
                    uni = 36;
                    break;
                // %
                case 53:
                    uni = 37;
                    break;
                // &
                case 55:
                    uni = 38;
                    break;
                // *
                case 56:
                    uni = 42;
                    break;
                // (
                case 57:
                    uni = 40;
                    break;
                // ;
                case 186:
                    uni = 59;
                    break;
                // :
                case -186:
                    uni = 58;
                    break;
                // =
                case 187:
                    uni = 61;
                    break;
                // +
                case -187:
                    uni = 43;
                    break;
                // ,
                case 188:
                    uni = 44;
                    break;
                // <
                case -188:
                    uni = 60;
                    break;
                // -
                case 189:
                    uni = 45;
                    break;
                // .
                case 190:
                    uni = 46;
                    break;
                // >
                case -190:
                    uni = 62;
                    break;
                // forward slash (/)
                case 191:
                    uni = 47;
                    break;
                // ?
                case -191:
                    uni = 63;
                    break;
            }
            return uni;
        }
    }
}
