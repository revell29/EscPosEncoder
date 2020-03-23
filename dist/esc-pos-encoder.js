"use strict";
exports.__esModule = true;
var iconv_lite_1 = require("iconv-lite");
var linewrap_1 = require("linewrap");
var EscPosEncoder = (function () {
    function EscPosEncoder() {
        this._reset();
    }
    EscPosEncoder.prototype._reset = function () {
        this._buffer = [];
        this._codepage = 'ascii';
        this._state = {
            'bold': false,
            'italic': false,
            'underline': false,
            'hanzi': false
        };
    };
    EscPosEncoder.prototype._encode = function (value) {
        return iconv_lite_1["default"].encode(value, this._codepage);
    };
    EscPosEncoder.prototype._queue = function (value) {
        var _this = this;
        value.forEach(function (item) { return _this._buffer.push(item); });
    };
    EscPosEncoder.prototype.initialize = function () {
        this._queue([
            0x1b, 0x40,
        ]);
        return this;
    };
    EscPosEncoder.prototype.codepage = function (value) {
        var codepages = {
            'cp437': [0x00, false],
            'cp737': [0x40, false],
            'cp850': [0x02, false],
            'cp775': [0x5f, false],
            'cp852': [0x12, false],
            'cp855': [0x3c, false],
            'cp857': [0x3d, false],
            'cp858': [0x13, false],
            'cp860': [0x03, false],
            'cp861': [0x38, false],
            'cp862': [0x3e, false],
            'cp863': [0x04, false],
            'cp864': [0x1c, false],
            'cp865': [0x05, false],
            'cp866': [0x11, false],
            'cp869': [0x42, false],
            'cp936': [0xff, true],
            'cp949': [0xfd, true],
            'cp950': [0xfe, true],
            'cp1252': [0x10, false],
            'iso88596': [0x16, false],
            'shiftjis': [0xfc, true],
            'windows1250': [0x48, false],
            'windows1251': [0x49, false],
            'windows1252': [0x47, false],
            'windows1253': [0x5a, false],
            'windows1254': [0x5b, false],
            'windows1255': [0x20, false],
            'windows1256': [0x5c, false],
            'windows1257': [0x19, false],
            'windows1258': [0x5e, false]
        };
        var codepage;
        if (!iconv_lite_1["default"].encodingExists(value)) {
            throw new Error('Unknown codepage');
        }
        if (value in iconv_lite_1["default"].encodings) {
            if (typeof iconv_lite_1["default"].encodings[value] === 'string') {
                codepage = iconv_lite_1["default"].encodings[value];
            }
            else {
                codepage = value;
            }
        }
        else {
            throw new Error('Unknown codepage');
        }
        if (typeof codepages[codepage] !== 'undefined') {
            this._codepage = codepage;
            this._state.hanzi = codepages[codepage][1];
            this._queue([
                0x1b, 0x74, codepages[codepage][0],
            ]);
        }
        else {
            throw new Error('Codepage not supported by printer');
        }
        return this;
    };
    EscPosEncoder.prototype.text = function (value, wrap) {
        if (wrap) {
            var w = linewrap_1["default"](wrap, { lineBreak: '\r\n' });
            value = w(value);
        }
        var bytes = this._encode(value);
        if (this._state.hanzi) {
            this._queue([
                0x1c, 0x26, bytes, 0x1c, 0x2e,
            ]);
        }
        else {
            this._queue([
                bytes,
            ]);
        }
        return this;
    };
    EscPosEncoder.prototype.newline = function () {
        this._queue([
            0x0a, 0x0d,
        ]);
        return this;
    };
    EscPosEncoder.prototype.line = function (value, wrap) {
        this.text(value, wrap);
        this.newline();
        return this;
    };
    EscPosEncoder.prototype.underline = function (value) {
        if (typeof value === 'undefined') {
            value = !this._state.underline;
        }
        this._state.underline = value;
        this._queue([
            0x1b, 0x2d, Number(value),
        ]);
        return this;
    };
    EscPosEncoder.prototype.italic = function (value) {
        if (typeof value === 'undefined') {
            value = !this._state.italic;
        }
        this._state.italic = value;
        this._queue([
            0x1b, 0x34, Number(value),
        ]);
        return this;
    };
    EscPosEncoder.prototype.bold = function (value) {
        if (typeof value === 'undefined') {
            value = !this._state.bold;
        }
        this._state.bold = value;
        this._queue([
            0x1b, 0x45, Number(value),
        ]);
        return this;
    };
    EscPosEncoder.prototype.size = function (value) {
        var realSize = 0;
        switch (value) {
            case 0:
                realSize = 0;
                break;
            case 1:
                realSize = 17;
                break;
            case 2:
                realSize = 34;
                break;
            case 3:
                realSize = 51;
                break;
            case 4:
                realSize = 68;
                break;
            case 5:
                realSize = 85;
                break;
            case 6:
                realSize = 102;
                break;
            case 7:
                realSize = 119;
                break;
        }
        this._queue([
            0x1b, 0x4d, 0x00,
        ]);
        this._queue([
            0x1d, 0x21, realSize,
        ]);
        return this;
    };
    EscPosEncoder.prototype.align = function (value) {
        var alignments = {
            'left': 0x00,
            'center': 0x01,
            'right': 0x02
        };
        if (value in alignments) {
            this._queue([
                0x1b, 0x61, alignments[value],
            ]);
        }
        else {
            throw new Error('Unknown alignment');
        }
        return this;
    };
    EscPosEncoder.prototype.barcode = function (value, symbology, height) {
        var symbologies = {
            'upca': 0x00,
            'upce': 0x01,
            'ean13': 0x02,
            'ean8': 0x03,
            'coda39': 0x04,
            'itf': 0x05,
            'codabar': 0x06
        };
        if (symbology in symbologies) {
            var bytes = iconv_lite_1["default"].encode(value, 'ascii');
            this._queue([
                0x1d, 0x68, height,
                0x1d, 0x77, symbology === 'code39' ? 0x02 : 0x03,
                0x1d, 0x6b, symbologies[symbology],
                bytes,
                0x00,
            ]);
        }
        else {
            throw new Error('Symbology not supported by printer');
        }
        return this;
    };
    EscPosEncoder.prototype.qrcode = function (value, model, size, errorlevel) {
        this._queue([
            0x0a,
        ]);
        var models = {
            1: 0x31,
            2: 0x32
        };
        if (typeof model === 'undefined') {
            model = 2;
        }
        if (model in models) {
            this._queue([
                0x1d, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, models[model], 0x00,
            ]);
        }
        else {
            throw new Error('Model must be 1 or 2');
        }
        if (typeof size === 'undefined') {
            size = 6;
        }
        if (typeof size !== 'number') {
            throw new Error('Size must be a number');
        }
        if (size < 1 || size > 8) {
            throw new Error('Size must be between 1 and 8');
        }
        this._queue([
            0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, size,
        ]);
        var errorlevels = {
            'l': 0x30,
            'm': 0x31,
            'q': 0x32,
            'h': 0x33
        };
        if (typeof errorlevel === 'undefined') {
            errorlevel = 'm';
        }
        if (errorlevel in errorlevels) {
            this._queue([
                0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, errorlevels[errorlevel],
            ]);
        }
        else {
            throw new Error('Error level must be l, m, q or h');
        }
        var bytes = iconv_lite_1["default"].encode(value, 'iso88591');
        var length = bytes.length + 3;
        this._queue([
            0x1d, 0x28, 0x6b, length % 0xff, length / 0xff, 0x31, 0x50, 0x30, bytes,
        ]);
        this._queue([
            0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30,
        ]);
        return this;
    };
    EscPosEncoder.prototype.cut = function (value) {
        var data = 0x00;
        if (value == 'partial') {
            data = 0x01;
        }
        this._queue([
            0x1b, 0x56, data,
        ]);
        return this;
    };
    EscPosEncoder.prototype.raw = function (data) {
        this._queue(data);
        return this;
    };
    EscPosEncoder.prototype.encode = function () {
        var length = 0;
        this._buffer.forEach(function (item) {
            if (typeof item === 'number') {
                length++;
            }
            else {
                length += item.length;
            }
        });
        var result = new Uint8Array(length);
        var index = 0;
        this._buffer.forEach(function (item) {
            if (typeof item === 'number') {
                result[index] = item;
                index++;
            }
            else {
                result.set(item, index);
                index += item.length;
            }
        });
        this._reset();
        return result;
    };
    return EscPosEncoder;
}());
exports["default"] = EscPosEncoder;
