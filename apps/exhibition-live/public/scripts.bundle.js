var scripts = (function (exports) {
    'use strict';

    let wasm;

    const heap = new Array(32).fill(undefined);

    heap.push(undefined, null, true, false);

    function getObject(idx) { return heap[idx]; }

    let heap_next = heap.length;

    function dropObject(idx) {
        if (idx < 36) return;
        heap[idx] = heap_next;
        heap_next = idx;
    }

    function takeObject(idx) {
        const ret = getObject(idx);
        dropObject(idx);
        return ret;
    }

    let WASM_VECTOR_LEN = 0;

    let cachedUint8Memory0 = new Uint8Array();

    function getUint8Memory0() {
        if (cachedUint8Memory0.byteLength === 0) {
            cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
        }
        return cachedUint8Memory0;
    }

    const cachedTextEncoder = new TextEncoder('utf-8');

    const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
        ? function (arg, view) {
        return cachedTextEncoder.encodeInto(arg, view);
    }
        : function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    });

    function passStringToWasm0(arg, malloc, realloc) {

        if (realloc === undefined) {
            const buf = cachedTextEncoder.encode(arg);
            const ptr = malloc(buf.length);
            getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
            WASM_VECTOR_LEN = buf.length;
            return ptr;
        }

        let len = arg.length;
        let ptr = malloc(len);

        const mem = getUint8Memory0();

        let offset = 0;

        for (; offset < len; offset++) {
            const code = arg.charCodeAt(offset);
            if (code > 0x7F) break;
            mem[ptr + offset] = code;
        }

        if (offset !== len) {
            if (offset !== 0) {
                arg = arg.slice(offset);
            }
            ptr = realloc(ptr, len, len = offset + arg.length * 3);
            const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
            const ret = encodeString(arg, view);

            offset += ret.written;
        }

        WASM_VECTOR_LEN = offset;
        return ptr;
    }

    function isLikeNone(x) {
        return x === undefined || x === null;
    }

    let cachedInt32Memory0 = new Int32Array();

    function getInt32Memory0() {
        if (cachedInt32Memory0.byteLength === 0) {
            cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
        }
        return cachedInt32Memory0;
    }

    const cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

    cachedTextDecoder.decode();

    function getStringFromWasm0(ptr, len) {
        return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
    }

    function addHeapObject(obj) {
        if (heap_next === heap.length) heap.push(heap.length + 1);
        const idx = heap_next;
        heap_next = heap[idx];

        heap[idx] = obj;
        return idx;
    }
    /**
    * @param {string} value
    * @returns {NamedNode}
    */
    function namedNode(value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.namedNode(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return NamedNode$2.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }

    /**
    * @param {string | undefined} value
    * @returns {BlankNode}
    */
    function blankNode(value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = isLikeNone(value) ? 0 : passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.blankNode(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return BlankNode$2.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }

    let stack_pointer = 32;

    function addBorrowedObject(obj) {
        if (stack_pointer == 1) throw new Error('out of js stack');
        heap[--stack_pointer] = obj;
        return stack_pointer;
    }
    /**
    * @param {string | undefined} value
    * @param {any} language_or_datatype
    * @returns {Literal}
    */
    function literal(value, language_or_datatype) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = isLikeNone(value) ? 0 : passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.literal(retptr, ptr0, len0, addBorrowedObject(language_or_datatype));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Literal$2.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
        }
    }

    /**
    * @returns {DefaultGraph}
    */
    function defaultGraph() {
        const ret = wasm.defaultGraph();
        return DefaultGraph$2.__wrap(ret);
    }

    /**
    * @param {string} value
    * @returns {Variable}
    */
    function variable(value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.variable(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Variable$2.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }

    /**
    * @param {any} subject
    * @param {any} predicate
    * @param {any} object
    * @returns {Quad}
    */
    function triple(subject, predicate, object) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.triple(retptr, addBorrowedObject(subject), addBorrowedObject(predicate), addBorrowedObject(object));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Quad$2.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
            heap[stack_pointer++] = undefined;
            heap[stack_pointer++] = undefined;
        }
    }

    /**
    * @param {any} subject
    * @param {any} predicate
    * @param {any} object
    * @param {any} graph
    * @returns {Quad}
    */
    function quad(subject, predicate, object, graph) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.quad(retptr, addBorrowedObject(subject), addBorrowedObject(predicate), addBorrowedObject(object), addBorrowedObject(graph));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Quad$2.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
            heap[stack_pointer++] = undefined;
            heap[stack_pointer++] = undefined;
            heap[stack_pointer++] = undefined;
        }
    }

    /**
    * @param {any} original
    * @returns {any}
    */
    function fromTerm(original) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.fromTerm(retptr, addBorrowedObject(original));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
        }
    }

    /**
    * @param {any} original
    * @returns {any}
    */
    function fromQuad(original) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.fromQuad(retptr, addBorrowedObject(original));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            heap[stack_pointer++] = undefined;
        }
    }

    let cachedUint32Memory0 = new Uint32Array();

    function getUint32Memory0() {
        if (cachedUint32Memory0.byteLength === 0) {
            cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
        }
        return cachedUint32Memory0;
    }

    function passArrayJsValueToWasm0(array, malloc) {
        const ptr = malloc(array.length * 4);
        const mem = getUint32Memory0();
        for (let i = 0; i < array.length; i++) {
            mem[ptr / 4 + i] = addHeapObject(array[i]);
        }
        WASM_VECTOR_LEN = array.length;
        return ptr;
    }

    function getArrayJsValueFromWasm0(ptr, len) {
        const mem = getUint32Memory0();
        const slice = mem.subarray(ptr / 4, ptr / 4 + len);
        const result = [];
        for (let i = 0; i < slice.length; i++) {
            result.push(takeObject(slice[i]));
        }
        return result;
    }
    /**
    */
    function main() {
        wasm.main();
    }

    function handleError(f, args) {
        try {
            return f.apply(this, args);
        } catch (e) {
            wasm.__wbindgen_exn_store(addHeapObject(e));
        }
    }

    function getArrayU8FromWasm0(ptr, len) {
        return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
    }
    /**
    */
    let BlankNode$2 = class BlankNode {

        static __wrap(ptr) {
            const obj = Object.create(BlankNode$2.prototype);
            obj.ptr = ptr;

            return obj;
        }

        __destroy_into_raw() {
            const ptr = this.ptr;
            this.ptr = 0;

            return ptr;
        }

        free() {
            const ptr = this.__destroy_into_raw();
            wasm.__wbg_blanknode_free(ptr);
        }
        /**
        * @returns {string}
        */
        get termType() {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                wasm.blanknode_term_type(retptr, this.ptr);
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                return getStringFromWasm0(r0, r1);
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
                wasm.__wbindgen_free(r0, r1);
            }
        }
        /**
        * @returns {string}
        */
        get value() {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                wasm.blanknode_value(retptr, this.ptr);
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                return getStringFromWasm0(r0, r1);
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
                wasm.__wbindgen_free(r0, r1);
            }
        }
        /**
        * @returns {string}
        */
        toString() {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                wasm.blanknode_toString(retptr, this.ptr);
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                return getStringFromWasm0(r0, r1);
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
                wasm.__wbindgen_free(r0, r1);
            }
        }
        /**
        * @param {any} other
        * @returns {boolean}
        */
        equals(other) {
            try {
                const ret = wasm.blanknode_equals(this.ptr, addBorrowedObject(other));
                return ret !== 0;
            } finally {
                heap[stack_pointer++] = undefined;
            }
        }
    };
    /**
    */
    let DefaultGraph$2 = class DefaultGraph {

        static __wrap(ptr) {
            const obj = Object.create(DefaultGraph$2.prototype);
            obj.ptr = ptr;

            return obj;
        }

        __destroy_into_raw() {
            const ptr = this.ptr;
            this.ptr = 0;

            return ptr;
        }

        free() {
            const ptr = this.__destroy_into_raw();
            wasm.__wbg_defaultgraph_free(ptr);
        }
        /**
        * @returns {string}
        */
        get termType() {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                wasm.defaultgraph_term_type(retptr, this.ptr);
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                return getStringFromWasm0(r0, r1);
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
                wasm.__wbindgen_free(r0, r1);
            }
        }
        /**
        * @returns {string}
        */
        get value() {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                wasm.defaultgraph_value(retptr, this.ptr);
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                return getStringFromWasm0(r0, r1);
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
                wasm.__wbindgen_free(r0, r1);
            }
        }
        /**
        * @returns {string}
        */
        toString() {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                wasm.defaultgraph_toString(retptr, this.ptr);
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                return getStringFromWasm0(r0, r1);
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
                wasm.__wbindgen_free(r0, r1);
            }
        }
        /**
        * @param {any} other
        * @returns {boolean}
        */
        equals(other) {
            try {
                const ret = wasm.defaultgraph_equals(this.ptr, addBorrowedObject(other));
                return ret !== 0;
            } finally {
                heap[stack_pointer++] = undefined;
            }
        }
    };
    /**
    */
    let Literal$2 = class Literal {

        static __wrap(ptr) {
            const obj = Object.create(Literal$2.prototype);
            obj.ptr = ptr;

            return obj;
        }

        __destroy_into_raw() {
            const ptr = this.ptr;
            this.ptr = 0;

            return ptr;
        }

        free() {
            const ptr = this.__destroy_into_raw();
            wasm.__wbg_literal_free(ptr);
        }
        /**
        * @returns {string}
        */
        get termType() {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                wasm.literal_term_type(retptr, this.ptr);
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                return getStringFromWasm0(r0, r1);
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
                wasm.__wbindgen_free(r0, r1);
            }
        }
        /**
        * @returns {string}
        */
        get value() {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                wasm.literal_value(retptr, this.ptr);
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                return getStringFromWasm0(r0, r1);
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
                wasm.__wbindgen_free(r0, r1);
            }
        }
        /**
        * @returns {string}
        */
        get language() {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                wasm.literal_language(retptr, this.ptr);
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                return getStringFromWasm0(r0, r1);
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
                wasm.__wbindgen_free(r0, r1);
            }
        }
        /**
        * @returns {NamedNode}
        */
        get datatype() {
            const ret = wasm.literal_datatype(this.ptr);
            return NamedNode$2.__wrap(ret);
        }
        /**
        * @returns {string}
        */
        toString() {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                wasm.literal_toString(retptr, this.ptr);
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                return getStringFromWasm0(r0, r1);
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
                wasm.__wbindgen_free(r0, r1);
            }
        }
        /**
        * @param {any} other
        * @returns {boolean}
        */
        equals(other) {
            try {
                const ret = wasm.literal_equals(this.ptr, addBorrowedObject(other));
                return ret !== 0;
            } finally {
                heap[stack_pointer++] = undefined;
            }
        }
    };
    /**
    */
    let NamedNode$2 = class NamedNode {

        static __wrap(ptr) {
            const obj = Object.create(NamedNode$2.prototype);
            obj.ptr = ptr;

            return obj;
        }

        __destroy_into_raw() {
            const ptr = this.ptr;
            this.ptr = 0;

            return ptr;
        }

        free() {
            const ptr = this.__destroy_into_raw();
            wasm.__wbg_namednode_free(ptr);
        }
        /**
        * @returns {string}
        */
        get termType() {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                wasm.namednode_term_type(retptr, this.ptr);
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                return getStringFromWasm0(r0, r1);
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
                wasm.__wbindgen_free(r0, r1);
            }
        }
        /**
        * @returns {string}
        */
        get value() {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                wasm.namednode_value(retptr, this.ptr);
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                return getStringFromWasm0(r0, r1);
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
                wasm.__wbindgen_free(r0, r1);
            }
        }
        /**
        * @returns {string}
        */
        toString() {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                wasm.namednode_toString(retptr, this.ptr);
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                return getStringFromWasm0(r0, r1);
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
                wasm.__wbindgen_free(r0, r1);
            }
        }
        /**
        * @param {any} other
        * @returns {boolean}
        */
        equals(other) {
            try {
                const ret = wasm.namednode_equals(this.ptr, addBorrowedObject(other));
                return ret !== 0;
            } finally {
                heap[stack_pointer++] = undefined;
            }
        }
    };
    /**
    */
    let Quad$2 = class Quad {

        static __wrap(ptr) {
            const obj = Object.create(Quad$2.prototype);
            obj.ptr = ptr;

            return obj;
        }

        __destroy_into_raw() {
            const ptr = this.ptr;
            this.ptr = 0;

            return ptr;
        }

        free() {
            const ptr = this.__destroy_into_raw();
            wasm.__wbg_quad_free(ptr);
        }
        /**
        * @returns {string}
        */
        get termType() {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                wasm.quad_term_type(retptr, this.ptr);
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                return getStringFromWasm0(r0, r1);
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
                wasm.__wbindgen_free(r0, r1);
            }
        }
        /**
        * @returns {string}
        */
        get value() {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                wasm.quad_value(retptr, this.ptr);
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                return getStringFromWasm0(r0, r1);
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
                wasm.__wbindgen_free(r0, r1);
            }
        }
        /**
        * @returns {any}
        */
        get subject() {
            const ret = wasm.quad_subject(this.ptr);
            return takeObject(ret);
        }
        /**
        * @returns {any}
        */
        get predicate() {
            const ret = wasm.quad_predicate(this.ptr);
            return takeObject(ret);
        }
        /**
        * @returns {any}
        */
        get object() {
            const ret = wasm.quad_object(this.ptr);
            return takeObject(ret);
        }
        /**
        * @returns {any}
        */
        get graph() {
            const ret = wasm.quad_graph(this.ptr);
            return takeObject(ret);
        }
        /**
        * @returns {string}
        */
        toString() {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                wasm.quad_toString(retptr, this.ptr);
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                return getStringFromWasm0(r0, r1);
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
                wasm.__wbindgen_free(r0, r1);
            }
        }
        /**
        * @param {any} other
        * @returns {boolean}
        */
        equals(other) {
            try {
                const ret = wasm.quad_equals(this.ptr, addBorrowedObject(other));
                return ret !== 0;
            } finally {
                heap[stack_pointer++] = undefined;
            }
        }
    };
    /**
    */
    class Store {

        static __wrap(ptr) {
            const obj = Object.create(Store.prototype);
            obj.ptr = ptr;

            return obj;
        }

        __destroy_into_raw() {
            const ptr = this.ptr;
            this.ptr = 0;

            return ptr;
        }

        free() {
            const ptr = this.__destroy_into_raw();
            wasm.__wbg_store_free(ptr);
        }
        /**
        * @param {any[] | undefined} quads
        */
        constructor(quads) {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                var ptr0 = isLikeNone(quads) ? 0 : passArrayJsValueToWasm0(quads, wasm.__wbindgen_malloc);
                var len0 = WASM_VECTOR_LEN;
                wasm.store_new(retptr, ptr0, len0);
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                var r2 = getInt32Memory0()[retptr / 4 + 2];
                if (r2) {
                    throw takeObject(r1);
                }
                return Store.__wrap(r0);
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
            }
        }
        /**
        * @param {any} quad
        */
        add(quad) {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                wasm.store_add(retptr, this.ptr, addBorrowedObject(quad));
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                if (r1) {
                    throw takeObject(r0);
                }
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
                heap[stack_pointer++] = undefined;
            }
        }
        /**
        * @param {any} quad
        */
        delete(quad) {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                wasm.store_delete(retptr, this.ptr, addBorrowedObject(quad));
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                if (r1) {
                    throw takeObject(r0);
                }
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
                heap[stack_pointer++] = undefined;
            }
        }
        /**
        * @param {any} quad
        * @returns {boolean}
        */
        has(quad) {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                wasm.store_has(retptr, this.ptr, addBorrowedObject(quad));
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                var r2 = getInt32Memory0()[retptr / 4 + 2];
                if (r2) {
                    throw takeObject(r1);
                }
                return r0 !== 0;
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
                heap[stack_pointer++] = undefined;
            }
        }
        /**
        * @returns {number}
        */
        get size() {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                wasm.store_size(retptr, this.ptr);
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                var r2 = getInt32Memory0()[retptr / 4 + 2];
                if (r2) {
                    throw takeObject(r1);
                }
                return r0 >>> 0;
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
            }
        }
        /**
        * @param {any} subject
        * @param {any} predicate
        * @param {any} object
        * @param {any} graph_name
        * @returns {any[]}
        */
        match(subject, predicate, object, graph_name) {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                wasm.store_match(retptr, this.ptr, addBorrowedObject(subject), addBorrowedObject(predicate), addBorrowedObject(object), addBorrowedObject(graph_name));
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                var r2 = getInt32Memory0()[retptr / 4 + 2];
                var r3 = getInt32Memory0()[retptr / 4 + 3];
                if (r3) {
                    throw takeObject(r2);
                }
                var v0 = getArrayJsValueFromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 4);
                return v0;
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
                heap[stack_pointer++] = undefined;
                heap[stack_pointer++] = undefined;
                heap[stack_pointer++] = undefined;
                heap[stack_pointer++] = undefined;
            }
        }
        /**
        * @param {string} query
        * @returns {any}
        */
        query(query) {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                const ptr0 = passStringToWasm0(query, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
                const len0 = WASM_VECTOR_LEN;
                wasm.store_query(retptr, this.ptr, ptr0, len0);
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                var r2 = getInt32Memory0()[retptr / 4 + 2];
                if (r2) {
                    throw takeObject(r1);
                }
                return takeObject(r0);
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
            }
        }
        /**
        * @param {string} update
        */
        update(update) {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                const ptr0 = passStringToWasm0(update, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
                const len0 = WASM_VECTOR_LEN;
                wasm.store_update(retptr, this.ptr, ptr0, len0);
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                if (r1) {
                    throw takeObject(r0);
                }
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
            }
        }
        /**
        * @param {string} data
        * @param {string} mime_type
        * @param {any} base_iri
        * @param {any} to_graph_name
        */
        load(data, mime_type, base_iri, to_graph_name) {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                const ptr0 = passStringToWasm0(data, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
                const len0 = WASM_VECTOR_LEN;
                const ptr1 = passStringToWasm0(mime_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
                const len1 = WASM_VECTOR_LEN;
                wasm.store_load(retptr, this.ptr, ptr0, len0, ptr1, len1, addBorrowedObject(base_iri), addBorrowedObject(to_graph_name));
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                if (r1) {
                    throw takeObject(r0);
                }
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
                heap[stack_pointer++] = undefined;
                heap[stack_pointer++] = undefined;
            }
        }
        /**
        * @param {string} mime_type
        * @param {any} from_graph_name
        * @returns {string}
        */
        dump(mime_type, from_graph_name) {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                const ptr0 = passStringToWasm0(mime_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
                const len0 = WASM_VECTOR_LEN;
                wasm.store_dump(retptr, this.ptr, ptr0, len0, addBorrowedObject(from_graph_name));
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                var r2 = getInt32Memory0()[retptr / 4 + 2];
                var r3 = getInt32Memory0()[retptr / 4 + 3];
                var ptr1 = r0;
                var len1 = r1;
                if (r3) {
                    ptr1 = 0; len1 = 0;
                    throw takeObject(r2);
                }
                return getStringFromWasm0(ptr1, len1);
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
                heap[stack_pointer++] = undefined;
                wasm.__wbindgen_free(ptr1, len1);
            }
        }
    }
    /**
    */
    let Variable$2 = class Variable {

        static __wrap(ptr) {
            const obj = Object.create(Variable$2.prototype);
            obj.ptr = ptr;

            return obj;
        }

        __destroy_into_raw() {
            const ptr = this.ptr;
            this.ptr = 0;

            return ptr;
        }

        free() {
            const ptr = this.__destroy_into_raw();
            wasm.__wbg_variable_free(ptr);
        }
        /**
        * @returns {string}
        */
        get termType() {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                wasm.variable_term_type(retptr, this.ptr);
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                return getStringFromWasm0(r0, r1);
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
                wasm.__wbindgen_free(r0, r1);
            }
        }
        /**
        * @returns {string}
        */
        get value() {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                wasm.namednode_value(retptr, this.ptr);
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                return getStringFromWasm0(r0, r1);
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
                wasm.__wbindgen_free(r0, r1);
            }
        }
        /**
        * @returns {string}
        */
        toString() {
            try {
                const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
                wasm.variable_toString(retptr, this.ptr);
                var r0 = getInt32Memory0()[retptr / 4 + 0];
                var r1 = getInt32Memory0()[retptr / 4 + 1];
                return getStringFromWasm0(r0, r1);
            } finally {
                wasm.__wbindgen_add_to_stack_pointer(16);
                wasm.__wbindgen_free(r0, r1);
            }
        }
        /**
        * @param {any} other
        * @returns {boolean}
        */
        equals(other) {
            try {
                const ret = wasm.variable_equals(this.ptr, addBorrowedObject(other));
                return ret !== 0;
            } finally {
                heap[stack_pointer++] = undefined;
            }
        }
    };

    async function load(module, imports) {
        if (typeof Response === 'function' && module instanceof Response) {
            if (typeof WebAssembly.instantiateStreaming === 'function') {
                try {
                    return await WebAssembly.instantiateStreaming(module, imports);

                } catch (e) {
                    if (module.headers.get('Content-Type') != 'application/wasm') {
                        console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                    } else {
                        throw e;
                    }
                }
            }

            const bytes = await module.arrayBuffer();
            return await WebAssembly.instantiate(bytes, imports);

        } else {
            const instance = await WebAssembly.instantiate(module, imports);

            if (instance instanceof WebAssembly.Instance) {
                return { instance, module };

            } else {
                return instance;
            }
        }
    }

    function getImports() {
        const imports = {};
        imports.wbg = {};
        imports.wbg.__wbg_quad_new = function(arg0) {
            const ret = Quad$2.__wrap(arg0);
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_new_8d2af00bc1e329ee = function(arg0, arg1) {
            const ret = new Error(getStringFromWasm0(arg0, arg1));
            return addHeapObject(ret);
        };
        imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
            takeObject(arg0);
        };
        imports.wbg.__wbg_namednode_new = function(arg0) {
            const ret = NamedNode$2.__wrap(arg0);
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_blanknode_new = function(arg0) {
            const ret = BlankNode$2.__wrap(arg0);
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_literal_new = function(arg0) {
            const ret = Literal$2.__wrap(arg0);
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_defaultgraph_new = function(arg0) {
            const ret = DefaultGraph$2.__wrap(arg0);
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_variable_new = function(arg0) {
            const ret = Variable$2.__wrap(arg0);
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_get_765201544a2b6869 = function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.get(getObject(arg0), getObject(arg1));
            return addHeapObject(ret);
        }, arguments) };
        imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
            const obj = getObject(arg1);
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
        };
        imports.wbg.__wbindgen_is_undefined = function(arg0) {
            const ret = getObject(arg0) === undefined;
            return ret;
        };
        imports.wbg.__wbg_has_8359f114ce042f5a = function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.has(getObject(arg0), getObject(arg1));
            return ret;
        }, arguments) };
        imports.wbg.__wbg_new_7a65684b23087040 = function(arg0, arg1) {
            const ret = new URIError(getStringFromWasm0(arg0, arg1));
            return addHeapObject(ret);
        };
        imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
            const ret = getStringFromWasm0(arg0, arg1);
            return addHeapObject(ret);
        };
        imports.wbg.__wbindgen_is_null = function(arg0) {
            const ret = getObject(arg0) === null;
            return ret;
        };
        imports.wbg.__wbindgen_is_string = function(arg0) {
            const ret = typeof(getObject(arg0)) === 'string';
            return ret;
        };
        imports.wbg.__wbg_new_1d9a920c6bfc44a8 = function() {
            const ret = new Array();
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_new_268f7b7dd3430798 = function() {
            const ret = new Map();
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_push_740e4b286702d964 = function(arg0, arg1) {
            const ret = getObject(arg0).push(getObject(arg1));
            return ret;
        };
        imports.wbg.__wbg_set_933729cf5b66ac11 = function(arg0, arg1, arg2) {
            const ret = getObject(arg0).set(getObject(arg1), getObject(arg2));
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_new_abda76e883ba8a5f = function() {
            const ret = new Error();
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_stack_658279fe44541cf6 = function(arg0, arg1) {
            const ret = getObject(arg1).stack;
            const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
        };
        imports.wbg.__wbg_error_f851667af71bcfc6 = function(arg0, arg1) {
            try {
                console.error(getStringFromWasm0(arg0, arg1));
            } finally {
                wasm.__wbindgen_free(arg0, arg1);
            }
        };
        imports.wbg.__wbg_call_168da88779e35f61 = function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
            return addHeapObject(ret);
        }, arguments) };
        imports.wbg.__wbg_now_58886682b7e790d7 = function() {
            const ret = Date.now();
            return ret;
        };
        imports.wbg.__wbg_self_6d479506f72c6a71 = function() { return handleError(function () {
            const ret = self.self;
            return addHeapObject(ret);
        }, arguments) };
        imports.wbg.__wbg_window_f2557cc78490aceb = function() { return handleError(function () {
            const ret = window.window;
            return addHeapObject(ret);
        }, arguments) };
        imports.wbg.__wbg_globalThis_7f206bda628d5286 = function() { return handleError(function () {
            const ret = globalThis.globalThis;
            return addHeapObject(ret);
        }, arguments) };
        imports.wbg.__wbg_global_ba75c50d1cf384f4 = function() { return handleError(function () {
            const ret = global.global;
            return addHeapObject(ret);
        }, arguments) };
        imports.wbg.__wbg_newnoargs_b5b063fc6c2f0376 = function(arg0, arg1) {
            const ret = new Function(getStringFromWasm0(arg0, arg1));
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_call_97ae9d8645dc388b = function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).call(getObject(arg1));
            return addHeapObject(ret);
        }, arguments) };
        imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
            const ret = getObject(arg0);
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_crypto_e1d53a1d73fb10b8 = function(arg0) {
            const ret = getObject(arg0).crypto;
            return addHeapObject(ret);
        };
        imports.wbg.__wbindgen_is_object = function(arg0) {
            const val = getObject(arg0);
            const ret = typeof(val) === 'object' && val !== null;
            return ret;
        };
        imports.wbg.__wbg_process_038c26bf42b093f8 = function(arg0) {
            const ret = getObject(arg0).process;
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_versions_ab37218d2f0b24a8 = function(arg0) {
            const ret = getObject(arg0).versions;
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_node_080f4b19d15bc1fe = function(arg0) {
            const ret = getObject(arg0).node;
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_msCrypto_6e7d3e1f92610cbb = function(arg0) {
            const ret = getObject(arg0).msCrypto;
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_newwithlength_f5933855e4f48a19 = function(arg0) {
            const ret = new Uint8Array(arg0 >>> 0);
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_require_78a3dcfbdba9cbce = function() { return handleError(function () {
            const ret = module.require;
            return addHeapObject(ret);
        }, arguments) };
        imports.wbg.__wbindgen_is_function = function(arg0) {
            const ret = typeof(getObject(arg0)) === 'function';
            return ret;
        };
        imports.wbg.__wbg_randomFillSync_6894564c2c334c42 = function() { return handleError(function (arg0, arg1, arg2) {
            getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
        }, arguments) };
        imports.wbg.__wbg_subarray_58ad4efbb5bcb886 = function(arg0, arg1, arg2) {
            const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_getRandomValues_805f1c3d65988a5a = function() { return handleError(function (arg0, arg1) {
            getObject(arg0).getRandomValues(getObject(arg1));
        }, arguments) };
        imports.wbg.__wbg_length_9e1ae1900cb0fbd5 = function(arg0) {
            const ret = getObject(arg0).length;
            return ret;
        };
        imports.wbg.__wbindgen_memory = function() {
            const ret = wasm.memory;
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_buffer_3f3d764d4747d564 = function(arg0) {
            const ret = getObject(arg0).buffer;
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_new_8c3f0052272a457a = function(arg0) {
            const ret = new Uint8Array(getObject(arg0));
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_set_83db9690f9353e79 = function(arg0, arg1, arg2) {
            getObject(arg0).set(getObject(arg1), arg2 >>> 0);
        };
        imports.wbg.__wbindgen_throw = function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        };

        return imports;
    }

    function finalizeInit(instance, module) {
        wasm = instance.exports;
        init.__wbindgen_wasm_module = module;
        cachedInt32Memory0 = new Int32Array();
        cachedUint32Memory0 = new Uint32Array();
        cachedUint8Memory0 = new Uint8Array();

        wasm.__wbindgen_start();
        return wasm;
    }

    function initSync(module) {
        const imports = getImports();

        if (!(module instanceof WebAssembly.Module)) {
            module = new WebAssembly.Module(module);
        }

        const instance = new WebAssembly.Instance(module, imports);

        return finalizeInit(instance, module);
    }

    async function init(input) {
        if (typeof input === 'undefined') {
            input = new URL('web_bg.wasm', (document.currentScript && document.currentScript.src || new URL('scripts.bundle.js', document.baseURI).href));
        }
        const imports = getImports();

        if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
            input = fetch(input);
        }

        const { instance, module } = await load(await input, imports);

        return finalizeInit(instance, module);
    }

    var web = /*#__PURE__*/Object.freeze({
        __proto__: null,
        BlankNode: BlankNode$2,
        DefaultGraph: DefaultGraph$2,
        Literal: Literal$2,
        NamedNode: NamedNode$2,
        Quad: Quad$2,
        Store: Store,
        Variable: Variable$2,
        blankNode: blankNode,
        default: init,
        defaultGraph: defaultGraph,
        fromQuad: fromQuad,
        fromTerm: fromTerm,
        initSync: initSync,
        literal: literal,
        main: main,
        namedNode: namedNode,
        quad: quad,
        triple: triple,
        variable: variable
    });

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    var Wildcard$2 = {};

    // Wildcard constructor
    let Wildcard$1 = class Wildcard {
      constructor() {
        return WILDCARD || this;
      }

      equals(other) {
        return other && (this.termType === other.termType);
      }
    };

    Object.defineProperty(Wildcard$1.prototype, 'value', {
      enumerable: true,
      value: '*',
    });

    Object.defineProperty(Wildcard$1.prototype, 'termType', {
      enumerable: true,
      value: 'Wildcard',
    });


    // Wildcard singleton
    var WILDCARD = new Wildcard$1();

    Wildcard$2.Wildcard = Wildcard$1;

    /* parser generated by jison 0.4.18 */

    /*
      Returns a Parser object of the following structure:

      Parser: {
        yy: {}
      }

      Parser.prototype: {
        yy: {},
        trace: function(),
        symbols_: {associative list: name ==> number},
        terminals_: {associative list: number ==> name},
        productions_: [...],
        performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
        table: [...],
        defaultActions: {...},
        parseError: function(str, hash),
        parse: function(input),

        lexer: {
            EOF: 1,
            parseError: function(str, hash),
            setInput: function(input),
            input: function(),
            unput: function(str),
            more: function(),
            less: function(n),
            pastInput: function(),
            upcomingInput: function(),
            showPosition: function(),
            test_match: function(regex_match_array, rule_index),
            next: function(),
            lex: function(),
            begin: function(condition),
            popState: function(),
            _currentRules: function(),
            topState: function(),
            pushState: function(condition),

            options: {
                ranges: boolean           (optional: true ==> token location info will include a .range[] member)
                flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
                backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
            },

            performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
            rules: [...],
            conditions: {associative list: name ==> set},
        }
      }


      token location info (@$, _$, etc.): {
        first_line: n,
        last_line: n,
        first_column: n,
        last_column: n,
        range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
      }


      the parseError function receives a 'hash' object with these members for lexer and parser errors: {
        text:        (matched text)
        token:       (the produced terminal token, if any)
        line:        (yylineno)
      }
      while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
        loc:         (yylloc)
        expected:    (string describing the set of expected tokens)
        recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
      }
    */
    var SparqlParser = (function(){
    var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[6,12,13,15,16,28,35,41,50,55,107,117,120,122,123,132,133,138,195,219,224,312,322,323,324,325,326],$V1=[2,211],$V2=[107,117,120,122,123,132,133,138,322,323,324,325,326],$V3=[2,389],$V4=[1,22],$V5=[1,31],$V6=[13,16,35,195,219,224,312],$V7=[6,90],$V8=[45,46,58],$V9=[45,58],$Va=[1,62],$Vb=[1,64],$Vc=[1,60],$Vd=[1,63],$Ve=[1,69],$Vf=[1,70],$Vg=[26,34,35],$Vh=[13,16,35,195,219,312],$Vi=[13,16,312],$Vj=[119,141,320,327],$Vk=[13,16,119,141,312],$Vl=[1,96],$Vm=[1,100],$Vn=[1,102],$Vo=[119,141,320,321,327],$Vp=[13,16,119,141,312,321],$Vq=[1,108],$Vr=[2,253],$Vs=[1,107],$Vt=[13,16,34,35,87,93,226,231,245,246,299,300,301,302,303,304,305,306,307,308,309,310,311,312],$Vu=[6,45,46,58,68,75,78,86,88,90],$Vv=[6,13,16,34,45,46,58,68,75,78,86,88,90,312],$Vw=[6,13,16,26,34,35,37,38,45,46,48,58,68,75,78,86,87,88,90,93,100,116,119,132,133,135,140,167,168,170,173,174,191,195,219,224,226,227,231,235,245,246,250,254,258,271,273,278,295,299,300,301,302,303,304,305,306,307,308,309,310,311,312,328,330,331,333,334,335,336,337,338,339],$Vx=[34,35,45,46,58],$Vy=[1,139],$Vz=[1,140],$VA=[1,151],$VB=[1,131],$VC=[1,125],$VD=[1,130],$VE=[1,132],$VF=[1,142],$VG=[1,143],$VH=[1,144],$VI=[1,145],$VJ=[1,147],$VK=[1,148],$VL=[2,461],$VM=[1,157],$VN=[1,158],$VO=[1,159],$VP=[1,152],$VQ=[1,153],$VR=[1,156],$VS=[1,166],$VT=[1,167],$VU=[1,168],$VV=[1,169],$VW=[1,170],$VX=[1,171],$VY=[1,172],$VZ=[1,173],$V_=[1,174],$V$=[1,175],$V01=[1,165],$V11=[1,160],$V21=[1,161],$V31=[1,162],$V41=[1,163],$V51=[1,164],$V61=[6,13,16,34,35,46,48,87,90,93,119,167,168,170,173,174,226,231,245,246,299,300,301,302,303,304,305,306,307,308,309,310,311,312,328],$V71=[2,312],$V81=[1,199],$V91=[1,197],$Va1=[6,191],$Vb1=[2,329],$Vc1=[2,317],$Vd1=[45,135],$Ve1=[6,48,78,86,88,90],$Vf1=[2,257],$Vg1=[1,213],$Vh1=[1,215],$Vi1=[6,48,75,78,86,88,90],$Vj1=[2,255],$Vk1=[1,221],$Vl1=[1,233],$Vm1=[1,231],$Vn1=[1,239],$Vo1=[1,232],$Vp1=[1,237],$Vq1=[1,238],$Vr1=[6,68,75,78,86,88,90],$Vs1=[37,38,191,250,278],$Vt1=[37,38,191,250,254,278],$Vu1=[37,38,191,250,254,258,271,273,278,295,306,307,308,309,310,311,334,335,336,337,338,339],$Vv1=[26,37,38,191,250,254,258,271,273,278,295,306,307,308,309,310,311,331,334,335,336,337,338,339],$Vw1=[1,267],$Vx1=[1,266],$Vy1=[6,13,16,26,34,35,37,38,46,48,75,78,81,83,86,87,88,90,93,119,167,168,170,173,174,191,226,231,245,246,250,254,258,271,273,275,276,277,278,279,281,282,284,285,288,290,295,299,300,301,302,303,304,305,306,307,308,309,310,311,312,328,331,334,335,336,337,338,339,340,341,342,343,344],$Vz1=[1,275],$VA1=[1,274],$VB1=[13,16,26,34,35,37,38,46,48,87,90,93,100,119,167,168,170,173,174,191,195,219,224,226,227,231,235,245,246,250,254,258,271,273,278,295,299,300,301,302,303,304,305,306,307,308,309,310,311,312,328,331,334,335,336,337,338,339],$VC1=[35,93],$VD1=[13,16,26,34,35,37,38,46,48,87,90,93,100,119,167,168,170,173,174,191,195,219,224,226,227,231,235,245,246,250,254,258,271,273,278,295,297,298,299,300,301,302,303,304,305,306,307,308,309,310,311,312,328,331,334,335,336,337,338,339],$VE1=[13,16,48,87,100,231,299,300,301,302,303,304,305,306,307,308,309,310,311,312],$VF1=[48,93],$VG1=[34,38],$VH1=[6,13,16,34,35,38,87,93,226,231,245,246,299,300,301,302,303,304,305,306,307,308,309,310,311,312,330,331],$VI1=[6,13,16,26,34,35,38,87,93,226,231,245,246,271,299,300,301,302,303,304,305,306,307,308,309,310,311,312,330,331,333],$VJ1=[1,299],$VK1=[1,300],$VL1=[6,116,191],$VM1=[48,119],$VN1=[6,48,86,88,90],$VO1=[2,341],$VP1=[2,333],$VQ1=[1,340],$VR1=[1,342],$VS1=[48,119,328],$VT1=[13,16,34,195,312],$VU1=[13,16,34,35,38,46,48,87,90,93,119,167,168,170,173,174,191,195,219,224,226,227,231,235,245,246,278,299,300,301,302,303,304,305,306,307,308,309,310,311,312,328],$VV1=[13,16,34,35,87,219,271,273,275,276,277,279,281,282,284,285,288,290,299,300,301,302,303,304,305,306,307,308,309,310,311,312,339,340,341,342,343,344],$VW1=[1,374],$VX1=[1,375],$VY1=[13,16,26,34,35,87,219,271,273,275,276,277,279,281,282,284,285,288,290,299,300,301,302,303,304,305,306,307,308,309,310,311,312,339,340,341,342,343,344],$VZ1=[1,398],$V_1=[1,399],$V$1=[13,16,38,195,224,312],$V02=[1,416],$V12=[6,48,90],$V22=[6,13,16,35,48,78,86,88,90,275,276,277,279,281,282,284,285,288,290,312,339,340,341,342,343,344],$V32=[6,13,16,34,35,46,48,78,81,83,86,87,88,90,93,119,167,168,170,173,174,226,231,245,246,275,276,277,279,281,282,284,285,288,290,299,300,301,302,303,304,305,306,307,308,309,310,311,312,328,339,340,341,342,343,344],$V42=[46,48,90,119,167,168,170,173,174],$V52=[1,435],$V62=[1,436],$V72=[1,442],$V82=[1,441],$V92=[48,119,191,227,328],$Va2=[13,16,34,35,38,87,93,226,231,245,246,299,300,301,302,303,304,305,306,307,308,309,310,311,312],$Vb2=[13,16,34,35,38,48,87,93,119,191,226,227,231,245,246,278,299,300,301,302,303,304,305,306,307,308,309,310,311,312,328],$Vc2=[13,16,38,48,87,100,231,299,300,301,302,303,304,305,306,307,308,309,310,311,312],$Vd2=[35,48],$Ve2=[2,332],$Vf2=[1,497],$Vg2=[1,494],$Vh2=[1,495],$Vi2=[6,13,16,26,34,35,37,38,46,48,68,75,78,81,83,86,87,88,90,93,119,167,168,170,173,174,191,226,231,245,246,250,254,258,271,273,275,276,277,278,279,281,282,284,285,288,290,295,299,300,301,302,303,304,305,306,307,308,309,310,311,312,328,329,331,334,335,336,337,338,339,340,341,342,343,344],$Vj2=[1,515],$Vk2=[46,48,90,119,167,168,170,173,174,328],$Vl2=[13,16,34,35,195,219,224,312],$Vm2=[6,13,16,34,35,48,75,78,86,88,90,275,276,277,279,281,282,284,285,288,290,312,339,340,341,342,343,344],$Vn2=[13,16,34,35,38,48,87,93,119,191,195,226,227,231,245,246,278,299,300,301,302,303,304,305,306,307,308,309,310,311,312,328],$Vo2=[6,13,16,34,35,48,81,83,86,88,90,275,276,277,279,281,282,284,285,288,290,312,339,340,341,342,343,344],$Vp2=[13,16,34,35,46,48,87,90,93,119,167,168,170,173,174,226,231,245,246,299,300,301,302,303,304,305,306,307,308,309,310,311,312],$Vq2=[13,16,34,312],$Vr2=[13,16,34,35,46,48,87,90,93,119,167,168,170,173,174,226,231,245,246,299,300,301,302,303,304,305,306,307,308,309,310,311,312,328],$Vs2=[2,344],$Vt2=[13,16,34,35,38,46,48,87,90,93,119,167,168,170,173,174,191,226,227,231,245,246,278,299,300,301,302,303,304,305,306,307,308,309,310,311,312,328],$Vu2=[13,16,34,35,37,38,46,48,87,90,93,119,167,168,170,173,174,191,195,219,224,226,227,231,235,245,246,278,299,300,301,302,303,304,305,306,307,308,309,310,311,312,328],$Vv2=[2,339],$Vw2=[13,16,34,35,38,46,48,87,90,93,119,167,168,170,173,174,191,195,219,224,226,227,231,245,246,278,299,300,301,302,303,304,305,306,307,308,309,310,311,312,328],$Vx2=[13,16,38,87,100,231,299,300,301,302,303,304,305,306,307,308,309,310,311,312],$Vy2=[46,48,90,119,167,168,170,173,174,191,227,328],$Vz2=[13,16,34,38,48,87,100,195,231,235,299,300,301,302,303,304,305,306,307,308,309,310,311,312],$VA2=[13,16,34,35,48,87,93,119,226,231,245,246,299,300,301,302,303,304,305,306,307,308,309,310,311,312],$VB2=[2,327];
    var parser = {trace: function trace () { },
    yy: {},
    symbols_: {"error":2,"QueryOrUpdate":3,"Prologue":4,"QueryOrUpdate_group0":5,"EOF":6,"Prologue_repetition0":7,"Query":8,"Query_group0":9,"Query_option0":10,"BaseDecl":11,"BASE":12,"IRIREF":13,"PrefixDecl":14,"PREFIX":15,"PNAME_NS":16,"SelectQuery":17,"SelectClauseWildcard":18,"SelectQuery_repetition0":19,"WhereClause":20,"SolutionModifierNoGroup":21,"SelectClauseVars":22,"SelectQuery_repetition1":23,"SolutionModifier":24,"SelectClauseBase":25,"*":26,"SelectClauseVars_repetition_plus0":27,"SELECT":28,"SelectClauseBase_option0":29,"SubSelect":30,"SubSelect_option0":31,"SubSelect_option1":32,"SelectClauseItem":33,"VAR":34,"(":35,"Expression":36,"AS":37,")":38,"VarTriple":39,"ConstructQuery":40,"CONSTRUCT":41,"ConstructTemplate":42,"ConstructQuery_repetition0":43,"ConstructQuery_repetition1":44,"WHERE":45,"{":46,"ConstructQuery_option0":47,"}":48,"DescribeQuery":49,"DESCRIBE":50,"DescribeQuery_group0":51,"DescribeQuery_repetition0":52,"DescribeQuery_option0":53,"AskQuery":54,"ASK":55,"AskQuery_repetition0":56,"DatasetClause":57,"FROM":58,"DatasetClause_option0":59,"iri":60,"WhereClause_option0":61,"GroupGraphPattern":62,"SolutionModifier_option0":63,"SolutionModifierNoGroup_option0":64,"SolutionModifierNoGroup_option1":65,"SolutionModifierNoGroup_option2":66,"GroupClause":67,"GROUP":68,"BY":69,"GroupClause_repetition_plus0":70,"GroupCondition":71,"BuiltInCall":72,"FunctionCall":73,"HavingClause":74,"HAVING":75,"HavingClause_repetition_plus0":76,"OrderClause":77,"ORDER":78,"OrderClause_repetition_plus0":79,"OrderCondition":80,"ASC":81,"BrackettedExpression":82,"DESC":83,"Constraint":84,"LimitOffsetClauses":85,"LIMIT":86,"INTEGER":87,"OFFSET":88,"ValuesClause":89,"VALUES":90,"InlineData":91,"InlineData_repetition0":92,"NIL":93,"InlineData_repetition1":94,"InlineData_repetition_plus2":95,"InlineData_repetition3":96,"DataBlockValue":97,"Literal":98,"ConstTriple":99,"UNDEF":100,"DataBlockValueList":101,"DataBlockValueList_repetition_plus0":102,"Update":103,"Update_repetition0":104,"Update1":105,"Update_option0":106,"LOAD":107,"Update1_option0":108,"Update1_option1":109,"Update1_group0":110,"Update1_option2":111,"GraphRefAll":112,"Update1_group1":113,"Update1_option3":114,"GraphOrDefault":115,"TO":116,"CREATE":117,"Update1_option4":118,"GRAPH":119,"INSERTDATA":120,"QuadPattern":121,"DELETEDATA":122,"DELETEWHERE":123,"Update1_option5":124,"InsertClause":125,"Update1_option6":126,"Update1_repetition0":127,"Update1_option7":128,"DeleteClause":129,"Update1_option8":130,"Update1_repetition1":131,"DELETE":132,"INSERT":133,"UsingClause":134,"USING":135,"UsingClause_option0":136,"WithClause":137,"WITH":138,"IntoGraphClause":139,"INTO":140,"DEFAULT":141,"GraphOrDefault_option0":142,"GraphRefAll_group0":143,"QuadPattern_option0":144,"QuadPattern_repetition0":145,"QuadsNotTriples":146,"QuadsNotTriples_group0":147,"QuadsNotTriples_option0":148,"QuadsNotTriples_option1":149,"QuadsNotTriples_option2":150,"TriplesTemplate":151,"TriplesTemplate_repetition0":152,"TriplesSameSubject":153,"TriplesTemplate_option0":154,"GroupGraphPatternSub":155,"GroupGraphPatternSub_option0":156,"GroupGraphPatternSub_repetition0":157,"GroupGraphPatternSubTail":158,"GraphPatternNotTriples":159,"GroupGraphPatternSubTail_option0":160,"GroupGraphPatternSubTail_option1":161,"TriplesBlock":162,"TriplesBlock_repetition0":163,"TriplesSameSubjectPath":164,"TriplesBlock_option0":165,"GraphPatternNotTriples_repetition0":166,"OPTIONAL":167,"MINUS":168,"GraphPatternNotTriples_group0":169,"SERVICE":170,"GraphPatternNotTriples_option0":171,"GraphPatternNotTriples_group1":172,"FILTER":173,"BIND":174,"FunctionCall_option0":175,"FunctionCall_repetition0":176,"ExpressionList":177,"ExpressionList_repetition0":178,"ConstructTemplate_option0":179,"ConstructTriples":180,"ConstructTriples_repetition0":181,"ConstructTriples_option0":182,"TriplesSameSubject_group0":183,"PropertyListNotEmpty":184,"TriplesNode":185,"PropertyList":186,"PropertyList_option0":187,"VerbObjectList":188,"PropertyListNotEmpty_repetition0":189,"SemiOptionalVerbObjectList":190,";":191,"SemiOptionalVerbObjectList_option0":192,"Verb":193,"ObjectList":194,"a":195,"ObjectList_repetition0":196,"GraphNode":197,"ObjectListPath":198,"ObjectListPath_repetition0":199,"GraphNodePath":200,"TriplesSameSubjectPath_group0":201,"PropertyListPathNotEmpty":202,"TriplesNodePath":203,"TriplesSameSubjectPath_option0":204,"PropertyListPathNotEmpty_group0":205,"PropertyListPathNotEmpty_repetition0":206,"PropertyListPathNotEmpty_repetition1":207,"PropertyListPathNotEmptyTail":208,"PropertyListPathNotEmptyTail_group0":209,"Path":210,"Path_repetition0":211,"PathSequence":212,"PathSequence_repetition0":213,"PathEltOrInverse":214,"PathElt":215,"PathPrimary":216,"PathElt_option0":217,"PathEltOrInverse_option0":218,"!":219,"PathNegatedPropertySet":220,"PathOneInPropertySet":221,"PathNegatedPropertySet_repetition0":222,"PathNegatedPropertySet_option0":223,"^":224,"TriplesNode_repetition_plus0":225,"[":226,"]":227,"TriplesNodePath_repetition_plus0":228,"GraphNode_group0":229,"GraphNodePath_group0":230,"<<":231,"VarTriple_group0":232,"VarTriple_group1":233,"VarTriple_group2":234,">>":235,"VarTriple_group3":236,"VarTriple_group4":237,"ConstTriple_group0":238,"ConstTriple_group1":239,"ConstTriple_group2":240,"ConstTriple_group3":241,"ConstTriple_group4":242,"VarOrTerm":243,"Term":244,"BLANK_NODE_LABEL":245,"ANON":246,"ConditionalAndExpression":247,"Expression_repetition0":248,"ExpressionTail":249,"||":250,"RelationalExpression":251,"ConditionalAndExpression_repetition0":252,"ConditionalAndExpressionTail":253,"&&":254,"AdditiveExpression":255,"RelationalExpression_group0":256,"RelationalExpression_option0":257,"IN":258,"MultiplicativeExpression":259,"AdditiveExpression_repetition0":260,"AdditiveExpressionTail":261,"AdditiveExpressionTail_group0":262,"NumericLiteralPositive":263,"AdditiveExpressionTail_repetition0":264,"NumericLiteralNegative":265,"AdditiveExpressionTail_repetition1":266,"UnaryExpression":267,"MultiplicativeExpression_repetition0":268,"MultiplicativeExpressionTail":269,"MultiplicativeExpressionTail_group0":270,"+":271,"PrimaryExpression":272,"-":273,"Aggregate":274,"FUNC_ARITY0":275,"FUNC_ARITY1":276,"FUNC_ARITY2":277,",":278,"IF":279,"BuiltInCall_group0":280,"BOUND":281,"BNODE":282,"BuiltInCall_option0":283,"EXISTS":284,"COUNT":285,"Aggregate_option0":286,"Aggregate_group0":287,"FUNC_AGGREGATE":288,"Aggregate_option1":289,"GROUP_CONCAT":290,"Aggregate_option2":291,"Aggregate_option3":292,"GroupConcatSeparator":293,"SEPARATOR":294,"=":295,"String":296,"LANGTAG":297,"^^":298,"DECIMAL":299,"DOUBLE":300,"BOOLEAN":301,"STRING_LITERAL1":302,"STRING_LITERAL2":303,"STRING_LITERAL_LONG1":304,"STRING_LITERAL_LONG2":305,"INTEGER_POSITIVE":306,"DECIMAL_POSITIVE":307,"DOUBLE_POSITIVE":308,"INTEGER_NEGATIVE":309,"DECIMAL_NEGATIVE":310,"DOUBLE_NEGATIVE":311,"PNAME_LN":312,"QueryOrUpdate_group0_option0":313,"Prologue_repetition0_group0":314,"SelectClauseBase_option0_group0":315,"DISTINCT":316,"REDUCED":317,"DescribeQuery_group0_repetition_plus0_group0":318,"DescribeQuery_group0_repetition_plus0":319,"NAMED":320,"SILENT":321,"CLEAR":322,"DROP":323,"ADD":324,"MOVE":325,"COPY":326,"ALL":327,".":328,"UNION":329,"|":330,"/":331,"PathElt_option0_group0":332,"?":333,"!=":334,"<":335,">":336,"<=":337,">=":338,"NOT":339,"CONCAT":340,"COALESCE":341,"SUBSTR":342,"REGEX":343,"REPLACE":344,"$accept":0,"$end":1},
    terminals_: {2:"error",6:"EOF",12:"BASE",13:"IRIREF",15:"PREFIX",16:"PNAME_NS",26:"*",28:"SELECT",34:"VAR",35:"(",37:"AS",38:")",41:"CONSTRUCT",45:"WHERE",46:"{",48:"}",50:"DESCRIBE",55:"ASK",58:"FROM",68:"GROUP",69:"BY",75:"HAVING",78:"ORDER",81:"ASC",83:"DESC",86:"LIMIT",87:"INTEGER",88:"OFFSET",90:"VALUES",93:"NIL",100:"UNDEF",107:"LOAD",116:"TO",117:"CREATE",119:"GRAPH",120:"INSERTDATA",122:"DELETEDATA",123:"DELETEWHERE",132:"DELETE",133:"INSERT",135:"USING",138:"WITH",140:"INTO",141:"DEFAULT",167:"OPTIONAL",168:"MINUS",170:"SERVICE",173:"FILTER",174:"BIND",191:";",195:"a",219:"!",224:"^",226:"[",227:"]",231:"<<",235:">>",245:"BLANK_NODE_LABEL",246:"ANON",250:"||",254:"&&",258:"IN",271:"+",273:"-",275:"FUNC_ARITY0",276:"FUNC_ARITY1",277:"FUNC_ARITY2",278:",",279:"IF",281:"BOUND",282:"BNODE",284:"EXISTS",285:"COUNT",288:"FUNC_AGGREGATE",290:"GROUP_CONCAT",294:"SEPARATOR",295:"=",297:"LANGTAG",298:"^^",299:"DECIMAL",300:"DOUBLE",301:"BOOLEAN",302:"STRING_LITERAL1",303:"STRING_LITERAL2",304:"STRING_LITERAL_LONG1",305:"STRING_LITERAL_LONG2",306:"INTEGER_POSITIVE",307:"DECIMAL_POSITIVE",308:"DOUBLE_POSITIVE",309:"INTEGER_NEGATIVE",310:"DECIMAL_NEGATIVE",311:"DOUBLE_NEGATIVE",312:"PNAME_LN",316:"DISTINCT",317:"REDUCED",320:"NAMED",321:"SILENT",322:"CLEAR",323:"DROP",324:"ADD",325:"MOVE",326:"COPY",327:"ALL",328:".",329:"UNION",330:"|",331:"/",333:"?",334:"!=",335:"<",336:">",337:"<=",338:">=",339:"NOT",340:"CONCAT",341:"COALESCE",342:"SUBSTR",343:"REGEX",344:"REPLACE"},
    productions_: [0,[3,3],[4,1],[8,2],[11,2],[14,3],[17,4],[17,4],[18,2],[22,2],[25,2],[30,4],[30,4],[33,1],[33,5],[33,5],[40,5],[40,7],[49,5],[54,4],[57,3],[20,2],[24,2],[21,3],[67,3],[71,1],[71,1],[71,3],[71,5],[71,1],[74,2],[77,3],[80,2],[80,2],[80,1],[80,1],[85,2],[85,2],[85,4],[85,4],[89,2],[91,4],[91,4],[91,6],[97,1],[97,1],[97,1],[97,1],[101,3],[103,3],[105,4],[105,3],[105,5],[105,4],[105,2],[105,2],[105,2],[105,6],[105,6],[129,2],[125,2],[134,3],[137,2],[139,3],[115,1],[115,2],[112,2],[112,1],[121,4],[146,7],[151,3],[62,3],[62,3],[155,2],[158,3],[162,3],[159,2],[159,2],[159,2],[159,3],[159,4],[159,2],[159,6],[159,6],[159,1],[84,1],[84,1],[84,1],[73,2],[73,6],[177,1],[177,4],[42,3],[180,3],[153,2],[153,2],[186,1],[184,2],[190,2],[188,2],[193,1],[193,1],[193,1],[194,2],[198,2],[164,2],[164,2],[202,4],[208,1],[208,3],[210,2],[212,2],[215,2],[214,2],[216,1],[216,1],[216,2],[216,3],[220,1],[220,1],[220,4],[221,1],[221,1],[221,2],[221,2],[185,3],[185,3],[203,3],[203,3],[197,1],[197,1],[200,1],[200,1],[39,9],[39,5],[99,9],[99,5],[243,1],[243,1],[244,1],[244,1],[244,1],[244,1],[244,1],[36,2],[249,2],[247,2],[253,2],[251,1],[251,3],[251,4],[255,2],[261,2],[261,2],[261,2],[259,2],[269,2],[267,2],[267,2],[267,2],[267,1],[272,1],[272,1],[272,1],[272,1],[272,1],[272,1],[82,3],[72,1],[72,2],[72,4],[72,6],[72,8],[72,2],[72,4],[72,2],[72,4],[72,3],[274,5],[274,5],[274,6],[293,4],[98,1],[98,2],[98,3],[98,1],[98,1],[98,1],[98,1],[98,1],[98,1],[296,1],[296,1],[296,1],[296,1],[263,1],[263,1],[263,1],[265,1],[265,1],[265,1],[60,1],[60,1],[60,1],[313,0],[313,1],[5,1],[5,1],[5,1],[314,1],[314,1],[7,0],[7,2],[9,1],[9,1],[9,1],[9,1],[10,0],[10,1],[19,0],[19,2],[23,0],[23,2],[27,1],[27,2],[315,1],[315,1],[29,0],[29,1],[31,0],[31,1],[32,0],[32,1],[43,0],[43,2],[44,0],[44,2],[47,0],[47,1],[318,1],[318,1],[319,1],[319,2],[51,1],[51,1],[52,0],[52,2],[53,0],[53,1],[56,0],[56,2],[59,0],[59,1],[61,0],[61,1],[63,0],[63,1],[64,0],[64,1],[65,0],[65,1],[66,0],[66,1],[70,1],[70,2],[76,1],[76,2],[79,1],[79,2],[92,0],[92,2],[94,0],[94,2],[95,1],[95,2],[96,0],[96,2],[102,1],[102,2],[104,0],[104,4],[106,0],[106,2],[108,0],[108,1],[109,0],[109,1],[110,1],[110,1],[111,0],[111,1],[113,1],[113,1],[113,1],[114,0],[114,1],[118,0],[118,1],[124,0],[124,1],[126,0],[126,1],[127,0],[127,2],[128,0],[128,1],[130,0],[130,1],[131,0],[131,2],[136,0],[136,1],[142,0],[142,1],[143,1],[143,1],[143,1],[144,0],[144,1],[145,0],[145,2],[147,1],[147,1],[148,0],[148,1],[149,0],[149,1],[150,0],[150,1],[152,0],[152,3],[154,0],[154,1],[156,0],[156,1],[157,0],[157,2],[160,0],[160,1],[161,0],[161,1],[163,0],[163,3],[165,0],[165,1],[166,0],[166,3],[169,1],[169,1],[171,0],[171,1],[172,1],[172,1],[175,0],[175,1],[176,0],[176,3],[178,0],[178,3],[179,0],[179,1],[181,0],[181,3],[182,0],[182,1],[183,1],[183,1],[187,0],[187,1],[189,0],[189,2],[192,0],[192,1],[196,0],[196,3],[199,0],[199,3],[201,1],[201,1],[204,0],[204,1],[205,1],[205,1],[206,0],[206,3],[207,0],[207,2],[209,1],[209,1],[211,0],[211,3],[213,0],[213,3],[332,1],[332,1],[332,1],[217,0],[217,1],[218,0],[218,1],[222,0],[222,3],[223,0],[223,1],[225,1],[225,2],[228,1],[228,2],[229,1],[229,1],[230,1],[230,1],[232,1],[232,1],[233,1],[233,1],[234,1],[234,1],[236,1],[236,1],[237,1],[237,1],[238,1],[238,1],[239,1],[239,1],[240,1],[240,1],[241,1],[241,1],[242,1],[242,1],[248,0],[248,2],[252,0],[252,2],[256,1],[256,1],[256,1],[256,1],[256,1],[256,1],[257,0],[257,1],[260,0],[260,2],[262,1],[262,1],[264,0],[264,2],[266,0],[266,2],[268,0],[268,2],[270,1],[270,1],[280,1],[280,1],[280,1],[280,1],[280,1],[283,0],[283,1],[286,0],[286,1],[287,1],[287,1],[289,0],[289,1],[291,0],[291,1],[292,0],[292,1]],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
    /* this == yyval */

    var $0 = $$.length - 1;
    switch (yystate) {
    case 1:

          // Set parser options
          $$[$0-1] = $$[$0-1] || {};
          if (Parser.base)
            $$[$0-1].base = Parser.base;
          Parser.base = '';
          $$[$0-1].prefixes = Parser.prefixes;
          Parser.prefixes = null;

          if (Parser.pathOnly) {
            if ($$[$0-1].type === 'path' || 'termType' in $$[$0-1]) {
              return $$[$0-1]
            }
            throw new Error('Received full SPARQL query in path only mode');
          } else if ($$[$0-1].type === 'path' || 'termType' in $$[$0-1]) {
            throw new Error('Received only path in full SPARQL mode');
          }

          // Ensure that blank nodes are not used across INSERT DATA clauses
          if ($$[$0-1].type === 'update') {
            const insertBnodesAll = {};
            for (const update of $$[$0-1].updates) {
              if (update.updateType === 'insert') {
                // Collect bnodes for current insert clause
                const insertBnodes = {};
                for (const operation of update.insert) {
                  if (operation.type === 'bgp' || operation.type === 'graph') {
                    for (const triple of operation.triples) {
                      if (triple.subject.termType === 'BlankNode')
                        insertBnodes[triple.subject.value] = true;
                      if (triple.predicate.termType === 'BlankNode')
                        insertBnodes[triple.predicate.value] = true;
                      if (triple.object.termType === 'BlankNode')
                        insertBnodes[triple.object.value] = true;
                    }
                  }
                }

                // Check if the inserting bnodes don't clash with bnodes from a previous insert clause
                for (const bnode of Object.keys(insertBnodes)) {
                  if (insertBnodesAll[bnode]) {
                    throw new Error('Detected reuse blank node across different INSERT DATA clauses');
                  }
                  insertBnodesAll[bnode] = true;
                }
              }
            }
          }
          return $$[$0-1];
    case 3:
    this.$ = extend($$[$0-1], $$[$0], { type: 'query' });
    break;
    case 4:

          Parser.base = resolveIRI($$[$0]);
        
    break;
    case 5:

          if (!Parser.prefixes) Parser.prefixes = {};
          $$[$0-1] = $$[$0-1].substr(0, $$[$0-1].length - 1);
          $$[$0] = resolveIRI($$[$0]);
          Parser.prefixes[$$[$0-1]] = $$[$0];
        
    break;
    case 6:
    this.$ = extend($$[$0-3], groupDatasets($$[$0-2]), $$[$0-1], $$[$0]);
    break;
    case 7:

          // Check for projection of ungrouped variable
          if (!Parser.skipValidation) {
            const counts = flatten($$[$0-3].variables.map(vars => getAggregatesOfExpression(vars.expression)))
              .some(agg => agg.aggregation === "count" && !(agg.expression instanceof Wildcard));
            if (counts || $$[$0].group) {
              for (const selectVar of $$[$0-3].variables) {
                if (selectVar.termType === "Variable") {
                  if (!$$[$0].group || !$$[$0].group.map(groupVar => getExpressionId(groupVar)).includes(getExpressionId(selectVar))) {
                    throw Error("Projection of ungrouped variable (?" + getExpressionId(selectVar) + ")");
                  }
                } else if (getAggregatesOfExpression(selectVar.expression).length === 0) {
                  const usedVars = getVariablesFromExpression(selectVar.expression);
                  for (const usedVar of usedVars) {
                    if (!$$[$0].group || !$$[$0].group.map || !$$[$0].group.map(groupVar => getExpressionId(groupVar)).includes(getExpressionId(usedVar))) {
                      throw Error("Use of ungrouped variable in projection of operation (?" + getExpressionId(usedVar) + ")");
                    }
                  }
                }
              }
            }
          }
          // Check if id of each AS-selected column is not yet bound by subquery
          const subqueries = $$[$0-1].where.filter(w => w.type === "query");
          if (subqueries.length > 0) {
            const selectedVarIds = $$[$0-3].variables.filter(v => v.variable && v.variable.value).map(v => v.variable.value);
            const subqueryIds = flatten(subqueries.map(sub => sub.variables)).map(v => v.value || v.variable.value);
            for (const selectedVarId of selectedVarIds) {
              if (subqueryIds.indexOf(selectedVarId) >= 0) {
                throw Error("Target id of 'AS' (?" + selectedVarId + ") already used in subquery");
              }
            }
          }
          this.$ = extend($$[$0-3], groupDatasets($$[$0-2]), $$[$0-1], $$[$0]);
        
    break;
    case 8:
    this.$ = extend($$[$0-1], {variables: [new Wildcard()]});
    break;
    case 9:

          // Check if id of each selected column is different
          const selectedVarIds = $$[$0].map(v => v.value || v.variable.value);
          const duplicates = getDuplicatesInArray(selectedVarIds);
          if (duplicates.length > 0) {
            throw Error("Two or more of the resulting columns have the same name (?" + duplicates[0] + ")");
          }

          this.$ = extend($$[$0-1], { variables: $$[$0] });
        
    break;
    case 10:
    this.$ = extend({ queryType: 'SELECT'}, $$[$0] && ($$[$0-1] = lowercase($$[$0]), $$[$0] = {}, $$[$0][$$[$0-1]] = true, $$[$0]));
    break;
    case 11: case 12:
    this.$ = extend($$[$0-3], $$[$0-2], $$[$0-1], $$[$0], { type: 'query' });
    break;
    case 13: case 100: case 137: case 166:
    this.$ = toVar($$[$0]);
    break;
    case 14: case 28:
    this.$ = expression($$[$0-3], { variable: toVar($$[$0-1]) });
    break;
    case 15:
    this.$ = ensureSparqlStar(expression($$[$0-3], { variable: toVar($$[$0-1]) }));
    break;
    case 16:
    this.$ = extend({ queryType: 'CONSTRUCT', template: $$[$0-3] }, groupDatasets($$[$0-2]), $$[$0-1], $$[$0]);
    break;
    case 17:
    this.$ = extend({ queryType: 'CONSTRUCT', template: $$[$0-2] = ($$[$0-2] ? $$[$0-2].triples : []) }, groupDatasets($$[$0-5]), { where: [ { type: 'bgp', triples: appendAllTo([], $$[$0-2]) } ] }, $$[$0]);
    break;
    case 18:
    this.$ = extend({ queryType: 'DESCRIBE', variables: $$[$0-3] === '*' ? [new Wildcard()] : $$[$0-3].map(toVar) }, groupDatasets($$[$0-2]), $$[$0-1], $$[$0]);
    break;
    case 19:
    this.$ = extend({ queryType: 'ASK' }, groupDatasets($$[$0-2]), $$[$0-1], $$[$0]);
    break;
    case 20: case 61:
    this.$ = { iri: $$[$0], named: !!$$[$0-1] };
    break;
    case 21:
    this.$ = { where: $$[$0].patterns };
    break;
    case 22:
    this.$ = extend($$[$0-1], $$[$0]);
    break;
    case 23:
    this.$ = extend($$[$0-2], $$[$0-1], $$[$0]);
    break;
    case 24:
    this.$ = { group: $$[$0] };
    break;
    case 25: case 26: case 32: case 34:
    this.$ = expression($$[$0]);
    break;
    case 27:
    this.$ = expression($$[$0-1]);
    break;
    case 29: case 35:
    this.$ = expression(toVar($$[$0]));
    break;
    case 30:
    this.$ = { having: $$[$0] };
    break;
    case 31:
    this.$ = { order: $$[$0] };
    break;
    case 33:
    this.$ = expression($$[$0], { descending: true });
    break;
    case 36:
    this.$ = { limit:  toInt($$[$0]) };
    break;
    case 37:
    this.$ = { offset: toInt($$[$0]) };
    break;
    case 38:
    this.$ = { limit: toInt($$[$0-2]), offset: toInt($$[$0]) };
    break;
    case 39:
    this.$ = { limit: toInt($$[$0]), offset: toInt($$[$0-2]) };
    break;
    case 40:
    this.$ = { type: 'values', values: $$[$0] };
    break;
    case 41:

          this.$ = $$[$0-1].map(function(v) { var o = {}; o[$$[$0-3]] = v; return o; });
        
    break;
    case 42:

          this.$ = $$[$0-1].map(function() { return {}; });
        
    break;
    case 43:

          var length = $$[$0-4].length;
          $$[$0-4] = $$[$0-4].map(toVar);
          this.$ = $$[$0-1].map(function (values) {
            if (values.length !== length)
              throw Error('Inconsistent VALUES length');
            var valuesObject = {};
            for(var i = 0; i<length; i++)
              valuesObject['?' + $$[$0-4][i].value] = values[i];
            return valuesObject;
          });
        
    break;
    case 46:
    this.$ = ensureSparqlStar($$[$0]);
    break;
    case 47:
    this.$ = undefined;
    break;
    case 48: case 92: case 117: case 167:
    this.$ = $$[$0-1];
    break;
    case 49:
    this.$ = { type: 'update', updates: appendTo($$[$0-2], $$[$0-1]) };
    break;
    case 50:
    this.$ = extend({ type: 'load', silent: !!$$[$0-2], source: $$[$0-1] }, $$[$0] && { destination: $$[$0] });
    break;
    case 51:
    this.$ = { type: lowercase($$[$0-2]), silent: !!$$[$0-1], graph: $$[$0] };
    break;
    case 52:
    this.$ = { type: lowercase($$[$0-4]), silent: !!$$[$0-3], source: $$[$0-2], destination: $$[$0] };
    break;
    case 53:
    this.$ = { type: 'create', silent: !!$$[$0-2], graph: { type: 'graph', name: $$[$0] } };
    break;
    case 54:
    this.$ = { updateType: 'insert',      insert: ensureNoVariables($$[$0])                 };
    break;
    case 55:
    this.$ = { updateType: 'delete',      delete: ensureNoBnodes(ensureNoVariables($$[$0])) };
    break;
    case 56:
    this.$ = { updateType: 'deletewhere', delete: ensureNoBnodes($$[$0])                    };
    break;
    case 57:
    this.$ = extend({ updateType: 'insertdelete' }, $$[$0-5], { insert: $$[$0-4] || [] }, { delete: $$[$0-3] || [] }, groupDatasets($$[$0-2], 'using'), { where: $$[$0].patterns });
    break;
    case 58:
    this.$ = extend({ updateType: 'insertdelete' }, $$[$0-5], { delete: $$[$0-4] || [] }, { insert: $$[$0-3] || [] }, groupDatasets($$[$0-2], 'using'), { where: $$[$0].patterns });
    break;
    case 59:
    this.$ = ensureNoBnodes($$[$0]);
    break;
    case 60: case 63: case 160: case 181:
    this.$ = $$[$0];
    break;
    case 62:
    this.$ = { graph: $$[$0] };
    break;
    case 64:
    this.$ = { type: 'graph', default: true };
    break;
    case 65: case 66:
    this.$ = { type: 'graph', name: $$[$0] };
    break;
    case 67:
     this.$ = {}; this.$[lowercase($$[$0])] = true; 
    break;
    case 68:
    this.$ = $$[$0-2] ? unionAll($$[$0-1], [$$[$0-2]]) : unionAll($$[$0-1]);
    break;
    case 69:

          var graph = extend($$[$0-3] || { triples: [] }, { type: 'graph', name: toVar($$[$0-5]) });
          this.$ = $$[$0] ? [graph, $$[$0]] : [graph];
        
    break;
    case 70: case 75:
    this.$ = { type: 'bgp', triples: unionAll($$[$0-2], [$$[$0-1]]) };
    break;
    case 71:
    this.$ = { type: 'group', patterns: [ $$[$0-1] ] };
    break;
    case 72:

          // For every binding
          for (const binding of $$[$0-1].filter(el => el.type === "bind")) {
            const index = $$[$0-1].indexOf(binding);
            const boundVars = new Set();
            //Collect all bounded variables before the binding
            for (const el of $$[$0-1].slice(0, index)) {
              if (el.type === "group" || el.type === "bgp") {
                getBoundVarsFromGroupGraphPattern(el).forEach(boundVar => boundVars.add(boundVar));
              }
            }
            // If binding with a non-free variable, throw error
            if (boundVars.has(binding.variable.value)) {
              throw Error("Variable used to bind is already bound (?" + binding.variable.value + ")");
            }
          }
          this.$ = { type: 'group', patterns: $$[$0-1] };
        
    break;
    case 73:
    this.$ = $$[$0-1] ? unionAll([$$[$0-1]], $$[$0]) : unionAll($$[$0]);
    break;
    case 74:
    this.$ = $$[$0] ? [$$[$0-2], $$[$0]] : $$[$0-2];
    break;
    case 76:

          if ($$[$0-1].length)
            this.$ = { type: 'union', patterns: unionAll($$[$0-1].map(degroupSingle), [degroupSingle($$[$0])]) };
          else
            this.$ = $$[$0];
        
    break;
    case 77:
    this.$ = extend($$[$0], { type: 'optional' });
    break;
    case 78:
    this.$ = extend($$[$0], { type: 'minus' });
    break;
    case 79:
    this.$ = extend($$[$0], { type: 'graph', name: toVar($$[$0-1]) });
    break;
    case 80:
    this.$ = extend($$[$0], { type: 'service', name: toVar($$[$0-1]), silent: !!$$[$0-2] });
    break;
    case 81:
    this.$ = { type: 'filter', expression: $$[$0] };
    break;
    case 82:
    this.$ = { type: 'bind', variable: toVar($$[$0-1]), expression: $$[$0-3] };
    break;
    case 83:
    this.$ = ensureSparqlStar({ type: 'bind', variable: toVar($$[$0-1]), expression: $$[$0-3] });
    break;
    case 88:
    this.$ = { type: 'functionCall', function: $$[$0-1], args: [] };
    break;
    case 89:
    this.$ = { type: 'functionCall', function: $$[$0-5], args: appendTo($$[$0-2], $$[$0-1]), distinct: !!$$[$0-3] };
    break;
    case 90: case 108: case 119: case 211: case 219: case 221: case 233: case 235: case 245: case 249: case 269: case 271: case 275: case 279: case 302: case 308: case 319: case 329: case 335: case 341: case 345: case 355: case 357: case 361: case 369: case 373: case 375: case 383: case 385: case 389: case 391: case 400: case 432: case 434: case 444: case 448: case 450: case 452:
    this.$ = [];
    break;
    case 91:
    this.$ = appendTo($$[$0-2], $$[$0-1]);
    break;
    case 93:
    this.$ = unionAll($$[$0-2], [$$[$0-1]]);
    break;
    case 94: case 105:
    this.$ = $$[$0].map(function (t) { return extend(triple($$[$0-1]), t); });
    break;
    case 95:
    this.$ = appendAllTo($$[$0].map(function (t) { return extend(triple($$[$0-1].entity), t); }), $$[$0-1].triples) /* the subject is a blank node, possibly with more triples */;
    break;
    case 97:
    this.$ = unionAll([$$[$0-1]], $$[$0]);
    break;
    case 98:
    this.$ = unionAll($$[$0]);
    break;
    case 99:
    this.$ = objectListToTriples($$[$0-1], $$[$0]);
    break;
    case 102: case 115: case 122:
    this.$ = Parser.factory.namedNode(RDF_TYPE);
    break;
    case 103: case 104:
    this.$ = appendTo($$[$0-1], $$[$0]);
    break;
    case 106:
    this.$ = !$$[$0] ? $$[$0-1].triples : appendAllTo($$[$0].map(function (t) { return extend(triple($$[$0-1].entity), t); }), $$[$0-1].triples) /* the subject is a blank node, possibly with more triples */;
    break;
    case 107:
    this.$ = objectListToTriples(toVar($$[$0-3]), appendTo($$[$0-2], $$[$0-1]), $$[$0]);
    break;
    case 109:
    this.$ = objectListToTriples(toVar($$[$0-1]), $$[$0]);
    break;
    case 110:
    this.$ = $$[$0-1].length ? path('|',appendTo($$[$0-1], $$[$0])) : $$[$0];
    break;
    case 111:
    this.$ = $$[$0-1].length ? path('/', appendTo($$[$0-1], $$[$0])) : $$[$0];
    break;
    case 112:
    this.$ = $$[$0] ? path($$[$0], [$$[$0-1]]) : $$[$0-1];
    break;
    case 113:
    this.$ = $$[$0-1] ? path($$[$0-1], [$$[$0]]) : $$[$0];break;
    case 116: case 123:
    this.$ = path($$[$0-1], [$$[$0]]);
    break;
    case 120:
    this.$ = path('|', appendTo($$[$0-2], $$[$0-1]));
    break;
    case 124:
    this.$ = path($$[$0-1], [Parser.factory.namedNode(RDF_TYPE)]);
    break;
    case 125: case 127:
    this.$ = createList($$[$0-1]);
    break;
    case 126: case 128:
    this.$ = createAnonymousObject($$[$0-1]);
    break;
    case 129:
    this.$ = { entity: $$[$0], triples: [] } /* for consistency with TriplesNode */;
    break;
    case 131:
    this.$ = { entity: $$[$0], triples: [] } /* for consistency with TriplesNodePath */;
    break;
    case 133: case 135:
    this.$ = ensureSparqlStar(Parser.factory.quad($$[$0-4], $$[$0-3], $$[$0-2], toVar($$[$0-6])));
    break;
    case 134: case 136:
    this.$ = ensureSparqlStar(Parser.factory.quad($$[$0-3], $$[$0-2], $$[$0-1]));
    break;
    case 141:
    this.$ = blank($$[$0].replace(/^(_:)/,''));break;
    case 142:
    this.$ = blank();
    break;
    case 143:
    this.$ = Parser.factory.namedNode(RDF_NIL);
    break;
    case 144: case 146: case 151: case 155:
    this.$ = createOperationTree($$[$0-1], $$[$0]);
    break;
    case 145:
    this.$ = ['||', $$[$0]];
    break;
    case 147:
    this.$ = ['&&', $$[$0]];
    break;
    case 149:
    this.$ = operation($$[$0-1], [$$[$0-2], $$[$0]]);
    break;
    case 150:
    this.$ = operation($$[$0-2] ? 'notin' : 'in', [$$[$0-3], $$[$0]]);
    break;
    case 152: case 156:
    this.$ = [$$[$0-1], $$[$0]];
    break;
    case 153:
    this.$ = ['+', createOperationTree($$[$0-1], $$[$0])];
    break;
    case 154:

          var negatedLiteral = createTypedLiteral($$[$0-1].value.replace('-', ''), $$[$0-1].datatype);
          this.$ = ['-', createOperationTree(negatedLiteral, $$[$0])];
        
    break;
    case 157:
    this.$ = operation('UPLUS', [$$[$0]]);
    break;
    case 158:
    this.$ = operation($$[$0-1], [$$[$0]]);
    break;
    case 159:
    this.$ = operation('UMINUS', [$$[$0]]);
    break;
    case 169:
    this.$ = operation(lowercase($$[$0-1]));
    break;
    case 170:
    this.$ = operation(lowercase($$[$0-3]), [$$[$0-1]]);
    break;
    case 171:
    this.$ = operation(lowercase($$[$0-5]), [$$[$0-3], $$[$0-1]]);
    break;
    case 172:
    this.$ = operation(lowercase($$[$0-7]), [$$[$0-5], $$[$0-3], $$[$0-1]]);
    break;
    case 173:
    this.$ = operation(lowercase($$[$0-1]), $$[$0]);
    break;
    case 174:
    this.$ = operation('bound', [toVar($$[$0-1])]);
    break;
    case 175:
    this.$ = operation($$[$0-1], []);
    break;
    case 176:
    this.$ = operation($$[$0-3], [$$[$0-1]]);
    break;
    case 177:
    this.$ = operation($$[$0-2] ? 'notexists' :'exists', [degroupSingle($$[$0])]);
    break;
    case 178: case 179:
    this.$ = expression($$[$0-1], { type: 'aggregate', aggregation: lowercase($$[$0-4]), distinct: !!$$[$0-2] });
    break;
    case 180:
    this.$ = expression($$[$0-2], { type: 'aggregate', aggregation: lowercase($$[$0-5]), distinct: !!$$[$0-3], separator: typeof $$[$0-1] === 'string' ? $$[$0-1] : ' ' });
    break;
    case 182:
    this.$ = createTypedLiteral($$[$0]);
    break;
    case 183:
    this.$ = createLangLiteral($$[$0-1], lowercase($$[$0].substr(1)));
    break;
    case 184:
    this.$ = createTypedLiteral($$[$0-2], $$[$0]);
    break;
    case 185: case 198:
    this.$ = createTypedLiteral($$[$0], XSD_INTEGER);
    break;
    case 186: case 199:
    this.$ = createTypedLiteral($$[$0], XSD_DECIMAL);
    break;
    case 187: case 200:
    this.$ = createTypedLiteral(lowercase($$[$0]), XSD_DOUBLE);
    break;
    case 190:
    this.$ = createTypedLiteral($$[$0].toLowerCase(), XSD_BOOLEAN);
    break;
    case 191: case 192:
    this.$ = unescapeString($$[$0], 1);
    break;
    case 193: case 194:
    this.$ = unescapeString($$[$0], 3);
    break;
    case 195:
    this.$ = createTypedLiteral($$[$0].substr(1), XSD_INTEGER);
    break;
    case 196:
    this.$ = createTypedLiteral($$[$0].substr(1), XSD_DECIMAL);
    break;
    case 197:
    this.$ = createTypedLiteral($$[$0].substr(1).toLowerCase(), XSD_DOUBLE);
    break;
    case 201:
    this.$ = Parser.factory.namedNode(resolveIRI($$[$0]));
    break;
    case 202:

          var namePos = $$[$0].indexOf(':'),
              prefix = $$[$0].substr(0, namePos),
              expansion = Parser.prefixes[prefix];
          if (!expansion) throw new Error('Unknown prefix: ' + prefix);
          var uriString = resolveIRI(expansion + $$[$0].substr(namePos + 1));
          this.$ = Parser.factory.namedNode(uriString);
        
    break;
    case 203:

          $$[$0] = $$[$0].substr(0, $$[$0].length - 1);
          if (!($$[$0] in Parser.prefixes)) throw new Error('Unknown prefix: ' + $$[$0]);
          var uriString = resolveIRI(Parser.prefixes[$$[$0]]);
          this.$ = Parser.factory.namedNode(uriString);
        
    break;
    case 212: case 220: case 222: case 224: case 234: case 236: case 242: case 246: case 250: case 264: case 266: case 268: case 270: case 272: case 274: case 276: case 278: case 303: case 309: case 320: case 336: case 370: case 386: case 405: case 407: case 433: case 435: case 445: case 449: case 451: case 453:
    $$[$0-1].push($$[$0]);
    break;
    case 223: case 241: case 263: case 265: case 267: case 273: case 277: case 404: case 406:
    this.$ = [$$[$0]];
    break;
    case 280:
    $$[$0-3].push($$[$0-2]);
    break;
    case 330: case 342: case 346: case 356: case 358: case 362: case 374: case 376: case 384: case 390: case 392: case 401:
    $$[$0-2].push($$[$0-1]);
    break;
    }
    },
    table: [o($V0,$V1,{3:1,4:2,7:3}),{1:[3]},o($V2,[2,279],{5:4,8:5,313:6,210:7,9:8,103:9,211:10,17:11,40:12,49:13,54:14,104:15,18:16,22:17,25:21,6:[2,204],13:$V3,16:$V3,35:$V3,195:$V3,219:$V3,224:$V3,312:$V3,28:$V4,41:[1,18],50:[1,19],55:[1,20]}),o([6,13,16,28,35,41,50,55,107,117,120,122,123,132,133,138,195,219,224,312,322,323,324,325,326],[2,2],{314:23,11:24,14:25,12:[1,26],15:[1,27]}),{6:[1,28]},{6:[2,206]},{6:[2,207]},{6:[2,208]},{6:[2,217],10:29,89:30,90:$V5},{6:[2,205]},o($V6,[2,391],{212:32,213:33}),o($V7,[2,213]),o($V7,[2,214]),o($V7,[2,215]),o($V7,[2,216]),{105:34,107:[1,35],110:36,113:37,117:[1,38],120:[1,39],122:[1,40],123:[1,41],124:42,128:43,132:[2,304],133:[2,298],137:49,138:[1,50],322:[1,44],323:[1,45],324:[1,46],325:[1,47],326:[1,48]},o($V8,[2,219],{19:51}),o($V8,[2,221],{23:52}),o($V9,[2,235],{42:53,44:54,46:[1,55]}),{13:$Va,16:$Vb,26:[1,58],34:$Vc,51:56,60:61,312:$Vd,318:59,319:57},o($V8,[2,249],{56:65}),{26:[1,66],27:67,33:68,34:$Ve,35:$Vf},o($Vg,[2,227],{29:71,315:72,316:[1,73],317:[1,74]}),o($V0,[2,212]),o($V0,[2,209]),o($V0,[2,210]),{13:[1,75]},{16:[1,76]},{1:[2,1]},{6:[2,3]},{6:[2,218]},{34:[1,78],35:[1,80],91:77,93:[1,79]},o([6,13,16,34,35,38,87,93,226,231,245,246,299,300,301,302,303,304,305,306,307,308,309,310,311,312],[2,110],{330:[1,81]}),o($Vh,[2,398],{214:82,218:83,224:[1,84]}),{6:[2,281],106:85,191:[1,86]},o($Vi,[2,283],{108:87,321:[1,88]}),o($Vj,[2,289],{111:89,321:[1,90]}),o($Vk,[2,294],{114:91,321:[1,92]}),{118:93,119:[2,296],321:[1,94]},{46:$Vl,121:95},{46:$Vl,121:97},{46:$Vl,121:98},{125:99,133:$Vm},{129:101,132:$Vn},o($Vo,[2,287]),o($Vo,[2,288]),o($Vp,[2,291]),o($Vp,[2,292]),o($Vp,[2,293]),{132:[2,305],133:[2,299]},{13:$Va,16:$Vb,60:103,312:$Vd},{20:104,45:$Vq,46:$Vr,57:105,58:$Vs,61:106},{20:109,45:$Vq,46:$Vr,57:110,58:$Vs,61:106},o($V8,[2,233],{43:111}),{45:[1,112],57:113,58:$Vs},o($Vt,[2,361],{179:114,180:115,181:116,48:[2,359]}),o($Vu,[2,245],{52:117}),o($Vu,[2,243],{60:61,318:118,13:$Va,16:$Vb,34:$Vc,312:$Vd}),o($Vu,[2,244]),o($Vv,[2,241]),o($Vv,[2,239]),o($Vv,[2,240]),o($Vw,[2,201]),o($Vw,[2,202]),o($Vw,[2,203]),{20:119,45:$Vq,46:$Vr,57:120,58:$Vs,61:106},o($V8,[2,8]),o($V8,[2,9],{33:121,34:$Ve,35:$Vf}),o($Vx,[2,223]),o($Vx,[2,13]),{13:$Va,16:$Vb,34:$Vy,35:$Vz,36:122,39:123,60:136,72:135,73:137,82:134,87:$VA,98:138,219:$VB,231:$VC,247:124,251:126,255:127,259:128,263:154,265:155,267:129,271:$VD,272:133,273:$VE,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},o($Vg,[2,10]),o($Vg,[2,228]),o($Vg,[2,225]),o($Vg,[2,226]),o($V0,[2,4]),{13:[1,176]},o($V61,[2,40]),{46:[1,177]},{46:[1,178]},{34:[1,180],95:179},o($V6,[2,390]),o([6,13,16,34,35,38,87,93,226,231,245,246,299,300,301,302,303,304,305,306,307,308,309,310,311,312,330],[2,111],{331:[1,181]}),{13:$Va,16:$Vb,35:[1,187],60:184,195:[1,185],215:182,216:183,219:[1,186],312:$Vd},o($Vh,[2,399]),{6:[2,49]},o($V0,$V1,{7:3,4:188}),{13:$Va,16:$Vb,60:189,312:$Vd},o($Vi,[2,284]),{112:190,119:[1,191],141:[1,193],143:192,320:[1,194],327:[1,195]},o($Vj,[2,290]),o($Vi,$V71,{115:196,142:198,119:$V81,141:$V91}),o($Vk,[2,295]),{119:[1,200]},{119:[2,297]},o($Va1,[2,54]),o($Vt,$Vb1,{144:201,151:202,152:203,48:$Vc1,119:$Vc1}),o($Va1,[2,55]),o($Va1,[2,56]),o($Vd1,[2,300],{126:204,129:205,132:$Vn}),{46:$Vl,121:206},o($Vd1,[2,306],{130:207,125:208,133:$Vm}),{46:$Vl,121:209},o([132,133],[2,62]),o($Ve1,$Vf1,{21:210,64:211,74:212,75:$Vg1}),o($V8,[2,220]),{46:$Vh1,62:214},o($Vi,[2,251],{59:216,320:[1,217]}),{46:[2,254]},o($Vi1,$Vj1,{24:218,63:219,67:220,68:$Vk1}),o($V8,[2,222]),{20:222,45:$Vq,46:$Vr,57:223,58:$Vs,61:106},{46:[1,224]},o($V9,[2,236]),{48:[1,225]},{48:[2,360]},{13:$Va,16:$Vb,34:$Vl1,35:$Vm1,39:230,60:235,87:$VA,93:$Vn1,98:236,153:226,183:227,185:228,226:$Vo1,231:$VC,243:229,244:234,245:$Vp1,246:$Vq1,263:154,265:155,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd},o($Vr1,[2,247],{61:106,53:240,57:241,20:242,45:$Vq,46:$Vr,58:$Vs}),o($Vv,[2,242]),o($Vi1,$Vj1,{63:219,67:220,24:243,68:$Vk1}),o($V8,[2,250]),o($Vx,[2,224]),{37:[1,244]},{37:[1,245]},o($Vs1,[2,432],{248:246}),{13:$Va,16:$Vb,34:$Vl1,39:249,60:235,87:$VA,93:$Vn1,98:236,119:[1,247],231:$VC,236:248,243:250,244:234,245:$Vp1,246:$Vq1,263:154,265:155,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd},o($Vt1,[2,434],{252:251}),o($Vt1,[2,148],{256:252,257:253,258:[2,442],295:[1,254],334:[1,255],335:[1,256],336:[1,257],337:[1,258],338:[1,259],339:[1,260]}),o($Vu1,[2,444],{260:261}),o($Vv1,[2,452],{268:262}),{13:$Va,16:$Vb,34:$Vy,35:$Vz,60:136,72:135,73:137,82:134,87:$VA,98:138,263:154,265:155,272:263,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},{13:$Va,16:$Vb,34:$Vy,35:$Vz,60:136,72:135,73:137,82:134,87:$VA,98:138,263:154,265:155,272:264,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},{13:$Va,16:$Vb,34:$Vy,35:$Vz,60:136,72:135,73:137,82:134,87:$VA,98:138,263:154,265:155,272:265,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},o($Vv1,[2,160]),o($Vv1,[2,161]),o($Vv1,[2,162]),o($Vv1,[2,163],{35:$Vw1,93:$Vx1}),o($Vv1,[2,164]),o($Vv1,[2,165]),o($Vv1,[2,166]),{13:$Va,16:$Vb,34:$Vy,35:$Vz,36:268,60:136,72:135,73:137,82:134,87:$VA,98:138,219:$VB,247:124,251:126,255:127,259:128,263:154,265:155,267:129,271:$VD,272:133,273:$VE,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},o($Vy1,[2,168]),{93:[1,269]},{35:[1,270]},{35:[1,271]},{35:[1,272]},{35:$Vz1,93:$VA1,177:273},{35:[1,276]},{35:[1,278],93:[1,277]},{284:[1,279]},o($VB1,[2,182],{297:[1,280],298:[1,281]}),o($VB1,[2,185]),o($VB1,[2,186]),o($VB1,[2,187]),o($VB1,[2,188]),o($VB1,[2,189]),o($VB1,[2,190]),{35:[1,282]},{35:[1,283]},{35:[1,284]},o($VC1,[2,456]),o($VC1,[2,457]),o($VC1,[2,458]),o($VC1,[2,459]),o($VC1,[2,460]),{284:[2,462]},o($VD1,[2,191]),o($VD1,[2,192]),o($VD1,[2,193]),o($VD1,[2,194]),o($VB1,[2,195]),o($VB1,[2,196]),o($VB1,[2,197]),o($VB1,[2,198]),o($VB1,[2,199]),o($VB1,[2,200]),o($V0,[2,5]),o($VE1,[2,269],{92:285}),o($VF1,[2,271],{94:286}),{34:[1,288],38:[1,287]},o($VG1,[2,273]),o($V6,[2,392]),o($VH1,[2,113]),o($VH1,[2,396],{217:289,332:290,26:[1,292],271:[1,293],333:[1,291]}),o($VI1,[2,114]),o($VI1,[2,115]),{13:$Va,16:$Vb,35:[1,297],60:298,93:[1,296],195:$VJ1,220:294,221:295,224:$VK1,312:$Vd},o($V6,$V3,{211:10,210:301}),o($V2,[2,280],{6:[2,282]}),o($Va1,[2,285],{109:302,139:303,140:[1,304]}),o($Va1,[2,51]),{13:$Va,16:$Vb,60:305,312:$Vd},o($Va1,[2,67]),o($Va1,[2,314]),o($Va1,[2,315]),o($Va1,[2,316]),{116:[1,306]},o($VL1,[2,64]),{13:$Va,16:$Vb,60:307,312:$Vd},o($Vi,[2,313]),{13:$Va,16:$Vb,60:308,312:$Vd},o($VM1,[2,319],{145:309}),o($VM1,[2,318]),{13:$Va,16:$Vb,34:$Vl1,35:$Vm1,39:230,60:235,87:$VA,93:$Vn1,98:236,153:310,183:227,185:228,226:$Vo1,231:$VC,243:229,244:234,245:$Vp1,246:$Vq1,263:154,265:155,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd},o($Vd1,[2,302],{127:311}),o($Vd1,[2,301]),o([45,132,135],[2,60]),o($Vd1,[2,308],{131:312}),o($Vd1,[2,307]),o([45,133,135],[2,59]),o($V7,[2,6]),o($VN1,[2,259],{65:313,77:314,78:[1,315]}),o($Ve1,[2,258]),{13:$Va,16:$Vb,35:$Vz,60:321,72:319,73:320,76:316,82:318,84:317,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},o([6,48,68,75,78,86,88,90],[2,21]),o($Vt,$VO1,{25:21,30:322,155:323,18:324,22:325,156:326,162:327,163:328,28:$V4,46:$VP1,48:$VP1,90:$VP1,119:$VP1,167:$VP1,168:$VP1,170:$VP1,173:$VP1,174:$VP1}),{13:$Va,16:$Vb,60:329,312:$Vd},o($Vi,[2,252]),o($V7,[2,7]),o($Ve1,$Vf1,{64:211,74:212,21:330,75:$Vg1}),o($Vi1,[2,256]),{69:[1,331]},o($Vi1,$Vj1,{63:219,67:220,24:332,68:$Vk1}),o($V8,[2,234]),o($Vt,$Vb1,{152:203,47:333,151:334,48:[2,237]}),o($V8,[2,92]),{48:[2,363],182:335,328:[1,336]},{13:$Va,16:$Vb,34:$VQ1,60:341,184:337,188:338,193:339,195:$VR1,312:$Vd},o($VS1,[2,367],{188:338,193:339,60:341,186:343,187:344,184:345,13:$Va,16:$Vb,34:$VQ1,195:$VR1,312:$Vd}),o($VT1,[2,365]),o($VT1,[2,366]),{13:$Va,16:$Vb,34:$Vl1,35:$Vm1,39:351,60:235,87:$VA,93:$Vn1,98:236,185:349,197:347,225:346,226:$Vo1,229:348,231:$VC,243:350,244:234,245:$Vp1,246:$Vq1,263:154,265:155,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd},{13:$Va,16:$Vb,34:$VQ1,60:341,184:352,188:338,193:339,195:$VR1,312:$Vd},o($VU1,[2,137]),o($VU1,[2,138]),o($VU1,[2,139]),o($VU1,[2,140]),o($VU1,[2,141]),o($VU1,[2,142]),o($VU1,[2,143]),o($Vi1,$Vj1,{63:219,67:220,24:353,68:$Vk1}),o($Vu,[2,246]),o($Vr1,[2,248]),o($V7,[2,19]),{34:[1,354]},{34:[1,355]},o([37,38,191,278],[2,144],{249:356,250:[1,357]}),{13:$Va,16:$Vb,34:[1,359],60:360,232:358,312:$Vd},{13:$Va,16:$Vb,34:$VQ1,60:341,193:361,195:$VR1,312:$Vd},o($VT1,[2,418]),o($VT1,[2,419]),o($Vs1,[2,146],{253:362,254:[1,363]}),{13:$Va,16:$Vb,34:$Vy,35:$Vz,60:136,72:135,73:137,82:134,87:$VA,98:138,219:$VB,255:364,259:128,263:154,265:155,267:129,271:$VD,272:133,273:$VE,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},{258:[1,365]},o($VV1,[2,436]),o($VV1,[2,437]),o($VV1,[2,438]),o($VV1,[2,439]),o($VV1,[2,440]),o($VV1,[2,441]),{258:[2,443]},o([37,38,191,250,254,258,278,295,334,335,336,337,338,339],[2,151],{261:366,262:367,263:368,265:369,271:[1,370],273:[1,371],306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$}),o($Vu1,[2,155],{269:372,270:373,26:$VW1,331:$VX1}),o($Vv1,[2,157]),o($Vv1,[2,158]),o($Vv1,[2,159]),o($Vy1,[2,88]),o($VV1,[2,353],{175:376,316:[1,377]}),{38:[1,378]},o($Vy1,[2,169]),{13:$Va,16:$Vb,34:$Vy,35:$Vz,36:379,60:136,72:135,73:137,82:134,87:$VA,98:138,219:$VB,247:124,251:126,255:127,259:128,263:154,265:155,267:129,271:$VD,272:133,273:$VE,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},{13:$Va,16:$Vb,34:$Vy,35:$Vz,36:380,60:136,72:135,73:137,82:134,87:$VA,98:138,219:$VB,247:124,251:126,255:127,259:128,263:154,265:155,267:129,271:$VD,272:133,273:$VE,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},{13:$Va,16:$Vb,34:$Vy,35:$Vz,36:381,60:136,72:135,73:137,82:134,87:$VA,98:138,219:$VB,247:124,251:126,255:127,259:128,263:154,265:155,267:129,271:$VD,272:133,273:$VE,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},o($Vy1,[2,173]),o($Vy1,[2,90]),o($VV1,[2,357],{178:382}),{34:[1,383]},o($Vy1,[2,175]),{13:$Va,16:$Vb,34:$Vy,35:$Vz,36:384,60:136,72:135,73:137,82:134,87:$VA,98:138,219:$VB,247:124,251:126,255:127,259:128,263:154,265:155,267:129,271:$VD,272:133,273:$VE,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},{46:$Vh1,62:385},o($VB1,[2,183]),{13:$Va,16:$Vb,60:386,312:$Vd},o($VY1,[2,463],{286:387,316:[1,388]}),o($VV1,[2,467],{289:389,316:[1,390]}),o($VV1,[2,469],{291:391,316:[1,392]}),{13:$Va,16:$Vb,48:[1,393],60:395,87:$VA,97:394,98:396,99:397,100:$VZ1,231:$V_1,263:154,265:155,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd},{48:[1,400],93:[1,401]},{46:[1,402]},o($VG1,[2,274]),o($VH1,[2,112]),o($VH1,[2,397]),o($VH1,[2,393]),o($VH1,[2,394]),o($VH1,[2,395]),o($VI1,[2,116]),o($VI1,[2,118]),o($VI1,[2,119]),o($V$1,[2,400],{222:403}),o($VI1,[2,121]),o($VI1,[2,122]),{13:$Va,16:$Vb,60:404,195:[1,405],312:$Vd},{38:[1,406]},o($Va1,[2,50]),o($Va1,[2,286]),{119:[1,407]},o($Va1,[2,66]),o($Vi,$V71,{142:198,115:408,119:$V81,141:$V91}),o($VL1,[2,65]),o($Va1,[2,53]),{48:[1,409],119:[1,411],146:410},o($VM1,[2,331],{154:412,328:[1,413]}),{45:[1,414],134:415,135:$V02},{45:[1,417],134:418,135:$V02},o($V12,[2,261],{66:419,85:420,86:[1,421],88:[1,422]}),o($VN1,[2,260]),{69:[1,423]},o($Ve1,[2,30],{274:141,280:146,283:149,82:318,72:319,73:320,60:321,84:424,13:$Va,16:$Vb,35:$Vz,275:$VF,276:$VG,277:$VH,279:$VI,281:$VJ,282:$VK,284:$VL,285:$VM,288:$VN,290:$VO,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51}),o($V22,[2,265]),o($V32,[2,85]),o($V32,[2,86]),o($V32,[2,87]),{35:$Vw1,93:$Vx1},{48:[1,425]},{48:[1,426]},{20:427,45:$Vq,46:$Vr,61:106},{20:428,45:$Vq,46:$Vr,61:106},o($V42,[2,335],{157:429}),o($V42,[2,334]),{13:$Va,16:$Vb,34:$Vl1,35:$V52,39:434,60:235,87:$VA,93:$Vn1,98:236,164:430,201:431,203:432,226:$V62,231:$VC,243:433,244:234,245:$Vp1,246:$Vq1,263:154,265:155,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd},o($Vu,[2,20]),o($V12,[2,22]),{13:$Va,16:$Vb,34:$V72,35:$V82,60:321,70:437,71:438,72:439,73:440,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},o($V7,[2,16]),{48:[1,443]},{48:[2,238]},{48:[2,93]},o($Vt,[2,362],{48:[2,364]}),o($VS1,[2,94]),o($V92,[2,369],{189:444}),o($Vt,[2,373],{194:445,196:446}),o($Vt,[2,100]),o($Vt,[2,101]),o($Vt,[2,102]),o($VS1,[2,95]),o($VS1,[2,96]),o($VS1,[2,368]),{13:$Va,16:$Vb,34:$Vl1,35:$Vm1,38:[1,447],39:351,60:235,87:$VA,93:$Vn1,98:236,185:349,197:448,226:$Vo1,229:348,231:$VC,243:350,244:234,245:$Vp1,246:$Vq1,263:154,265:155,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd},o($Va2,[2,404]),o($Vb2,[2,129]),o($Vb2,[2,130]),o($Vb2,[2,408]),o($Vb2,[2,409]),{227:[1,449]},o($V7,[2,18]),{38:[1,450]},{38:[1,451]},o($Vs1,[2,433]),{13:$Va,16:$Vb,34:$Vy,35:$Vz,60:136,72:135,73:137,82:134,87:$VA,98:138,219:$VB,247:452,251:126,255:127,259:128,263:154,265:155,267:129,271:$VD,272:133,273:$VE,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},{46:[1,453]},{46:[2,412]},{46:[2,413]},{13:$Va,16:$Vb,34:$Vl1,39:455,60:235,87:$VA,93:$Vn1,98:236,231:$VC,237:454,243:456,244:234,245:$Vp1,246:$Vq1,263:154,265:155,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd},o($Vt1,[2,435]),{13:$Va,16:$Vb,34:$Vy,35:$Vz,60:136,72:135,73:137,82:134,87:$VA,98:138,219:$VB,251:457,255:127,259:128,263:154,265:155,267:129,271:$VD,272:133,273:$VE,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},o($Vt1,[2,149]),{35:$Vz1,93:$VA1,177:458},o($Vu1,[2,445]),{13:$Va,16:$Vb,34:$Vy,35:$Vz,60:136,72:135,73:137,82:134,87:$VA,98:138,219:$VB,259:459,263:154,265:155,267:129,271:$VD,272:133,273:$VE,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},o($Vv1,[2,448],{264:460}),o($Vv1,[2,450],{266:461}),o($VV1,[2,446]),o($VV1,[2,447]),o($Vv1,[2,453]),{13:$Va,16:$Vb,34:$Vy,35:$Vz,60:136,72:135,73:137,82:134,87:$VA,98:138,219:$VB,263:154,265:155,267:462,271:$VD,272:133,273:$VE,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},o($VV1,[2,454]),o($VV1,[2,455]),o($VV1,[2,355],{176:463}),o($VV1,[2,354]),o([6,13,16,26,34,35,37,38,46,48,78,81,83,86,87,88,90,93,119,167,168,170,173,174,191,226,231,245,246,250,254,258,271,273,275,276,277,278,279,281,282,284,285,288,290,295,299,300,301,302,303,304,305,306,307,308,309,310,311,312,328,331,334,335,336,337,338,339,340,341,342,343,344],[2,167]),{38:[1,464]},{278:[1,465]},{278:[1,466]},{13:$Va,16:$Vb,34:$Vy,35:$Vz,36:467,60:136,72:135,73:137,82:134,87:$VA,98:138,219:$VB,247:124,251:126,255:127,259:128,263:154,265:155,267:129,271:$VD,272:133,273:$VE,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},{38:[1,468]},{38:[1,469]},o($Vy1,[2,177]),o($VB1,[2,184]),{13:$Va,16:$Vb,26:[1,471],34:$Vy,35:$Vz,36:472,60:136,72:135,73:137,82:134,87:$VA,98:138,219:$VB,247:124,251:126,255:127,259:128,263:154,265:155,267:129,271:$VD,272:133,273:$VE,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,287:470,288:$VN,290:$VO,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},o($VY1,[2,464]),{13:$Va,16:$Vb,34:$Vy,35:$Vz,36:473,60:136,72:135,73:137,82:134,87:$VA,98:138,219:$VB,247:124,251:126,255:127,259:128,263:154,265:155,267:129,271:$VD,272:133,273:$VE,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},o($VV1,[2,468]),{13:$Va,16:$Vb,34:$Vy,35:$Vz,36:474,60:136,72:135,73:137,82:134,87:$VA,98:138,219:$VB,247:124,251:126,255:127,259:128,263:154,265:155,267:129,271:$VD,272:133,273:$VE,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},o($VV1,[2,470]),o($V61,[2,41]),o($VE1,[2,270]),o($Vc2,[2,44]),o($Vc2,[2,45]),o($Vc2,[2,46]),o($Vc2,[2,47]),{13:$Va,16:$Vb,60:235,87:$VA,93:$Vn1,98:236,99:477,119:[1,475],231:$V_1,241:476,244:478,245:$Vp1,246:$Vq1,263:154,265:155,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd},o($V61,[2,42]),o($VF1,[2,272]),o($Vd2,[2,275],{96:479}),{13:$Va,16:$Vb,38:[2,402],60:298,195:$VJ1,221:481,223:480,224:$VK1,312:$Vd},o($VI1,[2,123]),o($VI1,[2,124]),o($VI1,[2,117]),{13:$Va,16:$Vb,60:482,312:$Vd},o($Va1,[2,52]),o([6,45,132,133,135,191],[2,68]),o($VM1,[2,320]),{13:$Va,16:$Vb,34:[1,484],60:485,147:483,312:$Vd},o($VM1,[2,70]),o($Vt,[2,330],{48:$Ve2,119:$Ve2}),{46:$Vh1,62:486},o($Vd1,[2,303]),o($Vi,[2,310],{136:487,320:[1,488]}),{46:$Vh1,62:489},o($Vd1,[2,309]),o($V12,[2,23]),o($V12,[2,262]),{87:[1,490]},{87:[1,491]},{13:$Va,16:$Vb,34:$Vf2,35:$Vz,60:321,72:319,73:320,79:492,80:493,81:$Vg2,82:318,83:$Vh2,84:496,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},o($V22,[2,266]),o($Vi2,[2,71]),o($Vi2,[2,72]),o($Ve1,$Vf1,{64:211,74:212,21:498,75:$Vg1}),o($Vi1,$Vj1,{63:219,67:220,24:499,68:$Vk1}),{46:[2,345],48:[2,73],89:509,90:$V5,119:[1,505],158:500,159:501,166:502,167:[1,503],168:[1,504],170:[1,506],173:[1,507],174:[1,508]},o($V42,[2,343],{165:510,328:[1,511]}),o($V6,$V3,{211:10,202:512,205:513,210:514,34:$Vj2}),o($Vk2,[2,379],{211:10,205:513,210:514,204:516,202:517,13:$V3,16:$V3,35:$V3,195:$V3,219:$V3,224:$V3,312:$V3,34:$Vj2}),o($Vl2,[2,377]),o($Vl2,[2,378]),{13:$Va,16:$Vb,34:$Vl1,35:$V52,39:523,60:235,87:$VA,93:$Vn1,98:236,200:519,203:521,226:$V62,228:518,230:520,231:$VC,243:522,244:234,245:$Vp1,246:$Vq1,263:154,265:155,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd},o($V6,$V3,{211:10,205:513,210:514,202:524,34:$Vj2}),o($Vi1,[2,24],{274:141,280:146,283:149,60:321,72:439,73:440,71:525,13:$Va,16:$Vb,34:$V72,35:$V82,275:$VF,276:$VG,277:$VH,279:$VI,281:$VJ,282:$VK,284:$VL,285:$VM,288:$VN,290:$VO,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51}),o($Vm2,[2,263]),o($Vm2,[2,25]),o($Vm2,[2,26]),{13:$Va,16:$Vb,34:$Vy,35:$Vz,36:526,60:136,72:135,73:137,82:134,87:$VA,98:138,219:$VB,247:124,251:126,255:127,259:128,263:154,265:155,267:129,271:$VD,272:133,273:$VE,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},o($Vm2,[2,29]),o($Vi1,$Vj1,{63:219,67:220,24:527,68:$Vk1}),o([48,119,227,328],[2,97],{190:528,191:[1,529]}),o($V92,[2,99]),{13:$Va,16:$Vb,34:$Vl1,35:$Vm1,39:351,60:235,87:$VA,93:$Vn1,98:236,185:349,197:530,226:$Vo1,229:348,231:$VC,243:350,244:234,245:$Vp1,246:$Vq1,263:154,265:155,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd},o($Vn2,[2,125]),o($Va2,[2,405]),o($Vn2,[2,126]),o($Vx,[2,14]),o($Vx,[2,15]),o($Vs1,[2,145]),{13:$Va,16:$Vb,34:$Vl1,39:532,60:235,87:$VA,93:$Vn1,98:236,231:$VC,233:531,243:533,244:234,245:$Vp1,246:$Vq1,263:154,265:155,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd},{235:[1,534]},{235:[2,420]},{235:[2,421]},o($Vt1,[2,147]),o($Vt1,[2,150]),o($Vu1,[2,152]),o($Vu1,[2,153],{270:373,269:535,26:$VW1,331:$VX1}),o($Vu1,[2,154],{270:373,269:536,26:$VW1,331:$VX1}),o($Vv1,[2,156]),{13:$Va,16:$Vb,34:$Vy,35:$Vz,36:537,60:136,72:135,73:137,82:134,87:$VA,98:138,219:$VB,247:124,251:126,255:127,259:128,263:154,265:155,267:129,271:$VD,272:133,273:$VE,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},o($Vy1,[2,170]),{13:$Va,16:$Vb,34:$Vy,35:$Vz,36:538,60:136,72:135,73:137,82:134,87:$VA,98:138,219:$VB,247:124,251:126,255:127,259:128,263:154,265:155,267:129,271:$VD,272:133,273:$VE,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},{13:$Va,16:$Vb,34:$Vy,35:$Vz,36:539,60:136,72:135,73:137,82:134,87:$VA,98:138,219:$VB,247:124,251:126,255:127,259:128,263:154,265:155,267:129,271:$VD,272:133,273:$VE,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},{38:[1,540],278:[1,541]},o($Vy1,[2,174]),o($Vy1,[2,176]),{38:[1,542]},{38:[2,465]},{38:[2,466]},{38:[1,543]},{38:[2,471],191:[1,546],292:544,293:545},{13:$Va,16:$Vb,34:[1,548],60:549,238:547,312:$Vd},{13:$Va,16:$Vb,34:$VQ1,60:341,193:550,195:$VR1,312:$Vd},o($VT1,[2,428]),o($VT1,[2,429]),{35:[1,553],48:[1,551],101:552},{38:[1,554]},{38:[2,403],330:[1,555]},o($Va1,[2,63]),{46:[1,556]},{46:[2,321]},{46:[2,322]},o($Va1,[2,57]),{13:$Va,16:$Vb,60:557,312:$Vd},o($Vi,[2,311]),o($Va1,[2,58]),o($V12,[2,36],{88:[1,558]}),o($V12,[2,37],{86:[1,559]}),o($VN1,[2,31],{274:141,280:146,283:149,82:318,72:319,73:320,60:321,84:496,80:560,13:$Va,16:$Vb,34:$Vf2,35:$Vz,81:$Vg2,83:$Vh2,275:$VF,276:$VG,277:$VH,279:$VI,281:$VJ,282:$VK,284:$VL,285:$VM,288:$VN,290:$VO,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51}),o($Vo2,[2,267]),{35:$Vz,82:561},{35:$Vz,82:562},o($Vo2,[2,34]),o($Vo2,[2,35]),{31:563,48:[2,229],89:564,90:$V5},{32:565,48:[2,231],89:566,90:$V5},o($V42,[2,336]),o($Vp2,[2,337],{160:567,328:[1,568]}),{46:$Vh1,62:569},{46:$Vh1,62:570},{46:$Vh1,62:571},{13:$Va,16:$Vb,34:[1,573],60:574,169:572,312:$Vd},o($Vq2,[2,349],{171:575,321:[1,576]}),{13:$Va,16:$Vb,35:$Vz,60:321,72:319,73:320,82:318,84:577,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},{35:[1,578]},o($Vr2,[2,84]),o($V42,[2,75]),o($Vt,[2,342],{46:$Vs2,48:$Vs2,90:$Vs2,119:$Vs2,167:$Vs2,168:$Vs2,170:$Vs2,173:$Vs2,174:$Vs2}),o($Vk2,[2,105]),o($Vt,[2,383],{206:579}),o($Vt,[2,381]),o($Vt,[2,382]),o($Vk2,[2,106]),o($Vk2,[2,380]),{13:$Va,16:$Vb,34:$Vl1,35:$V52,38:[1,580],39:523,60:235,87:$VA,93:$Vn1,98:236,200:581,203:521,226:$V62,230:520,231:$VC,243:522,244:234,245:$Vp1,246:$Vq1,263:154,265:155,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd},o($Va2,[2,406]),o($Vt2,[2,131]),o($Vt2,[2,132]),o($Vt2,[2,410]),o($Vt2,[2,411]),{227:[1,582]},o($Vm2,[2,264]),{37:[1,584],38:[1,583]},o($V7,[2,17]),o($V92,[2,370]),o($V92,[2,371],{193:339,60:341,192:585,188:586,13:$Va,16:$Vb,34:$VQ1,195:$VR1,312:$Vd}),o($V92,[2,103],{278:[1,587]}),{13:$Va,16:$Vb,34:$VQ1,60:341,193:588,195:$VR1,312:$Vd},o($VT1,[2,414]),o($VT1,[2,415]),o($Vu2,[2,134]),o($Vv1,[2,449]),o($Vv1,[2,451]),{38:[1,589],278:[1,590]},{38:[1,591]},{278:[1,592]},o($Vy1,[2,91]),o($VV1,[2,358]),o($Vy1,[2,178]),o($Vy1,[2,179]),{38:[1,593]},{38:[2,472]},{294:[1,594]},{46:[1,595]},{46:[2,422]},{46:[2,423]},{13:$Va,16:$Vb,60:235,87:$VA,93:$Vn1,98:236,99:597,231:$V_1,242:596,244:598,245:$Vp1,246:$Vq1,263:154,265:155,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd},o($V61,[2,43]),o($Vd2,[2,276]),{13:$Va,16:$Vb,60:395,87:$VA,97:600,98:396,99:397,100:$VZ1,102:599,231:$V_1,263:154,265:155,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd},o($VI1,[2,120]),o($V$1,[2,401]),o($Vt,$Vb1,{152:203,148:601,151:602,48:[2,323]}),o($Vd1,[2,61]),{87:[1,603]},{87:[1,604]},o($Vo2,[2,268]),o($Vo2,[2,32]),o($Vo2,[2,33]),{48:[2,11]},{48:[2,230]},{48:[2,12]},{48:[2,232]},o($Vt,$VO1,{163:328,161:605,162:606,46:$Vv2,48:$Vv2,90:$Vv2,119:$Vv2,167:$Vv2,168:$Vv2,170:$Vv2,173:$Vv2,174:$Vv2}),o($Vp2,[2,338]),o($Vr2,[2,76],{329:[1,607]}),o($Vr2,[2,77]),o($Vr2,[2,78]),{46:$Vh1,62:608},{46:[2,347]},{46:[2,348]},{13:$Va,16:$Vb,34:[1,610],60:611,172:609,312:$Vd},o($Vq2,[2,350]),o($Vr2,[2,81]),{13:$Va,16:$Vb,34:$Vy,35:$Vz,36:612,39:613,60:136,72:135,73:137,82:134,87:$VA,98:138,219:$VB,231:$VC,247:124,251:126,255:127,259:128,263:154,265:155,267:129,271:$VD,272:133,273:$VE,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},{13:$Va,16:$Vb,34:$Vl1,35:$V52,39:523,60:235,87:$VA,93:$Vn1,98:236,200:614,203:521,226:$V62,230:520,231:$VC,243:522,244:234,245:$Vp1,246:$Vq1,263:154,265:155,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd},o($Vw2,[2,127]),o($Va2,[2,407]),o($Vw2,[2,128]),o($Vm2,[2,27]),{34:[1,615]},o($V92,[2,98]),o($V92,[2,372]),o($Vt,[2,374]),{13:$Va,16:$Vb,34:$Vl1,39:617,60:235,87:$VA,93:$Vn1,98:236,231:$VC,234:616,243:618,244:234,245:$Vp1,246:$Vq1,263:154,265:155,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd},o($Vy1,[2,89]),o($VV1,[2,356]),o($Vy1,[2,171]),{13:$Va,16:$Vb,34:$Vy,35:$Vz,36:619,60:136,72:135,73:137,82:134,87:$VA,98:138,219:$VB,247:124,251:126,255:127,259:128,263:154,265:155,267:129,271:$VD,272:133,273:$VE,274:141,275:$VF,276:$VG,277:$VH,279:$VI,280:146,281:$VJ,282:$VK,283:149,284:$VL,285:$VM,288:$VN,290:$VO,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd,339:$V01,340:$V11,341:$V21,342:$V31,343:$V41,344:$V51},o($Vy1,[2,180]),{295:[1,620]},{13:$Va,16:$Vb,60:235,87:$VA,93:$Vn1,98:236,99:622,231:$V_1,239:621,244:623,245:$Vp1,246:$Vq1,263:154,265:155,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd},{235:[1,624]},{235:[2,430]},{235:[2,431]},{13:$Va,16:$Vb,38:[1,625],60:395,87:$VA,97:626,98:396,99:397,100:$VZ1,231:$V_1,263:154,265:155,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd},o($Vx2,[2,277]),{48:[1,627]},{48:[2,324]},o($V12,[2,38]),o($V12,[2,39]),o($V42,[2,74]),o($V42,[2,340]),{46:[2,346]},o($Vr2,[2,79]),{46:$Vh1,62:628},{46:[2,351]},{46:[2,352]},{37:[1,629]},{37:[1,630]},o($Vy2,[2,385],{207:631,278:[1,632]}),{38:[1,633]},{48:[1,634]},{48:[2,416]},{48:[2,417]},{38:[1,635]},{296:636,302:$VS,303:$VT,304:$VU,305:$VV},{13:$Va,16:$Vb,34:$VQ1,60:341,193:637,195:$VR1,312:$Vd},o($VT1,[2,424]),o($VT1,[2,425]),o($Vz2,[2,136]),o($Vd2,[2,48]),o($Vx2,[2,278]),o($VA2,[2,325],{149:638,328:[1,639]}),o($Vr2,[2,80]),{34:[1,640]},{34:[1,641]},o([46,48,90,119,167,168,170,173,174,227,328],[2,107],{208:642,191:[1,643]}),o($Vt,[2,384]),o($Vm2,[2,28]),{235:[1,644]},o($Vy1,[2,172]),{38:[2,181]},{13:$Va,16:$Vb,60:235,87:$VA,93:$Vn1,98:236,99:646,231:$V_1,240:645,244:647,245:$Vp1,246:$Vq1,263:154,265:155,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd},o($Vt,$Vb1,{152:203,150:648,151:649,48:$VB2,119:$VB2}),o($VA2,[2,326]),{38:[1,650]},{38:[1,651]},o($Vy2,[2,386]),o($Vy2,[2,108],{211:10,209:652,210:653,13:$V3,16:$V3,35:$V3,195:$V3,219:$V3,224:$V3,312:$V3,34:[1,654]}),o($Vu2,[2,133]),{48:[1,655]},{48:[2,426]},{48:[2,427]},o($VM1,[2,69]),o($VM1,[2,328]),o($Vr2,[2,82]),o($Vr2,[2,83]),o($Vt,[2,375],{198:656,199:657}),o($Vt,[2,387]),o($Vt,[2,388]),{235:[1,658]},o($Vy2,[2,109]),{13:$Va,16:$Vb,34:$Vl1,35:$V52,39:523,60:235,87:$VA,93:$Vn1,98:236,200:659,203:521,226:$V62,230:520,231:$VC,243:522,244:234,245:$Vp1,246:$Vq1,263:154,265:155,296:150,299:$VP,300:$VQ,301:$VR,302:$VS,303:$VT,304:$VU,305:$VV,306:$VW,307:$VX,308:$VY,309:$VZ,310:$V_,311:$V$,312:$Vd},o($Vz2,[2,135]),o($Vy2,[2,104],{278:[1,660]}),o($Vt,[2,376])],
    defaultActions: {5:[2,206],6:[2,207],7:[2,208],9:[2,205],28:[2,1],29:[2,3],30:[2,218],85:[2,49],94:[2,297],108:[2,254],115:[2,360],165:[2,462],260:[2,443],334:[2,238],335:[2,93],359:[2,412],360:[2,413],455:[2,420],456:[2,421],471:[2,465],472:[2,466],484:[2,321],485:[2,322],545:[2,472],548:[2,422],549:[2,423],563:[2,11],564:[2,230],565:[2,12],566:[2,232],573:[2,347],574:[2,348],597:[2,430],598:[2,431],602:[2,324],607:[2,346],610:[2,351],611:[2,352],617:[2,416],618:[2,417],636:[2,181],646:[2,426],647:[2,427]},
    parseError: function parseError (str, hash) {
        if (hash.recoverable) {
            this.trace(str);
        } else {
            var error = new Error(str);
            error.hash = hash;
            throw error;
        }
    },
    parse: function parse(input) {
        var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, TERROR = 2, EOF = 1;
        var args = lstack.slice.call(arguments, 1);
        var lexer = Object.create(this.lexer);
        var sharedState = { yy: {} };
        for (var k in this.yy) {
            if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
                sharedState.yy[k] = this.yy[k];
            }
        }
        lexer.setInput(input, sharedState.yy);
        sharedState.yy.lexer = lexer;
        sharedState.yy.parser = this;
        if (typeof lexer.yylloc == 'undefined') {
            lexer.yylloc = {};
        }
        var yyloc = lexer.yylloc;
        lstack.push(yyloc);
        var ranges = lexer.options && lexer.options.ranges;
        if (typeof sharedState.yy.parseError === 'function') {
            this.parseError = sharedState.yy.parseError;
        } else {
            this.parseError = Object.getPrototypeOf(this).parseError;
        }
        var lex = function () {
                var token;
                token = lexer.lex() || EOF;
                if (typeof token !== 'number') {
                    token = self.symbols_[token] || token;
                }
                return token;
            };
        var symbol, state, action, r, yyval = {}, p, len, newState, expected;
        while (true) {
            state = stack[stack.length - 1];
            if (this.defaultActions[state]) {
                action = this.defaultActions[state];
            } else {
                if (symbol === null || typeof symbol == 'undefined') {
                    symbol = lex();
                }
                action = table[state] && table[state][symbol];
            }
                        if (typeof action === 'undefined' || !action.length || !action[0]) {
                    var errStr = '';
                    expected = [];
                    for (p in table[state]) {
                        if (this.terminals_[p] && p > TERROR) {
                            expected.push('\'' + this.terminals_[p] + '\'');
                        }
                    }
                    if (lexer.showPosition) {
                        errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                    } else {
                        errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                    }
                    this.parseError(errStr, {
                        text: lexer.match,
                        token: this.terminals_[symbol] || symbol,
                        line: lexer.yylineno,
                        loc: yyloc,
                        expected: expected
                    });
                }
            if (action[0] instanceof Array && action.length > 1) {
                throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
            }
            switch (action[0]) {
            case 1:
                stack.push(symbol);
                vstack.push(lexer.yytext);
                lstack.push(lexer.yylloc);
                stack.push(action[1]);
                symbol = null;
                {
                    yyleng = lexer.yyleng;
                    yytext = lexer.yytext;
                    yylineno = lexer.yylineno;
                    yyloc = lexer.yylloc;
                }
                break;
            case 2:
                len = this.productions_[action[1]][1];
                yyval.$ = vstack[vstack.length - len];
                yyval._$ = {
                    first_line: lstack[lstack.length - (len || 1)].first_line,
                    last_line: lstack[lstack.length - 1].last_line,
                    first_column: lstack[lstack.length - (len || 1)].first_column,
                    last_column: lstack[lstack.length - 1].last_column
                };
                if (ranges) {
                    yyval._$.range = [
                        lstack[lstack.length - (len || 1)].range[0],
                        lstack[lstack.length - 1].range[1]
                    ];
                }
                r = this.performAction.apply(yyval, [
                    yytext,
                    yyleng,
                    yylineno,
                    sharedState.yy,
                    action[1],
                    vstack,
                    lstack
                ].concat(args));
                if (typeof r !== 'undefined') {
                    return r;
                }
                if (len) {
                    stack = stack.slice(0, -1 * len * 2);
                    vstack = vstack.slice(0, -1 * len);
                    lstack = lstack.slice(0, -1 * len);
                }
                stack.push(this.productions_[action[1]][0]);
                vstack.push(yyval.$);
                lstack.push(yyval._$);
                newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
                stack.push(newState);
                break;
            case 3:
                return true;
            }
        }
        return true;
    }};

      /*
        SPARQL parser in the Jison parser generator format.
      */

      var Wildcard = Wildcard$2.Wildcard;

      // Common namespaces and entities
      var RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
          RDF_TYPE  = RDF + 'type',
          RDF_FIRST = RDF + 'first',
          RDF_REST  = RDF + 'rest',
          RDF_NIL   = RDF + 'nil',
          XSD = 'http://www.w3.org/2001/XMLSchema#',
          XSD_INTEGER  = XSD + 'integer',
          XSD_DECIMAL  = XSD + 'decimal',
          XSD_DOUBLE   = XSD + 'double',
          XSD_BOOLEAN  = XSD + 'boolean';

      var base = '', basePath = '', baseRoot = '';

      // Returns a lowercase version of the given string
      function lowercase(string) {
        return string.toLowerCase();
      }

      // Appends the item to the array and returns the array
      function appendTo(array, item) {
        return array.push(item), array;
      }

      // Appends the items to the array and returns the array
      function appendAllTo(array, items) {
        return array.push.apply(array, items), array;
      }

      // Extends a base object with properties of other objects
      function extend(base) {
        if (!base) base = {};
        for (var i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
          for (var name in arg)
            base[name] = arg[name];
        return base;
      }

      // Creates an array that contains all items of the given arrays
      function unionAll() {
        var union = [];
        for (var i = 0, l = arguments.length; i < l; i++)
          union = union.concat.apply(union, arguments[i]);
        return union;
      }

      // Resolves an IRI against a base path
      function resolveIRI(iri) {
        // Strip off possible angular brackets
        if (iri[0] === '<')
          iri = iri.substring(1, iri.length - 1);
        // Return absolute IRIs unmodified
        if (/^[a-z]+:/i.test(iri))
          return iri;
        if (!Parser.base)
          throw new Error('Cannot resolve relative IRI ' + iri + ' because no base IRI was set.');
        if (base !== Parser.base) {
          base = Parser.base;
          basePath = base.replace(/[^\/:]*$/, '');
          baseRoot = base.match(/^(?:[a-z]+:\/*)?[^\/]*/)[0];
        }
        switch (iri[0]) {
        // An empty relative IRI indicates the base IRI
        case undefined:
          return base;
        // Resolve relative fragment IRIs against the base IRI
        case '#':
          return base + iri;
        // Resolve relative query string IRIs by replacing the query string
        case '?':
          return base.replace(/(?:\?.*)?$/, iri);
        // Resolve root relative IRIs at the root of the base IRI
        case '/':
          return baseRoot + iri;
        // Resolve all other IRIs at the base IRI's path
        default:
          return basePath + iri;
        }
      }

      // If the item is a variable, ensures it starts with a question mark
      function toVar(variable) {
        if (variable) {
          var first = variable[0];
          if (first === '?' || first === '$') return Parser.factory.variable(variable.substr(1));
        }
        return variable;
      }

      // Creates an operation with the given name and arguments
      function operation(operatorName, args) {
        return { type: 'operation', operator: operatorName, args: args || [] };
      }

      // Creates an expression with the given type and attributes
      function expression(expr, attr) {
        var expression = { expression: expr === '*'? new Wildcard() : expr };
        if (attr)
          for (var a in attr)
            expression[a] = attr[a];
        return expression;
      }

      // Creates a path with the given type and items
      function path(type, items) {
        return { type: 'path', pathType: type, items: items };
      }

      // Transforms a list of operations types and arguments into a tree of operations
      function createOperationTree(initialExpression, operationList) {
        for (var i = 0, l = operationList.length, item; i < l && (item = operationList[i]); i++)
          initialExpression = operation(item[0], [initialExpression, item[1]]);
        return initialExpression;
      }

      // Group datasets by default and named
      function groupDatasets(fromClauses, groupName) {
        var defaults = [], named = [], l = fromClauses.length, fromClause, group = {};
        if (!l)
          return null;
        for (var i = 0; i < l && (fromClause = fromClauses[i]); i++)
          (fromClause.named ? named : defaults).push(fromClause.iri);
        group[groupName || 'from'] = { default: defaults, named: named };
        return group;
      }

      // Converts the string to a number
      function toInt(string) {
        return parseInt(string, 10);
      }

      // Transforms a possibly single group into its patterns
      function degroupSingle(group) {
        return group.type === 'group' && group.patterns.length === 1 ? group.patterns[0] : group;
      }

      // Creates a literal with the given value and type
      function createTypedLiteral(value, type) {
        if (type && type.termType !== 'NamedNode'){
          type = Parser.factory.namedNode(type);
        }
        return Parser.factory.literal(value, type);
      }

      // Creates a literal with the given value and language
      function createLangLiteral(value, lang) {
        return Parser.factory.literal(value, lang);
      }

      // Creates a triple with the given subject, predicate, and object
      function triple(subject, predicate, object) {
        var triple = {};
        if (subject   != null) triple.subject   = subject;
        if (predicate != null) triple.predicate = predicate;
        if (object    != null) triple.object    = object;
        return triple;
      }

      // Creates a new blank node
      function blank(name) {
        if (typeof name === 'string') {  // Only use name if a name is given
          if (name.startsWith('e_')) return Parser.factory.blankNode(name);
          return Parser.factory.blankNode('e_' + name);
        }
        return Parser.factory.blankNode('g_' + blankId++);
      }  var blankId = 0;
      Parser._resetBlanks = function () { blankId = 0; };

      // Regular expression and replacement strings to escape strings
      var escapeSequence = /\\u([a-fA-F0-9]{4})|\\U([a-fA-F0-9]{8})|\\(.)/g,
          escapeReplacements = { '\\': '\\', "'": "'", '"': '"',
                                 't': '\t', 'b': '\b', 'n': '\n', 'r': '\r', 'f': '\f' },
          partialSurrogatesWithoutEndpoint = /[\uD800-\uDBFF]([^\uDC00-\uDFFF]|$)/,
          fromCharCode = String.fromCharCode;

      // Translates escape codes in the string into their textual equivalent
      function unescapeString(string, trimLength) {
        string = string.substring(trimLength, string.length - trimLength);
        try {
          string = string.replace(escapeSequence, function (sequence, unicode4, unicode8, escapedChar) {
            var charCode;
            if (unicode4) {
              charCode = parseInt(unicode4, 16);
              if (isNaN(charCode)) throw new Error(); // can never happen (regex), but helps performance
              return fromCharCode(charCode);
            }
            else if (unicode8) {
              charCode = parseInt(unicode8, 16);
              if (isNaN(charCode)) throw new Error(); // can never happen (regex), but helps performance
              if (charCode < 0xFFFF) return fromCharCode(charCode);
              return fromCharCode(0xD800 + ((charCode -= 0x10000) >> 10), 0xDC00 + (charCode & 0x3FF));
            }
            else {
              var replacement = escapeReplacements[escapedChar];
              if (!replacement) throw new Error();
              return replacement;
            }
          });
        }
        catch (error) { return ''; }

        // Test for invalid unicode surrogate pairs
        if (partialSurrogatesWithoutEndpoint.exec(string)) {
          throw new Error('Invalid unicode codepoint of surrogate pair without corresponding codepoint in ' + string);
        }

        return string;
      }

      // Creates a list, collecting its (possibly blank) items and triples associated with those items
      function createList(objects) {
        var list = blank(), head = list, listItems = [], listTriples, triples = [];
        objects.forEach(function (o) { listItems.push(o.entity); appendAllTo(triples, o.triples); });

        // Build an RDF list out of the items
        for (var i = 0, j = 0, l = listItems.length, listTriples = Array(l * 2); i < l;)
          listTriples[j++] = triple(head, Parser.factory.namedNode(RDF_FIRST), listItems[i]),
          listTriples[j++] = triple(head, Parser.factory.namedNode(RDF_REST),  head = ++i < l ? blank() : Parser.factory.namedNode(RDF_NIL));

        // Return the list's identifier, its triples, and the triples associated with its items
        return { entity: list, triples: appendAllTo(listTriples, triples) };
      }

      // Creates a blank node identifier, collecting triples with that blank node as subject
      function createAnonymousObject(propertyList) {
        var entity = blank();
        return {
          entity: entity,
          triples: propertyList.map(function (t) { return extend(triple(entity), t); })
        };
      }

      // Collects all (possibly blank) objects, and triples that have them as subject
      function objectListToTriples(predicate, objectList, otherTriples) {
        var objects = [], triples = [];
        objectList.forEach(function (l) {
          objects.push(triple(null, predicate, l.entity));
          appendAllTo(triples, l.triples);
        });
        return unionAll(objects, otherTriples || [], triples);
      }

      // Return the id of an expression
      function getExpressionId(expression) {
        return expression.variable ? expression.variable.value : expression.value || expression.expression.value;
      }

      // Get all "aggregate"'s from an expression
      function getAggregatesOfExpression(expression) {
        if (!expression) {
          return [];
        }
        if (expression.type === 'aggregate') {
          return [expression];
        } else if (expression.type === "operation") {
          const aggregates = [];
          for (const arg of expression.args) {
            aggregates.push(...getAggregatesOfExpression(arg));
          }
          return aggregates;
        }
        return [];
      }

      // Get all variables used in an expression
      function getVariablesFromExpression(expression) {
        const variables = new Set();
        const visitExpression = function (expr) {
          if (!expr) { return; }
          if (expr.termType === "Variable") {
            variables.add(expr);
          } else if (expr.type === "operation") {
            expr.args.forEach(visitExpression);
          }
        };
        visitExpression(expression);
        return variables;
      }

      // Helper function to flatten arrays
      function flatten(input, depth = 1, stack = []) {
        for (const item of input) {
            if (depth > 0 && item instanceof Array) {
              flatten(item, depth - 1, stack);
            } else {
              stack.push(item);
            }
        }
        return stack;
      }

      function isVariable(term) {
        return term.termType === 'Variable';
      }

      function getBoundVarsFromGroupGraphPattern(pattern) {
        if (pattern.triples) {
          const boundVars = [];
          for (const triple of pattern.triples) {
            if (isVariable(triple.subject)) boundVars.push(triple.subject.value);
            if (isVariable(triple.predicate)) boundVars.push(triple.predicate.value);
            if (isVariable(triple.object)) boundVars.push(triple.object.value);
          }
          return boundVars;
        } else if (pattern.patterns) {
          const boundVars = [];
          for (const pat of pattern.patterns) {
            boundVars.push(...getBoundVarsFromGroupGraphPattern(pat));
          }
          return boundVars;
        }
        return [];
      }

      // Helper function to find duplicates in array
      function getDuplicatesInArray(array) {
        const sortedArray = array.slice().sort();
        const duplicates = [];
        for (let i = 0; i < sortedArray.length - 1; i++) {
          if (sortedArray[i + 1] == sortedArray[i]) {
            duplicates.push(sortedArray[i]);
          }
        }
        return duplicates;
      }

      function ensureSparqlStar(value) {
        if (!Parser.sparqlStar) {
          throw new Error('SPARQL* support is not enabled');
        }
        return value;
      }

      function ensureNoVariables(operations) {
        for (const operation of operations) {
          if (operation.type === 'graph' && operation.name.termType === 'Variable') {
            throw new Error('Detected illegal variable in GRAPH');
          }
          if (operation.type === 'bgp' || operation.type === 'graph') {
            for (const triple of operation.triples) {
              if (triple.subject.termType === 'Variable' ||
                  triple.predicate.termType === 'Variable' ||
                  triple.object.termType === 'Variable') {
                throw new Error('Detected illegal variable in BGP');
              }
            }
          }
        }
        return operations;
      }

      function ensureNoBnodes(operations) {
        for (const operation of operations) {
          if (operation.type === 'bgp') {
            for (const triple of operation.triples) {
              if (triple.subject.termType === 'BlankNode' ||
                  triple.predicate.termType === 'BlankNode' ||
                  triple.object.termType === 'BlankNode') {
                throw new Error('Detected illegal blank node in BGP');
              }
            }
          }
        }
        return operations;
      }
    /* generated by jison-lex 0.3.4 */
    var lexer = (function(){
    var lexer = ({

    EOF:1,

    parseError:function parseError(str, hash) {
            if (this.yy.parser) {
                this.yy.parser.parseError(str, hash);
            } else {
                throw new Error(str);
            }
        },

    // resets the lexer, sets new input
    setInput:function (input, yy) {
            this.yy = yy || this.yy || {};
            this._input = input;
            this._more = this._backtrack = this.done = false;
            this.yylineno = this.yyleng = 0;
            this.yytext = this.matched = this.match = '';
            this.conditionStack = ['INITIAL'];
            this.yylloc = {
                first_line: 1,
                first_column: 0,
                last_line: 1,
                last_column: 0
            };
            if (this.options.ranges) {
                this.yylloc.range = [0,0];
            }
            this.offset = 0;
            return this;
        },

    // consumes and returns one char from the input
    input:function () {
            var ch = this._input[0];
            this.yytext += ch;
            this.yyleng++;
            this.offset++;
            this.match += ch;
            this.matched += ch;
            var lines = ch.match(/(?:\r\n?|\n).*/g);
            if (lines) {
                this.yylineno++;
                this.yylloc.last_line++;
            } else {
                this.yylloc.last_column++;
            }
            if (this.options.ranges) {
                this.yylloc.range[1]++;
            }

            this._input = this._input.slice(1);
            return ch;
        },

    // unshifts one char (or a string) into the input
    unput:function (ch) {
            var len = ch.length;
            var lines = ch.split(/(?:\r\n?|\n)/g);

            this._input = ch + this._input;
            this.yytext = this.yytext.substr(0, this.yytext.length - len);
            //this.yyleng -= len;
            this.offset -= len;
            var oldLines = this.match.split(/(?:\r\n?|\n)/g);
            this.match = this.match.substr(0, this.match.length - 1);
            this.matched = this.matched.substr(0, this.matched.length - 1);

            if (lines.length - 1) {
                this.yylineno -= lines.length - 1;
            }
            var r = this.yylloc.range;

            this.yylloc = {
                first_line: this.yylloc.first_line,
                last_line: this.yylineno + 1,
                first_column: this.yylloc.first_column,
                last_column: lines ?
                    (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                     + oldLines[oldLines.length - lines.length].length - lines[0].length :
                  this.yylloc.first_column - len
            };

            if (this.options.ranges) {
                this.yylloc.range = [r[0], r[0] + this.yyleng - len];
            }
            this.yyleng = this.yytext.length;
            return this;
        },

    // When called from action, caches matched text and appends it on next action
    more:function () {
            this._more = true;
            return this;
        },

    // When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
    reject:function () {
            if (this.options.backtrack_lexer) {
                this._backtrack = true;
            } else {
                return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                    text: "",
                    token: null,
                    line: this.yylineno
                });

            }
            return this;
        },

    // retain first n characters of the match
    less:function (n) {
            this.unput(this.match.slice(n));
        },

    // displays already matched input, i.e. for error messages
    pastInput:function () {
            var past = this.matched.substr(0, this.matched.length - this.match.length);
            return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
        },

    // displays upcoming input, i.e. for error messages
    upcomingInput:function () {
            var next = this.match;
            if (next.length < 20) {
                next += this._input.substr(0, 20-next.length);
            }
            return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
        },

    // displays the character position where the lexing error occurred, i.e. for error messages
    showPosition:function () {
            var pre = this.pastInput();
            var c = new Array(pre.length + 1).join("-");
            return pre + this.upcomingInput() + "\n" + c + "^";
        },

    // test the lexed token: return FALSE when not a match, otherwise return token
    test_match:function(match, indexed_rule) {
            var token,
                lines,
                backup;

            if (this.options.backtrack_lexer) {
                // save context
                backup = {
                    yylineno: this.yylineno,
                    yylloc: {
                        first_line: this.yylloc.first_line,
                        last_line: this.last_line,
                        first_column: this.yylloc.first_column,
                        last_column: this.yylloc.last_column
                    },
                    yytext: this.yytext,
                    match: this.match,
                    matches: this.matches,
                    matched: this.matched,
                    yyleng: this.yyleng,
                    offset: this.offset,
                    _more: this._more,
                    _input: this._input,
                    yy: this.yy,
                    conditionStack: this.conditionStack.slice(0),
                    done: this.done
                };
                if (this.options.ranges) {
                    backup.yylloc.range = this.yylloc.range.slice(0);
                }
            }

            lines = match[0].match(/(?:\r\n?|\n).*/g);
            if (lines) {
                this.yylineno += lines.length;
            }
            this.yylloc = {
                first_line: this.yylloc.last_line,
                last_line: this.yylineno + 1,
                first_column: this.yylloc.last_column,
                last_column: lines ?
                             lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                             this.yylloc.last_column + match[0].length
            };
            this.yytext += match[0];
            this.match += match[0];
            this.matches = match;
            this.yyleng = this.yytext.length;
            if (this.options.ranges) {
                this.yylloc.range = [this.offset, this.offset += this.yyleng];
            }
            this._more = false;
            this._backtrack = false;
            this._input = this._input.slice(match[0].length);
            this.matched += match[0];
            token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
            if (this.done && this._input) {
                this.done = false;
            }
            if (token) {
                return token;
            } else if (this._backtrack) {
                // recover context
                for (var k in backup) {
                    this[k] = backup[k];
                }
                return false; // rule action called reject() implying the next rule should be tested instead.
            }
            return false;
        },

    // return next match in input
    next:function () {
            if (this.done) {
                return this.EOF;
            }
            if (!this._input) {
                this.done = true;
            }

            var token,
                match,
                tempMatch,
                index;
            if (!this._more) {
                this.yytext = '';
                this.match = '';
            }
            var rules = this._currentRules();
            for (var i = 0; i < rules.length; i++) {
                tempMatch = this._input.match(this.rules[rules[i]]);
                if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                    match = tempMatch;
                    index = i;
                    if (this.options.backtrack_lexer) {
                        token = this.test_match(tempMatch, rules[i]);
                        if (token !== false) {
                            return token;
                        } else if (this._backtrack) {
                            match = false;
                            continue; // rule action called reject() implying a rule MISmatch.
                        } else {
                            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                            return false;
                        }
                    } else if (!this.options.flex) {
                        break;
                    }
                }
            }
            if (match) {
                token = this.test_match(match, rules[index]);
                if (token !== false) {
                    return token;
                }
                // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                return false;
            }
            if (this._input === "") {
                return this.EOF;
            } else {
                return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                    text: "",
                    token: null,
                    line: this.yylineno
                });
            }
        },

    // return next match that has a token
    lex:function lex () {
            var r = this.next();
            if (r) {
                return r;
            } else {
                return this.lex();
            }
        },

    // activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
    begin:function begin (condition) {
            this.conditionStack.push(condition);
        },

    // pop the previously active lexer condition state off the condition stack
    popState:function popState () {
            var n = this.conditionStack.length - 1;
            if (n > 0) {
                return this.conditionStack.pop();
            } else {
                return this.conditionStack[0];
            }
        },

    // produce the lexer rule set which is active for the currently active lexer condition state
    _currentRules:function _currentRules () {
            if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
                return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
            } else {
                return this.conditions["INITIAL"].rules;
            }
        },

    // return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
    topState:function topState (n) {
            n = this.conditionStack.length - 1 - Math.abs(n || 0);
            if (n >= 0) {
                return this.conditionStack[n];
            } else {
                return "INITIAL";
            }
        },

    // alias for begin(condition)
    pushState:function pushState (condition) {
            this.begin(condition);
        },

    // return the number of states currently on the stack
    stateStackSize:function stateStackSize() {
            return this.conditionStack.length;
        },
    options: {"flex":true,"case-insensitive":true},
    performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
    switch($avoiding_name_collisions) {
    case 0:/* ignore */
    break;
    case 1:return 12
    case 2:return 15
    case 3:return 28
    case 4:return 316
    case 5:return 317
    case 6:return 35
    case 7:return 37
    case 8:return 38
    case 9:return 26
    case 10:return 41
    case 11:return 45
    case 12:return 46
    case 13:return 48
    case 14:return 50
    case 15:return 55
    case 16:return 58
    case 17:return 320
    case 18:return 68
    case 19:return 69
    case 20:return 75
    case 21:return 78
    case 22:return 81
    case 23:return 83
    case 24:return 86
    case 25:return 88
    case 26:return 90
    case 27:return 191
    case 28:return 107
    case 29:return 321
    case 30:return 140
    case 31:return 322
    case 32:return 323
    case 33:return 117
    case 34:return 324
    case 35:return 116
    case 36:return 325
    case 37:return 326
    case 38:return 120
    case 39:return 122
    case 40:return 123
    case 41:return 138
    case 42:return 132
    case 43:return 133
    case 44:return 135
    case 45:return 141
    case 46:return 119
    case 47:return 327
    case 48:return 328
    case 49:return 167
    case 50:return 170
    case 51:return 174
    case 52:return 100
    case 53:return 168
    case 54:return 329
    case 55:return 173
    case 56:return 231
    case 57:return 235
    case 58:return 278
    case 59:return 195
    case 60:return 330
    case 61:return 331
    case 62:return 224
    case 63:return 333
    case 64:return 271
    case 65:return 219
    case 66:return 226
    case 67:return 227
    case 68:return 250
    case 69:return 254
    case 70:return 295
    case 71:return 334
    case 72:return 335
    case 73:return 336
    case 74:return 337
    case 75:return 338
    case 76:return 258
    case 77:return 339
    case 78:return 273
    case 79:return 281
    case 80:return 282
    case 81:return 275
    case 82:return 276
    case 83:return 277
    case 84:return 340
    case 85:return 341
    case 86:return 279
    case 87:return 343
    case 88:return 342
    case 89:return 344
    case 90:return 284
    case 91:return 285
    case 92:return 288
    case 93:return 290
    case 94:return 294
    case 95:return 298
    case 96:return 301
    case 97:return 13
    case 98:return 16
    case 99:return 312
    case 100:return 245
    case 101:return 34
    case 102:return 297
    case 103:return 87
    case 104:return 299
    case 105:return 300
    case 106:return 306
    case 107:return 307
    case 108:return 308
    case 109:return 309
    case 110:return 310
    case 111:return 311
    case 112:return 'EXPONENT'
    case 113:return 302
    case 114:return 303
    case 115:return 304
    case 116:return 305
    case 117:return 93
    case 118:return 246
    case 119:return 6
    case 120:return 'INVALID'
    case 121:console.log(yy_.yytext);
    break;
    }
    },
    rules: [/^(?:\s+|(#[^\n\r]*))/i,/^(?:BASE)/i,/^(?:PREFIX)/i,/^(?:SELECT)/i,/^(?:DISTINCT)/i,/^(?:REDUCED)/i,/^(?:\()/i,/^(?:AS)/i,/^(?:\))/i,/^(?:\*)/i,/^(?:CONSTRUCT)/i,/^(?:WHERE)/i,/^(?:\{)/i,/^(?:\})/i,/^(?:DESCRIBE)/i,/^(?:ASK)/i,/^(?:FROM)/i,/^(?:NAMED)/i,/^(?:GROUP)/i,/^(?:BY)/i,/^(?:HAVING)/i,/^(?:ORDER)/i,/^(?:ASC)/i,/^(?:DESC)/i,/^(?:LIMIT)/i,/^(?:OFFSET)/i,/^(?:VALUES)/i,/^(?:;)/i,/^(?:LOAD)/i,/^(?:SILENT)/i,/^(?:INTO)/i,/^(?:CLEAR)/i,/^(?:DROP)/i,/^(?:CREATE)/i,/^(?:ADD)/i,/^(?:TO)/i,/^(?:MOVE)/i,/^(?:COPY)/i,/^(?:INSERT((\s+|(#[^\n\r]*)\n\r?)+)DATA)/i,/^(?:DELETE((\s+|(#[^\n\r]*)\n\r?)+)DATA)/i,/^(?:DELETE((\s+|(#[^\n\r]*)\n\r?)+)WHERE)/i,/^(?:WITH)/i,/^(?:DELETE)/i,/^(?:INSERT)/i,/^(?:USING)/i,/^(?:DEFAULT)/i,/^(?:GRAPH)/i,/^(?:ALL)/i,/^(?:\.)/i,/^(?:OPTIONAL)/i,/^(?:SERVICE)/i,/^(?:BIND)/i,/^(?:UNDEF)/i,/^(?:MINUS)/i,/^(?:UNION)/i,/^(?:FILTER)/i,/^(?:<<)/i,/^(?:>>)/i,/^(?:,)/i,/^(?:a)/i,/^(?:\|)/i,/^(?:\/)/i,/^(?:\^)/i,/^(?:\?)/i,/^(?:\+)/i,/^(?:!)/i,/^(?:\[)/i,/^(?:\])/i,/^(?:\|\|)/i,/^(?:&&)/i,/^(?:=)/i,/^(?:!=)/i,/^(?:<)/i,/^(?:>)/i,/^(?:<=)/i,/^(?:>=)/i,/^(?:IN)/i,/^(?:NOT)/i,/^(?:-)/i,/^(?:BOUND)/i,/^(?:BNODE)/i,/^(?:(RAND|NOW|UUID|STRUUID))/i,/^(?:(LANG|DATATYPE|IRI|URI|ABS|CEIL|FLOOR|ROUND|STRLEN|STR|UCASE|LCASE|ENCODE_FOR_URI|YEAR|MONTH|DAY|HOURS|MINUTES|SECONDS|TIMEZONE|TZ|MD5|SHA1|SHA256|SHA384|SHA512|isIRI|isURI|isBLANK|isLITERAL|isNUMERIC))/i,/^(?:(LANGMATCHES|CONTAINS|STRSTARTS|STRENDS|STRBEFORE|STRAFTER|STRLANG|STRDT|sameTerm))/i,/^(?:CONCAT)/i,/^(?:COALESCE)/i,/^(?:IF)/i,/^(?:REGEX)/i,/^(?:SUBSTR)/i,/^(?:REPLACE)/i,/^(?:EXISTS)/i,/^(?:COUNT)/i,/^(?:SUM|MIN|MAX|AVG|SAMPLE)/i,/^(?:GROUP_CONCAT)/i,/^(?:SEPARATOR)/i,/^(?:\^\^)/i,/^(?:true|false)/i,/^(?:(<(?:[^<>\"\{\}\|\^`\\\u0000-\u0020])*>))/i,/^(?:((([A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])(?:(?:(((?:([A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F\u203F-\u2040])|\.)*(((?:([A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F\u203F-\u2040]))?)?:))/i,/^(?:(((([A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])(?:(?:(((?:([A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F\u203F-\u2040])|\.)*(((?:([A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F\u203F-\u2040]))?)?:)((?:((?:([A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|:|[0-9]|((%([0-9A-Fa-f])([0-9A-Fa-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(?:(?:(((?:([A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F\u203F-\u2040])|\.|:|((%([0-9A-Fa-f])([0-9A-Fa-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*(?:(((?:([A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F\u203F-\u2040])|:|((%([0-9A-Fa-f])([0-9A-Fa-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%)))))?)))/i,/^(?:(_:(?:((?:([A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|[0-9])(?:(?:(((?:([A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F\u203F-\u2040])|\.)*(((?:([A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F\u203F-\u2040]))?))/i,/^(?:([\?\$]((?:((?:([A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|[0-9])(?:((?:([A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|[0-9]|\u00B7|[\u0300-\u036F\u203F-\u2040])*)))/i,/^(?:(@[a-zA-Z]+(?:-[a-zA-Z0-9]+)*))/i,/^(?:([0-9]+))/i,/^(?:([0-9]*\.[0-9]+))/i,/^(?:([0-9]+\.[0-9]*([eE][+-]?[0-9]+)|\.([0-9])+([eE][+-]?[0-9]+)|([0-9])+([eE][+-]?[0-9]+)))/i,/^(?:(\+([0-9]+)))/i,/^(?:(\+([0-9]*\.[0-9]+)))/i,/^(?:(\+([0-9]+\.[0-9]*([eE][+-]?[0-9]+)|\.([0-9])+([eE][+-]?[0-9]+)|([0-9])+([eE][+-]?[0-9]+))))/i,/^(?:(-([0-9]+)))/i,/^(?:(-([0-9]*\.[0-9]+)))/i,/^(?:(-([0-9]+\.[0-9]*([eE][+-]?[0-9]+)|\.([0-9])+([eE][+-]?[0-9]+)|([0-9])+([eE][+-]?[0-9]+))))/i,/^(?:([eE][+-]?[0-9]+))/i,/^(?:('(?:(?:[^\u0027\u005C\u000A\u000D])|(\\[tbnrf\\\"']|\\u([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])|\\U([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])))*'))/i,/^(?:("(?:(?:[^\u0022\u005C\u000A\u000D])|(\\[tbnrf\\\"']|\\u([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])|\\U([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])))*"))/i,/^(?:('''(?:(?:'|'')?(?:[^'\\]|(\\[tbnrf\\\"']|\\u([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])|\\U([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f]))))*'''))/i,/^(?:("""(?:(?:"|"")?(?:[^\"\\]|(\\[tbnrf\\\"']|\\u([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])|\\U([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f]))))*"""))/i,/^(?:(\((\u0020|\u0009|\u000D|\u000A)*\)))/i,/^(?:(\[(\u0020|\u0009|\u000D|\u000A)*\]))/i,/^(?:$)/i,/^(?:.)/i,/^(?:.)/i],
    conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121],"inclusive":true}}
    });
    return lexer;
    })();
    parser.lexer = lexer;
    function Parser () {
      this.yy = {};
    }
    Parser.prototype = parser;parser.Parser = Parser;
    return new Parser;
    })();var SparqlParser_1=SparqlParser;

    var XSD_INTEGER = 'http://www.w3.org/2001/XMLSchema#integer';
    var XSD_STRING = 'http://www.w3.org/2001/XMLSchema#string';

    function Generator$1(options) {
      this._options = options = options || {};

      var prefixes = options.prefixes || {};
      this._prefixByIri = {};
      var prefixIris = [];
      for (var prefix in prefixes) {
        var iri = prefixes[prefix];
        if (isString(iri)) {
          this._prefixByIri[iri] = prefix;
          prefixIris.push(iri);
        }
      }
      var iriList = prefixIris.join('|').replace(/[\]\/\(\)\*\+\?\.\\\$]/g, '\\$&');
      this._prefixRegex = new RegExp('^(' + iriList + ')([a-zA-Z][\\-_a-zA-Z0-9]*)$');
      this._usedPrefixes = {};
      this._sparqlStar = options.sparqlStar;
      this._indent =  isString(options.indent)  ? options.indent  : '  ';
      this._newline = isString(options.newline) ? options.newline : '\n';
      this._explicitDatatype = Boolean(options.explicitDatatype);
    }

    // Converts the parsed query object into a SPARQL query
    Generator$1.prototype.toQuery = function (q) {
      var query = '';

      if (q.queryType)
        query += q.queryType.toUpperCase() + ' ';
      if (q.reduced)
        query += 'REDUCED ';
      if (q.distinct)
        query += 'DISTINCT ';

      if (q.variables){
        query += mapJoin(q.variables, undefined, function (variable) {
          return isTerm(variable) ? this.toEntity(variable) :
                 '(' + this.toExpression(variable.expression) + ' AS ' + variableToString(variable.variable) + ')';
        }, this) + ' ';
      }
      else if (q.template)
        query += this.group(q.template, true) + this._newline;

      if (q.from)
        query += this.graphs('FROM ', q.from.default) + this.graphs('FROM NAMED ', q.from.named);
      if (q.where)
        query += 'WHERE ' + this.group(q.where, true) + this._newline;

      if (q.updates)
        query += mapJoin(q.updates, ';' + this._newline, this.toUpdate, this);

      if (q.group)
        query += 'GROUP BY ' + mapJoin(q.group, undefined, function (it) {
          var result = isTerm(it.expression)
            ? this.toEntity(it.expression)
            : '(' + this.toExpression(it.expression) + ')';
          return it.variable ? '(' + result + ' AS ' + variableToString(it.variable) + ')' : result;
        }, this) + this._newline;
      if (q.having)
        query += 'HAVING (' + mapJoin(q.having, undefined, this.toExpression, this) + ')' + this._newline;
      if (q.order)
        query += 'ORDER BY ' + mapJoin(q.order, undefined, function (it) {
          var expr = '(' + this.toExpression(it.expression) + ')';
          return !it.descending ? expr : 'DESC ' + expr;
        }, this) + this._newline;

      if (q.offset)
        query += 'OFFSET ' + q.offset + this._newline;
      if (q.limit)
        query += 'LIMIT ' + q.limit + this._newline;

      if (q.values)
        query += this.values(q);

      // stringify prefixes at the end to mark used ones
      query = this.baseAndPrefixes(q) + query;
      return query.trim();
    };

    Generator$1.prototype.baseAndPrefixes = function (q) {
      var base = q.base ? ('BASE <' + q.base + '>' + this._newline) : '';
      var prefixes = '';
      for (var key in q.prefixes) {
        if (this._options.allPrefixes || this._usedPrefixes[key])
          prefixes += 'PREFIX ' + key + ': <' + q.prefixes[key] + '>' + this._newline;
      }
      return base + prefixes;
    };

    // Converts the parsed SPARQL pattern into a SPARQL pattern
    Generator$1.prototype.toPattern = function (pattern) {
      var type = pattern.type || (pattern instanceof Array) && 'array' ||
                 (pattern.subject && pattern.predicate && pattern.object ? 'triple' : '');
      if (!(type in this))
        throw new Error('Unknown entry type: ' + type);
      return this[type](pattern);
    };

    Generator$1.prototype.triple = function (t) {
      return this.toEntity(t.subject) + ' ' + this.toEntity(t.predicate) + ' ' + this.toEntity(t.object) + '.';
    };

    Generator$1.prototype.array = function (items) {
      return mapJoin(items, this._newline, this.toPattern, this);
    };

    Generator$1.prototype.bgp = function (bgp) {
      return this.encodeTriples(bgp.triples);
    };

    Generator$1.prototype.encodeTriples = function (triples) {
      if (!triples.length)
        return '';

      var parts = [], subject = undefined, predicate = undefined;
      for (var i = 0; i < triples.length; i++) {
        var triple = triples[i];
        // Triple with different subject
        if (!equalTerms(triple.subject, subject)) {
          // Terminate previous triple
          if (subject)
            parts.push('.' + this._newline);
          subject = triple.subject;
          predicate = triple.predicate;
          parts.push(this.toEntity(subject), ' ', this.toEntity(predicate));
        }
        // Triple with same subject but different predicate
        else if (!equalTerms(triple.predicate, predicate)) {
          predicate = triple.predicate;
          parts.push(';' + this._newline, this._indent, this.toEntity(predicate));
        }
        // Triple with same subject and predicate
        else {
          parts.push(',');
        }
        parts.push(' ', this.toEntity(triple.object));
      }
      parts.push('.');

      return parts.join('');
    };

    Generator$1.prototype.graph = function (graph) {
      return 'GRAPH ' + this.toEntity(graph.name) + ' ' + this.group(graph);
    };

    Generator$1.prototype.graphs = function (keyword, graphs) {
      return !graphs || graphs.length === 0 ? '' :
        mapJoin(graphs, '', function (g) { return keyword + this.toEntity(g) + this._newline; }, this)
    };

    Generator$1.prototype.group = function (group, inline) {
      group = inline !== true ? this.array(group.patterns || group.triples)
                              : this.toPattern(group.type !== 'group' ? group : group.patterns);
      return group.indexOf(this._newline) === -1 ? '{ ' + group + ' }' : '{' + this._newline + this.indent(group) + this._newline + '}';
    };

    Generator$1.prototype.query = function (query) {
      return this.toQuery(query);
    };

    Generator$1.prototype.filter = function (filter) {
      return 'FILTER(' + this.toExpression(filter.expression) + ')';
    };

    Generator$1.prototype.bind = function (bind) {
      return 'BIND(' + this.toExpression(bind.expression) + ' AS ' + variableToString(bind.variable) + ')';
    };

    Generator$1.prototype.optional = function (optional) {
      return 'OPTIONAL ' + this.group(optional);
    };

    Generator$1.prototype.union = function (union) {
      return mapJoin(union.patterns, this._newline + 'UNION' + this._newline, function (p) { return this.group(p, true); }, this);
    };

    Generator$1.prototype.minus = function (minus) {
      return 'MINUS ' + this.group(minus);
    };

    Generator$1.prototype.values = function (valuesList) {
      // Gather unique keys
      var keys = Object.keys(valuesList.values.reduce(function (keyHash, values) {
        for (var key in values) keyHash[key] = true;
        return keyHash;
      }, {}));
      // Check whether simple syntax can be used
      var lparen, rparen;
      if (keys.length === 1) {
        lparen = rparen = '';
      } else {
        lparen = '(';
        rparen = ')';
      }
      // Create value rows
      return 'VALUES ' + lparen + keys.join(' ') + rparen + ' {' + this._newline +
        mapJoin(valuesList.values, this._newline, function (values) {
          return '  ' + lparen + mapJoin(keys, undefined, function (key) {
            return values[key] ? this.toEntity(values[key]) : 'UNDEF';
          }, this) + rparen;
        }, this) + this._newline + '}';
    };

    Generator$1.prototype.service = function (service) {
      return 'SERVICE ' + (service.silent ? 'SILENT ' : '') + this.toEntity(service.name) + ' ' +
             this.group(service);
    };

    // Converts the parsed expression object into a SPARQL expression
    Generator$1.prototype.toExpression = function (expr) {
      if (isTerm(expr)) {
        return this.toEntity(expr);
      }
      switch (expr.type.toLowerCase()) {
        case 'aggregate':
          return expr.aggregation.toUpperCase() +
                 '(' + (expr.distinct ? 'DISTINCT ' : '') + this.toExpression(expr.expression) +
                 (typeof expr.separator === 'string' ? '; SEPARATOR = ' + '"' + expr.separator.replace(escape, escapeReplacer) + '"' : '') + ')';
        case 'functioncall':
          return this.toEntity(expr.function) + '(' + mapJoin(expr.args, ', ', this.toExpression, this) + ')';
        case 'operation':
          var operator = expr.operator.toUpperCase(), args = expr.args || [];
          switch (expr.operator.toLowerCase()) {
          // Infix operators
          case '<':
          case '>':
          case '>=':
          case '<=':
          case '&&':
          case '||':
          case '=':
          case '!=':
          case '+':
          case '-':
          case '*':
          case '/':
              return (isTerm(args[0]) ? this.toEntity(args[0]) : '(' + this.toExpression(args[0]) + ')') +
                     ' ' + operator + ' ' +
                     (isTerm(args[1]) ? this.toEntity(args[1]) : '(' + this.toExpression(args[1]) + ')');
          // Unary operators
          case '!':
            return '!(' + this.toExpression(args[0]) + ')';
          case 'uplus':
            return '+(' + this.toExpression(args[0]) + ')';
          case 'uminus':
            return '-(' + this.toExpression(args[0]) + ')';
          // IN and NOT IN
          case 'notin':
            operator = 'NOT IN';
          case 'in':
            return this.toExpression(args[0]) + ' ' + operator +
                   '(' + (isString(args[1]) ? args[1] : mapJoin(args[1], ', ', this.toExpression, this)) + ')';
          // EXISTS and NOT EXISTS
          case 'notexists':
            operator = 'NOT EXISTS';
          case 'exists':
            return operator + ' ' + this.group(args[0], true);
          // Other expressions
          default:
            return operator + '(' + mapJoin(args, ', ', this.toExpression, this) + ')';
          }
        default:
          throw new Error('Unknown expression type: ' + expr.type);
      }
    };

    // Converts the parsed entity (or property path) into a SPARQL entity
    Generator$1.prototype.toEntity = function (value) {
      if (isTerm(value)) {
        switch (value.termType) {
        // variable, * selector, or blank node
        case 'Wildcard':
          return '*';
        case 'Variable':
          return variableToString(value);
        case 'BlankNode':
          return '_:' + value.value;
        // literal
        case 'Literal':
          var lexical = value.value || '', language = value.language || '', datatype = value.datatype;
          value = '"' + lexical.replace(escape, escapeReplacer) + '"';
          if (language){
            value += '@' + language;
          } else if (datatype) {
            // Abbreviate literals when possible
            if (!this._explicitDatatype) {
              switch (datatype.value) {
              case XSD_STRING:
                return value;
              case XSD_INTEGER:
                if (/^\d+$/.test(lexical))
                  // Add space to avoid confusion with decimals in broken parsers
                  return lexical + ' ';
              }
            }
            value += '^^' + this.encodeIRI(datatype.value);
          }
          return value;
        case 'Quad':
          if (!this._sparqlStar)
              throw new Error('SPARQL* support is not enabled');

          if (value.graph && value.graph.termType !== "DefaultGraph") {
            return '<< GRAPH ' +
              this.toEntity(value.graph) +
              ' { ' +
              this.toEntity(value.subject) + ' ' +
              this.toEntity(value.predicate) + ' ' +
              this.toEntity(value.object) +
              ' } ' +
              ' >>'
          }
          else {
            return (
              '<< ' +
              this.toEntity(value.subject) + ' ' +
              this.toEntity(value.predicate) + ' ' +
              this.toEntity(value.object) +
              ' >>'
            );
          }
        // IRI
        default:
          return this.encodeIRI(value.value);
        }
      }
      // property path
      else {
        var items = value.items.map(this.toEntity, this), path = value.pathType;
        switch (path) {
        // prefix operator
        case '^':
        case '!':
          return path + items[0];
        // postfix operator
        case '*':
        case '+':
        case '?':
          return '(' + items[0] + path + ')';
        // infix operator
        default:
          return '(' + items.join(path) + ')';
        }
      }
    };
    var escape = /["\\\t\n\r\b\f]/g,
        escapeReplacer = function (c) { return escapeReplacements[c]; },
        escapeReplacements = { '\\': '\\\\', '"': '\\"', '\t': '\\t',
                               '\n': '\\n', '\r': '\\r', '\b': '\\b', '\f': '\\f' };

    // Represent the IRI, as a prefixed name when possible
    Generator$1.prototype.encodeIRI = function (iri) {
      var prefixMatch = this._prefixRegex.exec(iri);
      if (prefixMatch) {
        var prefix = this._prefixByIri[prefixMatch[1]];
        this._usedPrefixes[prefix] = true;
        return prefix + ':' + prefixMatch[2];
      }
      return '<' + iri + '>';
    };

    // Converts the parsed update object into a SPARQL update clause
    Generator$1.prototype.toUpdate = function (update) {
      switch (update.type || update.updateType) {
      case 'load':
        return 'LOAD' + (update.source ? ' ' + this.toEntity(update.source) : '') +
               (update.destination ? ' INTO GRAPH ' + this.toEntity(update.destination) : '');
      case 'insert':
        return 'INSERT DATA '  + this.group(update.insert, true);
      case 'delete':
        return 'DELETE DATA '  + this.group(update.delete, true);
      case 'deletewhere':
        return 'DELETE WHERE ' + this.group(update.delete, true);
      case 'insertdelete':
        return (update.graph ? 'WITH ' + this.toEntity(update.graph) + this._newline : '') +
               (update.delete.length ? 'DELETE ' + this.group(update.delete, true) + this._newline : '') +
               (update.insert.length ? 'INSERT ' + this.group(update.insert, true) + this._newline : '') +
               (update.using ? this.graphs('USING ', update.using.default) : '') +
               (update.using ? this.graphs('USING NAMED ', update.using.named) : '') +
               'WHERE ' + this.group(update.where, true);
      case 'add':
      case 'copy':
      case 'move':
        return update.type.toUpperCase()+ ' ' +  (update.silent ? 'SILENT ' : '') + (update.source.default ? 'DEFAULT' : this.toEntity(update.source.name)) +
               ' TO ' + this.toEntity(update.destination.name);
      case 'create':
      case 'clear':
      case 'drop':
        return update.type.toUpperCase() + (update.silent ? ' SILENT ' : ' ') + (
          update.graph.default ? 'DEFAULT' :
          update.graph.named ? 'NAMED' :
          update.graph.all ? 'ALL' :
          ('GRAPH ' + this.toEntity(update.graph.name))
        );
      default:
        throw new Error('Unknown update query type: ' + update.type);
      }
    };

    // Indents each line of the string
    Generator$1.prototype.indent = function(text) { return text.replace(/^/gm, this._indent); };

    function variableToString(variable){
      return '?' + variable.value;
    }

    // Checks whether the object is a string
    function isString(object) { return typeof object === 'string'; }

    // Checks whether the object is a Term
    function isTerm(object) {
      return typeof object.termType === 'string';
    }

    // Checks whether term1 and term2 are equivalent without `.equals()` prototype method
    function equalTerms(term1, term2) {
      if (!term1 || !isTerm(term1)) { return false; }
      if (!term2 || !isTerm(term2)) { return false; }
      if (term1.termType !== term2.termType) { return false; }
      switch (term1.termType) {
        case 'Literal':
          return term1.value === term2.value
              && term1.language === term2.language
              && equalTerms(term1.datatype, term2.datatype);
        case 'Quad':
          return equalTerms(term1.subject, term2.subject)
              && equalTerms(term1.predicate, term2.predicate)
              && equalTerms(term1.object, term2.object)
              && equalTerms(term1.graph, term2.graph);
        default:
          return term1.value === term2.value;
      }
    }

    // Maps the array with the given function, and joins the results using the separator
    function mapJoin(array, sep, func, self) {
      return array.map(func, self).join(isString(sep) ? sep : ' ');
    }

    /**
     * @param options {
     *   allPrefixes: boolean,
     *   indentation: string,
     *   newline: string
     * }
     */
    var SparqlGenerator = function SparqlGenerator(options = {}) {
      return {
        stringify: function (query) {
          var currentOptions = Object.create(options);
          currentOptions.prefixes = query.prefixes;
          return new Generator$1(currentOptions).toQuery(query);
        },
        createGenerator: function() { return new Generator$1(options); }
      };
    };

    var rdfDataFactory = {};

    var BlankNode$1 = {};

    Object.defineProperty(BlankNode$1, "__esModule", { value: true });
    BlankNode$1.BlankNode = void 0;
    /**
     * A term that represents an RDF blank node with a label.
     */
    class BlankNode {
        constructor(value) {
            this.termType = 'BlankNode';
            this.value = value;
        }
        equals(other) {
            return !!other && other.termType === 'BlankNode' && other.value === this.value;
        }
    }
    BlankNode$1.BlankNode = BlankNode;

    var DataFactory$2 = {};

    var DefaultGraph$1 = {};

    Object.defineProperty(DefaultGraph$1, "__esModule", { value: true });
    DefaultGraph$1.DefaultGraph = void 0;
    /**
     * A singleton term instance that represents the default graph.
     * It's only allowed to assign a DefaultGraph to the .graph property of a Quad.
     */
    class DefaultGraph {
        constructor() {
            this.termType = 'DefaultGraph';
            this.value = '';
            // Private constructor
        }
        equals(other) {
            return !!other && other.termType === 'DefaultGraph';
        }
    }
    DefaultGraph$1.DefaultGraph = DefaultGraph;
    DefaultGraph.INSTANCE = new DefaultGraph();

    var Literal$1 = {};

    var NamedNode$1 = {};

    Object.defineProperty(NamedNode$1, "__esModule", { value: true });
    NamedNode$1.NamedNode = void 0;
    /**
     * A term that contains an IRI.
     */
    class NamedNode {
        constructor(value) {
            this.termType = 'NamedNode';
            this.value = value;
        }
        equals(other) {
            return !!other && other.termType === 'NamedNode' && other.value === this.value;
        }
    }
    NamedNode$1.NamedNode = NamedNode;

    Object.defineProperty(Literal$1, "__esModule", { value: true });
    Literal$1.Literal = void 0;
    const NamedNode_1$1 = NamedNode$1;
    /**
     * A term that represents an RDF literal, containing a string with an optional language tag or datatype.
     */
    class Literal {
        constructor(value, languageOrDatatype) {
            this.termType = 'Literal';
            this.value = value;
            if (typeof languageOrDatatype === 'string') {
                this.language = languageOrDatatype;
                this.datatype = Literal.RDF_LANGUAGE_STRING;
            }
            else if (languageOrDatatype) {
                this.language = '';
                this.datatype = languageOrDatatype;
            }
            else {
                this.language = '';
                this.datatype = Literal.XSD_STRING;
            }
        }
        equals(other) {
            return !!other && other.termType === 'Literal' && other.value === this.value &&
                other.language === this.language && other.datatype.equals(this.datatype);
        }
    }
    Literal$1.Literal = Literal;
    Literal.RDF_LANGUAGE_STRING = new NamedNode_1$1.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
    Literal.XSD_STRING = new NamedNode_1$1.NamedNode('http://www.w3.org/2001/XMLSchema#string');

    var Quad$1 = {};

    Object.defineProperty(Quad$1, "__esModule", { value: true });
    Quad$1.Quad = void 0;
    /**
     * An instance of DefaultGraph represents the default graph.
     * It's only allowed to assign a DefaultGraph to the .graph property of a Quad.
     */
    class Quad {
        constructor(subject, predicate, object, graph) {
            this.termType = 'Quad';
            this.value = '';
            this.subject = subject;
            this.predicate = predicate;
            this.object = object;
            this.graph = graph;
        }
        equals(other) {
            // `|| !other.termType` is for backwards-compatibility with old factories without RDF* support.
            return !!other && (other.termType === 'Quad' || !other.termType) &&
                this.subject.equals(other.subject) &&
                this.predicate.equals(other.predicate) &&
                this.object.equals(other.object) &&
                this.graph.equals(other.graph);
        }
    }
    Quad$1.Quad = Quad;

    var Variable$1 = {};

    Object.defineProperty(Variable$1, "__esModule", { value: true });
    Variable$1.Variable = void 0;
    /**
     * A term that represents a variable.
     */
    class Variable {
        constructor(value) {
            this.termType = 'Variable';
            this.value = value;
        }
        equals(other) {
            return !!other && other.termType === 'Variable' && other.value === this.value;
        }
    }
    Variable$1.Variable = Variable;

    Object.defineProperty(DataFactory$2, "__esModule", { value: true });
    DataFactory$2.DataFactory = void 0;
    const BlankNode_1 = BlankNode$1;
    const DefaultGraph_1 = DefaultGraph$1;
    const Literal_1 = Literal$1;
    const NamedNode_1 = NamedNode$1;
    const Quad_1 = Quad$1;
    const Variable_1 = Variable$1;
    let dataFactoryCounter = 0;
    /**
     * A factory for instantiating RDF terms and quads.
     */
    let DataFactory$1 = class DataFactory {
        constructor(options) {
            this.blankNodeCounter = 0;
            options = options || {};
            this.blankNodePrefix = options.blankNodePrefix || `df_${dataFactoryCounter++}_`;
        }
        /**
         * @param value The IRI for the named node.
         * @return A new instance of NamedNode.
         * @see NamedNode
         */
        namedNode(value) {
            return new NamedNode_1.NamedNode(value);
        }
        /**
         * @param value The optional blank node identifier.
         * @return A new instance of BlankNode.
         *         If the `value` parameter is undefined a new identifier
         *         for the blank node is generated for each call.
         * @see BlankNode
         */
        blankNode(value) {
            return new BlankNode_1.BlankNode(value || `${this.blankNodePrefix}${this.blankNodeCounter++}`);
        }
        /**
         * @param value              The literal value.
         * @param languageOrDatatype The optional language or datatype.
         *                           If `languageOrDatatype` is a NamedNode,
         *                           then it is used for the value of `NamedNode.datatype`.
         *                           Otherwise `languageOrDatatype` is used for the value
         *                           of `NamedNode.language`.
         * @return A new instance of Literal.
         * @see Literal
         */
        literal(value, languageOrDatatype) {
            return new Literal_1.Literal(value, languageOrDatatype);
        }
        /**
         * This method is optional.
         * @param value The variable name
         * @return A new instance of Variable.
         * @see Variable
         */
        variable(value) {
            return new Variable_1.Variable(value);
        }
        /**
         * @return An instance of DefaultGraph.
         */
        defaultGraph() {
            return DefaultGraph_1.DefaultGraph.INSTANCE;
        }
        /**
         * @param subject   The quad subject term.
         * @param predicate The quad predicate term.
         * @param object    The quad object term.
         * @param graph     The quad graph term.
         * @return A new instance of Quad.
         * @see Quad
         */
        quad(subject, predicate, object, graph) {
            return new Quad_1.Quad(subject, predicate, object, graph || this.defaultGraph());
        }
        /**
         * Create a deep copy of the given term using this data factory.
         * @param original An RDF term.
         * @return A deep copy of the given term.
         */
        fromTerm(original) {
            // TODO: remove nasty any casts when this TS bug has been fixed:
            //  https://github.com/microsoft/TypeScript/issues/26933
            switch (original.termType) {
                case 'NamedNode':
                    return this.namedNode(original.value);
                case 'BlankNode':
                    return this.blankNode(original.value);
                case 'Literal':
                    if (original.language) {
                        return this.literal(original.value, original.language);
                    }
                    if (!original.datatype.equals(Literal_1.Literal.XSD_STRING)) {
                        return this.literal(original.value, this.fromTerm(original.datatype));
                    }
                    return this.literal(original.value);
                case 'Variable':
                    return this.variable(original.value);
                case 'DefaultGraph':
                    return this.defaultGraph();
                case 'Quad':
                    return this.quad(this.fromTerm(original.subject), this.fromTerm(original.predicate), this.fromTerm(original.object), this.fromTerm(original.graph));
            }
        }
        /**
         * Create a deep copy of the given quad using this data factory.
         * @param original An RDF quad.
         * @return A deep copy of the given quad.
         */
        fromQuad(original) {
            return this.fromTerm(original);
        }
        /**
         * Reset the internal blank node counter.
         */
        resetBlankNodeCounter() {
            this.blankNodeCounter = 0;
        }
    };
    DataFactory$2.DataFactory = DataFactory$1;

    (function (exports) {
    	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    	    if (k2 === undefined) k2 = k;
    	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
    	}) : (function(o, m, k, k2) {
    	    if (k2 === undefined) k2 = k;
    	    o[k2] = m[k];
    	}));
    	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
    	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
    	};
    	Object.defineProperty(exports, "__esModule", { value: true });
    	__exportStar(BlankNode$1, exports);
    	__exportStar(DataFactory$2, exports);
    	__exportStar(DefaultGraph$1, exports);
    	__exportStar(Literal$1, exports);
    	__exportStar(NamedNode$1, exports);
    	__exportStar(Quad$1, exports);
    	__exportStar(Variable$1, exports);
    	
    } (rdfDataFactory));

    var Parser = SparqlParser_1.Parser;
    var Generator = SparqlGenerator;
    var Wildcard = Wildcard$2.Wildcard;
    var { DataFactory } = rdfDataFactory;

    var sparql = {
      /**
       * Creates a SPARQL parser with the given pre-defined prefixes and base IRI
       * @param options {
       *   prefixes?: { [prefix: string]: string },
       *   baseIRI?: string,
       *   factory?: import('rdf-js').DataFactory,
       *   sparqlStar?: boolean,
       *   skipValidation?: boolean,
       *   skipUngroupedVariableCheck?: boolean
       * }
       */
      Parser: function ({ prefixes, baseIRI, factory, sparqlStar, skipValidation, skipUngroupedVariableCheck, pathOnly } = {}) {

        // Create a copy of the prefixes
        var prefixesCopy = {};
        for (var prefix in prefixes || {})
          prefixesCopy[prefix] = prefixes[prefix];

        // Create a new parser with the given prefixes
        // (Workaround for https://github.com/zaach/jison/issues/241)
        var parser = new Parser();
        parser.parse = function () {
          Parser.base = baseIRI || '';
          Parser.prefixes = Object.create(prefixesCopy);
          Parser.factory = factory || new DataFactory();
          Parser.sparqlStar = Boolean(sparqlStar);
          Parser.pathOnly = Boolean(pathOnly);
          // We keep skipUngroupedVariableCheck for compatibility reasons.
          Parser.skipValidation = Boolean(skipValidation) || Boolean(skipUngroupedVariableCheck);
          return Parser.prototype.parse.apply(parser, arguments);
        };
        parser._resetBlanks = Parser._resetBlanks;
        return parser;
      },
      Generator: Generator,
      Wildcard: Wildcard,
    };

    function getSelectQueryVariables(queryDetails) {
        // If no wildcard
        if (queryDetails.variables[0].value != "*") {
            return queryDetails.variables.map(function (v) { return v.value; });
        }
        // If wildcard we need to traverse the query in order to find the variables
        var variables = new Set();
        searchDeeper(queryDetails.where, variables);
        // COULD ALSO GET IT DIRECTLY FROM QUERY
        // let variables= new Set();
        // query.split("?").splice(1)
        //     .map(item => item.trim().split(/[^A-Za-z]/)[0])
        //     .forEach(item => variables.add(item));
        // return Array.from(variables);
        return Array.from(variables);
    }
    function searchDeeper(item, variables) {
        if (Array.isArray(item)) {
            item.forEach(function (x) { return searchDeeper(x, variables); });
        }
        else {
            if (item.type == "bgp") {
                item.triples.forEach(function (quad) {
                    processQuad(quad, variables);
                });
            }
            else if (item.type == "optional") {
                searchDeeper(item.patterns, variables);
            }
            else if (item.type == "bind") {
                variables.add(item.variable.value);
            }
            else if (item.type == "values") {
                Object.keys(item.values[0]).forEach(function (v) { return variables.add(v.split("?")[1]); });
            }
        }
    }
    function processQuad(quad, variables) {
        Object.keys(quad).forEach(function (key) {
            if (quad[key].termType == "Variable")
                variables.add(quad[key].value);
            // In SPARQL* the spo can all be quads themselves, and then we need to go one step deeper
            else if (quad[key].termType == "Quad")
                processQuad(quad[key], variables);
        });
    }

    // 3rd party scripts
    // Other scripts that will be part of the bundle
    /**
     * Takes a SPARQL query and returns its content in JSON format
     * @param {*} query the SPARQL query
     * @returns
     */
    function getQueryDetails(query) {
        var parser = new sparql.Parser({ sparqlStar: true });
        try {
            return parser.parse(query);
        }
        catch (err) {
            if (err.toString().indexOf("SPARQL*") != -1) {
                return {
                    type: "query",
                    queryType: "CONSTRUCT",
                    sparqlStar: true
                };
            }
            else {
                throw "Couldn't get query details: " + err.toString();
            }
        }
    }
    /**
     * Processes a query response as returned by Oxigraph so it's easier to work with in a JavaScript
     * based application
     * @param {*} results the raw Oxigraph results
     * @param {*} queryDetails Query details in JSON format as returned by the getQueryDetails method
     * @param {*} mimetype used for CONSTRUCT queries to describe the desired serialization of the results
     * @returns
     */
    function processQueryResponse(results, queryDetails, mimetype) {
        switch (queryDetails.queryType) {
            case "SELECT":
                var variables = getSelectQueryVariables(queryDetails);
                return buildSelectQueryResponse(results, variables);
            case "ASK":
                return buildAskQueryResponse(results);
            case "CONSTRUCT":
                return buildConstructQueryResponse(results, mimetype, queryDetails.sparqlStar);
        }
    }
    function buildAskQueryResponse(result) {
        return [result, 1];
    }
    function buildConstructQueryResponse(quads, mimetype, sparqlStar) {
        var qRes = quads;
        if (mimetype == undefined || mimetype == "text/turtle") {
            var tempStore = new Store(quads);
            qRes = tempStore.dump("text/turtle", undefined);
        }
        else if (mimetype == "application/ld+json") {
            if (sparqlStar)
                throw "SPARQL* not supported for JSON-LD";
            var arr = [];
            for (var _i = 0, quads_1 = quads; _i < quads_1.length; _i++) {
                var quad = quads_1[_i];
                arr.push(quadToJSONLDObject(quad));
            }
            qRes = arr;
        }
        return [qRes, quads.length];
    }
    function buildSelectQueryResponse(results, variables) {
        var bindings = [];
        var doc = {
            head: { vars: variables },
            results: { bindings: bindings }
        };
        var termTypeMap = {
            NamedNode: "uri",
            Literal: "literal"
        };
        var resultCount = 0;
        var _loop_1 = function (result) {
            resultCount++;
            // Object to hold the new binding results
            var binding = {};
            variables.forEach(function (variable) {
                binding[variable] = {};
                var node;
                try {
                    node = result.get(variable);
                }
                catch (err) {
                    console.log(err);
                }
                if (node != undefined) {
                    binding[variable].value = node.value;
                    binding[variable].type = termTypeMap[node.termType];
                    if (binding[variable].type == "literal") {
                        if (node.language != "") {
                            binding[variable]["xml:lang"] = node.language;
                        }
                        else {
                            binding[variable].datatype = node.datatype.value;
                        }
                    }
                }
            });
            bindings.push(binding);
        };
        for (var _i = 0, results_1 = results; _i < results_1.length; _i++) {
            var result = results_1[_i];
            _loop_1(result);
        }
        return [doc, resultCount];
    }
    function quadToJSONLDObject(quad) {
        console.log(quad);
        var obj = { "@id": quad.subject.value };
        if (quad.predicate.value == "http://www.w3.org/1999/02/22-rdf-syntax-ns#type") {
            obj["@type"] = quad.object.value;
        }
        else {
            if (quad.object.termType == "NamedNode") {
                obj[quad.predicate.value] = { "@id": quad.object.value };
            }
            else if (quad.object.termType == "Literal") {
                if (quad.object.datatype.value == "http://www.w3.org/2001/XMLSchema#string") {
                    obj[quad.predicate.value] = quad.object.value;
                }
                if (quad.object.datatype.value == "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString") {
                    obj[quad.predicate.value] = {
                        "@value": quad.object.value,
                        "@language": quad.object.language
                    };
                }
                else {
                    obj[quad.predicate.value] = {
                        "@value": quad.object.value,
                        "@type": quad.object.datatype.value
                    };
                }
            }
            else {
                console.log("Unsupported object");
                console.log(quad);
            }
        }
        return obj;
    }

    exports.getQueryDetails = getQueryDetails;
    exports.oxigraph = web;
    exports.processQueryResponse = processQueryResponse;

    return exports;

})({});
