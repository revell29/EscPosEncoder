"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var esc_pos_encoder_1 = require("./esc-pos-encoder");
var AlignEnum;
(function (AlignEnum) {
    AlignEnum["left"] = "left";
    AlignEnum["center"] = "center";
    AlignEnum["right"] = "right";
})(AlignEnum || (AlignEnum = {}));
/**
 * Create a byte stream based on commands for ESC/POS printers
 */
var EscPosImgEncoder = /** @class */ (function (_super) {
    __extends(EscPosImgEncoder, _super);
    /**
     * Create a new EscPosEncoder
     */
    function EscPosImgEncoder() {
        var _this = _super.call(this) || this;
        _this.alignValue = AlignEnum.left;
        _this.fontValue = '28px "Custom"';
        _this.width58 = 384;
        _this.width80 = 568;
        _this.lineHeight = 32;
        _this.lineHeight0 = 32;
        _this.lineHeight2 = 56;
        _this.heightPosition = 32;
        _this.cutAtFinal = false;
        _this.fontFoot = 16; // 给字体下方留下空间，防止截断
        // console.log('canvasNode', canvasNode);
        // registerFont('../../../../src/assets/font/锐字云字库胖头鱼体GBK.ttf', {family: 'Custom'});
        _this.CVS = document.createElement('canvas');
        _this._reset();
        return _this;
    }
    /**
     * Reset the state of the EscPosEncoder
     *
     */
    EscPosImgEncoder.prototype._reset = function () {
        this.heightPosition = 32;
        this.resize(this.width58, 0);
        this.ctx = this.CVS.getContext('2d');
        this.ctx.textBaseline = 'bottom';
        console.log('_reset', this.CVS);
        _super.prototype._reset.call(this);
    };
    /**
     * Change the code page
     *
     * @param  {string}   value  The codepage that we set the printer to
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    EscPosImgEncoder.prototype.codepage = function (value) {
        console.log('codepage', this.CVS);
        return this;
    };
    /**
     * Change text size
     *
     * @param  {number}          value   small or normal
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    EscPosImgEncoder.prototype.size = function (value) {
        this._size = value;
        switch (value) {
            case 0: // 正常字体
                this.fontValue = '28px "Custom"';
                this.lineHeight = this.lineHeight0;
                break;
            case 1: // 高度加倍
                this.fontValue = '28px "Custom"';
                this.lineHeight = this.lineHeight0;
                break;
            case 2: // 宽高都加倍
                this.fontValue = '56px "Custom"';
                this.lineHeight = this.lineHeight2;
                break;
        }
        this.ctx.font = this.fontValue;
        return this;
    };
    /**
     * 设置打印机宽度
     *
     * @param  {PrinterWidthEnum}   type  需要被分割的字符串
     * @returns {EscPosEncoder} 返回this
     */
    EscPosImgEncoder.prototype.setPinterType = function (type) {
        if (type === esc_pos_encoder_1.PrinterWidthEnum._58) {
            this.resize(this.width58, this.CVS.height);
        }
        else if (type === esc_pos_encoder_1.PrinterWidthEnum._80) {
            this.resize(this.width80, this.CVS.height);
        }
        _super.prototype.setPinterType.call(this, type);
        return this;
    };
    /**
     * Change text alignment
     *
     * @param  {string}          value   left, center or right
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    EscPosImgEncoder.prototype.align = function (value) {
        if (!AlignEnum[value]) {
            throw new Error('Unknown alignment');
        }
        this.alignValue = value;
        console.log('align', this.alignValue);
        return this;
    };
    /**
     * Print text, followed by a newline
     *
     * @param  {string}   value  Text that needs to be printed
     * @param  {number}   wrap   Wrap text after this many positions
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    EscPosImgEncoder.prototype.line = function (value, wrap) {
        var _this = this;
        var fixedWidthStrArr = this.splitByWidth(value, this.CVS.width);
        fixedWidthStrArr.forEach(function (str) {
            _this.newline();
            _this.text(str, wrap);
        });
        return this;
    };
    /**
     * Print text
     *
     * @param  {string}   value  Text that needs to be printed
     * @param  {number}   wrap   Wrap text after this many positions
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    EscPosImgEncoder.prototype.text = function (value, wrap) {
        var width = this.ctx.measureText(value).width;
        switch (this.alignValue) {
            case AlignEnum.left:
                this.ctx.fillText(value, 0, this.heightPosition);
                break;
            case AlignEnum.center:
                this.ctx.fillText(value, (this.CVS.width - width) / 2, this.heightPosition);
                break;
            case AlignEnum.right:
                this.ctx.fillText(value, this.CVS.width - width, this.heightPosition);
                break;
            default:
                throw new Error('align error');
        }
        return this;
    };
    /**
     * Print a newline
     *
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    EscPosImgEncoder.prototype.newline = function () {
        this.heightPosition += this.lineHeight;
        this.resize(this.CVS.width, this.heightPosition);
        return this;
    };
    /**
     * 动态修改画布大小
     *
     * @param {number} w  宽
     * @param {number} h  高
     */
    EscPosImgEncoder.prototype.resize = function (w, h) {
        var imgData = this.ctx.getImageData(0, 0, this.CVS.width, this.CVS.height);
        this.CVS.width = w;
        this.CVS.height = h + this.fontFoot;
        this.ctx.putImageData(imgData, 0, 0);
        this.ctx.font = this.fontValue;
    };
    /**
     * Encode all previous commands
     *
     * @returns {Uint8Array}         Return the encoded bytes
     *
     */
    EscPosImgEncoder.prototype.encode = function () {
        this.image(this.CVS, this.CVS.width, this.CVS.height, 'threshold');
        if (this.cutAtFinal) {
            _super.prototype.cutPartial.call(this);
        }
        var result = _super.prototype.encode.call(this);
        this._reset();
        return result;
    };
    /**
     * Bold text
     *
     * @param  {boolean}          value  true to turn on bold, false to turn off, or 2 for double underline
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    EscPosImgEncoder.prototype.bold = function (value) {
        return this;
    };
    /**
     * 打印一行字符
     *
     * @param {string} char 打印成行的字符
     * @param {string} message 提示信息
     * @param {boolean} middle 提示信息显示在行间
     * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
     */
    EscPosImgEncoder.prototype.printLine = function (char, message, middle) {
        if (message === void 0) { message = ''; }
        if (middle === void 0) { middle = false; }
        char = char.slice(0, 1);
        var restLength = this.CVS.width - this.getStrWidth(message);
        var charLength = this.getStrWidth(char);
        if (middle) {
            this.line(char.repeat(restLength / 2 / charLength) + message + char.repeat(restLength / 2 / charLength));
        }
        else {
            this.line(char.repeat(restLength / charLength));
            if (message) {
                var temp = this.alignValue;
                this.alignValue = AlignEnum.center;
                this.line(message);
                this.alignValue = temp;
            }
        }
        return this;
    };
    /**
     * Cut paper partial
     *
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    EscPosImgEncoder.prototype.cutPartial = function () {
        this.cutAtFinal = true;
        return this;
    };
    /**
     * 打印两个字符分别在纸的左右两侧
     *
     * @param  {string}   str1  左侧的字符串
     * @param  {string}   str2  右侧的字符串
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    EscPosImgEncoder.prototype.oneLine = function (str1, str2) {
        this.newline();
        var width = this.ctx.measureText(str2).width;
        this.ctx.fillText(str1, 0, this.heightPosition);
        this.ctx.fillText(str2, this.CVS.width - width, this.heightPosition);
        return this;
    };
    /**
     * 前台打印菜品，包含菜品名称，数量，价格
     *
     * @param {Array} dishes 菜品信息数组
     * @param {number} size 字体大小,默认1
     * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
     */
    EscPosImgEncoder.prototype.printFrontDeskDishs = function (dishes, size) {
        var _this = this;
        if (size === void 0) { size = 1; }
        var originSize = this._size;
        var countAndPriceLength = this.ctx.measureText('x99 999.99').width;
        var getCountAndPriceStr = function (count, price) {
            var priceStr = price.toFixed(2);
            var countStr = 'x' + count;
            var spaceNum = (countAndPriceLength - _this.getStrWidth(countStr) - _this.getStrWidth(priceStr)) / _this.getStrWidth(' ');
            return countStr + ' '.repeat(spaceNum < 0 ? 0 : spaceNum) + priceStr;
        };
        this.size(size);
        dishes.forEach(function (dish) {
            if (dish.count <= 0) {
                return;
            }
            var fixedWidthStrArr = _this.splitByWidth(dish.name, _this.CVS.width - countAndPriceLength - _this.getStrWidth('  '));
            fixedWidthStrArr.forEach(function (str, index) {
                if (index === 0) {
                    _this.oneLine(str, getCountAndPriceStr(dish.count, dish.price * dish.count));
                }
                else {
                    _this.line(str);
                }
            });
        });
        this.size(originSize);
        return this;
    };
    /**
     * 后厨打印菜品，包含菜品名称，数量，不包含价格
     *
     * @param {Array} dishes 菜品信息数组
     * @param {number} size 字体大小,默认2
     * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
     */
    EscPosImgEncoder.prototype.printChefDishs = function (dishes, size) {
        var _this = this;
        if (size === void 0) { size = 2; }
        var originSize = this._size;
        var countAndPriceLength = this.ctx.measureText('  x99').width;
        this.size(size);
        dishes.forEach(function (dish) {
            var fixedWidthStrArr = _this.splitByWidth(dish.name, _this.CVS.width - countAndPriceLength);
            fixedWidthStrArr.forEach(function (str, index) {
                if (dish.count <= 0) {
                    return;
                }
                if (index === 0) {
                    _this.oneLine(str, "x" + dish.count);
                }
                else {
                    _this.line(str);
                }
            });
        });
        this.size(originSize);
        return this;
    };
    /**
     * 根据打印宽度分割字符串
     *
     * @param  {string}   str  需要被分割的字符串
     * @param  {number}   maxLength  分割长度
     * @returns {Array} 返回被分割的字符串数组
     */
    EscPosImgEncoder.prototype.splitByWidth = function (str, maxLength) {
        var result = [];
        for (var i = 0; i < str.length; i++) {
            var char = str.slice(0, i);
            var width = this.ctx.measureText(char).width;
            if (width > maxLength) {
                result.push(str.slice(0, i - 1));
                result = result.concat(this.splitByWidth(str.slice(i - 1), maxLength));
                return result;
            }
        }
        return [str];
    };
    /**
     * 计算字符串的字节长度，也就是打印的宽度
     *
     * @param  {string}   str  需要计算的字符串
     * @returns {number} 返回被分割的字符串数组
     */
    EscPosImgEncoder.prototype.getStrWidth = function (str) {
        var width = this.ctx.measureText(str).width;
        return width;
    };
    /**
     * 打印空行
     *
     * @param {number} num 行数
     * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
     */
    EscPosImgEncoder.prototype.emptyLine = function (num) {
        if (num === void 0) { num = 1; }
        for (var i = 0; i < num; i++) {
            this.heightPosition += this.lineHeight0;
            this.resize(this.CVS.width, this.heightPosition);
        }
        return this;
    };
    return EscPosImgEncoder;
}(esc_pos_encoder_1.default));
exports.default = EscPosImgEncoder;
