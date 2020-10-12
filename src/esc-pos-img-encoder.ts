import EscPosEncoder, {PrinterWidthEnum} from './esc-pos-encoder';
import {createCanvas, Canvas, CanvasRenderingContext2D, registerFont} from 'canvas';

enum AlignEnum {
    'left'= 'left',
    'center'= 'center',
    'right'= 'right',
}


/**
 * Create a byte stream based on commands for ESC/POS printers
 */
export default class EscPosImgEncoder extends EscPosEncoder {
  private CVS: Canvas
  private ctx: CanvasRenderingContext2D
  private alignValue: AlignEnum = AlignEnum.left
  private fontValue = '28px "Custom"';
  private width58 = 384;
  private width80 = 568;
  private lineHeight = 32;
  private lineHeight0 = 32;
  private lineHeight2 = 56;
  private heightPosition = 32
  private cutAtFinal = false
  private fontFoot = 16; // 给字体下方留下空间，防止截断


  /**
   * Create a new EscPosEncoder
   *
   * @param  {Canvas} CVS   small or normal
   *
   */
  constructor(CVS?) {
    super();
    // console.log('canvasNode', canvasNode);
    // registerFont('../../../../src/assets/font/锐字云字库胖头鱼体GBK.ttf', {family: 'Custom'});
    this.CVS = CVS;
    this._reset();
  }

  /**
   * Reset the state of the EscPosEncoder
   *
   */
  protected _reset(): void {
    this.heightPosition = 32;
    if (!this.CVS) {
      this.CVS = createCanvas(this.width58, this.fontFoot);
    } else {
      this.resize(this.width58, 0);
    }
    this.ctx = this.CVS.getContext('2d');
    this.ctx.textBaseline = 'bottom';
    console.log('_reset', this.CVS);
    super._reset();
  }

  /**
   * Change the code page
   *
   * @param  {string}   value  The codepage that we set the printer to
   * @returns {EscPosEncoder}          Return the EscPosEncoder, for easy chaining commands
   *
   */
  codepage(value: string): EscPosEncoder {
    console.log('codepage', this.CVS);
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
    this._size = value;
    switch (value) {
      case 0:// 正常字体
        this.fontValue = '28px "Custom"';
        this.lineHeight = this.lineHeight0;
        break;
      case 1:// 高度加倍
        this.fontValue = '28px "Custom"';
        this.lineHeight = this.lineHeight0;
        break;
      case 2:// 宽高都加倍
        this.fontValue = '56px "Custom"';
        this.lineHeight = this.lineHeight2;
        break;
    }
    this.ctx.font = this.fontValue;
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
      this.resize(this.width58, this.CVS.height);
    } else if (type===PrinterWidthEnum._80) {
      this.resize(this.width80, this.CVS.height);
    }
    super.setPinterType(type);
    return this;
  }

  /**
   * Change text alignment
   *
   * @param  {string}          value   left, center or right
   * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
   *
   */
  align(value: AlignEnum|string): EscPosEncoder {
    if (!AlignEnum[value]) {
      throw new Error('Unknown alignment');
    }
    this.alignValue = value as AlignEnum;
    console.log('align', this.alignValue);
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
    const fixedWidthStrArr = this.splitByWidth(
        value,
        this.CVS.width
    );
    fixedWidthStrArr.forEach((str) => {
      this.newline();
      this.text(str, wrap);
    });
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
    const {width} = this.ctx.measureText(value);
    switch (this.alignValue) {
      case AlignEnum.left:
        this.ctx.fillText(value, 0, this.heightPosition);
        break;
      case AlignEnum.center:
        this.ctx.fillText(value, (this.CVS.width - width)/2, this.heightPosition);
        break;
      case AlignEnum.right:
        this.ctx.fillText(value, this.CVS.width - width, this.heightPosition);
        break;
      default:
        throw new Error('align error');
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
    this.heightPosition+=this.lineHeight;
    this.resize(this.CVS.width, this.heightPosition);
    return this;
  }

  /**
   * 动态修改画布大小
   *
   * @param {number} w  宽
   * @param {number} h  高
   */
  resize(w, h): void {
    const imgData = this.ctx.getImageData(0, 0, this.CVS.width, this.CVS.height);
    this.CVS.width = w;
    this.CVS.height = h+this.fontFoot;
    this.ctx.putImageData(imgData, 0, 0);
    this.ctx.font = this.fontValue;
  }

  /**
   * Encode all previous commands
   *
   * @returns {Uint8Array}         Return the encoded bytes
   *
   */
  encode(): Uint8Array {
    this.image(this.CVS, this.CVS.width, this.CVS.height, 'threshold');
    if (this.cutAtFinal) {
      super.cutPartial();
    }
    const result = super.encode();
    this._reset();
    return result;
  }

  /**
   * Bold text
   *
   * @param  {boolean}          value  true to turn on bold, false to turn off, or 2 for double underline
   * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
   *
   */
  bold(value: boolean): EscPosEncoder {
    return this;
  }

  /**
   * 打印一行字符
   *
   * @param {string} char 打印成行的字符
   * @param {string} message 提示信息
   * @param {boolean} middle 提示信息显示在行间
   * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
   */
  printLine(char: string, message='', middle= false): EscPosEncoder {
    char = char.slice(0, 1);
    const restLength = this.CVS.width - this.getStrWidth(message);
    const charLength = this.getStrWidth(char);
    if (middle) {
      this.line(char.repeat(restLength/2/charLength)+message+char.repeat(restLength/2/charLength));
    } else {
      this.line(char.repeat(restLength/charLength));
      if (message) {
        const temp = this.alignValue;
        this.alignValue = AlignEnum.center;
        this.line(message);
        this.alignValue = temp;
      }
    }
    return this;
  }

  /**
   * Cut paper partial
   *
   * @returns {EscPosEncoder}                  Return the EscPosEncoder, for easy chaining commands
   *
   */
  cutPartial(): EscPosEncoder {
    this.cutAtFinal = true;
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
    this.newline();
    const {width} = this.ctx.measureText(str2);
    this.ctx.fillText(str1, 0, this.heightPosition);
    this.ctx.fillText(str2, this.CVS.width - width, this.heightPosition);
    return this;
  }


  /**
   * 前台打印菜品，包含菜品名称，数量，价格
   *
   * @param {Array} dishes 菜品信息数组
   * @param {number} size 字体大小,默认1
   * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
   */
  printFrontDeskDishs(dishes: {name: string; count: number; price: number}[], size=1): EscPosEncoder {
    const originSize = this._size;
    const {width: countAndPriceLength} = this.ctx.measureText('x99 999.99');
    const getCountAndPriceStr = (count: number, price: number): string => {
      const priceStr = price.toFixed(2);
      const countStr = 'x' + count;
      const spaceNum = (countAndPriceLength - this.getStrWidth(countStr) - this.getStrWidth(priceStr))/this.getStrWidth(' ');
      return countStr + ' '.repeat(spaceNum<0?0:spaceNum) + priceStr;
    };
    this.size(size);
    dishes.forEach((dish) => {
      if (dish.count<=0) {
        return;
      }
      const fixedWidthStrArr = this.splitByWidth(
          dish.name,
          this.CVS.width - countAndPriceLength - this.getStrWidth('  ')
      );
      fixedWidthStrArr.forEach((str, index) => {
        if (index === 0) {
          this.oneLine(str, getCountAndPriceStr(dish.count, dish.price));
        } else {
          this.line(str);
        }
      });
    });
    this.size(originSize);
    return this;
  }

  /**
   * 后厨打印菜品，包含菜品名称，数量，不包含价格
   *
   * @param {Array} dishes 菜品信息数组
   * @param {number} size 字体大小,默认2
   * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
   */
  printChefDishs(dishes: {name: string; count: number}[], size=2): EscPosEncoder {
    const originSize = this._size;
    const {width: countAndPriceLength} = this.ctx.measureText('  x99');
    this.size(size);
    dishes.forEach((dish) => {
      const fixedWidthStrArr = this.splitByWidth(
          dish.name,
          this.CVS.width - countAndPriceLength
      );
      fixedWidthStrArr.forEach((str, index) => {
        if (dish.count<=0) {
          return;
        }
        if (index === 0) {
          this.oneLine(str, `x${dish.count}`);
        } else {
          this.line(str);
        }
      });
    });
    this.size(originSize);
    return this;
  }

  /**
   * 根据打印宽度分割字符串
   *
   * @param  {string}   str  需要被分割的字符串
   * @param  {number}   maxLength  分割长度
   * @returns {Array} 返回被分割的字符串数组
   */
  protected splitByWidth(str: string, maxLength: number): string[] {
    let result: string[] = [];
    for (let i = 0; i < str.length; i++) {
      const char = str.slice(0, i);
      const {width} = this.ctx.measureText(char);
      if (width > maxLength) {
        result.push(str.slice(0, i-1));
        result = result.concat(this.splitByWidth(str.slice(i-1), maxLength));
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
  protected getStrWidth(str: string): number {
    const {width} = this.ctx.measureText(str);
    return width;
  }

  /**
   * 打印空行
   *
   * @param {number} num 行数
   * @returns {EscPosEncoder}  Return the EscPosEncoder, for easy chaining commands
   */
  emptyLine(num=1): EscPosEncoder {
    for (let i = 0; i < num; i++) {
      this.heightPosition+=this.lineHeight0;
      this.resize(this.CVS.width, this.heightPosition);
    }
    return this;
  }
}
