/* --------
   Utils.ts

   Utility functions.
   -------- */

module TSOS {

    export class Utils {

        public static trim(str): string {
            // Use a regular expression to remove leading and trailing spaces.
            return str.replace(/^\s+ | \s+$/g, "");
            /*
            Huh? WTF? Okay... take a breath. Here we go:
            - The "|" separates this into two expressions, as in A or B.
            - "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
            - "\s+$" is the same thing, but at the end of the string.
            - "g" makes is global, so we get all the whitespace.
            - "" is nothing, which is what we replace the whitespace with.
            */
        }

        public static rot13(str: string): string {
            /*
               This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
               You can do this in three lines with a complex regular expression, but I'd have
               trouble explaining it in the future.  There's a lot to be said for obvious code.
            */
            var retVal: string = "";
            for (var i in <any>str) {    // We need to cast the string to any for use in the for...in construct.
                var ch: string = str[i];
                var code: number = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) + 13;  // It's okay to use 13.  It's not a magic number, it's called rot13.
                    retVal = retVal + String.fromCharCode(code);
                } else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) - 13;  // It's okay to use 13.  See above.
                    retVal = retVal + String.fromCharCode(code);
                } else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        }

        public static hexLog(num: number): string {
            // takes in a number and outputs the properly formatted 8-bit hexadecimal equivalent
            let ans: string;
            if (num < 0x100) {
                ans = '0x' + ('00' + num.toString(16).toUpperCase()).slice(-2);
            } else {
                ans = '0x' + (num.toString(16).toUpperCase());
            }
            return ans;
        }

        public static replaceAt(value: string, index: number, replacement: string): string {
            return value.substring(0, index) + replacement + value.substring(index + replacement.length);
        }

        // converts a text string to equivalent hex
        public static textToHex(str): string {
            let hexStr = "";
            for (let i=0; i<str.length; i++) {
                hexStr += str.charCodeAt(i).toString(16);
            }
            return hexStr;
        }

        // converts a hex string to equivalent text
        public static hexToText(str): string {
            if (str) {
                str = this.trimData(str);
                let textStr = "";
                for (let i=0; i<str.length; i+=2) {
                    textStr += String.fromCharCode(parseInt(str.substr(i, 2), 16));
                }
                return textStr;
            } else {
                return null;
            }
        }

        // removes trailing zeros from hex string
        public static trimData(data: string) {
            let dataArr = data.match(/.{1,2}/g);
            let i = 0;
            let res = ''
            while (i < dataArr.length) {
                if (dataArr[i] != '00') {
                    res += dataArr[i];
                } else {
                    break;
                }
                i++;
            }
            return res;
        }
    }
}
