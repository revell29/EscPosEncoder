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
     * @return {object}          Encoded string as a ArrayBuffer
     *
    */
    private _encode;
    /**
     * Add commands to the buffer
     *
     * @param  {array}   value  And array of numbers, arrays, buffers or Uint8Arrays to add to the buffer
     *
    */
    private _queue;
    /**
     * Initialize the printer
     *
     * @return {object}          Return the object, for easy chaining commands
     *
     */
    initialize(): this;
    /**
     * Change the code page
     *
     * @param  {string}   value  The codepage that we set the printer to
     * @return {object}          Return the object, for easy chaining commands
     *
     */
    codepage(value: any): this;
    /**
     * Print text
     *
     * @param  {string}   value  Text that needs to be printed
     * @param  {number}   wrap   Wrap text after this many positions
     * @return {object}          Return the object, for easy chaining commands
     *
     */
    text(value: any, wrap?: any): this;
    /**
     * Print a newline
     *
     * @return {object}          Return the object, for easy chaining commands
     *
     */
    newline(): this;
    /**
     * Print text, followed by a newline
     *
     * @param  {string}   value  Text that needs to be printed
     * @param  {number}   wrap   Wrap text after this many positions
     * @return {object}          Return the object, for easy chaining commands
     *
     */
    line(value: any, wrap?: any): this;
    /**
     * Underline text
     *
     * @param  {boolean|number}   value  true to turn on underline, false to turn off, or 2 for double underline
     * @return {object}                  Return the object, for easy chaining commands
     *
     */
    underline(value: any): this;
    /**
     * Italic text
     *
     * @param  {boolean}          value  true to turn on italic, false to turn off
     * @return {object}                  Return the object, for easy chaining commands
     *
     */
    italic(value: any): this;
    /**
     * Bold text
     *
     * @param  {boolean}          value  true to turn on bold, false to turn off, or 2 for double underline
     * @return {object}                  Return the object, for easy chaining commands
     *
     */
    bold(value: any): this;
    /**
      * Change text size
      *
      * @param  {string}          value   small or normal
      * @return {object}                  Return the object, for easy chaining commands
      *
      */
    size(value: any): this;
    /**
      * Change text alignment
      *
      * @param  {string}          value   left, center or right
      * @return {object}                  Return the object, for easy chaining commands
      *
      */
    align(value: any): this;
    /**
     * Barcode
     *
     * @param  {string}           value  the value of the barcode
     * @param  {string}           symbology  the type of the barcode
     * @param  {number}           height  height of the barcode
     * @return {object}                  Return the object, for easy chaining commands
     *
     */
    barcode(value: any, symbology: any, height: any): this;
    /**
     * QR code
     *
     * @param  {string}           value  the value of the qr code
     * @param  {number}           model  model of the qrcode, either 1 or 2
     * @param  {number}           size   size of the qrcode, a value between 1 and 8
     * @param  {string}           errorlevel  the amount of error correction used, either 'l', 'm', 'q', 'h'
     * @return {object}                  Return the object, for easy chaining commands
     *
     */
    qrcode(value: any, model: any, size: any, errorlevel: any): this;
    /**
     * Cut paper
     *
     * @param  {string}          value   full or partial. When not specified a full cut will be assumed
     * @return {object}                  Return the object, for easy chaining commands
     *
     */
    cut(value: any): this;
    /**
     * Add raw printer commands
     *
     * @param  {array}           data   raw bytes to be included
     * @return {object}          Return the object, for easy chaining commands
     *
     */
    raw(data: any): this;
    /**
     * Encode all previous commands
     *
     * @return {Uint8Array}         Return the encoded bytes
     *
     */
    encode(): Uint8Array;
}
