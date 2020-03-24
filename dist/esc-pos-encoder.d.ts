declare module 'iconv-lite' {
    const encodings: Array<string>;
}
/**
 * Create a byte stream based on commands for ESC/POS printers
 */
export default class EscPosEncoder {
    private _buffer;
    private _codepage;
    private _state;
    /**
     * Create a new object
     *
     */
    constructor();
    /**
     * Reset the state of the object
     *
     */
    private _reset;
    /**
     * Encode a string with the current code page
     *
     * @param  {string}   value  String to encode
     * @returns {object}          Encoded string as a ArrayBuffer
     *
     */
    private _encode;
    /**
     * Add commands to the buffer
     *
     * @param  {Array}   value  And array of numbers, arrays, buffers or Uint8Arrays to add to the buffer
     *
     */
    private _queue;
    /**
     * Initialize the printer
     *
     * @returns {object}          Return the object, for easy chaining commands
     *
     */
    initialize(): object;
    /**
     * Initialize the printer
     *
     * @param {string} a dddd
     * @returns {object}          Return the object, for easy chaining commands
     */
    printLine(a: string): object;
    /**
     * Change the code page
     *
     * @param  {string}   value  The codepage that we set the printer to
     * @returns {object}          Return the object, for easy chaining commands
     *
     */
    codepage(value: string): object;
    /**
     * Print text
     *
     * @param  {string}   value  Text that needs to be printed
     * @param  {number}   wrap   Wrap text after this many positions
     * @returns {object}          Return the object, for easy chaining commands
     *
     */
    text(value: string, wrap?: number): object;
    /**
     * Print a newline
     *
     * @returns {object}          Return the object, for easy chaining commands
     *
     */
    newline(): object;
    /**
     * Print text, followed by a newline
     *
     * @param  {string}   value  Text that needs to be printed
     * @param  {number}   wrap   Wrap text after this many positions
     * @returns {object}          Return the object, for easy chaining commands
     *
     */
    line(value: string, wrap?: number): object;
    /**
     * Underline text
     *
     * @param  {boolean|number}   value  true to turn on underline, false to turn off, or 2 for double underline
     * @returns {object}                  Return the object, for easy chaining commands
     *
     */
    underline(value: boolean | number): object;
    /**
     * Italic text
     *
     * @param  {boolean}          value  true to turn on italic, false to turn off
     * @returns {object}                  Return the object, for easy chaining commands
     *
     */
    italic(value: boolean): object;
    /**
     * Bold text
     *
     * @param  {boolean}          value  true to turn on bold, false to turn off, or 2 for double underline
     * @returns {object}                  Return the object, for easy chaining commands
     *
     */
    bold(value: boolean): object;
    /**
     * Change text size
     *
     * @param  {number}          value   small or normal
     * @returns {object}                  Return the object, for easy chaining commands
     *
     */
    size(value: number): object;
    /**
     * Change text alignment
     *
     * @param  {string}          value   left, center or right
     * @returns {object}                  Return the object, for easy chaining commands
     *
     */
    align(value: string): object;
    /**
     * Barcode
     *
     * @param  {string}           value  the value of the barcode
     * @param  {string}           symbology  the type of the barcode
     * @param  {number}           height  height of the barcode
     * @returns {object}                  Return the object, for easy chaining commands
     *
     */
    barcode(value: string, symbology: string, height: number): object;
    /**
     * QR code
     *
     * @param  {string}           value  the value of the qr code
     * @param  {number}           model  model of the qrcode, either 1 or 2
     * @param  {number}           size   size of the qrcode, a value between 1 and 8
     * @param  {string}           errorlevel  the amount of error correction used, either 'l', 'm', 'q', 'h'
     * @returns {object}                  Return the object, for easy chaining commands
     *
     */
    qrcode(value: string, model: number, size: number, errorlevel: string): object;
    /**
     * Cut paper
     *
     * @param  {string}          value   full or partial. When not specified a full cut will be assumed
     * @returns {object}                  Return the object, for easy chaining commands
     *
     */
    cut(value: string): object;
    /**
     * Add raw printer commands
     *
     * @param  {Array}           data   raw bytes to be included
     * @returns {object}          Return the object, for easy chaining commands
     *
     */
    raw(data: Array<number>): object;
    /**
     * Encode all previous commands
     *
     * @returns {Uint8Array}         Return the encoded bytes
     *
     */
    encode(): Uint8Array;
}
