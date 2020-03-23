export default class EscPosEncoder {
    private _buffer;
    private _codepage;
    private _state;
    constructor();
    private _reset;
    private _encode;
    private _queue;
    initialize(): this;
    codepage(value: any): this;
    text(value: any, wrap?: any): this;
    newline(): this;
    line(value: any, wrap?: any): this;
    underline(value: any): this;
    italic(value: any): this;
    bold(value: any): this;
    size(value: any): this;
    align(value: any): this;
    barcode(value: any, symbology: any, height: any): this;
    qrcode(value: any, model: any, size: any, errorlevel: any): this;
    cut(value: any): this;
    raw(data: any): this;
    encode(): Uint8Array;
}
