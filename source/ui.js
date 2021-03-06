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

;define(function(require, exports, module) {

var JSNES = require('source/nes')
    ,DynamicAudio = require('lib/dynamicaudio-min.js')
    // ,dynamicaudio = require('source/nes')

    JSNES.Utils = JSNES.Utils || require('source/utils')

    JSNES.DummyUI = function(nes) {
        this.nes = nes;
        this.enable = function() {};
        this.updateStatus = function() {};
        this.writeAudio = function() {};
        this.writeFrame = function() {};
    };

    if (typeof jQuery !== 'undefined') {
        (function($) {
            $.fn.JSNESUI = function(roms) {
                var parent = this;
                var UI = function(nes) {
                    var self = this;
                    var wid = ~~(window.innerWidth > window.innerHeight ? window.innerHeight * .8 : window.innerWidth) + 'px';
                    self.nes = nes;

                    /*
                     * Create UI
                     */
                    self.root = $('<div></div>');
                    self.screen = $('<canvas id="can" class="nes-screen" width="' + 256 +
                        '" height="' + 240 + '"></canvas>').appendTo(self.root);

                    if (!self.screen[0].getContext) {
                        parent.html("Your browser doesn't support the <code>&lt;canvas&gt;</code> tag. Try Google Chrome, Safari, Opera or Firefox!");
                        return;
                    }

                    self.romContainer = $('<div class="nes-roms"></div>').appendTo(self.root);
                    self.romSelect = $('<select></select>').appendTo(self.romContainer);

                    self.controls = $('<div class="nes-controls"></div>').appendTo(self.root);
                    self.buttons = {
                        pause: $('<input type="button" value="暂停" class="nes-pause" disabled="disabled">').appendTo(self.controls),
                        restart: $('<input type="button" value="重启" class="nes-restart" disabled="disabled">').appendTo(self.controls),
                        sound: $('<input type="button" value="静音" class="nes-enablesound">').appendTo(self.controls),
                        zoom: $('<input type="button" value="放大" class="nes-zoom">').appendTo(self.controls)
                    };
                    self.status = $('<p class="nes-status">Booting up...</p>').appendTo(self.root);
                    self.root.appendTo(parent);

                    /*
                     * ROM loading
                     */
                    self.romSelect.change(function() {
                        self.loadROM();
                    });

                    /*
                     * Buttons
                     */
                    self.buttons.pause.click(function() {
                        if (self.nes.isRunning) {
                            self.nes.stop();
                            self.updateStatus("Paused");
                            self.buttons.pause.attr("value", "继续");
                        } else {
                            self.nes.start();
                            self.buttons.pause.attr("value", "暂停");
                        }
                    });

                    self.buttons.restart.click(function() {
                        self.nes.reloadRom();
                        self.nes.start();
                    });

                    self.buttons.sound.click(function() {
                        if (self.nes.opts.emulateSound) {
                            self.nes.opts.emulateSound = false;
                            self.buttons.sound.attr("value", "音乐");
                        } else {
                            self.nes.opts.emulateSound = true;
                            self.buttons.sound.attr("value", "静音");
                        }
                    });

                    self.zoomed = false;

                    self.screen.animate({
                        width: wid,
                        height: wid
                    });
                    self.buttons.zoom.attr("value", "缩小");
                    self.zoomed = true;
                    self.buttons.zoom.click(function() {
                        if (self.zoomed) {
                            self.screen.animate({
                                width: 256,
                                height: 240
                            });
                            self.buttons.zoom.attr("value", "放大");
                            self.zoomed = false;
                        } else {
                            self.screen.animate({
                                width: wid,
                                height: wid
                            });
                            self.buttons.zoom.attr("value", "缩小");
                            self.zoomed = true;
                        }
                    });

                    /*
                     * Lightgun experiments with mouse
                     * (Requires jquery.dimensions.js)
                     */
                    if ($.offset) {
                        self.screen.mousedown(function(e) {
                            if (self.nes.mmap) {
                                self.nes.mmap.mousePressed = true;
                                // FIXME: does not take into account zoom
                                self.nes.mmap.mouseX = e.pageX - self.screen.offset().left;
                                self.nes.mmap.mouseY = e.pageY - self.screen.offset().top;
                            }
                        }).mouseup(function() {
                            setTimeout(function() {
                                if (self.nes.mmap) {
                                    self.nes.mmap.mousePressed = false;
                                    self.nes.mmap.mouseX = 0;
                                    self.nes.mmap.mouseY = 0;
                                }
                            }, 500);
                        });
                    }

                    if (typeof roms != 'undefined') {
                        self.setRoms(roms);
                    }

                    /*
                     * Canvas
                     */
                    self.canvasContext = self.screen[0].getContext('2d');

                    if (!self.canvasContext.getImageData) {
                        parent.html("Your browser doesn't support writing pixels directly to the <code>&lt;canvas&gt;</code> tag. Try the latest versions of Google Chrome, Safari, Opera or Firefox!");
                        return;
                    }

                    self.canvasImageData = self.canvasContext.getImageData(0, 0, 256, 240);
                    self.resetCanvas();

                    /*
                     * Keyboard
                     */
                    JSNES.tiker = JSNES.tikerA = 0
                    JSNES.isAutoB = false
                    JSNES.isAutoA = false
                    $(document).
                    bind('keydown', function(evt) {
                        if (evt.keyCode == 85 || evt.keyCode == 73) {
                            //     self.nes.spkeyboard.keyDown(evt)
                            //     // evt.preventDefault()
                            //     return
                            (evt.keyCode == 85) && (JSNES.isAutoB = true);
                            (evt.keyCode == 73) && (JSNES.isAutoA = true)
                            // console.log('keyDown:', evt.keyCode)
                        }
                        self.nes.keyboard.keyDown(evt);
                    }).
                    bind('keyup', function(evt) {
                        if (evt.keyCode == 85 || evt.keyCode == 73) {
                            //     self.nes.spkeyboard.keyUp(evt)
                            //     // evt.preventDefault()
                            //     return
                            (evt.keyCode == 85) && (JSNES.isAutoB = false);
                            (evt.keyCode == 73) && (JSNES.isAutoA = false)
                            // console.log('keyUp:', evt.keyCode)
                            JSNES.tiker = JSNES.tiker % 2 == 0 ? 1 : 0
                        }
                        self.nes.keyboard.keyUp(evt);
                    }).
                    bind('keypress', function(evt) {
                        if (evt.keyCode == 85 || evt.keyCode == 73) {
                            //     self.nes.spkeyboard.keyPress(evt)
                            //     return
                            // console.log('keyPress:', evt.keyCode)
                        }
                        self.nes.keyboard.keyPress(evt);
                    });

                    /*
                     * Sound
                     */
                    self.dynamicaudio = new DynamicAudio({
                        swf: nes.opts.swfPath + 'dynamicaudio.swf'
                    });
                };

                UI.prototype = {
                    loadROM: function() {
                        var self = this;
                        self.updateStatus("Downloading...");
                        $.ajax({
                            url: escape(self.romSelect.val()),
                            xhr: function() {
                                var xhr = $.ajaxSettings.xhr();
                                if (typeof xhr.overrideMimeType !== 'undefined') {
                                    // Download as binary
                                    xhr.overrideMimeType('text/plain; charset=x-user-defined');
                                }
                                self.xhr = xhr;
                                return xhr;
                            },
                            complete: function(xhr, status) {
                                var i, data;
                                if (JSNES.Utils.isIE()) {
                                    var charCodes = JSNESBinaryToArray(
                                        xhr.responseBody
                                    ).toArray();
                                    data = String.fromCharCode.apply(
                                        undefined,
                                        charCodes
                                    );
                                } else {
                                    data = xhr.responseText;
                                }
                                self.nes.loadRom(data);
                                self.nes.start();
                                self.enable();
                            }
                        });
                    },

                    resetCanvas: function() {
                        this.canvasContext.fillStyle = 'black';
                        // set alpha to opaque
                        this.canvasContext.fillRect(0, 0, 256, 240);

                        // Set alpha
                        for (var i = 3; i < this.canvasImageData.data.length - 3; i += 4) {
                            this.canvasImageData.data[i] = 0xFF;
                        }
                    },

                    /*
                     *
                     * nes.ui.screenshot() --> return <img> element :)
                     */
                    screenshot: function() {
                        var data = this.screen[0].toDataURL("image/png"),
                            img = new Image();
                        img.src = data;
                        return img;
                    },

                    /*
                     * Enable and reset UI elements
                     */
                    enable: function() {
                        this.buttons.pause.attr("disabled", null);
                        if (this.nes.isRunning) {
                            this.buttons.pause.attr("value", "暂停");
                        } else {
                            this.buttons.pause.attr("value", "继续");
                        }
                        this.buttons.restart.attr("disabled", null);
                        if (this.nes.opts.emulateSound) {
                            this.buttons.sound.attr("value", "静音");
                        } else {
                            this.buttons.sound.attr("value", "音乐");
                        }
                    },

                    updateStatus: function(s) {
                        this.status.text(s);
                    },

                    setRoms: function(roms) {
                        this.romSelect.children().remove();
                        $("<option>选择游戏...</option>").appendTo(this.romSelect);
                        for (var groupName in roms) {
                            if (roms.hasOwnProperty(groupName)) {
                                var optgroup = $('<optgroup></optgroup>').
                                attr("label", groupName);
                                for (var i = 0; i < roms[groupName].length; i++) {
                                    $('<option>' + roms[groupName][i][0] + '</option>')
                                        .attr("value", roms[groupName][i][1])
                                        .appendTo(optgroup);
                                }
                                this.romSelect.append(optgroup);
                            }
                        }
                    },

                    writeAudio: function(samples) {
                        return this.dynamicaudio.writeInt(samples);
                    },

                    writeFrame: function(buffer, prevBuffer) {
                        var imageData = this.canvasImageData.data;
                        var pixel, i, j;

                        for (i = 0; i < 256 * 240; i++) {
                            pixel = buffer[i];

                            if (pixel != prevBuffer[i]) {
                                j = i * 4;
                                imageData[j] = pixel & 0xFF;
                                imageData[j + 1] = (pixel >> 8) & 0xFF;
                                imageData[j + 2] = (pixel >> 16) & 0xFF;
                                prevBuffer[i] = pixel;
                            }
                        }

                        this.canvasContext.putImageData(this.canvasImageData, 0, 0);
                    }
                };

                return UI;
            };
        })(jQuery);
    }

    module.exports = $.fn.JSNESUI

});