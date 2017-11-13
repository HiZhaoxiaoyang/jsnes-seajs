/*
JSNES, based on Jamie Sanders' vNES
Copyright (C) 2010 Ben Firshman

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// Keyboard events are bound in the UI

;define(function(require, exports, module) {

    var JSNES = require('source/nes')

    JSNES.Keyboard = function() {
        var i;

        this.keys = {
            KEY_A: 0,
            KEY_B: 1,
            KEY_SELECT: 2,
            KEY_START: 3,
            KEY_UP: 4,
            KEY_DOWN: 5,
            KEY_LEFT: 6,
            KEY_RIGHT: 7
        };

        this.state1 = new Array(8);
        for (i = 0; i < this.state1.length; i++) {
            this.state1[i] = 0x40;
        }
        this.state2 = new Array(8);
        for (i = 0; i < this.state2.length; i++) {
            this.state2[i] = 0x40;
        }
    };

    JSNES.AutoFireA = JSNES.AutoFireB = function(inter, obj, key) {
        var val = 0x40
        inter = setInterval(function() {
            val = val == 0x40 ? 0x41 : 0x40
            obj.state1[obj.keys[key]] = val
        }.bind(obj), 200)
    }

    JSNES.Keyboard.prototype = {
        setKey: function(key, value) {

            switch (key) {
                case 88:
                    this.state1[this.keys.KEY_A] = value;
                    break; // X
                case 89:
                    this.state1[this.keys.KEY_B] = value;
                    break; // Y (Central European keyboard)
                case 90:
                    this.state1[this.keys.KEY_B] = value;
                    break; // Z
                case 17:
                    this.state1[this.keys.KEY_SELECT] = value;
                    break; // Right Ctrl
                case 13:
                    this.state1[this.keys.KEY_START] = value;
                    break; // Enter
                case 38:
                    this.state1[this.keys.KEY_UP] = value;
                    break; // Up
                case 40:
                    this.state1[this.keys.KEY_DOWN] = value;
                    break; // Down
                case 37:
                    this.state1[this.keys.KEY_LEFT] = value;
                    break; // Left
                case 39:
                    this.state1[this.keys.KEY_RIGHT] = value;
                    break; // Right


                case 74:
                    this.state1[this.keys.KEY_B] = value;
                    break; // j (Central European keyboard)
                case 75:
                    this.state1[this.keys.KEY_A] = value;
                    break; // k
                case 85:
                    // console.log(this.state1[this.keys.KEY_B], value)
                    this.state1[this.keys.KEY_B] = value;
                    break; // u
                    // // case 117: this.state1[this.keys.KEY_B] = value; break; // U
                case 73:
                    this.state1[this.keys.KEY_A] = value;
                    break; // i
                case 50:
                    this.state1[this.keys.KEY_SELECT] = value;
                    break; // 2
                case 49:
                    this.state1[this.keys.KEY_START] = value;
                    break; // 1
                case 87:
                    this.state1[this.keys.KEY_UP] = value;
                    break; // w
                case 83:
                    this.state1[this.keys.KEY_DOWN] = value;
                    break; // s
                case 65:
                    this.state1[this.keys.KEY_LEFT] = value;
                    break; // a
                case 68:
                    this.state1[this.keys.KEY_RIGHT] = value;
                    break; // d

                case 103:
                    this.state2[this.keys.KEY_A] = value;
                    break; // Num-7
                case 105:
                    this.state2[this.keys.KEY_B] = value;
                    break; // Num-9
                case 99:
                    this.state2[this.keys.KEY_SELECT] = value;
                    break; // Num-3
                case 97:
                    this.state2[this.keys.KEY_START] = value;
                    break; // Num-1
                case 104:
                    this.state2[this.keys.KEY_UP] = value;
                    break; // Num-8
                case 98:
                    this.state2[this.keys.KEY_DOWN] = value;
                    break; // Num-2
                case 100:
                    this.state2[this.keys.KEY_LEFT] = value;
                    break; // Num-4
                case 102:
                    this.state2[this.keys.KEY_RIGHT] = value;
                    break; // Num-6
                default:
                    return true;
            }

            return false; // preventDefault
        },

        keyDown: function(evt) {

            // var tick = 0x40
            // JSNES.tiker = JSNES.tiker%2==0?1:0
            if (JSNES.isAutoB || JSNES.isAutoA) {
                JSNES.tiker++
                // console.log(JSNES.tiker)
                var tick = 0x40 + (JSNES.tiker % 2)

                if (evt.keyCode == 85 || evt.keyCode == 73) {
                    this.setKey(evt.keyCode, tick)
                } else {
                    JSNES.isAutoB && this.setKey(85, tick)
                    JSNES.isAutoA && this.setKey(73, tick)
                    this.setKey(evt.keyCode, 0x41)
                }
                return
            }

            // if ((JSNES.isAutoB || JSNES.isAutoA) && (evt.keyCode!=85||evt.keyCode!=73)) {
            //     return
            // }

            if (!this.setKey(evt.keyCode, 0x41) && evt.preventDefault) {
                evt.preventDefault();
            }
        },

        keyUp: function(evt) {

            if (!this.setKey(evt.keyCode, 0x40) && evt.preventDefault) {
                evt.preventDefault();
            }
        },

        keyPress: function(evt) {
            // if (evt.keyCode == 117) {
            //     var tick = this.state1[this.keys.KEY_B]
            //     JSNES.tiker++
            //     tick = 0x4+(JSNES.tiker%2)
            //     this.state1[this.keys.KEY_B] = tick;
            // }else if (evt.keyCode == 105) {
            //     var tick = this.state1[this.keys.KEY_A]
            //     JSNES.tiker++
            //     tick = 0x4+(JSNES.tiker%2)
            //     this.state1[this.keys.KEY_A] = tick;
            // }
            // this.setKey(evt.keyCode, tick)
            evt.preventDefault();
        }
    };

    // special key events
    JSNES.SpKeyboard = function() {
        var i;

        this.keys = {
            KEY_A: 0,
            KEY_B: 1,
            KEY_SELECT: 2,
            KEY_START: 3,
            KEY_UP: 4,
            KEY_DOWN: 5,
            KEY_LEFT: 6,
            KEY_RIGHT: 7
        };

        this.state1 = new Array(8);
        for (i = 0; i < this.state1.length; i++) {
            this.state1[i] = 0x40;
        }
        this.state2 = new Array(8);
        for (i = 0; i < this.state2.length; i++) {
            this.state2[i] = 0x40;
        }
    }

    JSNES.SpKeyboard.prototype = {
        setKey: function(key, value) {

            switch (key) {

                case 85:
                    console.log(this.state1[this.keys.KEY_B], value)
                    this.state1[this.keys.KEY_B] = value;
                    break; // u
                    // case 117: this.state1[this.keys.KEY_B] = value; break; // U
                case 73:
                    this.state1[this.keys.KEY_A] = value;
                    break; // i
                default:
                    return true;
            }

            return false; // preventDefault
        },

        keyDown: function(evt) {
            console.log(evt.keyCode)
            if (!this.setKey(evt.keyCode, 0x41) && evt.preventDefault /*&& !JSNES.isAutoB*/ ) {
                // evt.preventDefault();
            }
        },

        keyUp: function(evt) {

            if (!this.setKey(evt.keyCode, 0x40) && evt.preventDefault /*&& !JSNES.isAutoB*/ ) {
                // evt.preventDefault();
            }
        },
    }


    // window.onkeydown= function(e) { console.log(e.keyCode) }
    module.exports = JSNES.Keyboard

});