/**
 * This class was originally written to provide proxy methods of that of Buffer.
 * However, the usage of ReadableStream would fail if the AMF message is large.
 * Therefore, this class is slightly modified to operate directly on a buffer instead.
 *
 * TODO: some of the methods can actually be simplified.
 */
export default class Reader {

    constructor(buffer) {
        this.buffer = buffer;
        this.dataView = new DataView(buffer);
        this.offset = 0;
    }

    readByte(len) {
        const array = new Uint8Array(this.buffer, this.offset, len);
        this.offset += len;
        return array;
    }

    readUInt8() {
        const ret = this.dataView.getUint8(this.offset);
        this.offset += 1;
        return ret;
    }

    readUInt16BE() {
        const ret = this.dataView.getUint16(this.offset);
        this.offset += 2;
        return ret;
    }

    readDoubleBE() {
        const ret = this.dataView.getFloat64(this.offset);
        this.offset += 8;
        return ret;
    }

    readInt32BE() {
        const ret = this.dataView.getInt32(this.offset);
        this.offset += 4;
        return ret;
    }

    readUint32BE() {
        const ret = this.dataView.getUint32(this.offset);
        this.offset += 4;
        return ret;
    }

    readString() {
        const len = this.readUInt16BE();
        if (len === 0) { return ""; }

        const array = new Uint8Array(this.buffer, this.offset, len);
        const decoder = new TextDecoder();
        return decoder.decode(array);
    }

    readAMFHeader() {
        let handle = this.readInt29(),
            def = handle & 1 !== 0;

        handle >>= 1;

        return {
            isDef: def,
            value: handle,
        };
    }

    readInt29() {
        let bit1,
            bit2,
            bit3,
            total;

        bit1 = this.readUInt8();
        if (bit1 < 128) {
            return bit1;
        }
        total = (bit1 & 0x7f) << 7;
        bit2 = this.readUInt8();
        if (bit2 < 128) {
            total |= bit2;
        } else {
            total = (total | bit2 & 0x7f) << 7;
            bit3 = this.readUInt8();
            if (bit3 < 128) {
                total |= bit3;
            } else {
                total = (total | bit3 & 0x7f) << 8;
                total |= this.readUInt8();
            }
        }

        return -(total & (1 << 28)) | total;
    }

}
