import * as iconv from 'iconv-lite';
import * as linewrap from 'linewrap';

declare module 'iconv-lite' {
    export const encodings: Array<string>;
}

interface PrinterParam {
  width: number;
  singleCharLength: number;
  doubleCharLength: number;
}

export enum PrinterWidthEnum {
  '_58' = 58,
  '_80' = 80,
}

/**
 * Create a byte stream based on commands for ESC/POS printers
 */
export default class EscPosEncoder {
    private _buffer
    private _codepage
    private _state
    private _58printerParam: PrinterParam = {
      width: 380,
      singleCharLength: 31,
      doubleCharLength: 15,
    }
    private _80printerParam: PrinterParam = {
      width: 500,
      singleCharLength: 47,
      doubleCharLength: 23,
    }
    private _printerParam: PrinterParam
    /**
     * Create a new EscPosEncoder
     *
     */
    constructor() {
      this._reset();
    }

    /**
     * Reset the state of the EscPosEncoder
     *
     */
    private _reset(): void {
      this._buffer = [];
      this._codepage = 'ascii';
      this._printerParam = this._58printerParam;

      this._state = {
        'bold': false,
        'italic': false,
        'underline': false,
        'hanzi': false,
      };
    }

    /**
     * Encode a string with the current code page
     *
     * @param  {string}   value  String to encode
     * @returns {Buffer}          Encoded string as a ArrayBuffer
     *
     */
    private _encode(value: string): Buffer {
      return iconv.encode(value, this._codepage);
    }

    /**
     * Add commands to the buffer
     *
     * @param  {Array}   value  And array of numbers, arrays, buffers or Uint8Arrays to add to the buffer
     *
     */
    private _queue(value): void {
      value.forEach((item) => this._buffer.push(item));
    }

    /**
     * 获取单个字符的字节数，也就是打印占宽
     *
     * @param  {string}   char  需要被分割的字符串
     * @returns {number} 返回字节数（占宽）
     */
    private getCharLength(char: string): number {
      let length;
      // eslint-disable-next-line no-control-regex
      if (/^[\x00-\xff]$/.test(char)) {
        length = 1;
      } else {
        length = 2;
      }
      return length;
    }

    /**
     * 根据打印宽度分割字符串
     *
     * @param  {string}   str  需要被分割的字符串
     * @param  {number}   maxLength  分割长度
     * @returns {Array} 返回被分割的字符串数组
     */
    private splitByWidth(str: string, maxLength: number): string[] {
      let width = 0;
      let result: string[] = [];
      for (let i = 0; i < str.length; i++) {
        const char = str.charAt(i);
        width += this.getCharLength(char);
        if (width > maxLength) {
          result.push(str.slice(0, i));
          result = result.concat(this.splitByWidth(str.slice(i), maxLength));
          return result;
        }
      }
      return [str];
    }

    /**
     * 计算字符串的字节长度，也就是打印的宽度
     *
     * @param  {string}   str  需要计算的字符串
     * @returns {number} 返回被分割的字符串数组
     */
    private getStrWidth(str: string): number {
      let width = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charAt(i);
        width += this.getCharLength(char);
      }
      return width;
    }

    /**
     * Initialize the printer
     *
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    initialize(): EscPosEncoder {
      this._queue([
        0x1b, 0x40,
      ]);

      return this;
    }

    /**
     * 设置打印机宽度
     *
     * @param  {PrinterWidthEnum}   type  需要被分割的字符串
     * @returns {EscPosEncoder} 返回this
     */
    setPinterType(type: PrinterWidthEnum): EscPosEncoder {
      if (type===PrinterWidthEnum._58) {
        this._printerParam = this._58printerParam;
      } else if (type===PrinterWidthEnum._80) {
        this._printerParam = this._80printerParam;
      }
      return this;
    }

    /**
     * 打印一行字符
     *
     * @param {string} char 打印成行的字符
     * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
     */
    printLine(char: string): EscPosEncoder {
      char = char.slice(0, 1);
      this.line(char.repeat(this._printerParam.singleCharLength));
      return this;
    }

    /**
     * 打印空行
     *
     * @param {number} num 行数
     * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
     */
    emptyLine(num=1): EscPosEncoder {
      for (let i = 0; i < num; i++) {
        this.line('');
      }
      return this;
    }

    /**
     * 前台打印菜品，包含菜品名称，数量，价格
     *
     * @param {Array} dishes 菜品信息数组
     * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
     */
    printFrontDeskDishs(dishes: {name: string; count: number; price: number}[]): EscPosEncoder {
      const countAndPriceLength = 11; // 价格和个数的长度
      const getCountAndPriceStr = (count: number, price: number): string => {
        const priceStr = (price*count).toFixed(2);
        const countStr = '*' + count;
        const spaceNum = countAndPriceLength - this.getStrWidth(countStr) - this.getStrWidth(priceStr);
        return countStr + ' '.repeat(spaceNum) + priceStr;
      };
      dishes.forEach((dish) => {
        const fixedWidthStrArr = this.splitByWidth(
            dish.name,
            this._printerParam.singleCharLength-countAndPriceLength-3
        );
        fixedWidthStrArr.forEach((str, index) => {
          if (index === 0) {
            this.oneLine(str, getCountAndPriceStr(dish.count, dish.price));
          } else {
            this.line(str);
          }
        });
      });
      return this;
    }

    /**
     * 后厨打印菜品，包含菜品名称，数量，不包含价格
     *
     * @param {Array} dishes 菜品信息数组
     * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
     */
    printChefDishs(dishes: {name: string; count: number}[]): EscPosEncoder {
      const countAndPriceLength = 6; // 价格和个数的长度
      dishes.forEach((dish) => {
        const fixedWidthStrArr = this.splitByWidth(
            dish.name,
            this._printerParam.singleCharLength-countAndPriceLength-3
        );
        fixedWidthStrArr.forEach((str, index) => {
          if (index === 0) {
            this.oneLine(str, `【*${dish.count}】`);
          } else {
            this.line(str);
          }
        });
      });
      return this;
    }

    /**
     * Change the code page
     *
     * @param  {string}   value  The codepage that we set the printer to
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    codepage(value: string): EscPosEncoder {
      const codepages = {
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
        'windows1258': [0x5e, false],
      };

      let codepage;

      if (!iconv.encodingExists(value)) {
        throw new Error('Unknown codepage');
      }

      if (value in iconv.encodings) {
        if (typeof iconv.encodings[value] === 'string') {
          codepage = iconv.encodings[value];
        } else {
          codepage = value;
        }
      } else {
        throw new Error('Unknown codepage');
      }

      if (typeof codepages[codepage] !== 'undefined') {
        this._codepage = codepage;
        this._state.hanzi = codepages[codepage][1];

        this._queue([
          0x1b, 0x74, codepages[codepage][0],
        ]);
      } else {
        throw new Error('Codepage not supported by printer');
      }

      return this;
    }

    /**
     * Print text
     *
     * @param  {string}   value  Text that needs to be printed
     * @param  {number}   wrap   Wrap text after this many positions
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    text(value: string, wrap?: number): EscPosEncoder {
      if (wrap) {
        const w = linewrap(wrap, {lineBreak: '\r\n'});
        value = w(value);
      }

      const bytes = this._encode(value);

      if (this._state.hanzi) {
        this._queue([
          0x1c, 0x26, bytes, 0x1c, 0x2e,
        ]);
      } else {
        this._queue([
          bytes,
        ]);
      }

      return this;
    }

    /**
     * Print a newline
     *
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    newline(): EscPosEncoder {
      this._queue([
        0x0a, 0x0d,
      ]);

      return this;
    }

    /**
     * Print text, followed by a newline
     *
     * @param  {string}   value  Text that needs to be printed
     * @param  {number}   wrap   Wrap text after this many positions
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    line(value: string, wrap?: number): EscPosEncoder {
      this.text(value, wrap);
      this.newline();

      return this;
    }

    /**
     * 打印两个字符分别在纸的左右两侧
     *
     * @param  {string}   str1  左侧的字符串
     * @param  {string}   str2  右侧的字符串
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    oneLine(str1: string, str2: string): EscPosEncoder {
      const spaceNum = this._printerParam.singleCharLength - this.getStrWidth(str1) - this.getStrWidth(str2);
      this.line(str1 + ' '.repeat(spaceNum) + str2);
      return this;
    }

    /**
     * Underline text
     *
     * @param  {boolean|number}   value  true to turn on underline, false to turn off, or 2 for double underline
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    underline(value: boolean | number): EscPosEncoder {
      if (typeof value === 'undefined') {
        value = !this._state.underline;
      }

      this._state.underline = value;

      this._queue([
        0x1b, 0x2d, Number(value),
      ]);

      return this;
    }

    /**
     * Italic text
     *
     * @param  {boolean}          value  true to turn on italic, false to turn off
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    italic(value: boolean): EscPosEncoder {
      if (typeof value === 'undefined') {
        value = !this._state.italic;
      }

      this._state.italic = value;

      this._queue([
        0x1b, 0x34, Number(value),
      ]);

      return this;
    }

    /**
     * Bold text
     *
     * @param  {boolean}          value  true to turn on bold, false to turn off, or 2 for double underline
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    bold(value: boolean): EscPosEncoder {
      if (typeof value === 'undefined') {
        value = !this._state.bold;
      }

      this._state.bold = value;

      this._queue([
        0x1b, 0x45, Number(value),
      ]);

      return this;
    }

    /**
     * Change text size
     *
     * @param  {number}          value   small or normal
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    size(value: number): EscPosEncoder {
      let realSize = 0;
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
    }

    /**
     * Change text alignment
     *
     * @param  {string}          value   left, center or right
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    align(value: string): EscPosEncoder {
      const alignments = {
        'left': 0x00,
        'center': 0x01,
        'right': 0x02,
      };

      if (value in alignments) {
        this._queue([
          0x1b, 0x61, alignments[value],
        ]);
      } else {
        throw new Error('Unknown alignment');
      }

      return this;
    }

    /**
     * Barcode
     *
     * @param  {string}           value  the value of the barcode
     * @param  {string}           symbology  the type of the barcode
     * @param  {number}           height  height of the barcode
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    barcode(value: string, symbology: string, height: number): EscPosEncoder {
      const symbologies = {
        'upca': 0x00,
        'upce': 0x01,
        'ean13': 0x02,
        'ean8': 0x03,
        'coda39': 0x04,
        'itf': 0x05,
        'codabar': 0x06,
      };

      if (symbology in symbologies) {
        const bytes = iconv.encode(value, 'ascii');

        this._queue([
          0x1d, 0x68, height,
          0x1d, 0x77, symbology === 'code39' ? 0x02 : 0x03,
          0x1d, 0x6b, symbologies[symbology],
          bytes,
          0x00,
        ]);
      } else {
        throw new Error('Symbology not supported by printer');
      }

      return this;
    }

    /**
     * QR code
     *
     * @param  {string}           value  the value of the qr code
     * @param  {number}           model  model of the qrcode, either 1 or 2
     * @param  {number}           size   size of the qrcode, a value between 1 and 8
     * @param  {string}           errorlevel  the amount of error correction used, either 'l', 'm', 'q', 'h'
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    qrcode(value: string, model: number, size: number, errorlevel: string): EscPosEncoder {
      /* Force printing the print buffer and moving to a new line */

      this._queue([
        0x0a,
      ]);

      /* Model */

      const models = {
        1: 0x31,
        2: 0x32,
      };

      if (typeof model === 'undefined') {
        model = 2;
      }

      if (model in models) {
        this._queue([
          0x1d, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, models[model], 0x00,
        ]);
      } else {
        throw new Error('Model must be 1 or 2');
      }

      /* Size */

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

      /* Error level */

      const errorlevels = {
        'l': 0x30,
        'm': 0x31,
        'q': 0x32,
        'h': 0x33,
      };

      if (typeof errorlevel === 'undefined') {
        errorlevel = 'm';
      }

      if (errorlevel in errorlevels) {
        this._queue([
          0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, errorlevels[errorlevel],
        ]);
      } else {
        throw new Error('Error level must be l, m, q or h');
      }

      /* Data */

      const bytes = iconv.encode(value, 'iso88591');
      const length = bytes.length + 3;

      this._queue([
        0x1d, 0x28, 0x6b, length % 0xff, length / 0xff, 0x31, 0x50, 0x30, bytes,
      ]);

      /* Print QR code */

      this._queue([
        0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30,
      ]);

      return this;
    }

    /**
     * Cut paper
     *
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    cut(): EscPosEncoder {
      this._queue([
        0x1d, 0x56, 0x41, 0x00,
      ]);

      return this;
    }

    /**
     * Cut paper partial
     *
     * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
     *
     */
    cutPartial(): EscPosEncoder {
      this._queue([
        0x1d, 0x56, 0x42, 0x00,
      ]);

      return this;
    }

    /**
     * Add raw printer commands
     *
     * @param  {Array}           data   raw bytes to be included
     * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
     *
     */
    raw(data: Array<number>): EscPosEncoder {
      this._queue(data);

      return this;
    }

    /**
     * Encode all previous commands
     *
     * @returns {Uint8Array}         Return the encoded bytes
     *
     */
    encode(): Uint8Array {
      let length = 0;

      this._buffer.forEach((item) => {
        if (typeof item === 'number') {
          length++;
        } else {
          length += item.length;
        }
      });

      const result = new Uint8Array(length);

      let index = 0;

      this._buffer.forEach((item) => {
        if (typeof item === 'number') {
          result[index] = item;
          index++;
        } else {
          result.set(item, index);
          index += item.length;
        }
      });

      this._reset();

      return result;
    }
}
