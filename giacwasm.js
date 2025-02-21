var Module = typeof Module !== "undefined" ? Module : {};
var moduleOverrides = {};
var key;
for (key in Module) {
    if (Module.hasOwnProperty(key)) {
        moduleOverrides[key] = Module[key]
    }
}
var arguments_ = [];
var thisProgram = "./this.program";
var quit_ = function (status, toThrow) {
    throw toThrow
};
var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_HAS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;
ENVIRONMENT_IS_WEB = typeof window === "object";
ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
ENVIRONMENT_HAS_NODE = typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string";
ENVIRONMENT_IS_NODE = ENVIRONMENT_HAS_NODE && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (Module["ENVIRONMENT"]) {
    throw new Error(`Module.ENVIRONMENT has been deprecated.
    To force the environment, use the ENVIRONMENT compile-time option 
    (for example, -s ENVIRONMENT=web or -s ENVIRONMENT=node)`)
}
var scriptDirectory = "";
function locateFile(path) {
    if (Module["locateFile"]) {
        return Module["locateFile"](path, scriptDirectory)
    }
    return scriptDirectory + path
}
var read_, readAsync, readBinary, setWindowTitle;
if (ENVIRONMENT_IS_NODE) {
    scriptDirectory = __dirname + "/";
    var nodeFS;
    var nodePath;
    read_ = function shell_read(filename, binary) {
        var ret;
        if (!nodeFS)
            nodeFS = require("fs");
        if (!nodePath)
            nodePath = require("path");
        filename = nodePath["normalize"](filename);
        ret = nodeFS["readFileSync"](filename);
        return binary ? ret : ret.toString()
    }
        ;
    readBinary = function readBinary(filename) {
        var ret = read_(filename, true);
        if (!ret.buffer) {
            ret = new Uint8Array(ret)
        }
        assert(ret.buffer);
        return ret
    }
        ;
    if (process["argv"].length > 1) {
        thisProgram = process["argv"][1].replace(/\\/g, "/")
    }
    arguments_ = process["argv"].slice(2);
    if (typeof module !== "undefined") {
        module["exports"] = Module
    }
    process["on"]("uncaughtException", function (ex) {
        if (!(ex instanceof ExitStatus)) {
            throw ex
        }
    });
    process["on"]("unhandledRejection", abort);
    quit_ = function (status) {
        process["exit"](status)
    }
        ;
    Module["inspect"] = function () {
        return "[Emscripten Module object]"
    }
} else if (ENVIRONMENT_IS_SHELL) {
    if (typeof read != "undefined") {
        read_ = function shell_read(f) {
            return read(f)
        }
    }
    readBinary = function readBinary(f) {
        var data;
        if (typeof readbuffer === "function") {
            return new Uint8Array(readbuffer(f))
        }
        data = read(f, "binary");
        assert(typeof data === "object");
        return data
    }
        ;
    if (typeof scriptArgs != "undefined") {
        arguments_ = scriptArgs
    } else if (typeof arguments != "undefined") {
        arguments_ = arguments
    }
    if (typeof quit === "function") {
        quit_ = function (status) {
            quit(status)
        }
    }
    if (typeof print !== "undefined") {
        if (typeof console === "undefined")
            console = {};
        console.log = print;
        console.warn = console.error = typeof printErr !== "undefined" ? printErr : print
    }
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = self.location.href
    } else if (document.currentScript) {
        scriptDirectory = document.currentScript.src
    }
    if (scriptDirectory.indexOf("blob:") !== 0) {
        scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf("/") + 1)
    } else {
        scriptDirectory = ""
    }
    read_ = function shell_read(url) {
        var xhr = new XMLHttpRequest;
        xhr.open("GET", url, false);
        xhr.send(null);
        return xhr.responseText
    }
        ;
    if (ENVIRONMENT_IS_WORKER) {
        readBinary = function readBinary(url) {
            var xhr = new XMLHttpRequest;
            xhr.open("GET", url, false);
            xhr.responseType = "arraybuffer";
            xhr.send(null);
            return new Uint8Array(xhr.response)
        }
    }
    readAsync = function readAsync(url, onload, onerror) {
        var xhr = new XMLHttpRequest;
        xhr.open("GET", url, true);
        xhr.responseType = "arraybuffer";
        xhr.onload = function xhr_onload() {
            if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                onload(xhr.response);
                return
            }
            onerror()
        }
            ;
        xhr.onerror = onerror;
        xhr.send(null)
    }
        ;
    setWindowTitle = function (title) {
        document.title = title
    }
} else {
    throw new Error("environment detection error")
}
var out = Module["print"] || console.log.bind(console);
var err = Module["printErr"] || console.warn.bind(console);
for (key in moduleOverrides) {
    if (moduleOverrides.hasOwnProperty(key)) {
        Module[key] = moduleOverrides[key]
    }
}
moduleOverrides = null;
if (Module["arguments"])
    arguments_ = Module["arguments"];
if (!Object.getOwnPropertyDescriptor(Module, "arguments"))
    Object.defineProperty(Module, "arguments", {
        get: function () {
            abort("Module.arguments has been replaced with plain arguments_")
        }
    });
if (Module["thisProgram"])
    thisProgram = Module["thisProgram"];
if (!Object.getOwnPropertyDescriptor(Module, "thisProgram"))
    Object.defineProperty(Module, "thisProgram", {
        get: function () {
            abort("Module.thisProgram has been replaced with plain thisProgram")
        }
    });
if (Module["quit"])
    quit_ = Module["quit"];
if (!Object.getOwnPropertyDescriptor(Module, "quit"))
    Object.defineProperty(Module, "quit", {
        get: function () {
            abort("Module.quit has been replaced with plain quit_")
        }
    });
assert(typeof Module["memoryInitializerPrefixURL"] === "undefined", "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");
assert(typeof Module["pthreadMainPrefixURL"] === "undefined", "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");
assert(typeof Module["cdInitializerPrefixURL"] === "undefined", "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");
assert(typeof Module["filePackagePrefixURL"] === "undefined", "Module.filePackagePrefixURL option was removed, use Module.locateFile instead");
assert(typeof Module["read"] === "undefined", "Module.read option was removed (modify read_ in JS)");
assert(typeof Module["readAsync"] === "undefined", "Module.readAsync option was removed (modify readAsync in JS)");
assert(typeof Module["readBinary"] === "undefined", "Module.readBinary option was removed (modify readBinary in JS)");
assert(typeof Module["setWindowTitle"] === "undefined", "Module.setWindowTitle option was removed (modify setWindowTitle in JS)");
if (!Object.getOwnPropertyDescriptor(Module, "read"))
    Object.defineProperty(Module, "read", {
        get: function () {
            abort("Module.read has been replaced with plain read_")
        }
    });
if (!Object.getOwnPropertyDescriptor(Module, "readAsync"))
    Object.defineProperty(Module, "readAsync", {
        get: function () {
            abort("Module.readAsync has been replaced with plain readAsync")
        }
    });
if (!Object.getOwnPropertyDescriptor(Module, "readBinary"))
    Object.defineProperty(Module, "readBinary", {
        get: function () {
            abort("Module.readBinary has been replaced with plain readBinary")
        }
    });
stackSave = stackRestore = stackAlloc = function () {
    abort("cannot use the stack before compiled code is ready to run, and has provided stack access")
}
    ;
function dynamicAlloc(size) {
    assert(DYNAMICTOP_PTR);
    var ret = HEAP32[DYNAMICTOP_PTR >> 2];
    var end = ret + size + 15 & -16;
    if (end > _emscripten_get_heap_size()) {
        abort("failure to dynamicAlloc - memory growth etc. is not supported there, call malloc/sbrk directly")
    }
    HEAP32[DYNAMICTOP_PTR >> 2] = end;
    return ret
}
function getNativeTypeSize(type) {
    switch (type) {
        case "i1":
        case "i8":
            return 1;
        case "i16":
            return 2;
        case "i32":
            return 4;
        case "i64":
            return 8;
        case "float":
            return 4;
        case "double":
            return 8;
        default:
            {
                if (type[type.length - 1] === "*") {
                    return 4
                } else if (type[0] === "i") {
                    var bits = parseInt(type.substr(1));
                    assert(bits % 8 === 0, "getNativeTypeSize invalid bits " + bits + ", type " + type);
                    return bits / 8
                } else {
                    return 0
                }
            }
    }
}
function warnOnce(text) {
    if (!warnOnce.shown)
        warnOnce.shown = {};
    if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        err(text)
    }
}
var asm2wasmImports = {
    "f64-rem": function (x, y) {
        return x % y
    },
    "debugger": function () {
        debugger
    }
};
var functionPointers = new Array(0);
var tempRet0 = 0;
var setTempRet0 = function (value) {
    tempRet0 = value
};
var getTempRet0 = function () {
    return tempRet0
};
var wasmBinary;
if (Module["wasmBinary"])
    wasmBinary = Module["wasmBinary"];
if (!Object.getOwnPropertyDescriptor(Module, "wasmBinary"))
    Object.defineProperty(Module, "wasmBinary", {
        get: function () {
            abort("Module.wasmBinary has been replaced with plain wasmBinary")
        }
    });
if (typeof WebAssembly !== "object") {
    abort("No WebAssembly support found. Build with -s WASM=0 to target JavaScript instead.")
}
function setValue(ptr, value, type, noSafe) {
    type = type || "i8";
    if (type.charAt(type.length - 1) === "*")
        type = "i32";
    switch (type) {
        case "i1":
            HEAP8[ptr >> 0] = value;
            break;
        case "i8":
            HEAP8[ptr >> 0] = value;
            break;
        case "i16":
            HEAP16[ptr >> 1] = value;
            break;
        case "i32":
            HEAP32[ptr >> 2] = value;
            break;
        case "i64":
            tempI64 = [value >>> 0, (tempDouble = value,
                +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)],
                HEAP32[ptr >> 2] = tempI64[0],
                HEAP32[ptr + 4 >> 2] = tempI64[1];
            break;
        case "float":
            HEAPF32[ptr >> 2] = value;
            break;
        case "double":
            HEAPF64[ptr >> 3] = value;
            break;
        default:
            abort("invalid type for setValue: " + type)
    }
}
var wasmMemory;
var wasmTable;
var ABORT = false;
var EXITSTATUS = 0;
function assert(condition, text) {
    if (!condition) {
        abort("Assertion failed: " + text)
    }
}
function getCFunc(ident) {
    var func = Module["_" + ident];
    assert(func, "Cannot call unknown function " + ident + ", make sure it is exported");
    return func
}
function ccall(ident, returnType, argTypes, args, opts) {
    var toC = {
        "string": function (str) {
            var ret = 0;
            if (str !== null && str !== undefined && str !== 0) {
                var len = (str.length << 2) + 1;
                ret = stackAlloc(len);
                stringToUTF8(str, ret, len)
            }
            return ret
        },
        "array": function (arr) {
            var ret = stackAlloc(arr.length);
            writeArrayToMemory(arr, ret);
            return ret
        }
    };
    function convertReturnValue(ret) {
        if (returnType === "string")
            return UTF8ToString(ret);
        if (returnType === "boolean")
            return Boolean(ret);
        return ret
    }
    var func = getCFunc(ident);
    var cArgs = [];
    var stack = 0;
    assert(returnType !== "array", 'Return type should not be "array".');
    if (args) {
        for (var i = 0; i < args.length; i++) {
            var converter = toC[argTypes[i]];
            if (converter) {
                if (stack === 0)
                    stack = stackSave();
                cArgs[i] = converter(args[i])
            } else {
                cArgs[i] = args[i]
            }
        }
    }
    var ret = func.apply(null, cArgs);
    assert(!(opts && opts.async), "async call is only supported with Emterpretify for now, see #9029");
    ret = convertReturnValue(ret);
    if (stack !== 0)
        stackRestore(stack);
    return ret
}
function cwrap(ident, returnType, argTypes, opts) {
    return function () {
        return ccall(ident, returnType, argTypes, arguments, opts)
    }
}
var ALLOC_NORMAL = 0;
var ALLOC_NONE = 3;
function allocate(slab, types, allocator, ptr) {
    var zeroinit, size;
    if (typeof slab === "number") {
        zeroinit = true;
        size = slab
    } else {
        zeroinit = false;
        size = slab.length
    }
    var singleType = typeof types === "string" ? types : null;
    var ret;
    if (allocator == ALLOC_NONE) {
        ret = ptr
    } else {
        ret = [_malloc, stackAlloc, dynamicAlloc][allocator](Math.max(size, singleType ? 1 : types.length))
    }
    if (zeroinit) {
        var stop;
        ptr = ret;
        assert((ret & 3) == 0);
        stop = ret + (size & ~3);
        for (; ptr < stop; ptr += 4) {
            HEAP32[ptr >> 2] = 0
        }
        stop = ret + size;
        while (ptr < stop) {
            HEAP8[ptr++ >> 0] = 0
        }
        return ret
    }
    if (singleType === "i8") {
        if (slab.subarray || slab.slice) {
            HEAPU8.set(slab, ret)
        } else {
            HEAPU8.set(new Uint8Array(slab), ret)
        }
        return ret
    }
    var i = 0, type, typeSize, previousType;
    while (i < size) {
        var curr = slab[i];
        type = singleType || types[i];
        if (type === 0) {
            i++;
            continue
        }
        assert(type, "Must know what type to store in allocate!");
        if (type == "i64")
            type = "i32";
        setValue(ret + i, curr, type);
        if (previousType !== type) {
            typeSize = getNativeTypeSize(type);
            previousType = type
        }
        i += typeSize
    }
    return ret
}
function getMemory(size) {
    if (!runtimeInitialized)
        return dynamicAlloc(size);
    return _malloc(size)
}
function Pointer_stringify(ptr, length) {
    abort("this function has been removed - you should use UTF8ToString(ptr, maxBytesToRead) instead!")
}
var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;
function UTF8ArrayToString(u8Array, idx, maxBytesToRead) {
    var endIdx = idx + maxBytesToRead;
    var endPtr = idx;
    while (u8Array[endPtr] && !(endPtr >= endIdx))
        ++endPtr;
    if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
        return UTF8Decoder.decode(u8Array.subarray(idx, endPtr))
    } else {
        var str = "";
        while (idx < endPtr) {
            var u0 = u8Array[idx++];
            if (!(u0 & 128)) {
                str += String.fromCharCode(u0);
                continue
            }
            var u1 = u8Array[idx++] & 63;
            if ((u0 & 224) == 192) {
                str += String.fromCharCode((u0 & 31) << 6 | u1);
                continue
            }
            var u2 = u8Array[idx++] & 63;
            if ((u0 & 240) == 224) {
                u0 = (u0 & 15) << 12 | u1 << 6 | u2
            } else {
                if ((u0 & 248) != 240)
                    warnOnce("Invalid UTF-8 leading byte 0x" + u0.toString(16) + " encountered when deserializing a UTF-8 string on the asm.js/wasm heap to a JS string!");
                u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | u8Array[idx++] & 63
            }
            if (u0 < 65536) {
                str += String.fromCharCode(u0)
            } else {
                var ch = u0 - 65536;
                str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
            }
        }
    }
    return str
}
function UTF8ToString(ptr, maxBytesToRead) {
    return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : ""
}
function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
    if (!(maxBytesToWrite > 0))
        return 0;
    var startIdx = outIdx;
    var endIdx = outIdx + maxBytesToWrite - 1;
    for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) {
            var u1 = str.charCodeAt(++i);
            u = 65536 + ((u & 1023) << 10) | u1 & 1023
        }
        if (u <= 127) {
            if (outIdx >= endIdx)
                break;
            outU8Array[outIdx++] = u
        } else if (u <= 2047) {
            if (outIdx + 1 >= endIdx)
                break;
            outU8Array[outIdx++] = 192 | u >> 6;
            outU8Array[outIdx++] = 128 | u & 63
        } else if (u <= 65535) {
            if (outIdx + 2 >= endIdx)
                break;
            outU8Array[outIdx++] = 224 | u >> 12;
            outU8Array[outIdx++] = 128 | u >> 6 & 63;
            outU8Array[outIdx++] = 128 | u & 63
        } else {
            if (outIdx + 3 >= endIdx)
                break;
            if (u >= 2097152)
                warnOnce("Invalid Unicode code point 0x" + u.toString(16) + " encountered when serializing a JS string to an UTF-8 string on the asm.js/wasm heap! (Valid unicode code points should be in range 0-0x1FFFFF).");
            outU8Array[outIdx++] = 240 | u >> 18;
            outU8Array[outIdx++] = 128 | u >> 12 & 63;
            outU8Array[outIdx++] = 128 | u >> 6 & 63;
            outU8Array[outIdx++] = 128 | u & 63
        }
    }
    outU8Array[outIdx] = 0;
    return outIdx - startIdx
}
function stringToUTF8(str, outPtr, maxBytesToWrite) {
    assert(typeof maxBytesToWrite == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
    return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite)
}
function lengthBytesUTF8(str) {
    var len = 0;
    for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343)
            u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
        if (u <= 127)
            ++len;
        else if (u <= 2047)
            len += 2;
        else if (u <= 65535)
            len += 3;
        else
            len += 4
    }
    return len
}
var UTF16Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : undefined;
function allocateUTF8(str) {
    var size = lengthBytesUTF8(str) + 1;
    var ret = _malloc(size);
    if (ret)
        stringToUTF8Array(str, HEAP8, ret, size);
    return ret
}
function writeStringToMemory(string, buffer, dontAddNull) {
    warnOnce("writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!");
    var lastChar, end;
    if (dontAddNull) {
        end = buffer + lengthBytesUTF8(string);
        lastChar = HEAP8[end]
    }
    stringToUTF8(string, buffer, Infinity);
    if (dontAddNull)
        HEAP8[end] = lastChar
}
function writeArrayToMemory(array, buffer) {
    assert(array.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)");
    HEAP8.set(array, buffer)
}
function writeAsciiToMemory(str, buffer, dontAddNull) {
    for (var i = 0; i < str.length; ++i) {
        assert(str.charCodeAt(i) === str.charCodeAt(i) & 255);
        HEAP8[buffer++ >> 0] = str.charCodeAt(i)
    }
    if (!dontAddNull)
        HEAP8[buffer >> 0] = 0
}
var PAGE_SIZE = 16384;
var WASM_PAGE_SIZE = 65536;
var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
function updateGlobalBufferViews() {
    Module["HEAP8"] = HEAP8 = new Int8Array(buffer);
    Module["HEAP16"] = HEAP16 = new Int16Array(buffer);
    Module["HEAP32"] = HEAP32 = new Int32Array(buffer);
    Module["HEAPU8"] = HEAPU8 = new Uint8Array(buffer);
    Module["HEAPU16"] = HEAPU16 = new Uint16Array(buffer);
    Module["HEAPU32"] = HEAPU32 = new Uint32Array(buffer);
    Module["HEAPF32"] = HEAPF32 = new Float32Array(buffer);
    Module["HEAPF64"] = HEAPF64 = new Float64Array(buffer)
}
var STACK_BASE = 5095264
    , STACK_MAX = 10338144
    , DYNAMIC_BASE = 10338144
    , DYNAMICTOP_PTR = 5095232;
assert(STACK_BASE % 16 === 0, "stack must start aligned");
assert(DYNAMIC_BASE % 16 === 0, "heap must start aligned");
var TOTAL_STACK = 5242880;
if (Module["TOTAL_STACK"])
    assert(TOTAL_STACK === Module["TOTAL_STACK"], "the stack size can no longer be determined at runtime");
var INITIAL_TOTAL_MEMORY = Module["TOTAL_MEMORY"] || 1073741824;
if (!Object.getOwnPropertyDescriptor(Module, "TOTAL_MEMORY"))
    Object.defineProperty(Module, "TOTAL_MEMORY", {
        get: function () {
            abort("Module.TOTAL_MEMORY has been replaced with plain INITIAL_TOTAL_MEMORY")
        }
    });
assert(INITIAL_TOTAL_MEMORY >= TOTAL_STACK, "TOTAL_MEMORY should be larger than TOTAL_STACK, was " + INITIAL_TOTAL_MEMORY + "! (TOTAL_STACK=" + TOTAL_STACK + ")");
assert(typeof Int32Array !== "undefined" && typeof Float64Array !== "undefined" && Int32Array.prototype.subarray !== undefined && Int32Array.prototype.set !== undefined, "JS engine does not provide full typed array support");
if (Module["wasmMemory"]) {
    wasmMemory = Module["wasmMemory"]
} else {
    wasmMemory = new WebAssembly.Memory({
        "initial": INITIAL_TOTAL_MEMORY / WASM_PAGE_SIZE,
        "maximum": INITIAL_TOTAL_MEMORY / WASM_PAGE_SIZE
    })
}
if (wasmMemory) {
    buffer = wasmMemory.buffer
}
INITIAL_TOTAL_MEMORY = buffer.byteLength;
assert(INITIAL_TOTAL_MEMORY % WASM_PAGE_SIZE === 0);
updateGlobalBufferViews();
HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;
function writeStackCookie() {
    assert((STACK_MAX & 3) == 0);
    HEAPU32[(STACK_MAX >> 2) - 1] = 34821223;
    HEAPU32[(STACK_MAX >> 2) - 2] = 2310721022
}
function checkStackCookie() {
    var cookie1 = HEAPU32[(STACK_MAX >> 2) - 1];
    var cookie2 = HEAPU32[(STACK_MAX >> 2) - 2];
    if (cookie1 != 34821223 || cookie2 != 2310721022) {
        abort("Stack overflow! Stack cookie has been overwritten, expected hex dwords 0x89BACDFE and 0x02135467, but received 0x" + cookie2.toString(16) + " " + cookie1.toString(16))
    }
    if (HEAP32[0] !== 1668509029)
        abort("Runtime error: The application has corrupted its heap memory area (address zero)!")
}
function abortStackOverflow(allocSize) {
    abort("Stack overflow! Attempted to allocate " + allocSize + " bytes on the stack, but stack has only " + (STACK_MAX - stackSave() + allocSize) + " bytes available!")
}
HEAP32[0] = 1668509029;
HEAP16[1] = 25459;
if (HEAPU8[2] !== 115 || HEAPU8[3] !== 99)
    throw "Runtime error: expected the system to be little-endian!";
function abortFnPtrError(ptr, sig) {
    abort("Invalid function pointer " + ptr + " called with signature '" + sig + "'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this). Build with ASSERTIONS=2 for more info.")
}
function callRuntimeCallbacks(callbacks) {
    while (callbacks.length > 0) {
        var callback = callbacks.shift();
        if (typeof callback == "function") {
            callback();
            continue
        }
        var func = callback.func;
        if (typeof func === "number") {
            if (callback.arg === undefined) {
                Module["dynCall_v"](func)
            } else {
                Module["dynCall_vi"](func, callback.arg)
            }
        } else {
            func(callback.arg === undefined ? null : callback.arg)
        }
    }
}
var __ATPRERUN__ = [];
var __ATINIT__ = [];
var __ATMAIN__ = [];
var __ATPOSTRUN__ = [];
var runtimeInitialized = false;
var runtimeExited = false;
function preRun() {
    if (Module["preRun"]) {
        if (typeof Module["preRun"] == "function")
            Module["preRun"] = [Module["preRun"]];
        while (Module["preRun"].length) {
            addOnPreRun(Module["preRun"].shift())
        }
    }
    callRuntimeCallbacks(__ATPRERUN__)
}
function initRuntime() {
    checkStackCookie();
    assert(!runtimeInitialized);
    runtimeInitialized = true;
    if (!Module["noFSInit"] && !FS.init.initialized)
        FS.init();
    TTY.init();
    callRuntimeCallbacks(__ATINIT__)
}
function preMain() {
    checkStackCookie();
    FS.ignorePermissions = false;
    callRuntimeCallbacks(__ATMAIN__)
}
function exitRuntime() {
    checkStackCookie();
    runtimeExited = true
}
function postRun() {
    checkStackCookie();
    if (Module["postRun"]) {
        if (typeof Module["postRun"] == "function")
            Module["postRun"] = [Module["postRun"]];
        while (Module["postRun"].length) {
            addOnPostRun(Module["postRun"].shift())
        }
    }
    callRuntimeCallbacks(__ATPOSTRUN__)
}
function addOnPreRun(cb) {
    __ATPRERUN__.unshift(cb)
}
function addOnPostRun(cb) {
    __ATPOSTRUN__.unshift(cb)
}
assert(Math.imul, "This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
assert(Math.fround, "This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
assert(Math.clz32, "This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
assert(Math.trunc, "This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_min = Math.min;
var Math_trunc = Math.trunc;
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;
var runDependencyTracking = {};
function getUniqueRunDependency(id) {
    var orig = id;
    while (1) {
        if (!runDependencyTracking[id])
            return id;
        id = orig + Math.random()
    }
    return id
}
function addRunDependency(id) {
    runDependencies++;
    if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies)
    }
    if (id) {
        assert(!runDependencyTracking[id]);
        runDependencyTracking[id] = 1;
        if (runDependencyWatcher === null && typeof setInterval !== "undefined") {
            runDependencyWatcher = setInterval(function () {
                if (ABORT) {
                    clearInterval(runDependencyWatcher);
                    runDependencyWatcher = null;
                    return
                }
                var shown = false;
                for (var dep in runDependencyTracking) {
                    if (!shown) {
                        shown = true;
                        err("still waiting on run dependencies:")
                    }
                    err("dependency: " + dep)
                }
                if (shown) {
                    err("(end of list)")
                }
            }, 1e4)
        }
    } else {
        err("warning: run dependency added without ID")
    }
}
function removeRunDependency(id) {
    runDependencies--;
    if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies)
    }
    if (id) {
        assert(runDependencyTracking[id]);
        delete runDependencyTracking[id]
    } else {
        err("warning: run dependency removed without ID")
    }
    if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
            clearInterval(runDependencyWatcher);
            runDependencyWatcher = null
        }
        if (dependenciesFulfilled) {
            var callback = dependenciesFulfilled;
            dependenciesFulfilled = null;
            callback()
        }
    }
}
Module["preloadedImages"] = {};
Module["preloadedAudios"] = {};
var dataURIPrefix = "data:application/octet-stream;base64,";
function isDataURI(filename) {
    return String.prototype.startsWith ? filename.startsWith(dataURIPrefix) : filename.indexOf(dataURIPrefix) === 0
}
var wasmBinaryFile = "giacwasm.wasm";
if (!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile)
}
function getBinary() {
    try {
        if (wasmBinary) {
            return new Uint8Array(wasmBinary)
        }
        if (readBinary) {
            return readBinary(wasmBinaryFile)
        } else {
            throw "both async and sync fetching of the wasm failed"
        }
    } catch (err) {
        abort(err)
    }
}
function getBinaryPromise() {
    if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && typeof fetch === "function") {
        return fetch(wasmBinaryFile, {
            credentials: "same-origin"
        }).then(function (response) {
            if (!response["ok"]) {
                throw "failed to load wasm binary file at '" + wasmBinaryFile + "'"
            }
            return response["arrayBuffer"]()
        }).catch(function () {
            return getBinary()
        })
    }
    return new Promise(function (resolve, reject) {
        resolve(getBinary())
    }
    )
}
function createWasm(env) {
    var info = {
        "env": env,
        "global": {
            "NaN": NaN,
            Infinity: Infinity
        },
        "global.Math": Math,
        "asm2wasm": asm2wasmImports
    };
    function receiveInstance(instance, module) {
        var exports = instance.exports;
        Module["asm"] = exports;
        removeRunDependency("wasm-instantiate")
    }
    addRunDependency("wasm-instantiate");
    var trueModule = Module;
    function receiveInstantiatedSource(output) {
        assert(Module === trueModule, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");
        trueModule = null;
        receiveInstance(output["instance"])
    }
    function instantiateArrayBuffer(receiver) {
        return getBinaryPromise().then(function (binary) {
            return WebAssembly.instantiate(binary, info)
        }).then(receiver, function (reason) {
            err("failed to asynchronously prepare wasm: " + reason);
            abort(reason)
        })
    }
    function instantiateAsync() {
        if (!wasmBinary && typeof WebAssembly.instantiateStreaming === "function" && !isDataURI(wasmBinaryFile) && typeof fetch === "function") {
            fetch(wasmBinaryFile, {
                credentials: "same-origin"
            }).then(function (response) {
                var result = WebAssembly.instantiateStreaming(response, info);
                return result.then(receiveInstantiatedSource, function (reason) {
                    err("wasm streaming compile failed: " + reason);
                    err("falling back to ArrayBuffer instantiation");
                    instantiateArrayBuffer(receiveInstantiatedSource)
                })
            })
        } else {
            return instantiateArrayBuffer(receiveInstantiatedSource)
        }
    }
    if (Module["instantiateWasm"]) {
        try {
            var exports = Module["instantiateWasm"](info, receiveInstance);
            return exports
        } catch (e) {
            err("Module.instantiateWasm callback failed with error: " + e);
            return false
        }
    }
    instantiateAsync();
    return {}
}
Module["asm"] = function (global, env, providedBuffer) {
    env["memory"] = wasmMemory;
    env["table"] = wasmTable = new WebAssembly.Table({
        "initial": 6599,
        "maximum": 6599,
        "element": "anyfunc"
    });
    env["__memory_base"] = 1024;
    env["__table_base"] = 0;
    var exports = createWasm(env);
    assert(exports, "binaryen setup failed (no wasm support?)");
    return exports
}
    ;
var tempDouble;
var tempI64;
var ASM_CONSTS = [function ($0, $1, $2, $3) {
    var nchannels;
    var nDataBytes;
    var nrate;
    var ptr;
    var data_size;
    nchannels = $0;
    nDataBytes = $1;
    nrate = $2;
    ptr = $3;
    data_size = nDataBytes / 4 / nchannels;
    var audioCtx = new (window.AudioContext || window.webkitAudioContext);
    var SoundArrayBuffer = audioCtx.createBuffer(nchannels, nDataBytes, audioCtx.sampleRate);
    var dataHeap = new Uint8Array(Module.HEAPU8.buffer, ptr, nDataBytes);
    var result = new Float32Array(dataHeap.buffer, dataHeap.byteOffset, nDataBytes / 4);
    var j;
    var i;
    for (j = 0; j < nchannels; j++) {
        var v = SoundArrayBuffer.getChannelData(j);
        for (i = 0; i < data_size; ++i)
            v[i] = result[j * data_size + i]
    }
    var source = audioCtx.createBufferSource();
    source.buffer = SoundArrayBuffer;
    source.connect(audioCtx.destination);
    source.start()
}
    , function () {
        if (Module.worker)
            return 0;
        var ua = window.navigator.userAgent;
        var old_ie = ua.indexOf("MSIE ");
        var new_ie = ua.indexOf("Trident/");
        if (old_ie > -1 || new_ie > -1)
            return 1;
        else
            return 0
    }
    , function ($0, $1, $2) {
        var url = UTF8ToString($0);
        console.log("url:" + url);
        var req = new XMLHttpRequest;
        var bufsize = $2;
        req.open("GET", url, false);
        req.overrideMimeType("text/plain; charset=x-user-defined");
        req.send(null);
        if (req.status === 200) {
            console.log("Réponse reçue: %s", req.responseText);
            var s = req.responseText;
            if (s.length >= bufsize - 1)
                s = s.substr(0, bufsize - 1);
            Module.writeStringToMemory(s, $1)
        } else {
            console.log("Status de la réponse: %d (%s)", req.status, req.statusText);
            Module.writeStringToMemory("ERROR", $1)
        }
    }
    , function ($0) {
        var msg = UTF8ToString($0);
        var tst = prompt(msg, " ");
        if (tst == null)
            return 0;
        return allocate(intArrayFromString(tst), "i8", ALLOC_NORMAL)
    }
    , function ($0) {
        return UI.assistant_matr_maxrows
    }
    , function ($0) {
        return UI.assistant_matr_maxcols
    }
    , function ($0) {
        var s = " ";
        UI.sheet_recompute(s.substr(0, 0));
        UI.open_sheet(true)
    }
    , function ($0, $1, $2) {
        var s = UTF8ToString($0);
        console.log(s);
        UI.sheet_set_ij(s, $1, $2)
    }
    , function ($0) {
        var msg = UTF8ToString($0);
        var tst = prompt(msg, "n");
        if (tst == null)
            return -4;
        if (tst == "next" || tst == "n" || tst == "sst")
            return -1;
        if (tst == "sst_in" || tst == "s")
            return -2;
        if (tst == "cont" || tst == "c")
            return -3;
        if (tst == "kill" || tst == "k")
            return -4;
        if (tst == "break" || tst == "b")
            return -5;
        if (tst == "delete" || tst == "d")
            return -6;
        return allocate(intArrayFromString(tst), "i8", ALLOC_NORMAL)
    }
    , function ($0) {
        if (UI.warnpy) {
            var msg = UTF8ToString($0);
            //alert(msg)
            console.log(msg);
        }
    }
    , function () {
        var hw = window.innerWidth;
        if (typeof svgwidth != "undefined")
            return svgwidth * 1;
        if (hw >= 1e3)
            return 9 * hw / 1e3;
        else
            return hw / 60
    }
    , function () {
        if (typeof UI.disable3d !== "undefined" && UI.disable3d)
            return UI.disable3d;
        if (Module.worker)
            return 1;
        else
            return 0
    }
    , function ($0) {
        var msg = UTF8ToString($0);
        console.log(msg)
    }
    , function ($0, $1) {
        var text = UTF8ToString($0);
        text = text.substr(0, $1);
        UI.add_python_output(text);
        text = UI.clean_for_html(text);
        var tmp = document.getElementById("consolediv");
        if (tmp != null && tmp.style.display != "block") {
            tmp.style.display = "block";
            UI.set_config_width()
        }
        var element = document.getElementById("output");
        if (element != null) {
            element.style.display = "inherit";
            element.innerHTML += text;
            element.scrollTop = 99999
        }
    }
    , function ($0) {
        var msg = UTF8ToString($0);
        UI.python_output += msg
    }
];
function _emscripten_asm_const_i(code) {
    return ASM_CONSTS[code]()
}
function _emscripten_asm_const_d(code) {
    return ASM_CONSTS[code]()
}
function _emscripten_asm_const_ii(code, a0) {
    return ASM_CONSTS[code](a0)
}
function _emscripten_asm_const_iiiii(code, a0, a1, a2, a3) {
    return ASM_CONSTS[code](a0, a1, a2, a3)
}
function _emscripten_asm_const_iiii(code, a0, a1, a2) {
    return ASM_CONSTS[code](a0, a1, a2)
}
function _emscripten_asm_const_iii(code, a0, a1) {
    return ASM_CONSTS[code](a0, a1)
}
__ATINIT__.push({
    func: function () {
        globalCtors()
    }
});
var tempDoublePtr = 5095248;
assert(tempDoublePtr % 8 == 0);
function demangle(func) {
    warnOnce("warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling");
    return func
}
function demangleAll(text) {
    var regex = /__Z[\w\d_]+/g;
    return text.replace(regex, function (x) {
        var y = demangle(x);
        return x === y ? x : y + " [" + x + "]"
    })
}
function jsStackTrace() {
    var err = new Error;
    if (!err.stack) {
        try {
            throw new Error(0)
        } catch (e) {
            err = e
        }
        if (!err.stack) {
            return "(no stack trace available)"
        }
    }
    return err.stack.toString()
}
function stackTrace() {
    var js = jsStackTrace();
    if (Module["extraStackTrace"])
        js += "\n" + Module["extraStackTrace"]();
    return demangleAll(js)
}
function ___setErrNo(value) {
    if (Module["___errno_location"])
        HEAP32[Module["___errno_location"]() >> 2] = value;
    else
        err("failed to set errno from JS");
    return value
}
var PATH = {
    splitPath: function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1)
    },
    normalizeArray: function (parts, allowAboveRoot) {
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
            var last = parts[i];
            if (last === ".") {
                parts.splice(i, 1)
            } else if (last === "..") {
                parts.splice(i, 1);
                up++
            } else if (up) {
                parts.splice(i, 1);
                up--
            }
        }
        if (allowAboveRoot) {
            for (; up; up--) {
                parts.unshift("..")
            }
        }
        return parts
    },
    normalize: function (path) {
        var isAbsolute = path.charAt(0) === "/"
            , trailingSlash = path.substr(-1) === "/";
        path = PATH.normalizeArray(path.split("/").filter(function (p) {
            return !!p
        }), !isAbsolute).join("/");
        if (!path && !isAbsolute) {
            path = "."
        }
        if (path && trailingSlash) {
            path += "/"
        }
        return (isAbsolute ? "/" : "") + path
    },
    dirname: function (path) {
        var result = PATH.splitPath(path)
            , root = result[0]
            , dir = result[1];
        if (!root && !dir) {
            return "."
        }
        if (dir) {
            dir = dir.substr(0, dir.length - 1)
        }
        return root + dir
    },
    basename: function (path) {
        if (path === "/")
            return "/";
        var lastSlash = path.lastIndexOf("/");
        if (lastSlash === -1)
            return path;
        return path.substr(lastSlash + 1)
    },
    extname: function (path) {
        return PATH.splitPath(path)[3]
    },
    join: function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join("/"))
    },
    join2: function (l, r) {
        return PATH.normalize(l + "/" + r)
    }
};
var PATH_FS = {
    resolve: function () {
        var resolvedPath = ""
            , resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            var path = i >= 0 ? arguments[i] : FS.cwd();
            if (typeof path !== "string") {
                throw new TypeError("Arguments to path.resolve must be strings")
            } else if (!path) {
                return ""
            }
            resolvedPath = path + "/" + resolvedPath;
            resolvedAbsolute = path.charAt(0) === "/"
        }
        resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(function (p) {
            return !!p
        }), !resolvedAbsolute).join("/");
        return (resolvedAbsolute ? "/" : "") + resolvedPath || "."
    },
    relative: function (from, to) {
        from = PATH_FS.resolve(from).substr(1);
        to = PATH_FS.resolve(to).substr(1);
        function trim(arr) {
            var start = 0;
            for (; start < arr.length; start++) {
                if (arr[start] !== "")
                    break
            }
            var end = arr.length - 1;
            for (; end >= 0; end--) {
                if (arr[end] !== "")
                    break
            }
            if (start > end)
                return [];
            return arr.slice(start, end - start + 1)
        }
        var fromParts = trim(from.split("/"));
        var toParts = trim(to.split("/"));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
            if (fromParts[i] !== toParts[i]) {
                samePartsLength = i;
                break
            }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
            outputParts.push("..")
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join("/")
    }
};
var TTY = {
    ttys: [],
    init: function () { },
    shutdown: function () { },
    register: function (dev, ops) {
        TTY.ttys[dev] = {
            input: [],
            output: [],
            ops: ops
        };
        FS.registerDevice(dev, TTY.stream_ops)
    },
    stream_ops: {
        open: function (stream) {
            var tty = TTY.ttys[stream.node.rdev];
            if (!tty) {
                throw new FS.ErrnoError(19)
            }
            stream.tty = tty;
            stream.seekable = false
        },
        close: function (stream) {
            stream.tty.ops.flush(stream.tty)
        },
        flush: function (stream) {
            stream.tty.ops.flush(stream.tty)
        },
        read: function (stream, buffer, offset, length, pos) {
            if (!stream.tty || !stream.tty.ops.get_char) {
                throw new FS.ErrnoError(6)
            }
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
                var result;
                try {
                    result = stream.tty.ops.get_char(stream.tty)
                } catch (e) {
                    throw new FS.ErrnoError(5)
                }
                if (result === undefined && bytesRead === 0) {
                    throw new FS.ErrnoError(11)
                }
                if (result === null || result === undefined)
                    break;
                bytesRead++;
                buffer[offset + i] = result
            }
            if (bytesRead) {
                stream.node.timestamp = Date.now()
            }
            return bytesRead
        },
        write: function (stream, buffer, offset, length, pos) {
            if (!stream.tty || !stream.tty.ops.put_char) {
                throw new FS.ErrnoError(6)
            }
            try {
                for (var i = 0; i < length; i++) {
                    stream.tty.ops.put_char(stream.tty, buffer[offset + i])
                }
            } catch (e) {
                throw new FS.ErrnoError(5)
            }
            if (length) {
                stream.node.timestamp = Date.now()
            }
            return i
        }
    },
    default_tty_ops: {
        get_char: function (tty) {
            if (!tty.input.length) {
                var result = null;
                if (ENVIRONMENT_IS_NODE) {
                    var BUFSIZE = 256;
                    var buf = Buffer.alloc ? Buffer.alloc(BUFSIZE) : new Buffer(BUFSIZE);
                    var bytesRead = 0;
                    var isPosixPlatform = process.platform != "win32";
                    var fd = process.stdin.fd;
                    if (isPosixPlatform) {
                        var usingDevice = false;
                        try {
                            fd = fs.openSync("/dev/stdin", "r");
                            usingDevice = true
                        } catch (e) { }
                    }
                    try {
                        bytesRead = fs.readSync(fd, buf, 0, BUFSIZE, null)
                    } catch (e) {
                        if (e.toString().indexOf("EOF") != -1)
                            bytesRead = 0;
                        else
                            throw e
                    }
                    if (usingDevice) {
                        fs.closeSync(fd)
                    }
                    if (bytesRead > 0) {
                        result = buf.slice(0, bytesRead).toString("utf-8")
                    } else {
                        result = null
                    }
                } else if (typeof window != "undefined" && typeof window.prompt == "function") {
                    result = window.prompt("Input: ");
                    if (result !== null) {
                        result += "\n"
                    }
                } else if (typeof readline == "function") {
                    result = readline();
                    if (result !== null) {
                        result += "\n"
                    }
                }
                if (!result) {
                    return null
                }
                tty.input = intArrayFromString(result, true)
            }
            return tty.input.shift()
        },
        put_char: function (tty, val) {
            if (val === null || val === 10) {
                out(UTF8ArrayToString(tty.output, 0));
                tty.output = []
            } else {
                if (val != 0)
                    tty.output.push(val)
            }
        },
        flush: function (tty) {
            if (tty.output && tty.output.length > 0) {
                out(UTF8ArrayToString(tty.output, 0));
                tty.output = []
            }
        }
    },
    default_tty1_ops: {
        put_char: function (tty, val) {
            if (val === null || val === 10) {
                err(UTF8ArrayToString(tty.output, 0));
                tty.output = []
            } else {
                if (val != 0)
                    tty.output.push(val)
            }
        },
        flush: function (tty) {
            if (tty.output && tty.output.length > 0) {
                err(UTF8ArrayToString(tty.output, 0));
                tty.output = []
            }
        }
    }
};
var MEMFS = {
    ops_table: null,
    mount: function (mount) {
        return MEMFS.createNode(null, "/", 16384 | 511, 0)
    },
    createNode: function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
            throw new FS.ErrnoError(1)
        }
        if (!MEMFS.ops_table) {
            MEMFS.ops_table = {
                dir: {
                    node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr,
                        lookup: MEMFS.node_ops.lookup,
                        mknod: MEMFS.node_ops.mknod,
                        rename: MEMFS.node_ops.rename,
                        unlink: MEMFS.node_ops.unlink,
                        rmdir: MEMFS.node_ops.rmdir,
                        readdir: MEMFS.node_ops.readdir,
                        symlink: MEMFS.node_ops.symlink
                    },
                    stream: {
                        llseek: MEMFS.stream_ops.llseek
                    }
                },
                file: {
                    node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr
                    },
                    stream: {
                        llseek: MEMFS.stream_ops.llseek,
                        read: MEMFS.stream_ops.read,
                        write: MEMFS.stream_ops.write,
                        allocate: MEMFS.stream_ops.allocate,
                        mmap: MEMFS.stream_ops.mmap,
                        msync: MEMFS.stream_ops.msync
                    }
                },
                link: {
                    node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr,
                        readlink: MEMFS.node_ops.readlink
                    },
                    stream: {}
                },
                chrdev: {
                    node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr
                    },
                    stream: FS.chrdev_stream_ops
                }
            }
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
            node.node_ops = MEMFS.ops_table.dir.node;
            node.stream_ops = MEMFS.ops_table.dir.stream;
            node.contents = {}
        } else if (FS.isFile(node.mode)) {
            node.node_ops = MEMFS.ops_table.file.node;
            node.stream_ops = MEMFS.ops_table.file.stream;
            node.usedBytes = 0;
            node.contents = null
        } else if (FS.isLink(node.mode)) {
            node.node_ops = MEMFS.ops_table.link.node;
            node.stream_ops = MEMFS.ops_table.link.stream
        } else if (FS.isChrdev(node.mode)) {
            node.node_ops = MEMFS.ops_table.chrdev.node;
            node.stream_ops = MEMFS.ops_table.chrdev.stream
        }
        node.timestamp = Date.now();
        if (parent) {
            parent.contents[name] = node
        }
        return node
    },
    getFileDataAsRegularArray: function (node) {
        if (node.contents && node.contents.subarray) {
            var arr = [];
            for (var i = 0; i < node.usedBytes; ++i)
                arr.push(node.contents[i]);
            return arr
        }
        return node.contents
    },
    getFileDataAsTypedArray: function (node) {
        if (!node.contents)
            return new Uint8Array;
        if (node.contents.subarray)
            return node.contents.subarray(0, node.usedBytes);
        return new Uint8Array(node.contents)
    },
    expandFileStorage: function (node, newCapacity) {
        var prevCapacity = node.contents ? node.contents.length : 0;
        if (prevCapacity >= newCapacity)
            return;
        var CAPACITY_DOUBLING_MAX = 1024 * 1024;
        newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) | 0);
        if (prevCapacity != 0)
            newCapacity = Math.max(newCapacity, 256);
        var oldContents = node.contents;
        node.contents = new Uint8Array(newCapacity);
        if (node.usedBytes > 0)
            node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
        return
    },
    resizeFileStorage: function (node, newSize) {
        if (node.usedBytes == newSize)
            return;
        if (newSize == 0) {
            node.contents = null;
            node.usedBytes = 0;
            return
        }
        if (!node.contents || node.contents.subarray) {
            var oldContents = node.contents;
            node.contents = new Uint8Array(new ArrayBuffer(newSize));
            if (oldContents) {
                node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)))
            }
            node.usedBytes = newSize;
            return
        }
        if (!node.contents)
            node.contents = [];
        if (node.contents.length > newSize)
            node.contents.length = newSize;
        else
            while (node.contents.length < newSize)
                node.contents.push(0);
        node.usedBytes = newSize
    },
    node_ops: {
        getattr: function (node) {
            var attr = {};
            attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
            attr.ino = node.id;
            attr.mode = node.mode;
            attr.nlink = 1;
            attr.uid = 0;
            attr.gid = 0;
            attr.rdev = node.rdev;
            if (FS.isDir(node.mode)) {
                attr.size = 4096
            } else if (FS.isFile(node.mode)) {
                attr.size = node.usedBytes
            } else if (FS.isLink(node.mode)) {
                attr.size = node.link.length
            } else {
                attr.size = 0
            }
            attr.atime = new Date(node.timestamp);
            attr.mtime = new Date(node.timestamp);
            attr.ctime = new Date(node.timestamp);
            attr.blksize = 4096;
            attr.blocks = Math.ceil(attr.size / attr.blksize);
            return attr
        },
        setattr: function (node, attr) {
            if (attr.mode !== undefined) {
                node.mode = attr.mode
            }
            if (attr.timestamp !== undefined) {
                node.timestamp = attr.timestamp
            }
            if (attr.size !== undefined) {
                MEMFS.resizeFileStorage(node, attr.size)
            }
        },
        lookup: function (parent, name) {
            throw FS.genericErrors[2]
        },
        mknod: function (parent, name, mode, dev) {
            return MEMFS.createNode(parent, name, mode, dev)
        },
        rename: function (old_node, new_dir, new_name) {
            if (FS.isDir(old_node.mode)) {
                var new_node;
                try {
                    new_node = FS.lookupNode(new_dir, new_name)
                } catch (e) { }
                if (new_node) {
                    for (var i in new_node.contents) {
                        throw new FS.ErrnoError(39)
                    }
                }
            }
            delete old_node.parent.contents[old_node.name];
            old_node.name = new_name;
            new_dir.contents[new_name] = old_node;
            old_node.parent = new_dir
        },
        unlink: function (parent, name) {
            delete parent.contents[name]
        },
        rmdir: function (parent, name) {
            var node = FS.lookupNode(parent, name);
            for (var i in node.contents) {
                throw new FS.ErrnoError(39)
            }
            delete parent.contents[name]
        },
        readdir: function (node) {
            var entries = [".", ".."];
            for (var key in node.contents) {
                if (!node.contents.hasOwnProperty(key)) {
                    continue
                }
                entries.push(key)
            }
            return entries
        },
        symlink: function (parent, newname, oldpath) {
            var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
            node.link = oldpath;
            return node
        },
        readlink: function (node) {
            if (!FS.isLink(node.mode)) {
                throw new FS.ErrnoError(22)
            }
            return node.link
        }
    },
    stream_ops: {
        read: function (stream, buffer, offset, length, position) {
            var contents = stream.node.contents;
            if (position >= stream.node.usedBytes)
                return 0;
            var size = Math.min(stream.node.usedBytes - position, length);
            assert(size >= 0);
            if (size > 8 && contents.subarray) {
                buffer.set(contents.subarray(position, position + size), offset)
            } else {
                for (var i = 0; i < size; i++)
                    buffer[offset + i] = contents[position + i]
            }
            return size
        },
        write: function (stream, buffer, offset, length, position, canOwn) {
            if (!length)
                return 0;
            var node = stream.node;
            node.timestamp = Date.now();
            if (buffer.subarray && (!node.contents || node.contents.subarray)) {
                if (canOwn) {
                    assert(position === 0, "canOwn must imply no weird position inside the file");
                    node.contents = buffer.subarray(offset, offset + length);
                    node.usedBytes = length;
                    return length
                } else if (node.usedBytes === 0 && position === 0) {
                    node.contents = new Uint8Array(buffer.subarray(offset, offset + length));
                    node.usedBytes = length;
                    return length
                } else if (position + length <= node.usedBytes) {
                    node.contents.set(buffer.subarray(offset, offset + length), position);
                    return length
                }
            }
            MEMFS.expandFileStorage(node, position + length);
            if (node.contents.subarray && buffer.subarray)
                node.contents.set(buffer.subarray(offset, offset + length), position);
            else {
                for (var i = 0; i < length; i++) {
                    node.contents[position + i] = buffer[offset + i]
                }
            }
            node.usedBytes = Math.max(node.usedBytes, position + length);
            return length
        },
        llseek: function (stream, offset, whence) {
            var position = offset;
            if (whence === 1) {
                position += stream.position
            } else if (whence === 2) {
                if (FS.isFile(stream.node.mode)) {
                    position += stream.node.usedBytes
                }
            }
            if (position < 0) {
                throw new FS.ErrnoError(22)
            }
            return position
        },
        allocate: function (stream, offset, length) {
            MEMFS.expandFileStorage(stream.node, offset + length);
            stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length)
        },
        mmap: function (stream, buffer, offset, length, position, prot, flags) {
            if (!FS.isFile(stream.node.mode)) {
                throw new FS.ErrnoError(19)
            }
            var ptr;
            var allocated;
            var contents = stream.node.contents;
            if (!(flags & 2) && (contents.buffer === buffer || contents.buffer === buffer.buffer)) {
                allocated = false;
                ptr = contents.byteOffset
            } else {
                if (position > 0 || position + length < stream.node.usedBytes) {
                    if (contents.subarray) {
                        contents = contents.subarray(position, position + length)
                    } else {
                        contents = Array.prototype.slice.call(contents, position, position + length)
                    }
                }
                allocated = true;
                var fromHeap = buffer.buffer == HEAP8.buffer;
                ptr = _malloc(length);
                if (!ptr) {
                    throw new FS.ErrnoError(12)
                }
                (fromHeap ? HEAP8 : buffer).set(contents, ptr)
            }
            return {
                ptr: ptr,
                allocated: allocated
            }
        },
        msync: function (stream, buffer, offset, length, mmapFlags) {
            if (!FS.isFile(stream.node.mode)) {
                throw new FS.ErrnoError(19)
            }
            if (mmapFlags & 2) {
                return 0
            }
            var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
            return 0
        }
    }
};
var IDBFS = {
    dbs: {},
    indexedDB: function () {
        if (typeof indexedDB !== "undefined")
            return indexedDB;
        var ret = null;
        if (typeof window === "object")
            ret = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        assert(ret, "IDBFS used, but indexedDB not supported");
        return ret
    },
    DB_VERSION: 21,
    DB_STORE_NAME: "FILE_DATA",
    mount: function (mount) {
        return MEMFS.mount.apply(null, arguments)
    },
    syncfs: function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function (err, local) {
            if (err)
                return callback(err);
            IDBFS.getRemoteSet(mount, function (err, remote) {
                if (err)
                    return callback(err);
                var src = populate ? remote : local;
                var dst = populate ? local : remote;
                IDBFS.reconcile(src, dst, callback)
            })
        })
    },
    getDB: function (name, callback) {
        var db = IDBFS.dbs[name];
        if (db) {
            return callback(null, db)
        }
        var req;
        try {
            req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION)
        } catch (e) {
            return callback(e)
        }
        if (!req) {
            return callback("Unable to connect to IndexedDB")
        }
        req.onupgradeneeded = function (e) {
            var db = e.target.result;
            var transaction = e.target.transaction;
            var fileStore;
            if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
                fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME)
            } else {
                fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME)
            }
            if (!fileStore.indexNames.contains("timestamp")) {
                fileStore.createIndex("timestamp", "timestamp", {
                    unique: false
                })
            }
        }
            ;
        req.onsuccess = function () {
            db = req.result;
            IDBFS.dbs[name] = db;
            callback(null, db)
        }
            ;
        req.onerror = function (e) {
            callback(this.error);
            e.preventDefault()
        }
    },
    getLocalSet: function (mount, callback) {
        var entries = {};
        function isRealDir(p) {
            return p !== "." && p !== ".."
        }
        function toAbsolute(root) {
            return function (p) {
                return PATH.join2(root, p)
            }
        }
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
        while (check.length) {
            var path = check.pop();
            var stat;
            try {
                stat = FS.stat(path)
            } catch (e) {
                return callback(e)
            }
            if (FS.isDir(stat.mode)) {
                check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)))
            }
            entries[path] = {
                timestamp: stat.mtime
            }
        }
        return callback(null, {
            type: "local",
            entries: entries
        })
    },
    getRemoteSet: function (mount, callback) {
        var entries = {};
        IDBFS.getDB(mount.mountpoint, function (err, db) {
            if (err)
                return callback(err);
            try {
                var transaction = db.transaction([IDBFS.DB_STORE_NAME], "readonly");
                transaction.onerror = function (e) {
                    callback(this.error);
                    e.preventDefault()
                }
                    ;
                var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
                var index = store.index("timestamp");
                index.openKeyCursor().onsuccess = function (event) {
                    var cursor = event.target.result;
                    if (!cursor) {
                        return callback(null, {
                            type: "remote",
                            db: db,
                            entries: entries
                        })
                    }
                    entries[cursor.primaryKey] = {
                        timestamp: cursor.key
                    };
                    cursor.continue()
                }
            } catch (e) {
                return callback(e)
            }
        })
    },
    loadLocalEntry: function (path, callback) {
        var stat, node;
        try {
            var lookup = FS.lookupPath(path);
            node = lookup.node;
            stat = FS.stat(path)
        } catch (e) {
            return callback(e)
        }
        if (FS.isDir(stat.mode)) {
            return callback(null, {
                timestamp: stat.mtime,
                mode: stat.mode
            })
        } else if (FS.isFile(stat.mode)) {
            node.contents = MEMFS.getFileDataAsTypedArray(node);
            return callback(null, {
                timestamp: stat.mtime,
                mode: stat.mode,
                contents: node.contents
            })
        } else {
            return callback(new Error("node type not supported"))
        }
    },
    storeLocalEntry: function (path, entry, callback) {
        try {
            if (FS.isDir(entry.mode)) {
                FS.mkdir(path, entry.mode)
            } else if (FS.isFile(entry.mode)) {
                FS.writeFile(path, entry.contents, {
                    canOwn: true
                })
            } else {
                return callback(new Error("node type not supported"))
            }
            FS.chmod(path, entry.mode);
            FS.utime(path, entry.timestamp, entry.timestamp)
        } catch (e) {
            return callback(e)
        }
        callback(null)
    },
    removeLocalEntry: function (path, callback) {
        try {
            var lookup = FS.lookupPath(path);
            var stat = FS.stat(path);
            if (FS.isDir(stat.mode)) {
                FS.rmdir(path)
            } else if (FS.isFile(stat.mode)) {
                FS.unlink(path)
            }
        } catch (e) {
            return callback(e)
        }
        callback(null)
    },
    loadRemoteEntry: function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function (event) {
            callback(null, event.target.result)
        }
            ;
        req.onerror = function (e) {
            callback(this.error);
            e.preventDefault()
        }
    },
    storeRemoteEntry: function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function () {
            callback(null)
        }
            ;
        req.onerror = function (e) {
            callback(this.error);
            e.preventDefault()
        }
    },
    removeRemoteEntry: function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function () {
            callback(null)
        }
            ;
        req.onerror = function (e) {
            callback(this.error);
            e.preventDefault()
        }
    },
    reconcile: function (src, dst, callback) {
        var total = 0;
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
            var e = src.entries[key];
            var e2 = dst.entries[key];
            if (!e2 || e.timestamp > e2.timestamp) {
                create.push(key);
                total++
            }
        });
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
            var e = dst.entries[key];
            var e2 = src.entries[key];
            if (!e2) {
                remove.push(key);
                total++
            }
        });
        if (!total) {
            return callback(null)
        }
        var errored = false;
        var db = src.type === "remote" ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], "readwrite");
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
        function done(err) {
            if (err && !errored) {
                errored = true;
                return callback(err)
            }
        }
        transaction.onerror = function (e) {
            done(this.error);
            e.preventDefault()
        }
            ;
        transaction.oncomplete = function (e) {
            if (!errored) {
                callback(null)
            }
        }
            ;
        create.sort().forEach(function (path) {
            if (dst.type === "local") {
                IDBFS.loadRemoteEntry(store, path, function (err, entry) {
                    if (err)
                        return done(err);
                    IDBFS.storeLocalEntry(path, entry, done)
                })
            } else {
                IDBFS.loadLocalEntry(path, function (err, entry) {
                    if (err)
                        return done(err);
                    IDBFS.storeRemoteEntry(store, path, entry, done)
                })
            }
        });
        remove.sort().reverse().forEach(function (path) {
            if (dst.type === "local") {
                IDBFS.removeLocalEntry(path, done)
            } else {
                IDBFS.removeRemoteEntry(store, path, done)
            }
        })
    }
};
var NODEFS = {
    isWindows: false,
    staticInit: function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
        var flags = process["binding"]("constants");
        if (flags["fs"]) {
            flags = flags["fs"]
        }
        NODEFS.flagsForNodeMap = {
            1024: flags["O_APPEND"],
            64: flags["O_CREAT"],
            128: flags["O_EXCL"],
            0: flags["O_RDONLY"],
            2: flags["O_RDWR"],
            4096: flags["O_SYNC"],
            512: flags["O_TRUNC"],
            1: flags["O_WRONLY"]
        }
    },
    bufferFrom: function (arrayBuffer) {
        return Buffer.alloc ? Buffer.from(arrayBuffer) : new Buffer(arrayBuffer)
    },
    mount: function (mount) {
        assert(ENVIRONMENT_HAS_NODE);
        return NODEFS.createNode(null, "/", NODEFS.getMode(mount.opts.root), 0)
    },
    createNode: function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
            throw new FS.ErrnoError(22)
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node
    },
    getMode: function (path) {
        var stat;
        try {
            stat = fs.lstatSync(path);
            if (NODEFS.isWindows) {
                stat.mode = stat.mode | (stat.mode & 292) >> 2
            }
        } catch (e) {
            if (!e.code)
                throw e;
            throw new FS.ErrnoError(-e.errno)
        }
        return stat.mode
    },
    realPath: function (node) {
        var parts = [];
        while (node.parent !== node) {
            parts.push(node.name);
            node = node.parent
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts)
    },
    flagsForNode: function (flags) {
        flags &= ~2097152;
        flags &= ~2048;
        flags &= ~32768;
        flags &= ~524288;
        var newFlags = 0;
        for (var k in NODEFS.flagsForNodeMap) {
            if (flags & k) {
                newFlags |= NODEFS.flagsForNodeMap[k];
                flags ^= k
            }
        }
        if (!flags) {
            return newFlags
        } else {
            throw new FS.ErrnoError(22)
        }
    },
    node_ops: {
        getattr: function (node) {
            var path = NODEFS.realPath(node);
            var stat;
            try {
                stat = fs.lstatSync(path)
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(-e.errno)
            }
            if (NODEFS.isWindows && !stat.blksize) {
                stat.blksize = 4096
            }
            if (NODEFS.isWindows && !stat.blocks) {
                stat.blocks = (stat.size + stat.blksize - 1) / stat.blksize | 0
            }
            return {
                dev: stat.dev,
                ino: stat.ino,
                mode: stat.mode,
                nlink: stat.nlink,
                uid: stat.uid,
                gid: stat.gid,
                rdev: stat.rdev,
                size: stat.size,
                atime: stat.atime,
                mtime: stat.mtime,
                ctime: stat.ctime,
                blksize: stat.blksize,
                blocks: stat.blocks
            }
        },
        setattr: function (node, attr) {
            var path = NODEFS.realPath(node);
            try {
                if (attr.mode !== undefined) {
                    fs.chmodSync(path, attr.mode);
                    node.mode = attr.mode
                }
                if (attr.timestamp !== undefined) {
                    var date = new Date(attr.timestamp);
                    fs.utimesSync(path, date, date)
                }
                if (attr.size !== undefined) {
                    fs.truncateSync(path, attr.size)
                }
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(-e.errno)
            }
        },
        lookup: function (parent, name) {
            var path = PATH.join2(NODEFS.realPath(parent), name);
            var mode = NODEFS.getMode(path);
            return NODEFS.createNode(parent, name, mode)
        },
        mknod: function (parent, name, mode, dev) {
            var node = NODEFS.createNode(parent, name, mode, dev);
            var path = NODEFS.realPath(node);
            try {
                if (FS.isDir(node.mode)) {
                    fs.mkdirSync(path, node.mode)
                } else {
                    fs.writeFileSync(path, "", {
                        mode: node.mode
                    })
                }
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(-e.errno)
            }
            return node
        },
        rename: function (oldNode, newDir, newName) {
            var oldPath = NODEFS.realPath(oldNode);
            var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
            try {
                fs.renameSync(oldPath, newPath)
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(-e.errno)
            }
        },
        unlink: function (parent, name) {
            var path = PATH.join2(NODEFS.realPath(parent), name);
            try {
                fs.unlinkSync(path)
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(-e.errno)
            }
        },
        rmdir: function (parent, name) {
            var path = PATH.join2(NODEFS.realPath(parent), name);
            try {
                fs.rmdirSync(path)
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(-e.errno)
            }
        },
        readdir: function (node) {
            var path = NODEFS.realPath(node);
            try {
                return fs.readdirSync(path)
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(-e.errno)
            }
        },
        symlink: function (parent, newName, oldPath) {
            var newPath = PATH.join2(NODEFS.realPath(parent), newName);
            try {
                fs.symlinkSync(oldPath, newPath)
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(-e.errno)
            }
        },
        readlink: function (node) {
            var path = NODEFS.realPath(node);
            try {
                path = fs.readlinkSync(path);
                path = NODEJS_PATH.relative(NODEJS_PATH.resolve(node.mount.opts.root), path);
                return path
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(-e.errno)
            }
        }
    },
    stream_ops: {
        open: function (stream) {
            var path = NODEFS.realPath(stream.node);
            try {
                if (FS.isFile(stream.node.mode)) {
                    stream.nfd = fs.openSync(path, NODEFS.flagsForNode(stream.flags))
                }
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(-e.errno)
            }
        },
        close: function (stream) {
            try {
                if (FS.isFile(stream.node.mode) && stream.nfd) {
                    fs.closeSync(stream.nfd)
                }
            } catch (e) {
                if (!e.code)
                    throw e;
                throw new FS.ErrnoError(-e.errno)
            }
        },
        read: function (stream, buffer, offset, length, position) {
            if (length === 0)
                return 0;
            try {
                return fs.readSync(stream.nfd, NODEFS.bufferFrom(buffer.buffer), offset, length, position)
            } catch (e) {
                throw new FS.ErrnoError(-e.errno)
            }
        },
        write: function (stream, buffer, offset, length, position) {
            try {
                return fs.writeSync(stream.nfd, NODEFS.bufferFrom(buffer.buffer), offset, length, position)
            } catch (e) {
                throw new FS.ErrnoError(-e.errno)
            }
        },
        llseek: function (stream, offset, whence) {
            var position = offset;
            if (whence === 1) {
                position += stream.position
            } else if (whence === 2) {
                if (FS.isFile(stream.node.mode)) {
                    try {
                        var stat = fs.fstatSync(stream.nfd);
                        position += stat.size
                    } catch (e) {
                        throw new FS.ErrnoError(-e.errno)
                    }
                }
            }
            if (position < 0) {
                throw new FS.ErrnoError(22)
            }
            return position
        }
    }
};
var WORKERFS = {
    DIR_MODE: 16895,
    FILE_MODE: 33279,
    reader: null,
    mount: function (mount) {
        assert(ENVIRONMENT_IS_WORKER);
        if (!WORKERFS.reader)
            WORKERFS.reader = new FileReaderSync;
        var root = WORKERFS.createNode(null, "/", WORKERFS.DIR_MODE, 0);
        var createdParents = {};
        function ensureParent(path) {
            var parts = path.split("/");
            var parent = root;
            for (var i = 0; i < parts.length - 1; i++) {
                var curr = parts.slice(0, i + 1).join("/");
                if (!createdParents[curr]) {
                    createdParents[curr] = WORKERFS.createNode(parent, parts[i], WORKERFS.DIR_MODE, 0)
                }
                parent = createdParents[curr]
            }
            return parent
        }
        function base(path) {
            var parts = path.split("/");
            return parts[parts.length - 1]
        }
        Array.prototype.forEach.call(mount.opts["files"] || [], function (file) {
            WORKERFS.createNode(ensureParent(file.name), base(file.name), WORKERFS.FILE_MODE, 0, file, file.lastModifiedDate)
        });
        (mount.opts["blobs"] || []).forEach(function (obj) {
            WORKERFS.createNode(ensureParent(obj["name"]), base(obj["name"]), WORKERFS.FILE_MODE, 0, obj["data"])
        });
        (mount.opts["packages"] || []).forEach(function (pack) {
            pack["metadata"].files.forEach(function (file) {
                var name = file.filename.substr(1);
                WORKERFS.createNode(ensureParent(name), base(name), WORKERFS.FILE_MODE, 0, pack["blob"].slice(file.start, file.end))
            })
        });
        return root
    },
    createNode: function (parent, name, mode, dev, contents, mtime) {
        var node = FS.createNode(parent, name, mode);
        node.mode = mode;
        node.node_ops = WORKERFS.node_ops;
        node.stream_ops = WORKERFS.stream_ops;
        node.timestamp = (mtime || new Date).getTime();
        assert(WORKERFS.FILE_MODE !== WORKERFS.DIR_MODE);
        if (mode === WORKERFS.FILE_MODE) {
            node.size = contents.size;
            node.contents = contents
        } else {
            node.size = 4096;
            node.contents = {}
        }
        if (parent) {
            parent.contents[name] = node
        }
        return node
    },
    node_ops: {
        getattr: function (node) {
            return {
                dev: 1,
                ino: undefined,
                mode: node.mode,
                nlink: 1,
                uid: 0,
                gid: 0,
                rdev: undefined,
                size: node.size,
                atime: new Date(node.timestamp),
                mtime: new Date(node.timestamp),
                ctime: new Date(node.timestamp),
                blksize: 4096,
                blocks: Math.ceil(node.size / 4096)
            }
        },
        setattr: function (node, attr) {
            if (attr.mode !== undefined) {
                node.mode = attr.mode
            }
            if (attr.timestamp !== undefined) {
                node.timestamp = attr.timestamp
            }
        },
        lookup: function (parent, name) {
            throw new FS.ErrnoError(2)
        },
        mknod: function (parent, name, mode, dev) {
            throw new FS.ErrnoError(1)
        },
        rename: function (oldNode, newDir, newName) {
            throw new FS.ErrnoError(1)
        },
        unlink: function (parent, name) {
            throw new FS.ErrnoError(1)
        },
        rmdir: function (parent, name) {
            throw new FS.ErrnoError(1)
        },
        readdir: function (node) {
            var entries = [".", ".."];
            for (var key in node.contents) {
                if (!node.contents.hasOwnProperty(key)) {
                    continue
                }
                entries.push(key)
            }
            return entries
        },
        symlink: function (parent, newName, oldPath) {
            throw new FS.ErrnoError(1)
        },
        readlink: function (node) {
            throw new FS.ErrnoError(1)
        }
    },
    stream_ops: {
        read: function (stream, buffer, offset, length, position) {
            if (position >= stream.node.size)
                return 0;
            var chunk = stream.node.contents.slice(position, position + length);
            var ab = WORKERFS.reader.readAsArrayBuffer(chunk);
            buffer.set(new Uint8Array(ab), offset);
            return chunk.size
        },
        write: function (stream, buffer, offset, length, position) {
            throw new FS.ErrnoError(5)
        },
        llseek: function (stream, offset, whence) {
            var position = offset;
            if (whence === 1) {
                position += stream.position
            } else if (whence === 2) {
                if (FS.isFile(stream.node.mode)) {
                    position += stream.node.size
                }
            }
            if (position < 0) {
                throw new FS.ErrnoError(22)
            }
            return position
        }
    }
};
var ERRNO_MESSAGES = {
    0: "Success",
    1: "Not super-user",
    2: "No such file or directory",
    3: "No such process",
    4: "Interrupted system call",
    5: "I/O error",
    6: "No such device or address",
    7: "Arg list too long",
    8: "Exec format error",
    9: "Bad file number",
    10: "No children",
    11: "No more processes",
    12: "Not enough core",
    13: "Permission denied",
    14: "Bad address",
    15: "Block device required",
    16: "Mount device busy",
    17: "File exists",
    18: "Cross-device link",
    19: "No such device",
    20: "Not a directory",
    21: "Is a directory",
    22: "Invalid argument",
    23: "Too many open files in system",
    24: "Too many open files",
    25: "Not a typewriter",
    26: "Text file busy",
    27: "File too large",
    28: "No space left on device",
    29: "Illegal seek",
    30: "Read only file system",
    31: "Too many links",
    32: "Broken pipe",
    33: "Math arg out of domain of func",
    34: "Math result not representable",
    35: "File locking deadlock error",
    36: "File or path name too long",
    37: "No record locks available",
    38: "Function not implemented",
    39: "Directory not empty",
    40: "Too many symbolic links",
    42: "No message of desired type",
    43: "Identifier removed",
    44: "Channel number out of range",
    45: "Level 2 not synchronized",
    46: "Level 3 halted",
    47: "Level 3 reset",
    48: "Link number out of range",
    49: "Protocol driver not attached",
    50: "No CSI structure available",
    51: "Level 2 halted",
    52: "Invalid exchange",
    53: "Invalid request descriptor",
    54: "Exchange full",
    55: "No anode",
    56: "Invalid request code",
    57: "Invalid slot",
    59: "Bad font file fmt",
    60: "Device not a stream",
    61: "No data (for no delay io)",
    62: "Timer expired",
    63: "Out of streams resources",
    64: "Machine is not on the network",
    65: "Package not installed",
    66: "The object is remote",
    67: "The link has been severed",
    68: "Advertise error",
    69: "Srmount error",
    70: "Communication error on send",
    71: "Protocol error",
    72: "Multihop attempted",
    73: "Cross mount point (not really error)",
    74: "Trying to read unreadable message",
    75: "Value too large for defined data type",
    76: "Given log. name not unique",
    77: "f.d. invalid for this operation",
    78: "Remote address changed",
    79: "Can   access a needed shared lib",
    80: "Accessing a corrupted shared lib",
    81: ".lib section in a.out corrupted",
    82: "Attempting to link in too many libs",
    83: "Attempting to exec a shared library",
    84: "Illegal byte sequence",
    86: "Streams pipe error",
    87: "Too many users",
    88: "Socket operation on non-socket",
    89: "Destination address required",
    90: "Message too long",
    91: "Protocol wrong type for socket",
    92: "Protocol not available",
    93: "Unknown protocol",
    94: "Socket type not supported",
    95: "Not supported",
    96: "Protocol family not supported",
    97: "Address family not supported by protocol family",
    98: "Address already in use",
    99: "Address not available",
    100: "Network interface is not configured",
    101: "Network is unreachable",
    102: "Connection reset by network",
    103: "Connection aborted",
    104: "Connection reset by peer",
    105: "No buffer space available",
    106: "Socket is already connected",
    107: "Socket is not connected",
    108: "Can't send after socket shutdown",
    109: "Too many references",
    110: "Connection timed out",
    111: "Connection refused",
    112: "Host is down",
    113: "Host is unreachable",
    114: "Socket already connected",
    115: "Connection already in progress",
    116: "Stale file handle",
    122: "Quota exceeded",
    123: "No medium (in tape drive)",
    125: "Operation canceled",
    130: "Previous owner died",
    131: "State not recoverable"
};
var ERRNO_CODES = {
    EPERM: 1,
    ENOENT: 2,
    ESRCH: 3,
    EINTR: 4,
    EIO: 5,
    ENXIO: 6,
    E2BIG: 7,
    ENOEXEC: 8,
    EBADF: 9,
    ECHILD: 10,
    EAGAIN: 11,
    EWOULDBLOCK: 11,
    ENOMEM: 12,
    EACCES: 13,
    EFAULT: 14,
    ENOTBLK: 15,
    EBUSY: 16,
    EEXIST: 17,
    EXDEV: 18,
    ENODEV: 19,
    ENOTDIR: 20,
    EISDIR: 21,
    EINVAL: 22,
    ENFILE: 23,
    EMFILE: 24,
    ENOTTY: 25,
    ETXTBSY: 26,
    EFBIG: 27,
    ENOSPC: 28,
    ESPIPE: 29,
    EROFS: 30,
    EMLINK: 31,
    EPIPE: 32,
    EDOM: 33,
    ERANGE: 34,
    ENOMSG: 42,
    EIDRM: 43,
    ECHRNG: 44,
    EL2NSYNC: 45,
    EL3HLT: 46,
    EL3RST: 47,
    ELNRNG: 48,
    EUNATCH: 49,
    ENOCSI: 50,
    EL2HLT: 51,
    EDEADLK: 35,
    ENOLCK: 37,
    EBADE: 52,
    EBADR: 53,
    EXFULL: 54,
    ENOANO: 55,
    EBADRQC: 56,
    EBADSLT: 57,
    EDEADLOCK: 35,
    EBFONT: 59,
    ENOSTR: 60,
    ENODATA: 61,
    ETIME: 62,
    ENOSR: 63,
    ENONET: 64,
    ENOPKG: 65,
    EREMOTE: 66,
    ENOLINK: 67,
    EADV: 68,
    ESRMNT: 69,
    ECOMM: 70,
    EPROTO: 71,
    EMULTIHOP: 72,
    EDOTDOT: 73,
    EBADMSG: 74,
    ENOTUNIQ: 76,
    EBADFD: 77,
    EREMCHG: 78,
    ELIBACC: 79,
    ELIBBAD: 80,
    ELIBSCN: 81,
    ELIBMAX: 82,
    ELIBEXEC: 83,
    ENOSYS: 38,
    ENOTEMPTY: 39,
    ENAMETOOLONG: 36,
    ELOOP: 40,
    EOPNOTSUPP: 95,
    EPFNOSUPPORT: 96,
    ECONNRESET: 104,
    ENOBUFS: 105,
    EAFNOSUPPORT: 97,
    EPROTOTYPE: 91,
    ENOTSOCK: 88,
    ENOPROTOOPT: 92,
    ESHUTDOWN: 108,
    ECONNREFUSED: 111,
    EADDRINUSE: 98,
    ECONNABORTED: 103,
    ENETUNREACH: 101,
    ENETDOWN: 100,
    ETIMEDOUT: 110,
    EHOSTDOWN: 112,
    EHOSTUNREACH: 113,
    EINPROGRESS: 115,
    EALREADY: 114,
    EDESTADDRREQ: 89,
    EMSGSIZE: 90,
    EPROTONOSUPPORT: 93,
    ESOCKTNOSUPPORT: 94,
    EADDRNOTAVAIL: 99,
    ENETRESET: 102,
    EISCONN: 106,
    ENOTCONN: 107,
    ETOOMANYREFS: 109,
    EUSERS: 87,
    EDQUOT: 122,
    ESTALE: 116,
    ENOTSUP: 95,
    ENOMEDIUM: 123,
    EILSEQ: 84,
    EOVERFLOW: 75,
    ECANCELED: 125,
    ENOTRECOVERABLE: 131,
    EOWNERDEAD: 130,
    ESTRPIPE: 86
};
var FS = {
    root: null,
    mounts: [],
    devices: {},
    streams: [],
    nextInode: 1,
    nameTable: null,
    currentPath: "/",
    initialized: false,
    ignorePermissions: true,
    trackingDelegate: {},
    tracking: {
        openFlags: {
            READ: 1,
            WRITE: 2
        }
    },
    ErrnoError: null,
    genericErrors: {},
    filesystems: null,
    syncFSRequests: 0,
    handleFSError: function (e) {
        if (!(e instanceof FS.ErrnoError))
            throw e + " : " + stackTrace();
        return ___setErrNo(e.errno)
    },
    lookupPath: function (path, opts) {
        path = PATH_FS.resolve(FS.cwd(), path);
        opts = opts || {};
        if (!path)
            return {
                path: "",
                node: null
            };
        var defaults = {
            follow_mount: true,
            recurse_count: 0
        };
        for (var key in defaults) {
            if (opts[key] === undefined) {
                opts[key] = defaults[key]
            }
        }
        if (opts.recurse_count > 8) {
            throw new FS.ErrnoError(40)
        }
        var parts = PATH.normalizeArray(path.split("/").filter(function (p) {
            return !!p
        }), false);
        var current = FS.root;
        var current_path = "/";
        for (var i = 0; i < parts.length; i++) {
            var islast = i === parts.length - 1;
            if (islast && opts.parent) {
                break
            }
            current = FS.lookupNode(current, parts[i]);
            current_path = PATH.join2(current_path, parts[i]);
            if (FS.isMountpoint(current)) {
                if (!islast || islast && opts.follow_mount) {
                    current = current.mounted.root
                }
            }
            if (!islast || opts.follow) {
                var count = 0;
                while (FS.isLink(current.mode)) {
                    var link = FS.readlink(current_path);
                    current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
                    var lookup = FS.lookupPath(current_path, {
                        recurse_count: opts.recurse_count
                    });
                    current = lookup.node;
                    if (count++ > 40) {
                        throw new FS.ErrnoError(40)
                    }
                }
            }
        }
        return {
            path: current_path,
            node: current
        }
    },
    getPath: function (node) {
        var path;
        while (true) {
            if (FS.isRoot(node)) {
                var mount = node.mount.mountpoint;
                if (!path)
                    return mount;
                return mount[mount.length - 1] !== "/" ? mount + "/" + path : mount + path
            }
            path = path ? node.name + "/" + path : node.name;
            node = node.parent
        }
    },
    hashName: function (parentid, name) {
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
            hash = (hash << 5) - hash + name.charCodeAt(i) | 0
        }
        return (parentid + hash >>> 0) % FS.nameTable.length
    },
    hashAddNode: function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node
    },
    hashRemoveNode: function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
            FS.nameTable[hash] = node.name_next
        } else {
            var current = FS.nameTable[hash];
            while (current) {
                if (current.name_next === node) {
                    current.name_next = node.name_next;
                    break
                }
                current = current.name_next
            }
        }
    },
    lookupNode: function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
            throw new FS.ErrnoError(err, parent)
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
            var nodeName = node.name;
            if (node.parent.id === parent.id && nodeName === name) {
                return node
            }
        }
        return FS.lookup(parent, name)
    },
    createNode: function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
            FS.FSNode = function (parent, name, mode, rdev) {
                if (!parent) {
                    parent = this
                }
                this.parent = parent;
                this.mount = parent.mount;
                this.mounted = null;
                this.id = FS.nextInode++;
                this.name = name;
                this.mode = mode;
                this.node_ops = {};
                this.stream_ops = {};
                this.rdev = rdev
            }
                ;
            FS.FSNode.prototype = {};
            var readMode = 292 | 73;
            var writeMode = 146;
            Object.defineProperties(FS.FSNode.prototype, {
                read: {
                    get: function () {
                        return (this.mode & readMode) === readMode
                    },
                    set: function (val) {
                        val ? this.mode |= readMode : this.mode &= ~readMode
                    }
                },
                write: {
                    get: function () {
                        return (this.mode & writeMode) === writeMode
                    },
                    set: function (val) {
                        val ? this.mode |= writeMode : this.mode &= ~writeMode
                    }
                },
                isFolder: {
                    get: function () {
                        return FS.isDir(this.mode)
                    }
                },
                isDevice: {
                    get: function () {
                        return FS.isChrdev(this.mode)
                    }
                }
            })
        }
        var node = new FS.FSNode(parent, name, mode, rdev);
        FS.hashAddNode(node);
        return node
    },
    destroyNode: function (node) {
        FS.hashRemoveNode(node)
    },
    isRoot: function (node) {
        return node === node.parent
    },
    isMountpoint: function (node) {
        return !!node.mounted
    },
    isFile: function (mode) {
        return (mode & 61440) === 32768
    },
    isDir: function (mode) {
        return (mode & 61440) === 16384
    },
    isLink: function (mode) {
        return (mode & 61440) === 40960
    },
    isChrdev: function (mode) {
        return (mode & 61440) === 8192
    },
    isBlkdev: function (mode) {
        return (mode & 61440) === 24576
    },
    isFIFO: function (mode) {
        return (mode & 61440) === 4096
    },
    isSocket: function (mode) {
        return (mode & 49152) === 49152
    },
    flagModes: {
        "r": 0,
        "rs": 1052672,
        "r+": 2,
        "w": 577,
        "wx": 705,
        "xw": 705,
        "w+": 578,
        "wx+": 706,
        "xw+": 706,
        "a": 1089,
        "ax": 1217,
        "xa": 1217,
        "a+": 1090,
        "ax+": 1218,
        "xa+": 1218
    },
    modeStringToFlags: function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === "undefined") {
            throw new Error("Unknown file open mode: " + str)
        }
        return flags
    },
    flagsToPermissionString: function (flag) {
        var perms = ["r", "w", "rw"][flag & 3];
        if (flag & 512) {
            perms += "w"
        }
        return perms
    },
    nodePermissions: function (node, perms) {
        if (FS.ignorePermissions) {
            return 0
        }
        if (perms.indexOf("r") !== -1 && !(node.mode & 292)) {
            return 13
        } else if (perms.indexOf("w") !== -1 && !(node.mode & 146)) {
            return 13
        } else if (perms.indexOf("x") !== -1 && !(node.mode & 73)) {
            return 13
        }
        return 0
    },
    mayLookup: function (dir) {
        var err = FS.nodePermissions(dir, "x");
        if (err)
            return err;
        if (!dir.node_ops.lookup)
            return 13;
        return 0
    },
    mayCreate: function (dir, name) {
        try {
            var node = FS.lookupNode(dir, name);
            return 17
        } catch (e) { }
        return FS.nodePermissions(dir, "wx")
    },
    mayDelete: function (dir, name, isdir) {
        var node;
        try {
            node = FS.lookupNode(dir, name)
        } catch (e) {
            return e.errno
        }
        var err = FS.nodePermissions(dir, "wx");
        if (err) {
            return err
        }
        if (isdir) {
            if (!FS.isDir(node.mode)) {
                return 20
            }
            if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
                return 16
            }
        } else {
            if (FS.isDir(node.mode)) {
                return 21
            }
        }
        return 0
    },
    mayOpen: function (node, flags) {
        if (!node) {
            return 2
        }
        if (FS.isLink(node.mode)) {
            return 40
        } else if (FS.isDir(node.mode)) {
            if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
                return 21
            }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags))
    },
    MAX_OPEN_FDS: 4096,
    nextfd: function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
            if (!FS.streams[fd]) {
                return fd
            }
        }
        throw new FS.ErrnoError(24)
    },
    getStream: function (fd) {
        return FS.streams[fd]
    },
    createStream: function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
            FS.FSStream = function () { }
                ;
            FS.FSStream.prototype = {};
            Object.defineProperties(FS.FSStream.prototype, {
                object: {
                    get: function () {
                        return this.node
                    },
                    set: function (val) {
                        this.node = val
                    }
                },
                isRead: {
                    get: function () {
                        return (this.flags & 2097155) !== 1
                    }
                },
                isWrite: {
                    get: function () {
                        return (this.flags & 2097155) !== 0
                    }
                },
                isAppend: {
                    get: function () {
                        return this.flags & 1024
                    }
                }
            })
        }
        var newStream = new FS.FSStream;
        for (var p in stream) {
            newStream[p] = stream[p]
        }
        stream = newStream;
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream
    },
    closeStream: function (fd) {
        FS.streams[fd] = null
    },
    chrdev_stream_ops: {
        open: function (stream) {
            var device = FS.getDevice(stream.node.rdev);
            stream.stream_ops = device.stream_ops;
            if (stream.stream_ops.open) {
                stream.stream_ops.open(stream)
            }
        },
        llseek: function () {
            throw new FS.ErrnoError(29)
        }
    },
    major: function (dev) {
        return dev >> 8
    },
    minor: function (dev) {
        return dev & 255
    },
    makedev: function (ma, mi) {
        return ma << 8 | mi
    },
    registerDevice: function (dev, ops) {
        FS.devices[dev] = {
            stream_ops: ops
        }
    },
    getDevice: function (dev) {
        return FS.devices[dev]
    },
    getMounts: function (mount) {
        var mounts = [];
        var check = [mount];
        while (check.length) {
            var m = check.pop();
            mounts.push(m);
            check.push.apply(check, m.mounts)
        }
        return mounts
    },
    syncfs: function (populate, callback) {
        if (typeof populate === "function") {
            callback = populate;
            populate = false
        }
        FS.syncFSRequests++;
        if (FS.syncFSRequests > 1) {
            console.log("warning: " + FS.syncFSRequests + " FS.syncfs operations in flight at once, probably just doing extra work")
        }
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
        function doCallback(err) {
            assert(FS.syncFSRequests > 0);
            FS.syncFSRequests--;
            return callback(err)
        }
        function done(err) {
            if (err) {
                if (!done.errored) {
                    done.errored = true;
                    return doCallback(err)
                }
                return
            }
            if (++completed >= mounts.length) {
                doCallback(null)
            }
        }
        mounts.forEach(function (mount) {
            if (!mount.type.syncfs) {
                return done(null)
            }
            mount.type.syncfs(mount, populate, done)
        })
    },
    mount: function (type, opts, mountpoint) {
        var root = mountpoint === "/";
        var pseudo = !mountpoint;
        var node;
        if (root && FS.root) {
            throw new FS.ErrnoError(16)
        } else if (!root && !pseudo) {
            var lookup = FS.lookupPath(mountpoint, {
                follow_mount: false
            });
            mountpoint = lookup.path;
            node = lookup.node;
            if (FS.isMountpoint(node)) {
                throw new FS.ErrnoError(16)
            }
            if (!FS.isDir(node.mode)) {
                throw new FS.ErrnoError(20)
            }
        }
        var mount = {
            type: type,
            opts: opts,
            mountpoint: mountpoint,
            mounts: []
        };
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
        if (root) {
            FS.root = mountRoot
        } else if (node) {
            node.mounted = mount;
            if (node.mount) {
                node.mount.mounts.push(mount)
            }
        }
        return mountRoot
    },
    unmount: function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, {
            follow_mount: false
        });
        if (!FS.isMountpoint(lookup.node)) {
            throw new FS.ErrnoError(22)
        }
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
        Object.keys(FS.nameTable).forEach(function (hash) {
            var current = FS.nameTable[hash];
            while (current) {
                var next = current.name_next;
                if (mounts.indexOf(current.mount) !== -1) {
                    FS.destroyNode(current)
                }
                current = next
            }
        });
        node.mounted = null;
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1)
    },
    lookup: function (parent, name) {
        return parent.node_ops.lookup(parent, name)
    },
    mknod: function (path, mode, dev) {
        var lookup = FS.lookupPath(path, {
            parent: true
        });
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name || name === "." || name === "..") {
            throw new FS.ErrnoError(22)
        }
        var err = FS.mayCreate(parent, name);
        if (err) {
            throw new FS.ErrnoError(err)
        }
        if (!parent.node_ops.mknod) {
            throw new FS.ErrnoError(1)
        }
        return parent.node_ops.mknod(parent, name, mode, dev)
    },
    create: function (path, mode) {
        mode = mode !== undefined ? mode : 438;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0)
    },
    mkdir: function (path, mode) {
        mode = mode !== undefined ? mode : 511;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0)
    },
    mkdirTree: function (path, mode) {
        var dirs = path.split("/");
        var d = "";
        for (var i = 0; i < dirs.length; ++i) {
            if (!dirs[i])
                continue;
            d += "/" + dirs[i];
            try {
                FS.mkdir(d, mode)
            } catch (e) {
                if (e.errno != 17)
                    throw e
            }
        }
    },
    mkdev: function (path, mode, dev) {
        if (typeof dev === "undefined") {
            dev = mode;
            mode = 438
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev)
    },
    symlink: function (oldpath, newpath) {
        if (!PATH_FS.resolve(oldpath)) {
            throw new FS.ErrnoError(2)
        }
        var lookup = FS.lookupPath(newpath, {
            parent: true
        });
        var parent = lookup.node;
        if (!parent) {
            throw new FS.ErrnoError(2)
        }
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
            throw new FS.ErrnoError(err)
        }
        if (!parent.node_ops.symlink) {
            throw new FS.ErrnoError(1)
        }
        return parent.node_ops.symlink(parent, newname, oldpath)
    },
    rename: function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        var lookup, old_dir, new_dir;
        try {
            lookup = FS.lookupPath(old_path, {
                parent: true
            });
            old_dir = lookup.node;
            lookup = FS.lookupPath(new_path, {
                parent: true
            });
            new_dir = lookup.node
        } catch (e) {
            throw new FS.ErrnoError(16)
        }
        if (!old_dir || !new_dir)
            throw new FS.ErrnoError(2);
        if (old_dir.mount !== new_dir.mount) {
            throw new FS.ErrnoError(18)
        }
        var old_node = FS.lookupNode(old_dir, old_name);
        var relative = PATH_FS.relative(old_path, new_dirname);
        if (relative.charAt(0) !== ".") {
            throw new FS.ErrnoError(22)
        }
        relative = PATH_FS.relative(new_path, old_dirname);
        if (relative.charAt(0) !== ".") {
            throw new FS.ErrnoError(39)
        }
        var new_node;
        try {
            new_node = FS.lookupNode(new_dir, new_name)
        } catch (e) { }
        if (old_node === new_node) {
            return
        }
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
            throw new FS.ErrnoError(err)
        }
        err = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
        if (err) {
            throw new FS.ErrnoError(err)
        }
        if (!old_dir.node_ops.rename) {
            throw new FS.ErrnoError(1)
        }
        if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
            throw new FS.ErrnoError(16)
        }
        if (new_dir !== old_dir) {
            err = FS.nodePermissions(old_dir, "w");
            if (err) {
                throw new FS.ErrnoError(err)
            }
        }
        try {
            if (FS.trackingDelegate["willMovePath"]) {
                FS.trackingDelegate["willMovePath"](old_path, new_path)
            }
        } catch (e) {
            console.log("FS.trackingDelegate['willMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message)
        }
        FS.hashRemoveNode(old_node);
        try {
            old_dir.node_ops.rename(old_node, new_dir, new_name)
        } catch (e) {
            throw e
        } finally {
            FS.hashAddNode(old_node)
        }
        try {
            if (FS.trackingDelegate["onMovePath"])
                FS.trackingDelegate["onMovePath"](old_path, new_path)
        } catch (e) {
            console.log("FS.trackingDelegate['onMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message)
        }
    },
    rmdir: function (path) {
        var lookup = FS.lookupPath(path, {
            parent: true
        });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
            throw new FS.ErrnoError(err)
        }
        if (!parent.node_ops.rmdir) {
            throw new FS.ErrnoError(1)
        }
        if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(16)
        }
        try {
            if (FS.trackingDelegate["willDeletePath"]) {
                FS.trackingDelegate["willDeletePath"](path)
            }
        } catch (e) {
            console.log("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message)
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
        try {
            if (FS.trackingDelegate["onDeletePath"])
                FS.trackingDelegate["onDeletePath"](path)
        } catch (e) {
            console.log("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message)
        }
    },
    readdir: function (path) {
        var lookup = FS.lookupPath(path, {
            follow: true
        });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
            throw new FS.ErrnoError(20)
        }
        return node.node_ops.readdir(node)
    },
    unlink: function (path) {
        var lookup = FS.lookupPath(path, {
            parent: true
        });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
            throw new FS.ErrnoError(err)
        }
        if (!parent.node_ops.unlink) {
            throw new FS.ErrnoError(1)
        }
        if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(16)
        }
        try {
            if (FS.trackingDelegate["willDeletePath"]) {
                FS.trackingDelegate["willDeletePath"](path)
            }
        } catch (e) {
            console.log("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message)
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
        try {
            if (FS.trackingDelegate["onDeletePath"])
                FS.trackingDelegate["onDeletePath"](path)
        } catch (e) {
            console.log("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message)
        }
    },
    readlink: function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
            throw new FS.ErrnoError(2)
        }
        if (!link.node_ops.readlink) {
            throw new FS.ErrnoError(22)
        }
        return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link))
    },
    stat: function (path, dontFollow) {
        var lookup = FS.lookupPath(path, {
            follow: !dontFollow
        });
        var node = lookup.node;
        if (!node) {
            throw new FS.ErrnoError(2)
        }
        if (!node.node_ops.getattr) {
            throw new FS.ErrnoError(1)
        }
        return node.node_ops.getattr(node)
    },
    lstat: function (path) {
        return FS.stat(path, true)
    },
    chmod: function (path, mode, dontFollow) {
        var node;
        if (typeof path === "string") {
            var lookup = FS.lookupPath(path, {
                follow: !dontFollow
            });
            node = lookup.node
        } else {
            node = path
        }
        if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(1)
        }
        node.node_ops.setattr(node, {
            mode: mode & 4095 | node.mode & ~4095,
            timestamp: Date.now()
        })
    },
    lchmod: function (path, mode) {
        FS.chmod(path, mode, true)
    },
    fchmod: function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
            throw new FS.ErrnoError(9)
        }
        FS.chmod(stream.node, mode)
    },
    chown: function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === "string") {
            var lookup = FS.lookupPath(path, {
                follow: !dontFollow
            });
            node = lookup.node
        } else {
            node = path
        }
        if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(1)
        }
        node.node_ops.setattr(node, {
            timestamp: Date.now()
        })
    },
    lchown: function (path, uid, gid) {
        FS.chown(path, uid, gid, true)
    },
    fchown: function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
            throw new FS.ErrnoError(9)
        }
        FS.chown(stream.node, uid, gid)
    },
    truncate: function (path, len) {
        if (len < 0) {
            throw new FS.ErrnoError(22)
        }
        var node;
        if (typeof path === "string") {
            var lookup = FS.lookupPath(path, {
                follow: true
            });
            node = lookup.node
        } else {
            node = path
        }
        if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(1)
        }
        if (FS.isDir(node.mode)) {
            throw new FS.ErrnoError(21)
        }
        if (!FS.isFile(node.mode)) {
            throw new FS.ErrnoError(22)
        }
        var err = FS.nodePermissions(node, "w");
        if (err) {
            throw new FS.ErrnoError(err)
        }
        node.node_ops.setattr(node, {
            size: len,
            timestamp: Date.now()
        })
    },
    ftruncate: function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
            throw new FS.ErrnoError(9)
        }
        if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(22)
        }
        FS.truncate(stream.node, len)
    },
    utime: function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, {
            follow: true
        });
        var node = lookup.node;
        node.node_ops.setattr(node, {
            timestamp: Math.max(atime, mtime)
        })
    },
    open: function (path, flags, mode, fd_start, fd_end) {
        if (path === "") {
            throw new FS.ErrnoError(2)
        }
        flags = typeof flags === "string" ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === "undefined" ? 438 : mode;
        if (flags & 64) {
            mode = mode & 4095 | 32768
        } else {
            mode = 0
        }
        var node;
        if (typeof path === "object") {
            node = path
        } else {
            path = PATH.normalize(path);
            try {
                var lookup = FS.lookupPath(path, {
                    follow: !(flags & 131072)
                });
                node = lookup.node
            } catch (e) { }
        }
        var created = false;
        if (flags & 64) {
            if (node) {
                if (flags & 128) {
                    throw new FS.ErrnoError(17)
                }
            } else {
                node = FS.mknod(path, mode, 0);
                created = true
            }
        }
        if (!node) {
            throw new FS.ErrnoError(2)
        }
        if (FS.isChrdev(node.mode)) {
            flags &= ~512
        }
        if (flags & 65536 && !FS.isDir(node.mode)) {
            throw new FS.ErrnoError(20)
        }
        if (!created) {
            var err = FS.mayOpen(node, flags);
            if (err) {
                throw new FS.ErrnoError(err)
            }
        }
        if (flags & 512) {
            FS.truncate(node, 0)
        }
        flags &= ~(128 | 512);
        var stream = FS.createStream({
            node: node,
            path: FS.getPath(node),
            flags: flags,
            seekable: true,
            position: 0,
            stream_ops: node.stream_ops,
            ungotten: [],
            error: false
        }, fd_start, fd_end);
        if (stream.stream_ops.open) {
            stream.stream_ops.open(stream)
        }
        if (Module["logReadFiles"] && !(flags & 1)) {
            if (!FS.readFiles)
                FS.readFiles = {};
            if (!(path in FS.readFiles)) {
                FS.readFiles[path] = 1;
                console.log("FS.trackingDelegate error on read file: " + path)
            }
        }
        try {
            if (FS.trackingDelegate["onOpenFile"]) {
                var trackingFlags = 0;
                if ((flags & 2097155) !== 1) {
                    trackingFlags |= FS.tracking.openFlags.READ
                }
                if ((flags & 2097155) !== 0) {
                    trackingFlags |= FS.tracking.openFlags.WRITE
                }
                FS.trackingDelegate["onOpenFile"](path, trackingFlags)
            }
        } catch (e) {
            console.log("FS.trackingDelegate['onOpenFile']('" + path + "', flags) threw an exception: " + e.message)
        }
        return stream
    },
    close: function (stream) {
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(9)
        }
        if (stream.getdents)
            stream.getdents = null;
        try {
            if (stream.stream_ops.close) {
                stream.stream_ops.close(stream)
            }
        } catch (e) {
            throw e
        } finally {
            FS.closeStream(stream.fd)
        }
        stream.fd = null
    },
    isClosed: function (stream) {
        return stream.fd === null
    },
    llseek: function (stream, offset, whence) {
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(9)
        }
        if (!stream.seekable || !stream.stream_ops.llseek) {
            throw new FS.ErrnoError(29)
        }
        if (whence != 0 && whence != 1 && whence != 2) {
            throw new FS.ErrnoError(22)
        }
        stream.position = stream.stream_ops.llseek(stream, offset, whence);
        stream.ungotten = [];
        return stream.position
    },
    read: function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
            throw new FS.ErrnoError(22)
        }
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(9)
        }
        if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(9)
        }
        if (FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(21)
        }
        if (!stream.stream_ops.read) {
            throw new FS.ErrnoError(22)
        }
        var seeking = typeof position !== "undefined";
        if (!seeking) {
            position = stream.position
        } else if (!stream.seekable) {
            throw new FS.ErrnoError(29)
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking)
            stream.position += bytesRead;
        return bytesRead
    },
    write: function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
            throw new FS.ErrnoError(22)
        }
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(9)
        }
        if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(9)
        }
        if (FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(21)
        }
        if (!stream.stream_ops.write) {
            throw new FS.ErrnoError(22)
        }
        if (stream.flags & 1024) {
            FS.llseek(stream, 0, 2)
        }
        var seeking = typeof position !== "undefined";
        if (!seeking) {
            position = stream.position
        } else if (!stream.seekable) {
            throw new FS.ErrnoError(29)
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking)
            stream.position += bytesWritten;
        try {
            if (stream.path && FS.trackingDelegate["onWriteToFile"])
                FS.trackingDelegate["onWriteToFile"](stream.path)
        } catch (e) {
            console.log("FS.trackingDelegate['onWriteToFile']('" + stream.path + "') threw an exception: " + e.message)
        }
        return bytesWritten
    },
    allocate: function (stream, offset, length) {
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(9)
        }
        if (offset < 0 || length <= 0) {
            throw new FS.ErrnoError(22)
        }
        if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(9)
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(19)
        }
        if (!stream.stream_ops.allocate) {
            throw new FS.ErrnoError(95)
        }
        stream.stream_ops.allocate(stream, offset, length)
    },
    mmap: function (stream, buffer, offset, length, position, prot, flags) {
        if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
            throw new FS.ErrnoError(13)
        }
        if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(13)
        }
        if (!stream.stream_ops.mmap) {
            throw new FS.ErrnoError(19)
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags)
    },
    msync: function (stream, buffer, offset, length, mmapFlags) {
        if (!stream || !stream.stream_ops.msync) {
            return 0
        }
        return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags)
    },
    munmap: function (stream) {
        return 0
    },
    ioctl: function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
            throw new FS.ErrnoError(25)
        }
        return stream.stream_ops.ioctl(stream, cmd, arg)
    },
    readFile: function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || "r";
        opts.encoding = opts.encoding || "binary";
        if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
            throw new Error('Invalid encoding type "' + opts.encoding + '"')
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === "utf8") {
            ret = UTF8ArrayToString(buf, 0)
        } else if (opts.encoding === "binary") {
            ret = buf
        }
        FS.close(stream);
        return ret
    },
    writeFile: function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || "w";
        var stream = FS.open(path, opts.flags, opts.mode);
        if (typeof data === "string") {
            var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
            var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
            FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn)
        } else if (ArrayBuffer.isView(data)) {
            FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn)
        } else {
            throw new Error("Unsupported data type")
        }
        FS.close(stream)
    },
    cwd: function () {
        return FS.currentPath
    },
    chdir: function (path) {
        var lookup = FS.lookupPath(path, {
            follow: true
        });
        if (lookup.node === null) {
            throw new FS.ErrnoError(2)
        }
        if (!FS.isDir(lookup.node.mode)) {
            throw new FS.ErrnoError(20)
        }
        var err = FS.nodePermissions(lookup.node, "x");
        if (err) {
            throw new FS.ErrnoError(err)
        }
        FS.currentPath = lookup.path
    },
    createDefaultDirectories: function () {
        FS.mkdir("/tmp");
        FS.mkdir("/home");
        FS.mkdir("/home/web_user")
    },
    createDefaultDevices: function () {
        FS.mkdir("/dev");
        FS.registerDevice(FS.makedev(1, 3), {
            read: function () {
                return 0
            },
            write: function (stream, buffer, offset, length, pos) {
                return length
            }
        });
        FS.mkdev("/dev/null", FS.makedev(1, 3));
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev("/dev/tty", FS.makedev(5, 0));
        FS.mkdev("/dev/tty1", FS.makedev(6, 0));
        var random_device;
        if (typeof crypto === "object" && typeof crypto["getRandomValues"] === "function") {
            var randomBuffer = new Uint8Array(1);
            random_device = function () {
                crypto.getRandomValues(randomBuffer);
                return randomBuffer[0]
            }
        } else if (ENVIRONMENT_IS_NODE) {
            try {
                var crypto_module = require("crypto");
                random_device = function () {
                    return crypto_module["randomBytes"](1)[0]
                }
            } catch (e) { }
        } else { }
        if (!random_device) {
            random_device = function () {
                abort("no cryptographic support found for random_device. consider polyfilling it if you want to use something insecure like Math.random(), e.g. put this in a --pre-js: var crypto = { getRandomValues: function(array) { for (var i = 0; i < array.length; i++) array[i] = (Math.random()*256)|0 } };")
            }
        }
        FS.createDevice("/dev", "random", random_device);
        FS.createDevice("/dev", "urandom", random_device);
        FS.mkdir("/dev/shm");
        FS.mkdir("/dev/shm/tmp")
    },
    createSpecialDirectories: function () {
        FS.mkdir("/proc");
        FS.mkdir("/proc/self");
        FS.mkdir("/proc/self/fd");
        FS.mount({
            mount: function () {
                var node = FS.createNode("/proc/self", "fd", 16384 | 511, 73);
                node.node_ops = {
                    lookup: function (parent, name) {
                        var fd = +name;
                        var stream = FS.getStream(fd);
                        if (!stream)
                            throw new FS.ErrnoError(9);
                        var ret = {
                            parent: null,
                            mount: {
                                mountpoint: "fake"
                            },
                            node_ops: {
                                readlink: function () {
                                    return stream.path
                                }
                            }
                        };
                        ret.parent = ret;
                        return ret
                    }
                };
                return node
            }
        }, {}, "/proc/self/fd")
    },
    createStandardStreams: function () {
        if (Module["stdin"]) {
            FS.createDevice("/dev", "stdin", Module["stdin"])
        } else {
            FS.symlink("/dev/tty", "/dev/stdin")
        }
        if (Module["stdout"]) {
            FS.createDevice("/dev", "stdout", null, Module["stdout"])
        } else {
            FS.symlink("/dev/tty", "/dev/stdout")
        }
        if (Module["stderr"]) {
            FS.createDevice("/dev", "stderr", null, Module["stderr"])
        } else {
            FS.symlink("/dev/tty1", "/dev/stderr")
        }
        var stdin = FS.open("/dev/stdin", "r");
        var stdout = FS.open("/dev/stdout", "w");
        var stderr = FS.open("/dev/stderr", "w");
        assert(stdin.fd === 0, "invalid handle for stdin (" + stdin.fd + ")");
        assert(stdout.fd === 1, "invalid handle for stdout (" + stdout.fd + ")");
        assert(stderr.fd === 2, "invalid handle for stderr (" + stderr.fd + ")")
    },
    ensureErrnoError: function () {
        if (FS.ErrnoError)
            return;
        FS.ErrnoError = function ErrnoError(errno, node) {
            this.node = node;
            this.setErrno = function (errno) {
                this.errno = errno;
                for (var key in ERRNO_CODES) {
                    if (ERRNO_CODES[key] === errno) {
                        this.code = key;
                        break
                    }
                }
            }
                ;
            this.setErrno(errno);
            this.message = ERRNO_MESSAGES[errno];
            if (this.stack)
                Object.defineProperty(this, "stack", {
                    value: (new Error).stack,
                    writable: true
                });
            if (this.stack)
                this.stack = demangleAll(this.stack)
        }
            ;
        FS.ErrnoError.prototype = new Error;
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        [2].forEach(function (code) {
            FS.genericErrors[code] = new FS.ErrnoError(code);
            FS.genericErrors[code].stack = "<generic error, no stack>"
        })
    },
    staticInit: function () {
        FS.ensureErrnoError();
        FS.nameTable = new Array(4096);
        FS.mount(MEMFS, {}, "/");
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
        FS.createSpecialDirectories();
        FS.filesystems = {
            "MEMFS": MEMFS,
            "IDBFS": IDBFS,
            "NODEFS": NODEFS,
            "WORKERFS": WORKERFS
        }
    },
    init: function (input, output, error) {
        assert(!FS.init.initialized, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");
        FS.init.initialized = true;
        FS.ensureErrnoError();
        Module["stdin"] = input || Module["stdin"];
        Module["stdout"] = output || Module["stdout"];
        Module["stderr"] = error || Module["stderr"];
        FS.createStandardStreams()
    },
    quit: function () {
        FS.init.initialized = false;
        var fflush = Module["_fflush"];
        if (fflush)
            fflush(0);
        for (var i = 0; i < FS.streams.length; i++) {
            var stream = FS.streams[i];
            if (!stream) {
                continue
            }
            FS.close(stream)
        }
    },
    getMode: function (canRead, canWrite) {
        var mode = 0;
        if (canRead)
            mode |= 292 | 73;
        if (canWrite)
            mode |= 146;
        return mode
    },
    joinPath: function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == "/")
            path = path.substr(1);
        return path
    },
    absolutePath: function (relative, base) {
        return PATH_FS.resolve(base, relative)
    },
    standardizePath: function (path) {
        return PATH.normalize(path)
    },
    findObject: function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
            return ret.object
        } else {
            ___setErrNo(ret.error);
            return null
        }
    },
    analyzePath: function (path, dontResolveLastLink) {
        try {
            var lookup = FS.lookupPath(path, {
                follow: !dontResolveLastLink
            });
            path = lookup.path
        } catch (e) { }
        var ret = {
            isRoot: false,
            exists: false,
            error: 0,
            name: null,
            path: null,
            object: null,
            parentExists: false,
            parentPath: null,
            parentObject: null
        };
        try {
            var lookup = FS.lookupPath(path, {
                parent: true
            });
            ret.parentExists = true;
            ret.parentPath = lookup.path;
            ret.parentObject = lookup.node;
            ret.name = PATH.basename(path);
            lookup = FS.lookupPath(path, {
                follow: !dontResolveLastLink
            });
            ret.exists = true;
            ret.path = lookup.path;
            ret.object = lookup.node;
            ret.name = lookup.node.name;
            ret.isRoot = lookup.path === "/"
        } catch (e) {
            ret.error = e.errno
        }
        return ret
    },
    createFolder: function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode)
    },
    createPath: function (parent, path, canRead, canWrite) {
        parent = typeof parent === "string" ? parent : FS.getPath(parent);
        var parts = path.split("/").reverse();
        while (parts.length) {
            var part = parts.pop();
            if (!part)
                continue;
            var current = PATH.join2(parent, part);
            try {
                FS.mkdir(current)
            } catch (e) { }
            parent = current
        }
        return current
    },
    createFile: function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode)
    },
    createDataFile: function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
            if (typeof data === "string") {
                var arr = new Array(data.length);
                for (var i = 0, len = data.length; i < len; ++i)
                    arr[i] = data.charCodeAt(i);
                data = arr
            }
            FS.chmod(node, mode | 146);
            var stream = FS.open(node, "w");
            FS.write(stream, data, 0, data.length, 0, canOwn);
            FS.close(stream);
            FS.chmod(node, mode)
        }
        return node
    },
    createDevice: function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major)
            FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        FS.registerDevice(dev, {
            open: function (stream) {
                stream.seekable = false
            },
            close: function (stream) {
                if (output && output.buffer && output.buffer.length) {
                    output(10)
                }
            },
            read: function (stream, buffer, offset, length, pos) {
                var bytesRead = 0;
                for (var i = 0; i < length; i++) {
                    var result;
                    try {
                        result = input()
                    } catch (e) {
                        throw new FS.ErrnoError(5)
                    }
                    if (result === undefined && bytesRead === 0) {
                        throw new FS.ErrnoError(11)
                    }
                    if (result === null || result === undefined)
                        break;
                    bytesRead++;
                    buffer[offset + i] = result
                }
                if (bytesRead) {
                    stream.node.timestamp = Date.now()
                }
                return bytesRead
            },
            write: function (stream, buffer, offset, length, pos) {
                for (var i = 0; i < length; i++) {
                    try {
                        output(buffer[offset + i])
                    } catch (e) {
                        throw new FS.ErrnoError(5)
                    }
                }
                if (length) {
                    stream.node.timestamp = Date.now()
                }
                return i
            }
        });
        return FS.mkdev(path, mode, dev)
    },
    createLink: function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path)
    },
    forceLoadFile: function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents)
            return true;
        var success = true;
        if (typeof XMLHttpRequest !== "undefined") {
            throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.")
        } else if (read_) {
            try {
                obj.contents = intArrayFromString(read_(obj.url), true);
                obj.usedBytes = obj.contents.length
            } catch (e) {
                success = false
            }
        } else {
            throw new Error("Cannot load without read() or XMLHttpRequest.")
        }
        if (!success)
            ___setErrNo(5);
        return success
    },
    createLazyFile: function (parent, name, url, canRead, canWrite) {
        function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length - 1 || idx < 0) {
                return undefined
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = idx / this.chunkSize | 0;
            return this.getter(chunkNum)[chunkOffset]
        }
            ;
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter
        }
            ;
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
            var xhr = new XMLHttpRequest;
            xhr.open("HEAD", url, false);
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304))
                throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            var datalength = Number(xhr.getResponseHeader("Content-length"));
            var header;
            var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
            var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
            var chunkSize = 1024 * 1024;
            if (!hasByteServing)
                chunkSize = datalength;
            var doXHR = function (from, to) {
                if (from > to)
                    throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength - 1)
                    throw new Error("only " + datalength + " bytes available! programmer error!");
                var xhr = new XMLHttpRequest;
                xhr.open("GET", url, false);
                if (datalength !== chunkSize)
                    xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                if (typeof Uint8Array != "undefined")
                    xhr.responseType = "arraybuffer";
                if (xhr.overrideMimeType) {
                    xhr.overrideMimeType("text/plain; charset=x-user-defined")
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304))
                    throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                    return new Uint8Array(xhr.response || [])
                } else {
                    return intArrayFromString(xhr.responseText || "", true)
                }
            };
            var lazyArray = this;
            lazyArray.setDataGetter(function (chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum + 1) * chunkSize - 1;
                end = Math.min(end, datalength - 1);
                if (typeof lazyArray.chunks[chunkNum] === "undefined") {
                    lazyArray.chunks[chunkNum] = doXHR(start, end)
                }
                if (typeof lazyArray.chunks[chunkNum] === "undefined")
                    throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum]
            });
            if (usesGzip || !datalength) {
                chunkSize = datalength = 1;
                datalength = this.getter(0).length;
                chunkSize = datalength;
                console.log("LazyFiles on gzip forces download of the whole file when length is accessed")
            }
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true
        }
            ;
        if (typeof XMLHttpRequest !== "undefined") {
            if (!ENVIRONMENT_IS_WORKER)
                throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
            var lazyArray = new LazyUint8Array;
            Object.defineProperties(lazyArray, {
                length: {
                    get: function () {
                        if (!this.lengthKnown) {
                            this.cacheLength()
                        }
                        return this._length
                    }
                },
                chunkSize: {
                    get: function () {
                        if (!this.lengthKnown) {
                            this.cacheLength()
                        }
                        return this._chunkSize
                    }
                }
            });
            var properties = {
                isDevice: false,
                contents: lazyArray
            }
        } else {
            var properties = {
                isDevice: false,
                url: url
            }
        }
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        if (properties.contents) {
            node.contents = properties.contents
        } else if (properties.url) {
            node.contents = null;
            node.url = properties.url
        }
        Object.defineProperties(node, {
            usedBytes: {
                get: function () {
                    return this.contents.length
                }
            }
        });
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function (key) {
            var fn = node.stream_ops[key];
            stream_ops[key] = function forceLoadLazyFile() {
                if (!FS.forceLoadFile(node)) {
                    throw new FS.ErrnoError(5)
                }
                return fn.apply(null, arguments)
            }
        });
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
            if (!FS.forceLoadFile(node)) {
                throw new FS.ErrnoError(5)
            }
            var contents = stream.node.contents;
            if (position >= contents.length)
                return 0;
            var size = Math.min(contents.length - position, length);
            assert(size >= 0);
            if (contents.slice) {
                for (var i = 0; i < size; i++) {
                    buffer[offset + i] = contents[position + i]
                }
            } else {
                for (var i = 0; i < size; i++) {
                    buffer[offset + i] = contents.get(position + i)
                }
            }
            return size
        }
            ;
        node.stream_ops = stream_ops;
        return node
    },
    createPreloadedFile: function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
        Browser.init();
        var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
        var dep = getUniqueRunDependency("cp " + fullname);
        function processData(byteArray) {
            function finish(byteArray) {
                if (preFinish)
                    preFinish();
                if (!dontCreateFile) {
                    FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn)
                }
                if (onload)
                    onload();
                removeRunDependency(dep)
            }
            var handled = false;
            Module["preloadPlugins"].forEach(function (plugin) {
                if (handled)
                    return;
                if (plugin["canHandle"](fullname)) {
                    plugin["handle"](byteArray, fullname, finish, function () {
                        if (onerror)
                            onerror();
                        removeRunDependency(dep)
                    });
                    handled = true
                }
            });
            if (!handled)
                finish(byteArray)
        }
        addRunDependency(dep);
        if (typeof url == "string") {
            Browser.asyncLoad(url, function (byteArray) {
                processData(byteArray)
            }, onerror)
        } else {
            processData(url)
        }
    },
    indexedDB: function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
    },
    DB_NAME: function () {
        return "EM_FS_" + window.location.pathname
    },
    DB_VERSION: 20,
    DB_STORE_NAME: "FILE_DATA",
    saveFilesToDB: function (paths, onload, onerror) {
        onload = onload || function () { }
            ;
        onerror = onerror || function () { }
            ;
        var indexedDB = FS.indexedDB();
        try {
            var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION)
        } catch (e) {
            return onerror(e)
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
            console.log("creating db");
            var db = openRequest.result;
            db.createObjectStore(FS.DB_STORE_NAME)
        }
            ;
        openRequest.onsuccess = function openRequest_onsuccess() {
            var db = openRequest.result;
            var transaction = db.transaction([FS.DB_STORE_NAME], "readwrite");
            var files = transaction.objectStore(FS.DB_STORE_NAME);
            var ok = 0
                , fail = 0
                , total = paths.length;
            function finish() {
                if (fail == 0)
                    onload();
                else
                    onerror()
            }
            paths.forEach(function (path) {
                var putRequest = files.put(FS.analyzePath(path).object.contents, path);
                putRequest.onsuccess = function putRequest_onsuccess() {
                    ok++;
                    if (ok + fail == total)
                        finish()
                }
                    ;
                putRequest.onerror = function putRequest_onerror() {
                    fail++;
                    if (ok + fail == total)
                        finish()
                }
            });
            transaction.onerror = onerror
        }
            ;
        openRequest.onerror = onerror
    },
    loadFilesFromDB: function (paths, onload, onerror) {
        onload = onload || function () { }
            ;
        onerror = onerror || function () { }
            ;
        var indexedDB = FS.indexedDB();
        try {
            var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION)
        } catch (e) {
            return onerror(e)
        }
        openRequest.onupgradeneeded = onerror;
        openRequest.onsuccess = function openRequest_onsuccess() {
            var db = openRequest.result;
            try {
                var transaction = db.transaction([FS.DB_STORE_NAME], "readonly")
            } catch (e) {
                onerror(e);
                return
            }
            var files = transaction.objectStore(FS.DB_STORE_NAME);
            var ok = 0
                , fail = 0
                , total = paths.length;
            function finish() {
                if (fail == 0)
                    onload();
                else
                    onerror()
            }
            paths.forEach(function (path) {
                var getRequest = files.get(path);
                getRequest.onsuccess = function getRequest_onsuccess() {
                    if (FS.analyzePath(path).exists) {
                        FS.unlink(path)
                    }
                    FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
                    ok++;
                    if (ok + fail == total)
                        finish()
                }
                    ;
                getRequest.onerror = function getRequest_onerror() {
                    fail++;
                    if (ok + fail == total)
                        finish()
                }
            });
            transaction.onerror = onerror
        }
            ;
        openRequest.onerror = onerror
    }
};
function _emscripten_set_main_loop_timing(mode, value) {
    Browser.mainLoop.timingMode = mode;
    Browser.mainLoop.timingValue = value;
    if (!Browser.mainLoop.func) {
        console.error("emscripten_set_main_loop_timing: Cannot set timing mode for main loop since a main loop does not exist! Call emscripten_set_main_loop first to set one up.");
        return 1
    }
    if (mode == 0) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
            var timeUntilNextTick = Math.max(0, Browser.mainLoop.tickStartTime + value - _emscripten_get_now()) | 0;
            setTimeout(Browser.mainLoop.runner, timeUntilNextTick)
        }
            ;
        Browser.mainLoop.method = "timeout"
    } else if (mode == 1) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
            Browser.requestAnimationFrame(Browser.mainLoop.runner)
        }
            ;
        Browser.mainLoop.method = "rAF"
    } else if (mode == 2) {
        if (typeof setImmediate === "undefined") {
            var setImmediates = [];
            var emscriptenMainLoopMessageId = "setimmediate";
            var Browser_setImmediate_messageHandler = function (event) {
                if (event.data === emscriptenMainLoopMessageId || event.data.target === emscriptenMainLoopMessageId) {
                    event.stopPropagation();
                    setImmediates.shift()()
                }
            };
            addEventListener("message", Browser_setImmediate_messageHandler, true);
            setImmediate = function Browser_emulated_setImmediate(func) {
                setImmediates.push(func);
                if (ENVIRONMENT_IS_WORKER) {
                    if (Module["setImmediates"] === undefined)
                        Module["setImmediates"] = [];
                    Module["setImmediates"].push(func);
                    postMessage({
                        target: emscriptenMainLoopMessageId
                    })
                } else
                    postMessage(emscriptenMainLoopMessageId, "*")
            }
        }
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
            setImmediate(Browser.mainLoop.runner)
        }
            ;
        Browser.mainLoop.method = "immediate"
    }
    return 0
}
function _emscripten_get_now() {
    abort()
}
function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop, arg, noSetTiming) {
    Module["noExitRuntime"] = true;
    assert(!Browser.mainLoop.func, "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");
    Browser.mainLoop.func = func;
    Browser.mainLoop.arg = arg;
    var browserIterationFunc;
    if (typeof arg !== "undefined") {
        browserIterationFunc = function () {
            Module["dynCall_vi"](func, arg)
        }
    } else {
        browserIterationFunc = function () {
            Module["dynCall_v"](func)
        }
    }
    var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
    Browser.mainLoop.runner = function Browser_mainLoop_runner() {
        if (ABORT)
            return;
        if (Browser.mainLoop.queue.length > 0) {
            var start = Date.now();
            var blocker = Browser.mainLoop.queue.shift();
            blocker.func(blocker.arg);
            if (Browser.mainLoop.remainingBlockers) {
                var remaining = Browser.mainLoop.remainingBlockers;
                var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
                if (blocker.counted) {
                    Browser.mainLoop.remainingBlockers = next
                } else {
                    next = next + .5;
                    Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9
                }
            }
            console.log('main loop blocker "' + blocker.name + '" took ' + (Date.now() - start) + " ms");
            Browser.mainLoop.updateStatus();
            if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop)
                return;
            setTimeout(Browser.mainLoop.runner, 0);
            return
        }
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop)
            return;
        Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
        if (Browser.mainLoop.timingMode == 1 && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
            Browser.mainLoop.scheduler();
            return
        } else if (Browser.mainLoop.timingMode == 0) {
            Browser.mainLoop.tickStartTime = _emscripten_get_now()
        }
        GL.newRenderingFrameStarted();
        if (Browser.mainLoop.method === "timeout" && Module.ctx) {
            err("Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!");
            Browser.mainLoop.method = ""
        }
        Browser.mainLoop.runIter(browserIterationFunc);
        checkStackCookie();
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop)
            return;
        if (typeof SDL === "object" && SDL.audio && SDL.audio.queueNewAudioData)
            SDL.audio.queueNewAudioData();
        Browser.mainLoop.scheduler()
    }
        ;
    if (!noSetTiming) {
        if (fps && fps > 0)
            _emscripten_set_main_loop_timing(0, 1e3 / fps);
        else
            _emscripten_set_main_loop_timing(1, 1);
        Browser.mainLoop.scheduler()
    }
    if (simulateInfiniteLoop) {
        throw "SimulateInfiniteLoop"
    }
}
var Browser = {
    mainLoop: {
        scheduler: null,
        method: "",
        currentlyRunningMainloop: 0,
        func: null,
        arg: 0,
        timingMode: 0,
        timingValue: 0,
        currentFrameNumber: 0,
        queue: [],
        pause: function () {
            Browser.mainLoop.scheduler = null;
            Browser.mainLoop.currentlyRunningMainloop++
        },
        resume: function () {
            Browser.mainLoop.currentlyRunningMainloop++;
            var timingMode = Browser.mainLoop.timingMode;
            var timingValue = Browser.mainLoop.timingValue;
            var func = Browser.mainLoop.func;
            Browser.mainLoop.func = null;
            _emscripten_set_main_loop(func, 0, false, Browser.mainLoop.arg, true);
            _emscripten_set_main_loop_timing(timingMode, timingValue);
            Browser.mainLoop.scheduler()
        },
        updateStatus: function () {
            if (Module["setStatus"]) {
                var message = Module["statusMessage"] || "Please wait...";
                var remaining = Browser.mainLoop.remainingBlockers;
                var expected = Browser.mainLoop.expectedBlockers;
                if (remaining) {
                    if (remaining < expected) {
                        Module["setStatus"](message + " (" + (expected - remaining) + "/" + expected + ")")
                    } else {
                        Module["setStatus"](message)
                    }
                } else {
                    Module["setStatus"]("")
                }
            }
        },
        runIter: function (func) {
            if (ABORT)
                return;
            if (Module["preMainLoop"]) {
                var preRet = Module["preMainLoop"]();
                if (preRet === false) {
                    return
                }
            }
            try {
                func()
            } catch (e) {
                if (e instanceof ExitStatus) {
                    return
                } else {
                    if (e && typeof e === "object" && e.stack)
                        err("exception thrown: " + [e, e.stack]);
                    throw e
                }
            }
            if (Module["postMainLoop"])
                Module["postMainLoop"]()
        }
    },
    isFullscreen: false,
    pointerLock: false,
    moduleContextCreatedCallbacks: [],
    workers: [],
    init: function () {
        if (!Module["preloadPlugins"])
            Module["preloadPlugins"] = [];
        if (Browser.initted)
            return;
        Browser.initted = true;
        try {
            new Blob;
            Browser.hasBlobConstructor = true
        } catch (e) {
            Browser.hasBlobConstructor = false;
            console.log("warning: no blob constructor, cannot create blobs with mimetypes")
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : !Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null;
        Browser.URLObject = typeof window != "undefined" ? window.URL ? window.URL : window.webkitURL : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === "undefined") {
            console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
            Module.noImageDecoding = true
        }
        var imagePlugin = {};
        imagePlugin["canHandle"] = function imagePlugin_canHandle(name) {
            return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name)
        }
            ;
        imagePlugin["handle"] = function imagePlugin_handle(byteArray, name, onload, onerror) {
            var b = null;
            if (Browser.hasBlobConstructor) {
                try {
                    b = new Blob([byteArray], {
                        type: Browser.getMimetype(name)
                    });
                    if (b.size !== byteArray.length) {
                        b = new Blob([new Uint8Array(byteArray).buffer], {
                            type: Browser.getMimetype(name)
                        })
                    }
                } catch (e) {
                    warnOnce("Blob constructor present but fails: " + e + "; falling back to blob builder")
                }
            }
            if (!b) {
                var bb = new Browser.BlobBuilder;
                bb.append(new Uint8Array(byteArray).buffer);
                b = bb.getBlob()
            }
            var url = Browser.URLObject.createObjectURL(b);
            assert(typeof url == "string", "createObjectURL must return a url as a string");
            var img = new Image;
            img.onload = function img_onload() {
                assert(img.complete, "Image " + name + " could not be decoded");
                var canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                Module["preloadedImages"][name] = canvas;
                Browser.URLObject.revokeObjectURL(url);
                if (onload)
                    onload(byteArray)
            }
                ;
            img.onerror = function img_onerror(event) {
                console.log("Image " + url + " could not be decoded");
                if (onerror)
                    onerror()
            }
                ;
            img.src = url
        }
            ;
        Module["preloadPlugins"].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin["canHandle"] = function audioPlugin_canHandle(name) {
            return !Module.noAudioDecoding && name.substr(-4) in {
                ".ogg": 1,
                ".wav": 1,
                ".mp3": 1
            }
        }
            ;
        audioPlugin["handle"] = function audioPlugin_handle(byteArray, name, onload, onerror) {
            var done = false;
            function finish(audio) {
                if (done)
                    return;
                done = true;
                Module["preloadedAudios"][name] = audio;
                if (onload)
                    onload(byteArray)
            }
            function fail() {
                if (done)
                    return;
                done = true;
                Module["preloadedAudios"][name] = new Audio;
                if (onerror)
                    onerror()
            }
            if (Browser.hasBlobConstructor) {
                try {
                    var b = new Blob([byteArray], {
                        type: Browser.getMimetype(name)
                    })
                } catch (e) {
                    return fail()
                }
                var url = Browser.URLObject.createObjectURL(b);
                assert(typeof url == "string", "createObjectURL must return a url as a string");
                var audio = new Audio;
                audio.addEventListener("canplaythrough", function () {
                    finish(audio)
                }, false);
                audio.onerror = function audio_onerror(event) {
                    if (done)
                        return;
                    console.log("warning: browser could not fully decode audio " + name + ", trying slower base64 approach");
                    function encode64(data) {
                        var BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                        var PAD = "=";
                        var ret = "";
                        var leftchar = 0;
                        var leftbits = 0;
                        for (var i = 0; i < data.length; i++) {
                            leftchar = leftchar << 8 | data[i];
                            leftbits += 8;
                            while (leftbits >= 6) {
                                var curr = leftchar >> leftbits - 6 & 63;
                                leftbits -= 6;
                                ret += BASE[curr]
                            }
                        }
                        if (leftbits == 2) {
                            ret += BASE[(leftchar & 3) << 4];
                            ret += PAD + PAD
                        } else if (leftbits == 4) {
                            ret += BASE[(leftchar & 15) << 2];
                            ret += PAD
                        }
                        return ret
                    }
                    audio.src = "data:audio/x-" + name.substr(-3) + ";base64," + encode64(byteArray);
                    finish(audio)
                }
                    ;
                audio.src = url;
                Browser.safeSetTimeout(function () {
                    finish(audio)
                }, 1e4)
            } else {
                return fail()
            }
        }
            ;
        Module["preloadPlugins"].push(audioPlugin);
        function pointerLockChange() {
            Browser.pointerLock = document["pointerLockElement"] === Module["canvas"] || document["mozPointerLockElement"] === Module["canvas"] || document["webkitPointerLockElement"] === Module["canvas"] || document["msPointerLockElement"] === Module["canvas"]
        }
        var canvas = Module["canvas"];
        if (canvas) {
            canvas.requestPointerLock = canvas["requestPointerLock"] || canvas["mozRequestPointerLock"] || canvas["webkitRequestPointerLock"] || canvas["msRequestPointerLock"] || function () { }
                ;
            canvas.exitPointerLock = document["exitPointerLock"] || document["mozExitPointerLock"] || document["webkitExitPointerLock"] || document["msExitPointerLock"] || function () { }
                ;
            canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
            document.addEventListener("pointerlockchange", pointerLockChange, false);
            document.addEventListener("mozpointerlockchange", pointerLockChange, false);
            document.addEventListener("webkitpointerlockchange", pointerLockChange, false);
            document.addEventListener("mspointerlockchange", pointerLockChange, false);
            if (Module["elementPointerLock"]) {
                canvas.addEventListener("click", function (ev) {
                    if (!Browser.pointerLock && Module["canvas"].requestPointerLock) {
                        Module["canvas"].requestPointerLock();
                        ev.preventDefault()
                    }
                }, false)
            }
        }
    },
    createContext: function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        if (useWebGL && Module.ctx && canvas == Module.canvas)
            return Module.ctx;
        var ctx;
        var contextHandle;
        if (useWebGL) {
            var contextAttributes = {
                antialias: false,
                alpha: false,
                majorVersion: 1
            };
            if (webGLContextAttributes) {
                for (var attribute in webGLContextAttributes) {
                    contextAttributes[attribute] = webGLContextAttributes[attribute]
                }
            }
            if (typeof GL !== "undefined") {
                contextHandle = GL.createContext(canvas, contextAttributes);
                if (contextHandle) {
                    ctx = GL.getContext(contextHandle).GLctx
                }
            }
        } else {
            ctx = canvas.getContext("2d")
        }
        if (!ctx)
            return null;
        if (setInModule) {
            if (!useWebGL)
                assert(typeof GLctx === "undefined", "cannot set in module if GLctx is used, but we are a non-GL context that would replace it");
            Module.ctx = ctx;
            if (useWebGL)
                GL.makeContextCurrent(contextHandle);
            Module.useWebGL = useWebGL;
            Browser.moduleContextCreatedCallbacks.forEach(function (callback) {
                callback()
            });
            Browser.init()
        }
        return ctx
    },
    destroyContext: function (canvas, useWebGL, setInModule) { },
    fullscreenHandlersInstalled: false,
    lockPointer: undefined,
    resizeCanvas: undefined,
    requestFullscreen: function (lockPointer, resizeCanvas, vrDevice) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        Browser.vrDevice = vrDevice;
        if (typeof Browser.lockPointer === "undefined")
            Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === "undefined")
            Browser.resizeCanvas = false;
        if (typeof Browser.vrDevice === "undefined")
            Browser.vrDevice = null;
        var canvas = Module["canvas"];
        function fullscreenChange() {
            Browser.isFullscreen = false;
            var canvasContainer = canvas.parentNode;
            if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvasContainer) {
                canvas.exitFullscreen = Browser.exitFullscreen;
                if (Browser.lockPointer)
                    canvas.requestPointerLock();
                Browser.isFullscreen = true;
                if (Browser.resizeCanvas) {
                    Browser.setFullscreenCanvasSize()
                } else {
                    Browser.updateCanvasDimensions(canvas)
                }
            } else {
                canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
                canvasContainer.parentNode.removeChild(canvasContainer);
                if (Browser.resizeCanvas) {
                    Browser.setWindowedCanvasSize()
                } else {
                    Browser.updateCanvasDimensions(canvas)
                }
            }
            if (Module["onFullScreen"])
                Module["onFullScreen"](Browser.isFullscreen);
            if (Module["onFullscreen"])
                Module["onFullscreen"](Browser.isFullscreen)
        }
        if (!Browser.fullscreenHandlersInstalled) {
            Browser.fullscreenHandlersInstalled = true;
            document.addEventListener("fullscreenchange", fullscreenChange, false);
            document.addEventListener("mozfullscreenchange", fullscreenChange, false);
            document.addEventListener("webkitfullscreenchange", fullscreenChange, false);
            document.addEventListener("MSFullscreenChange", fullscreenChange, false)
        }
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        canvasContainer.requestFullscreen = canvasContainer["requestFullscreen"] || canvasContainer["mozRequestFullScreen"] || canvasContainer["msRequestFullscreen"] || (canvasContainer["webkitRequestFullscreen"] ? function () {
            canvasContainer["webkitRequestFullscreen"](Element["ALLOW_KEYBOARD_INPUT"])
        }
            : null) || (canvasContainer["webkitRequestFullScreen"] ? function () {
                canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"])
            }
                : null);
        if (vrDevice) {
            canvasContainer.requestFullscreen({
                vrDisplay: vrDevice
            })
        } else {
            canvasContainer.requestFullscreen()
        }
    },
    requestFullScreen: function (lockPointer, resizeCanvas, vrDevice) {
        err("Browser.requestFullScreen() is deprecated. Please call Browser.requestFullscreen instead.");
        Browser.requestFullScreen = function (lockPointer, resizeCanvas, vrDevice) {
            return Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice)
        }
            ;
        return Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice)
    },
    exitFullscreen: function () {
        if (!Browser.isFullscreen) {
            return false
        }
        var CFS = document["exitFullscreen"] || document["cancelFullScreen"] || document["mozCancelFullScreen"] || document["msExitFullscreen"] || document["webkitCancelFullScreen"] || function () { }
            ;
        CFS.apply(document, []);
        return true
    },
    nextRAF: 0,
    fakeRequestAnimationFrame: function (func) {
        var now = Date.now();
        if (Browser.nextRAF === 0) {
            Browser.nextRAF = now + 1e3 / 60
        } else {
            while (now + 2 >= Browser.nextRAF) {
                Browser.nextRAF += 1e3 / 60
            }
        }
        var delay = Math.max(Browser.nextRAF - now, 0);
        setTimeout(func, delay)
    },
    requestAnimationFrame: function (func) {
        if (typeof requestAnimationFrame === "function") {
            requestAnimationFrame(func);
            return
        }
        var RAF = Browser.fakeRequestAnimationFrame;
        RAF(func)
    },
    safeCallback: function (func) {
        return function () {
            if (!ABORT)
                return func.apply(null, arguments)
        }
    },
    allowAsyncCallbacks: true,
    queuedAsyncCallbacks: [],
    pauseAsyncCallbacks: function () {
        Browser.allowAsyncCallbacks = false
    },
    resumeAsyncCallbacks: function () {
        Browser.allowAsyncCallbacks = true;
        if (Browser.queuedAsyncCallbacks.length > 0) {
            var callbacks = Browser.queuedAsyncCallbacks;
            Browser.queuedAsyncCallbacks = [];
            callbacks.forEach(function (func) {
                func()
            })
        }
    },
    safeRequestAnimationFrame: function (func) {
        return Browser.requestAnimationFrame(function () {
            if (ABORT)
                return;
            if (Browser.allowAsyncCallbacks) {
                func()
            } else {
                Browser.queuedAsyncCallbacks.push(func)
            }
        })
    },
    safeSetTimeout: function (func, timeout) {
        Module["noExitRuntime"] = true;
        return setTimeout(function () {
            if (ABORT)
                return;
            if (Browser.allowAsyncCallbacks) {
                func()
            } else {
                Browser.queuedAsyncCallbacks.push(func)
            }
        }, timeout)
    },
    safeSetInterval: function (func, timeout) {
        Module["noExitRuntime"] = true;
        return setInterval(function () {
            if (ABORT)
                return;
            if (Browser.allowAsyncCallbacks) {
                func()
            }
        }, timeout)
    },
    getMimetype: function (name) {
        return {
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "png": "image/png",
            "bmp": "image/bmp",
            "ogg": "audio/ogg",
            "wav": "audio/wav",
            "mp3": "audio/mpeg"
        }[name.substr(name.lastIndexOf(".") + 1)]
    },
    getUserMedia: function (func) {
        if (!window.getUserMedia) {
            window.getUserMedia = navigator["getUserMedia"] || navigator["mozGetUserMedia"]
        }
        window.getUserMedia(func)
    },
    getMovementX: function (event) {
        return event["movementX"] || event["mozMovementX"] || event["webkitMovementX"] || 0
    },
    getMovementY: function (event) {
        return event["movementY"] || event["mozMovementY"] || event["webkitMovementY"] || 0
    },
    getMouseWheelDelta: function (event) {
        var delta = 0;
        switch (event.type) {
            case "DOMMouseScroll":
                delta = event.detail / 3;
                break;
            case "mousewheel":
                delta = event.wheelDelta / 120;
                break;
            case "wheel":
                delta = event.deltaY;
                switch (event.deltaMode) {
                    case 0:
                        delta /= 100;
                        break;
                    case 1:
                        delta /= 3;
                        break;
                    case 2:
                        delta *= 80;
                        break;
                    default:
                        throw "unrecognized mouse wheel delta mode: " + event.deltaMode
                }
                break;
            default:
                throw "unrecognized mouse wheel event: " + event.type
        }
        return delta
    },
    mouseX: 0,
    mouseY: 0,
    mouseMovementX: 0,
    mouseMovementY: 0,
    touches: {},
    lastTouches: {},
    calculateMouseEvent: function (event) {
        if (Browser.pointerLock) {
            if (event.type != "mousemove" && "mozMovementX" in event) {
                Browser.mouseMovementX = Browser.mouseMovementY = 0
            } else {
                Browser.mouseMovementX = Browser.getMovementX(event);
                Browser.mouseMovementY = Browser.getMovementY(event)
            }
            if (typeof SDL != "undefined") {
                Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
                Browser.mouseY = SDL.mouseY + Browser.mouseMovementY
            } else {
                Browser.mouseX += Browser.mouseMovementX;
                Browser.mouseY += Browser.mouseMovementY
            }
        } else {
            var rect = Module["canvas"].getBoundingClientRect();
            var cw = Module["canvas"].width;
            var ch = Module["canvas"].height;
            var scrollX = typeof window.scrollX !== "undefined" ? window.scrollX : window.pageXOffset;
            var scrollY = typeof window.scrollY !== "undefined" ? window.scrollY : window.pageYOffset;
            assert(typeof scrollX !== "undefined" && typeof scrollY !== "undefined", "Unable to retrieve scroll position, mouse positions likely broken.");
            if (event.type === "touchstart" || event.type === "touchend" || event.type === "touchmove") {
                var touch = event.touch;
                if (touch === undefined) {
                    return
                }
                var adjustedX = touch.pageX - (scrollX + rect.left);
                var adjustedY = touch.pageY - (scrollY + rect.top);
                adjustedX = adjustedX * (cw / rect.width);
                adjustedY = adjustedY * (ch / rect.height);
                var coords = {
                    x: adjustedX,
                    y: adjustedY
                };
                if (event.type === "touchstart") {
                    Browser.lastTouches[touch.identifier] = coords;
                    Browser.touches[touch.identifier] = coords
                } else if (event.type === "touchend" || event.type === "touchmove") {
                    var last = Browser.touches[touch.identifier];
                    if (!last)
                        last = coords;
                    Browser.lastTouches[touch.identifier] = last;
                    Browser.touches[touch.identifier] = coords
                }
                return
            }
            var x = event.pageX - (scrollX + rect.left);
            var y = event.pageY - (scrollY + rect.top);
            x = x * (cw / rect.width);
            y = y * (ch / rect.height);
            Browser.mouseMovementX = x - Browser.mouseX;
            Browser.mouseMovementY = y - Browser.mouseY;
            Browser.mouseX = x;
            Browser.mouseY = y
        }
    },
    asyncLoad: function (url, onload, onerror, noRunDep) {
        var dep = !noRunDep ? getUniqueRunDependency("al " + url) : "";
        readAsync(url, function (arrayBuffer) {
            assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
            onload(new Uint8Array(arrayBuffer));
            if (dep)
                removeRunDependency(dep)
        }, function (event) {
            if (onerror) {
                onerror()
            } else {
                throw 'Loading data file "' + url + '" failed.'
            }
        });
        if (dep)
            addRunDependency(dep)
    },
    resizeListeners: [],
    updateResizeListeners: function () {
        var canvas = Module["canvas"];
        Browser.resizeListeners.forEach(function (listener) {
            listener(canvas.width, canvas.height)
        })
    },
    setCanvasSize: function (width, height, noUpdates) {
        var canvas = Module["canvas"];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates)
            Browser.updateResizeListeners()
    },
    windowedWidth: 0,
    windowedHeight: 0,
    setFullscreenCanvasSize: function () {
        if (typeof SDL != "undefined") {
            var flags = HEAPU32[SDL.screen >> 2];
            flags = flags | 8388608;
            HEAP32[SDL.screen >> 2] = flags
        }
        Browser.updateCanvasDimensions(Module["canvas"]);
        Browser.updateResizeListeners()
    },
    setWindowedCanvasSize: function () {
        if (typeof SDL != "undefined") {
            var flags = HEAPU32[SDL.screen >> 2];
            flags = flags & ~8388608;
            HEAP32[SDL.screen >> 2] = flags
        }
        Browser.updateCanvasDimensions(Module["canvas"]);
        Browser.updateResizeListeners()
    },
    updateCanvasDimensions: function (canvas, wNative, hNative) {
        if (wNative && hNative) {
            canvas.widthNative = wNative;
            canvas.heightNative = hNative
        } else {
            wNative = canvas.widthNative;
            hNative = canvas.heightNative
        }
        var w = wNative;
        var h = hNative;
        if (Module["forcedAspectRatio"] && Module["forcedAspectRatio"] > 0) {
            if (w / h < Module["forcedAspectRatio"]) {
                w = Math.round(h * Module["forcedAspectRatio"])
            } else {
                h = Math.round(w / Module["forcedAspectRatio"])
            }
        }
        if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvas.parentNode && typeof screen != "undefined") {
            var factor = Math.min(screen.width / w, screen.height / h);
            w = Math.round(w * factor);
            h = Math.round(h * factor)
        }
        if (Browser.resizeCanvas) {
            if (canvas.width != w)
                canvas.width = w;
            if (canvas.height != h)
                canvas.height = h;
            if (typeof canvas.style != "undefined") {
                canvas.style.removeProperty("width");
                canvas.style.removeProperty("height")
            }
        } else {
            if (canvas.width != wNative)
                canvas.width = wNative;
            if (canvas.height != hNative)
                canvas.height = hNative;
            if (typeof canvas.style != "undefined") {
                if (w != wNative || h != hNative) {
                    canvas.style.setProperty("width", w + "px", "important");
                    canvas.style.setProperty("height", h + "px", "important")
                } else {
                    canvas.style.removeProperty("width");
                    canvas.style.removeProperty("height")
                }
            }
        }
    },
    wgetRequests: {},
    nextWgetRequestHandle: 0,
    getNextWgetRequestHandle: function () {
        var handle = Browser.nextWgetRequestHandle;
        Browser.nextWgetRequestHandle++;
        return handle
    }
};
function _SDL_GetTicks() {
    return Date.now() - SDL.startTime | 0
}
function _SDL_LockSurface(surf) {
    var surfData = SDL.surfaces[surf];
    surfData.locked++;
    if (surfData.locked > 1)
        return 0;
    if (!surfData.buffer) {
        surfData.buffer = _malloc(surfData.width * surfData.height * 4);
        HEAP32[surf + 20 >> 2] = surfData.buffer
    }
    HEAP32[surf + 20 >> 2] = surfData.buffer;
    if (surf == SDL.screen && Module.screenIsReadOnly && surfData.image)
        return 0;
    if (SDL.defaults.discardOnLock) {
        if (!surfData.image) {
            surfData.image = surfData.ctx.createImageData(surfData.width, surfData.height)
        }
        if (!SDL.defaults.opaqueFrontBuffer)
            return
    } else {
        surfData.image = surfData.ctx.getImageData(0, 0, surfData.width, surfData.height)
    }
    if (surf == SDL.screen && SDL.defaults.opaqueFrontBuffer) {
        var data = surfData.image.data;
        var num = data.length;
        for (var i = 0; i < num / 4; i++) {
            data[i * 4 + 3] = 255
        }
    }
    if (SDL.defaults.copyOnLock && !SDL.defaults.discardOnLock) {
        if (surfData.isFlagSet(2097152)) {
            throw "CopyOnLock is not supported for SDL_LockSurface with SDL_HWPALETTE flag set" + (new Error).stack
        } else {
            HEAPU8.set(surfData.image.data, surfData.buffer)
        }
    }
    return 0
}
var SDL = {
    defaults: {
        width: 320,
        height: 200,
        copyOnLock: true,
        discardOnLock: false,
        opaqueFrontBuffer: true
    },
    version: null,
    surfaces: {},
    canvasPool: [],
    events: [],
    fonts: [null],
    audios: [null],
    rwops: [null],
    music: {
        audio: null,
        volume: 1
    },
    mixerFrequency: 22050,
    mixerFormat: 32784,
    mixerNumChannels: 2,
    mixerChunkSize: 1024,
    channelMinimumNumber: 0,
    GL: false,
    glAttributes: {
        0: 3,
        1: 3,
        2: 2,
        3: 0,
        4: 0,
        5: 1,
        6: 16,
        7: 0,
        8: 0,
        9: 0,
        10: 0,
        11: 0,
        12: 0,
        13: 0,
        14: 0,
        15: 1,
        16: 0,
        17: 0,
        18: 0
    },
    keyboardState: null,
    keyboardMap: {},
    canRequestFullscreen: false,
    isRequestingFullscreen: false,
    textInput: false,
    startTime: null,
    initFlags: 0,
    buttonState: 0,
    modState: 0,
    DOMButtons: [0, 0, 0],
    DOMEventToSDLEvent: {},
    TOUCH_DEFAULT_ID: 0,
    eventHandler: null,
    eventHandlerContext: null,
    eventHandlerTemp: 0,
    keyCodes: {
        16: 1249,
        17: 1248,
        18: 1250,
        20: 1081,
        33: 1099,
        34: 1102,
        35: 1101,
        36: 1098,
        37: 1104,
        38: 1106,
        39: 1103,
        40: 1105,
        44: 316,
        45: 1097,
        46: 127,
        91: 1251,
        93: 1125,
        96: 1122,
        97: 1113,
        98: 1114,
        99: 1115,
        100: 1116,
        101: 1117,
        102: 1118,
        103: 1119,
        104: 1120,
        105: 1121,
        106: 1109,
        107: 1111,
        109: 1110,
        110: 1123,
        111: 1108,
        112: 1082,
        113: 1083,
        114: 1084,
        115: 1085,
        116: 1086,
        117: 1087,
        118: 1088,
        119: 1089,
        120: 1090,
        121: 1091,
        122: 1092,
        123: 1093,
        124: 1128,
        125: 1129,
        126: 1130,
        127: 1131,
        128: 1132,
        129: 1133,
        130: 1134,
        131: 1135,
        132: 1136,
        133: 1137,
        134: 1138,
        135: 1139,
        144: 1107,
        160: 94,
        161: 33,
        162: 34,
        163: 35,
        164: 36,
        165: 37,
        166: 38,
        167: 95,
        168: 40,
        169: 41,
        170: 42,
        171: 43,
        172: 124,
        173: 45,
        174: 123,
        175: 125,
        176: 126,
        181: 127,
        182: 129,
        183: 128,
        188: 44,
        190: 46,
        191: 47,
        192: 96,
        219: 91,
        220: 92,
        221: 93,
        222: 39,
        224: 1251
    },
    scanCodes: {
        8: 42,
        9: 43,
        13: 40,
        27: 41,
        32: 44,
        35: 204,
        39: 53,
        44: 54,
        46: 55,
        47: 56,
        48: 39,
        49: 30,
        50: 31,
        51: 32,
        52: 33,
        53: 34,
        54: 35,
        55: 36,
        56: 37,
        57: 38,
        58: 203,
        59: 51,
        61: 46,
        91: 47,
        92: 49,
        93: 48,
        96: 52,
        97: 4,
        98: 5,
        99: 6,
        100: 7,
        101: 8,
        102: 9,
        103: 10,
        104: 11,
        105: 12,
        106: 13,
        107: 14,
        108: 15,
        109: 16,
        110: 17,
        111: 18,
        112: 19,
        113: 20,
        114: 21,
        115: 22,
        116: 23,
        117: 24,
        118: 25,
        119: 26,
        120: 27,
        121: 28,
        122: 29,
        127: 76,
        305: 224,
        308: 226,
        316: 70
    },
    loadRect: function (rect) {
        return {
            x: HEAP32[rect + 0 >> 2],
            y: HEAP32[rect + 4 >> 2],
            w: HEAP32[rect + 8 >> 2],
            h: HEAP32[rect + 12 >> 2]
        }
    },
    updateRect: function (rect, r) {
        HEAP32[rect >> 2] = r.x;
        HEAP32[rect + 4 >> 2] = r.y;
        HEAP32[rect + 8 >> 2] = r.w;
        HEAP32[rect + 12 >> 2] = r.h
    },
    intersectionOfRects: function (first, second) {
        var leftX = Math.max(first.x, second.x);
        var leftY = Math.max(first.y, second.y);
        var rightX = Math.min(first.x + first.w, second.x + second.w);
        var rightY = Math.min(first.y + first.h, second.y + second.h);
        return {
            x: leftX,
            y: leftY,
            w: Math.max(leftX, rightX) - leftX,
            h: Math.max(leftY, rightY) - leftY
        }
    },
    checkPixelFormat: function (fmt) {
        var format = HEAP32[fmt >> 2];
        if (format != -2042224636) {
            warnOnce("Unsupported pixel format!")
        }
    },
    loadColorToCSSRGB: function (color) {
        var rgba = HEAP32[color >> 2];
        return "rgb(" + (rgba & 255) + "," + (rgba >> 8 & 255) + "," + (rgba >> 16 & 255) + ")"
    },
    loadColorToCSSRGBA: function (color) {
        var rgba = HEAP32[color >> 2];
        return "rgba(" + (rgba & 255) + "," + (rgba >> 8 & 255) + "," + (rgba >> 16 & 255) + "," + (rgba >> 24 & 255) / 255 + ")"
    },
    translateColorToCSSRGBA: function (rgba) {
        return "rgba(" + (rgba & 255) + "," + (rgba >> 8 & 255) + "," + (rgba >> 16 & 255) + "," + (rgba >>> 24) / 255 + ")"
    },
    translateRGBAToCSSRGBA: function (r, g, b, a) {
        return "rgba(" + (r & 255) + "," + (g & 255) + "," + (b & 255) + "," + (a & 255) / 255 + ")"
    },
    translateRGBAToColor: function (r, g, b, a) {
        return r | g << 8 | b << 16 | a << 24
    },
    makeSurface: function (width, height, flags, usePageCanvas, source, rmask, gmask, bmask, amask) {
        flags = flags || 0;
        var is_SDL_HWSURFACE = flags & 1;
        var is_SDL_HWPALETTE = flags & 2097152;
        var is_SDL_OPENGL = flags & 67108864;
        var surf = _malloc(60);
        var pixelFormat = _malloc(44);
        var bpp = is_SDL_HWPALETTE ? 1 : 4;
        var buffer = 0;
        if (!is_SDL_HWSURFACE && !is_SDL_OPENGL) {
            buffer = _malloc(width * height * 4)
        }
        HEAP32[surf >> 2] = flags;
        HEAP32[surf + 4 >> 2] = pixelFormat;
        HEAP32[surf + 8 >> 2] = width;
        HEAP32[surf + 12 >> 2] = height;
        HEAP32[surf + 16 >> 2] = width * bpp;
        HEAP32[surf + 20 >> 2] = buffer;
        HEAP32[surf + 36 >> 2] = 0;
        HEAP32[surf + 40 >> 2] = 0;
        HEAP32[surf + 44 >> 2] = Module["canvas"].width;
        HEAP32[surf + 48 >> 2] = Module["canvas"].height;
        HEAP32[surf + 56 >> 2] = 1;
        HEAP32[pixelFormat >> 2] = -2042224636;
        HEAP32[pixelFormat + 4 >> 2] = 0;
        HEAP8[pixelFormat + 8 >> 0] = bpp * 8;
        HEAP8[pixelFormat + 9 >> 0] = bpp;
        HEAP32[pixelFormat + 12 >> 2] = rmask || 255;
        HEAP32[pixelFormat + 16 >> 2] = gmask || 65280;
        HEAP32[pixelFormat + 20 >> 2] = bmask || 16711680;
        HEAP32[pixelFormat + 24 >> 2] = amask || 4278190080;
        SDL.GL = SDL.GL || is_SDL_OPENGL;
        var canvas;
        if (!usePageCanvas) {
            if (SDL.canvasPool.length > 0) {
                canvas = SDL.canvasPool.pop()
            } else {
                canvas = document.createElement("canvas")
            }
            canvas.width = width;
            canvas.height = height
        } else {
            canvas = Module["canvas"]
        }
        var webGLContextAttributes = {
            antialias: SDL.glAttributes[13] != 0 && SDL.glAttributes[14] > 1,
            depth: SDL.glAttributes[6] > 0,
            stencil: SDL.glAttributes[7] > 0,
            alpha: SDL.glAttributes[3] > 0
        };
        var ctx = Browser.createContext(canvas, is_SDL_OPENGL, usePageCanvas, webGLContextAttributes);
        SDL.surfaces[surf] = {
            width: width,
            height: height,
            canvas: canvas,
            ctx: ctx,
            surf: surf,
            buffer: buffer,
            pixelFormat: pixelFormat,
            alpha: 255,
            flags: flags,
            locked: 0,
            usePageCanvas: usePageCanvas,
            source: source,
            isFlagSet: function (flag) {
                return flags & flag
            }
        };
        return surf
    },
    copyIndexedColorData: function (surfData, rX, rY, rW, rH) {
        if (!surfData.colors) {
            return
        }
        var fullWidth = Module["canvas"].width;
        var fullHeight = Module["canvas"].height;
        var startX = rX || 0;
        var startY = rY || 0;
        var endX = (rW || fullWidth - startX) + startX;
        var endY = (rH || fullHeight - startY) + startY;
        var buffer = surfData.buffer;
        if (!surfData.image.data32) {
            surfData.image.data32 = new Uint32Array(surfData.image.data.buffer)
        }
        var data32 = surfData.image.data32;
        var colors32 = surfData.colors32;
        for (var y = startY; y < endY; ++y) {
            var base = y * fullWidth;
            for (var x = startX; x < endX; ++x) {
                data32[base + x] = colors32[HEAPU8[buffer + base + x >> 0]]
            }
        }
    },
    freeSurface: function (surf) {
        var refcountPointer = surf + 56;
        var refcount = HEAP32[refcountPointer >> 2];
        if (refcount > 1) {
            HEAP32[refcountPointer >> 2] = refcount - 1;
            return
        }
        var info = SDL.surfaces[surf];
        if (!info.usePageCanvas && info.canvas)
            SDL.canvasPool.push(info.canvas);
        if (info.buffer)
            _free(info.buffer);
        _free(info.pixelFormat);
        _free(surf);
        SDL.surfaces[surf] = null;
        if (surf === SDL.screen) {
            SDL.screen = null
        }
    },
    blitSurface: function (src, srcrect, dst, dstrect, scale) {
        var srcData = SDL.surfaces[src];
        var dstData = SDL.surfaces[dst];
        var sr, dr;
        if (srcrect) {
            sr = SDL.loadRect(srcrect)
        } else {
            sr = {
                x: 0,
                y: 0,
                w: srcData.width,
                h: srcData.height
            }
        }
        if (dstrect) {
            dr = SDL.loadRect(dstrect)
        } else {
            dr = {
                x: 0,
                y: 0,
                w: srcData.width,
                h: srcData.height
            }
        }
        if (dstData.clipRect) {
            var widthScale = !scale || sr.w === 0 ? 1 : sr.w / dr.w;
            var heightScale = !scale || sr.h === 0 ? 1 : sr.h / dr.h;
            dr = SDL.intersectionOfRects(dstData.clipRect, dr);
            sr.w = dr.w * widthScale;
            sr.h = dr.h * heightScale;
            if (dstrect) {
                SDL.updateRect(dstrect, dr)
            }
        }
        var blitw, blith;
        if (scale) {
            blitw = dr.w;
            blith = dr.h
        } else {
            blitw = sr.w;
            blith = sr.h
        }
        if (sr.w === 0 || sr.h === 0 || blitw === 0 || blith === 0) {
            return 0
        }
        var oldAlpha = dstData.ctx.globalAlpha;
        dstData.ctx.globalAlpha = srcData.alpha / 255;
        dstData.ctx.drawImage(srcData.canvas, sr.x, sr.y, sr.w, sr.h, dr.x, dr.y, blitw, blith);
        dstData.ctx.globalAlpha = oldAlpha;
        if (dst != SDL.screen) {
            warnOnce("WARNING: copying canvas data to memory for compatibility");
            _SDL_LockSurface(dst);
            dstData.locked--
        }
        return 0
    },
    downFingers: {},
    savedKeydown: null,
    receiveEvent: function (event) {
        function unpressAllPressedKeys() {
            for (var code in SDL.keyboardMap) {
                SDL.events.push({
                    type: "keyup",
                    keyCode: SDL.keyboardMap[code]
                })
            }
        }
        switch (event.type) {
            case "touchstart":
            case "touchmove":
                {
                    event.preventDefault();
                    var touches = [];
                    if (event.type === "touchstart") {
                        for (var i = 0; i < event.touches.length; i++) {
                            var touch = event.touches[i];
                            if (SDL.downFingers[touch.identifier] != true) {
                                SDL.downFingers[touch.identifier] = true;
                                touches.push(touch)
                            }
                        }
                    } else {
                        touches = event.touches
                    }
                    var firstTouch = touches[0];
                    if (firstTouch) {
                        if (event.type == "touchstart") {
                            SDL.DOMButtons[0] = 1
                        }
                        var mouseEventType;
                        switch (event.type) {
                            case "touchstart":
                                mouseEventType = "mousedown";
                                break;
                            case "touchmove":
                                mouseEventType = "mousemove";
                                break
                        }
                        var mouseEvent = {
                            type: mouseEventType,
                            button: 0,
                            pageX: firstTouch.clientX,
                            pageY: firstTouch.clientY
                        };
                        SDL.events.push(mouseEvent)
                    }
                    for (var i = 0; i < touches.length; i++) {
                        var touch = touches[i];
                        SDL.events.push({
                            type: event.type,
                            touch: touch
                        })
                    }
                    break
                }
            case "touchend":
                {
                    event.preventDefault();
                    for (var i = 0; i < event.changedTouches.length; i++) {
                        var touch = event.changedTouches[i];
                        if (SDL.downFingers[touch.identifier] === true) {
                            delete SDL.downFingers[touch.identifier]
                        }
                    }
                    var mouseEvent = {
                        type: "mouseup",
                        button: 0,
                        pageX: event.changedTouches[0].clientX,
                        pageY: event.changedTouches[0].clientY
                    };
                    SDL.DOMButtons[0] = 0;
                    SDL.events.push(mouseEvent);
                    for (var i = 0; i < event.changedTouches.length; i++) {
                        var touch = event.changedTouches[i];
                        SDL.events.push({
                            type: "touchend",
                            touch: touch
                        })
                    }
                    break
                }
            case "DOMMouseScroll":
            case "mousewheel":
            case "wheel":
                var delta = -Browser.getMouseWheelDelta(event);
                delta = delta == 0 ? 0 : delta > 0 ? Math.max(delta, 1) : Math.min(delta, -1);
                var button = delta > 0 ? 3 : 4;
                SDL.events.push({
                    type: "mousedown",
                    button: button,
                    pageX: event.pageX,
                    pageY: event.pageY
                });
                SDL.events.push({
                    type: "mouseup",
                    button: button,
                    pageX: event.pageX,
                    pageY: event.pageY
                });
                SDL.events.push({
                    type: "wheel",
                    deltaX: 0,
                    deltaY: delta
                });
                event.preventDefault();
                break;
            case "mousemove":
                if (SDL.DOMButtons[0] === 1) {
                    SDL.events.push({
                        type: "touchmove",
                        touch: {
                            identifier: 0,
                            deviceID: -1,
                            pageX: event.pageX,
                            pageY: event.pageY
                        }
                    })
                }
                if (Browser.pointerLock) {
                    if ("mozMovementX" in event) {
                        event["movementX"] = event["mozMovementX"];
                        event["movementY"] = event["mozMovementY"]
                    }
                    if (event["movementX"] == 0 && event["movementY"] == 0) {
                        event.preventDefault();
                        return
                    }
                }
            case "keydown":
            case "keyup":
            case "keypress":
            case "mousedown":
            case "mouseup":
                if (event.type !== "keydown" || !SDL.unicode && !SDL.textInput || (event.keyCode === 8 || event.keyCode === 9)) {
                    event.preventDefault()
                }
                if (event.type == "mousedown") {
                    SDL.DOMButtons[event.button] = 1;
                    SDL.events.push({
                        type: "touchstart",
                        touch: {
                            identifier: 0,
                            deviceID: -1,
                            pageX: event.pageX,
                            pageY: event.pageY
                        }
                    })
                } else if (event.type == "mouseup") {
                    if (!SDL.DOMButtons[event.button]) {
                        return
                    }
                    SDL.events.push({
                        type: "touchend",
                        touch: {
                            identifier: 0,
                            deviceID: -1,
                            pageX: event.pageX,
                            pageY: event.pageY
                        }
                    });
                    SDL.DOMButtons[event.button] = 0
                }
                if (event.type === "keydown" || event.type === "mousedown") {
                    SDL.canRequestFullscreen = true
                } else if (event.type === "keyup" || event.type === "mouseup") {
                    if (SDL.isRequestingFullscreen) {
                        Module["requestFullscreen"](true, true);
                        SDL.isRequestingFullscreen = false
                    }
                    SDL.canRequestFullscreen = false
                }
                if (event.type === "keypress" && SDL.savedKeydown) {
                    SDL.savedKeydown.keypressCharCode = event.charCode;
                    SDL.savedKeydown = null
                } else if (event.type === "keydown") {
                    SDL.savedKeydown = event
                }
                if (event.type !== "keypress" || SDL.textInput) {
                    SDL.events.push(event)
                }
                break;
            case "mouseout":
                for (var i = 0; i < 3; i++) {
                    if (SDL.DOMButtons[i]) {
                        SDL.events.push({
                            type: "mouseup",
                            button: i,
                            pageX: event.pageX,
                            pageY: event.pageY
                        });
                        SDL.DOMButtons[i] = 0
                    }
                }
                event.preventDefault();
                break;
            case "focus":
                SDL.events.push(event);
                event.preventDefault();
                break;
            case "blur":
                SDL.events.push(event);
                unpressAllPressedKeys();
                event.preventDefault();
                break;
            case "visibilitychange":
                SDL.events.push({
                    type: "visibilitychange",
                    visible: !document.hidden
                });
                unpressAllPressedKeys();
                event.preventDefault();
                break;
            case "unload":
                if (Browser.mainLoop.runner) {
                    SDL.events.push(event);
                    Browser.mainLoop.runner()
                }
                return;
            case "resize":
                SDL.events.push(event);
                if (event.preventDefault) {
                    event.preventDefault()
                }
                break
        }
        if (SDL.events.length >= 1e4) {
            err("SDL event queue full, dropping events");
            SDL.events = SDL.events.slice(0, 1e4)
        }
        SDL.flushEventsToHandler();
        return
    },
    lookupKeyCodeForEvent: function (event) {
        var code = event.keyCode;
        if (code >= 65 && code <= 90) {
            code += 32
        } else {
            code = SDL.keyCodes[event.keyCode] || event.keyCode;
            if (event.location === KeyboardEvent.DOM_KEY_LOCATION_RIGHT && code >= (224 | 1 << 10) && code <= (227 | 1 << 10)) {
                code += 4
            }
        }
        return code
    },
    handleEvent: function (event) {
        if (event.handled)
            return;
        event.handled = true;
        switch (event.type) {
            case "touchstart":
            case "touchend":
            case "touchmove":
                {
                    Browser.calculateMouseEvent(event);
                    break
                }
            case "keydown":
            case "keyup":
                {
                    var down = event.type === "keydown";
                    var code = SDL.lookupKeyCodeForEvent(event);
                    HEAP8[SDL.keyboardState + code >> 0] = down;
                    SDL.modState = (HEAP8[SDL.keyboardState + 1248 >> 0] ? 64 : 0) | (HEAP8[SDL.keyboardState + 1249 >> 0] ? 1 : 0) | (HEAP8[SDL.keyboardState + 1250 >> 0] ? 256 : 0) | (HEAP8[SDL.keyboardState + 1252 >> 0] ? 128 : 0) | (HEAP8[SDL.keyboardState + 1253 >> 0] ? 2 : 0) | (HEAP8[SDL.keyboardState + 1254 >> 0] ? 512 : 0);
                    if (down) {
                        SDL.keyboardMap[code] = event.keyCode
                    } else {
                        delete SDL.keyboardMap[code]
                    }
                    break
                }
            case "mousedown":
            case "mouseup":
                if (event.type == "mousedown") {
                    SDL.buttonState |= 1 << event.button
                } else if (event.type == "mouseup") {
                    SDL.buttonState &= ~(1 << event.button)
                }
            case "mousemove":
                {
                    Browser.calculateMouseEvent(event);
                    break
                }
        }
    },
    flushEventsToHandler: function () {
        if (!SDL.eventHandler)
            return;
        while (SDL.pollEvent(SDL.eventHandlerTemp)) {
            Module["dynCall_iii"](SDL.eventHandler, SDL.eventHandlerContext, SDL.eventHandlerTemp)
        }
    },
    pollEvent: function (ptr) {
        if (SDL.initFlags & 512 && SDL.joystickEventState) {
            SDL.queryJoysticks()
        }
        if (ptr) {
            while (SDL.events.length > 0) {
                if (SDL.makeCEvent(SDL.events.shift(), ptr) !== false)
                    return 1
            }
            return 0
        } else {
            return SDL.events.length > 0
        }
    },
    makeCEvent: function (event, ptr) {
        if (typeof event === "number") {
            _memcpy(ptr, event, 28);
            _free(event);
            return
        }
        SDL.handleEvent(event);
        switch (event.type) {
            case "keydown":
            case "keyup":
                {
                    var down = event.type === "keydown";
                    var key = SDL.lookupKeyCodeForEvent(event);
                    var scan;
                    if (key >= 1024) {
                        scan = key - 1024
                    } else {
                        scan = SDL.scanCodes[key] || key
                    }
                    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                    HEAP8[ptr + 8 >> 0] = down ? 1 : 0;
                    HEAP8[ptr + 9 >> 0] = 0;
                    HEAP32[ptr + 12 >> 2] = scan;
                    HEAP32[ptr + 16 >> 2] = key;
                    HEAP16[ptr + 20 >> 1] = SDL.modState;
                    HEAP32[ptr + 24 >> 2] = event.keypressCharCode || key;
                    break
                }
            case "keypress":
                {
                    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                    var cStr = intArrayFromString(String.fromCharCode(event.charCode));
                    for (var i = 0; i < cStr.length; ++i) {
                        HEAP8[ptr + (8 + i) >> 0] = cStr[i]
                    }
                    break
                }
            case "mousedown":
            case "mouseup":
            case "mousemove":
                {
                    if (event.type != "mousemove") {
                        var down = event.type === "mousedown";
                        HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                        HEAP32[ptr + 4 >> 2] = 0;
                        HEAP32[ptr + 8 >> 2] = 0;
                        HEAP32[ptr + 12 >> 2] = 0;
                        HEAP8[ptr + 16 >> 0] = event.button + 1;
                        HEAP8[ptr + 17 >> 0] = down ? 1 : 0;
                        HEAP32[ptr + 20 >> 2] = Browser.mouseX;
                        HEAP32[ptr + 24 >> 2] = Browser.mouseY
                    } else {
                        HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                        HEAP32[ptr + 4 >> 2] = 0;
                        HEAP32[ptr + 8 >> 2] = 0;
                        HEAP32[ptr + 12 >> 2] = 0;
                        HEAP32[ptr + 16 >> 2] = SDL.buttonState;
                        HEAP32[ptr + 20 >> 2] = Browser.mouseX;
                        HEAP32[ptr + 24 >> 2] = Browser.mouseY;
                        HEAP32[ptr + 28 >> 2] = Browser.mouseMovementX;
                        HEAP32[ptr + 32 >> 2] = Browser.mouseMovementY
                    }
                    break
                }
            case "wheel":
                {
                    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                    HEAP32[ptr + 16 >> 2] = event.deltaX;
                    HEAP32[ptr + 20 >> 2] = event.deltaY;
                    break
                }
            case "touchstart":
            case "touchend":
            case "touchmove":
                {
                    var touch = event.touch;
                    if (!Browser.touches[touch.identifier])
                        break;
                    var w = Module["canvas"].width;
                    var h = Module["canvas"].height;
                    var x = Browser.touches[touch.identifier].x / w;
                    var y = Browser.touches[touch.identifier].y / h;
                    var lx = Browser.lastTouches[touch.identifier].x / w;
                    var ly = Browser.lastTouches[touch.identifier].y / h;
                    var dx = x - lx;
                    var dy = y - ly;
                    if (touch["deviceID"] === undefined)
                        touch.deviceID = SDL.TOUCH_DEFAULT_ID;
                    if (dx === 0 && dy === 0 && event.type === "touchmove")
                        return false;
                    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                    HEAP32[ptr + 4 >> 2] = _SDL_GetTicks();
                    tempI64 = [touch.deviceID >>> 0, (tempDouble = touch.deviceID,
                        +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)],
                        HEAP32[ptr + 8 >> 2] = tempI64[0],
                        HEAP32[ptr + 12 >> 2] = tempI64[1];
                    tempI64 = [touch.identifier >>> 0, (tempDouble = touch.identifier,
                        +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)],
                        HEAP32[ptr + 16 >> 2] = tempI64[0],
                        HEAP32[ptr + 20 >> 2] = tempI64[1];
                    HEAPF32[ptr + 24 >> 2] = x;
                    HEAPF32[ptr + 28 >> 2] = y;
                    HEAPF32[ptr + 32 >> 2] = dx;
                    HEAPF32[ptr + 36 >> 2] = dy;
                    if (touch.force !== undefined) {
                        HEAPF32[ptr + 40 >> 2] = touch.force
                    } else {
                        HEAPF32[ptr + 40 >> 2] = event.type == "touchend" ? 0 : 1
                    }
                    break
                }
            case "unload":
                {
                    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                    break
                }
            case "resize":
                {
                    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                    HEAP32[ptr + 4 >> 2] = event.w;
                    HEAP32[ptr + 8 >> 2] = event.h;
                    break
                }
            case "joystick_button_up":
            case "joystick_button_down":
                {
                    var state = event.type === "joystick_button_up" ? 0 : 1;
                    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                    HEAP8[ptr + 4 >> 0] = event.index;
                    HEAP8[ptr + 5 >> 0] = event.button;
                    HEAP8[ptr + 6 >> 0] = state;
                    break
                }
            case "joystick_axis_motion":
                {
                    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                    HEAP8[ptr + 4 >> 0] = event.index;
                    HEAP8[ptr + 5 >> 0] = event.axis;
                    HEAP32[ptr + 8 >> 2] = SDL.joystickAxisValueConversion(event.value);
                    break
                }
            case "focus":
                {
                    var SDL_WINDOWEVENT_FOCUS_GAINED = 12;
                    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                    HEAP32[ptr + 4 >> 2] = 0;
                    HEAP8[ptr + 8 >> 0] = SDL_WINDOWEVENT_FOCUS_GAINED;
                    break
                }
            case "blur":
                {
                    var SDL_WINDOWEVENT_FOCUS_LOST = 13;
                    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                    HEAP32[ptr + 4 >> 2] = 0;
                    HEAP8[ptr + 8 >> 0] = SDL_WINDOWEVENT_FOCUS_LOST;
                    break
                }
            case "visibilitychange":
                {
                    var SDL_WINDOWEVENT_SHOWN = 1;
                    var SDL_WINDOWEVENT_HIDDEN = 2;
                    var visibilityEventID = event.visible ? SDL_WINDOWEVENT_SHOWN : SDL_WINDOWEVENT_HIDDEN;
                    HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
                    HEAP32[ptr + 4 >> 2] = 0;
                    HEAP8[ptr + 8 >> 0] = visibilityEventID;
                    break
                }
            default:
                throw "Unhandled SDL event: " + event.type
        }
    },
    makeFontString: function (height, fontName) {
        if (fontName.charAt(0) != "'" && fontName.charAt(0) != '"') {
            fontName = '"' + fontName + '"'
        }
        return height + "px " + fontName + ", serif"
    },
    estimateTextWidth: function (fontData, text) {
        var h = fontData.size;
        var fontString = SDL.makeFontString(h, fontData.name);
        var tempCtx = SDL.ttfContext;
        assert(tempCtx, "TTF_Init must have been called");
        tempCtx.font = fontString;
        var ret = tempCtx.measureText(text).width | 0;
        return ret
    },
    allocateChannels: function (num) {
        if (SDL.numChannels && SDL.numChannels >= num && num != 0)
            return;
        SDL.numChannels = num;
        SDL.channels = [];
        for (var i = 0; i < num; i++) {
            SDL.channels[i] = {
                audio: null,
                volume: 1
            }
        }
    },
    setGetVolume: function (info, volume) {
        if (!info)
            return 0;
        var ret = info.volume * 128;
        if (volume != -1) {
            info.volume = Math.min(Math.max(volume, 0), 128) / 128;
            if (info.audio) {
                try {
                    info.audio.volume = info.volume;
                    if (info.audio.webAudioGainNode)
                        info.audio.webAudioGainNode["gain"]["value"] = info.volume
                } catch (e) {
                    err("setGetVolume failed to set audio volume: " + e)
                }
            }
        }
        return ret
    },
    setPannerPosition: function (info, x, y, z) {
        if (!info)
            return;
        if (info.audio) {
            if (info.audio.webAudioPannerNode) {
                info.audio.webAudioPannerNode["setPosition"](x, y, z)
            }
        }
    },
    playWebAudio: function (audio) {
        if (!audio)
            return;
        if (audio.webAudioNode)
            return;
        if (!SDL.webAudioAvailable())
            return;
        try {
            var webAudio = audio.resource.webAudio;
            audio.paused = false;
            if (!webAudio.decodedBuffer) {
                if (webAudio.onDecodeComplete === undefined)
                    abort("Cannot play back audio object that was not loaded");
                webAudio.onDecodeComplete.push(function () {
                    if (!audio.paused)
                        SDL.playWebAudio(audio)
                });
                return
            }
            audio.webAudioNode = SDL.audioContext["createBufferSource"]();
            audio.webAudioNode["buffer"] = webAudio.decodedBuffer;
            audio.webAudioNode["loop"] = audio.loop;
            audio.webAudioNode["onended"] = function () {
                audio["onended"]()
            }
                ;
            audio.webAudioPannerNode = SDL.audioContext["createPanner"]();
            audio.webAudioPannerNode["setPosition"](0, 0, -.5);
            audio.webAudioPannerNode["panningModel"] = "equalpower";
            audio.webAudioGainNode = SDL.audioContext["createGain"]();
            audio.webAudioGainNode["gain"]["value"] = audio.volume;
            audio.webAudioNode["connect"](audio.webAudioPannerNode);
            audio.webAudioPannerNode["connect"](audio.webAudioGainNode);
            audio.webAudioGainNode["connect"](SDL.audioContext["destination"]);
            audio.webAudioNode["start"](0, audio.currentPosition);
            audio.startTime = SDL.audioContext["currentTime"] - audio.currentPosition
        } catch (e) {
            err("playWebAudio failed: " + e)
        }
    },
    pauseWebAudio: function (audio) {
        if (!audio)
            return;
        if (audio.webAudioNode) {
            try {
                audio.currentPosition = (SDL.audioContext["currentTime"] - audio.startTime) % audio.resource.webAudio.decodedBuffer.duration;
                audio.webAudioNode["onended"] = undefined;
                audio.webAudioNode.stop(0);
                audio.webAudioNode = undefined
            } catch (e) {
                err("pauseWebAudio failed: " + e)
            }
        }
        audio.paused = true
    },
    openAudioContext: function () {
        if (!SDL.audioContext) {
            if (typeof AudioContext !== "undefined")
                SDL.audioContext = new AudioContext;
            else if (typeof webkitAudioContext !== "undefined")
                SDL.audioContext = new webkitAudioContext
        }
    },
    webAudioAvailable: function () {
        return !!SDL.audioContext
    },
    fillWebAudioBufferFromHeap: function (heapPtr, sizeSamplesPerChannel, dstAudioBuffer) {
        var numChannels = SDL.audio.channels;
        for (var c = 0; c < numChannels; ++c) {
            var channelData = dstAudioBuffer["getChannelData"](c);
            if (channelData.length != sizeSamplesPerChannel) {
                throw "Web Audio output buffer length mismatch! Destination size: " + channelData.length + " samples vs expected " + sizeSamplesPerChannel + " samples!"
            }
            if (SDL.audio.format == 32784) {
                for (var j = 0; j < sizeSamplesPerChannel; ++j) {
                    channelData[j] = HEAP16[heapPtr + (j * numChannels + c) * 2 >> 1] / 32768
                }
            } else if (SDL.audio.format == 8) {
                for (var j = 0; j < sizeSamplesPerChannel; ++j) {
                    var v = HEAP8[heapPtr + (j * numChannels + c) >> 0];
                    channelData[j] = (v >= 0 ? v - 128 : v + 128) / 128
                }
            } else if (SDL.audio.format == 33056) {
                for (var j = 0; j < sizeSamplesPerChannel; ++j) {
                    channelData[j] = HEAPF32[heapPtr + (j * numChannels + c) * 4 >> 2]
                }
            } else {
                throw "Invalid SDL audio format " + SDL.audio.format + "!"
            }
        }
    },
    debugSurface: function (surfData) {
        console.log("dumping surface " + [surfData.surf, surfData.source, surfData.width, surfData.height]);
        var image = surfData.ctx.getImageData(0, 0, surfData.width, surfData.height);
        var data = image.data;
        var num = Math.min(surfData.width, surfData.height);
        for (var i = 0; i < num; i++) {
            console.log("   diagonal " + i + ":" + [data[i * surfData.width * 4 + i * 4 + 0], data[i * surfData.width * 4 + i * 4 + 1], data[i * surfData.width * 4 + i * 4 + 2], data[i * surfData.width * 4 + i * 4 + 3]])
        }
    },
    joystickEventState: 1,
    lastJoystickState: {},
    joystickNamePool: {},
    recordJoystickState: function (joystick, state) {
        var buttons = new Array(state.buttons.length);
        for (var i = 0; i < state.buttons.length; i++) {
            buttons[i] = SDL.getJoystickButtonState(state.buttons[i])
        }
        SDL.lastJoystickState[joystick] = {
            buttons: buttons,
            axes: state.axes.slice(0),
            timestamp: state.timestamp,
            index: state.index,
            id: state.id
        }
    },
    getJoystickButtonState: function (button) {
        if (typeof button === "object") {
            return button["pressed"]
        } else {
            return button > 0
        }
    },
    queryJoysticks: function () {
        for (var joystick in SDL.lastJoystickState) {
            var state = SDL.getGamepad(joystick - 1);
            var prevState = SDL.lastJoystickState[joystick];
            if (typeof state === "undefined")
                return;
            if (state === null)
                return;
            if (typeof state.timestamp !== "number" || state.timestamp !== prevState.timestamp || !state.timestamp) {
                var i;
                for (i = 0; i < state.buttons.length; i++) {
                    var buttonState = SDL.getJoystickButtonState(state.buttons[i]);
                    if (buttonState !== prevState.buttons[i]) {
                        SDL.events.push({
                            type: buttonState ? "joystick_button_down" : "joystick_button_up",
                            joystick: joystick,
                            index: joystick - 1,
                            button: i
                        })
                    }
                }
                for (i = 0; i < state.axes.length; i++) {
                    if (state.axes[i] !== prevState.axes[i]) {
                        SDL.events.push({
                            type: "joystick_axis_motion",
                            joystick: joystick,
                            index: joystick - 1,
                            axis: i,
                            value: state.axes[i]
                        })
                    }
                }
                SDL.recordJoystickState(joystick, state)
            }
        }
    },
    joystickAxisValueConversion: function (value) {
        value = Math.min(1, Math.max(value, -1));
        return Math.ceil((value + 1) * 32767.5 - 32768)
    },
    getGamepads: function () {
        var fcn = navigator.getGamepads || navigator.webkitGamepads || navigator.mozGamepads || navigator.gamepads || navigator.webkitGetGamepads;
        if (fcn !== undefined) {
            return fcn.apply(navigator)
        } else {
            return []
        }
    },
    getGamepad: function (deviceIndex) {
        var gamepads = SDL.getGamepads();
        if (gamepads.length > deviceIndex && deviceIndex >= 0) {
            return gamepads[deviceIndex]
        }
        return null
    }
};
function _SDL_GL_SetAttribute(attr, value) {
    if (!(attr in SDL.glAttributes)) {
        abort("Unknown SDL GL attribute (" + attr + "). Please check if your SDL version is supported.")
    }
    SDL.glAttributes[attr] = value
}
function _SDL_GL_SwapBuffers() {
    if (Browser.doSwapBuffers)
        Browser.doSwapBuffers()
}
function _SDL_GetError() {
    if (!SDL.errorMessage) {
        SDL.errorMessage = allocate(intArrayFromString("unknown SDL-emscripten error"), "i8", ALLOC_NORMAL)
    }
    return SDL.errorMessage
}
function _SDL_Init(initFlags) {
    SDL.startTime = Date.now();
    SDL.initFlags = initFlags;
    if (!Module["doNotCaptureKeyboard"]) {
        var keyboardListeningElement = Module["keyboardListeningElement"] || document;
        keyboardListeningElement.addEventListener("keydown", SDL.receiveEvent);
        keyboardListeningElement.addEventListener("keyup", SDL.receiveEvent);
        keyboardListeningElement.addEventListener("keypress", SDL.receiveEvent);
        window.addEventListener("focus", SDL.receiveEvent);
        window.addEventListener("blur", SDL.receiveEvent);
        document.addEventListener("visibilitychange", SDL.receiveEvent)
    }
    window.addEventListener("unload", SDL.receiveEvent);
    SDL.keyboardState = _malloc(65536);
    _memset(SDL.keyboardState, 0, 65536);
    SDL.DOMEventToSDLEvent["keydown"] = 768;
    SDL.DOMEventToSDLEvent["keyup"] = 769;
    SDL.DOMEventToSDLEvent["keypress"] = 771;
    SDL.DOMEventToSDLEvent["mousedown"] = 1025;
    SDL.DOMEventToSDLEvent["mouseup"] = 1026;
    SDL.DOMEventToSDLEvent["mousemove"] = 1024;
    SDL.DOMEventToSDLEvent["wheel"] = 1027;
    SDL.DOMEventToSDLEvent["touchstart"] = 1792;
    SDL.DOMEventToSDLEvent["touchend"] = 1793;
    SDL.DOMEventToSDLEvent["touchmove"] = 1794;
    SDL.DOMEventToSDLEvent["unload"] = 256;
    SDL.DOMEventToSDLEvent["resize"] = 28673;
    SDL.DOMEventToSDLEvent["visibilitychange"] = 512;
    SDL.DOMEventToSDLEvent["focus"] = 512;
    SDL.DOMEventToSDLEvent["blur"] = 512;
    SDL.DOMEventToSDLEvent["joystick_axis_motion"] = 1536;
    SDL.DOMEventToSDLEvent["joystick_button_down"] = 1539;
    SDL.DOMEventToSDLEvent["joystick_button_up"] = 1540;
    return 0
}
function _SDL_AudioQuit() {
    for (var i = 0; i < SDL.numChannels; ++i) {
        if (SDL.channels[i].audio) {
            SDL.channels[i].audio.pause();
            SDL.channels[i].audio = undefined
        }
    }
    if (SDL.music.audio)
        SDL.music.audio.pause();
    SDL.music.audio = undefined
}
function _SDL_Quit() {
    _SDL_AudioQuit();
    var keyboardListeningElement = Module["keyboardListeningElement"] || document;
    keyboardListeningElement.removeEventListener("keydown", SDL.receiveEvent);
    keyboardListeningElement.removeEventListener("keyup", SDL.receiveEvent);
    keyboardListeningElement.removeEventListener("keypress", SDL.receiveEvent)
}
function ___assert_fail(condition, filename, line, func) {
    abort("Assertion failed: " + UTF8ToString(condition) + ", at: " + [filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function"])
}
var ENV = {};
function ___buildEnvironment(environ) {
    var MAX_ENV_VALUES = 64;
    var TOTAL_ENV_SIZE = 1024;
    var poolPtr;
    var envPtr;
    if (!___buildEnvironment.called) {
        ___buildEnvironment.called = true;
        ENV["USER"] = ENV["LOGNAME"] = "web_user";
        ENV["PATH"] = "/";
        ENV["PWD"] = "/";
        ENV["HOME"] = "/home/web_user";
        ENV["LANG"] = "C.UTF-8";
        ENV["LANG"] = (typeof navigator === "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
        ENV["_"] = thisProgram;
        poolPtr = getMemory(TOTAL_ENV_SIZE);
        envPtr = getMemory(MAX_ENV_VALUES * 4);
        HEAP32[envPtr >> 2] = poolPtr;
        HEAP32[environ >> 2] = envPtr
    } else {
        envPtr = HEAP32[environ >> 2];
        poolPtr = HEAP32[envPtr >> 2]
    }
    var strings = [];
    var totalSize = 0;
    for (var key in ENV) {
        if (typeof ENV[key] === "string") {
            var line = key + "=" + ENV[key];
            strings.push(line);
            totalSize += line.length
        }
    }
    if (totalSize > TOTAL_ENV_SIZE) {
        throw new Error("Environment size exceeded TOTAL_ENV_SIZE!")
    }
    var ptrSize = 4;
    for (var i = 0; i < strings.length; i++) {
        var line = strings[i];
        writeAsciiToMemory(line, poolPtr);
        HEAP32[envPtr + i * ptrSize >> 2] = poolPtr;
        poolPtr += line.length + 1
    }
    HEAP32[envPtr + strings.length * ptrSize >> 2] = 0
}
function ___cxa_allocate_exception(size) {
    return _malloc(size)
}
var ___exception_infos = {};
function ___cxa_pure_virtual() {
    ABORT = true;
    throw "Pure virtual function called!"
}
var ___exception_last = 0;
function ___cxa_throw(ptr, type, destructor) {
    ___exception_infos[ptr] = {
        ptr: ptr,
        adjusted: [ptr],
        type: type,
        destructor: destructor,
        refcount: 0,
        caught: false,
        rethrown: false
    };
    ___exception_last = ptr;
    if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exceptions = 1
    } else {
        __ZSt18uncaught_exceptionv.uncaught_exceptions++
    }
    throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch."
}
function ___cxa_uncaught_exceptions() {
    return __ZSt18uncaught_exceptionv.uncaught_exceptions
}
function ___lock() { }
function ___map_file(pathname, size) {
    ___setErrNo(1);
    return -1
}
var SYSCALLS = {
    DEFAULT_POLLMASK: 5,
    mappings: {},
    umask: 511,
    calculateAt: function (dirfd, path) {
        if (path[0] !== "/") {
            var dir;
            if (dirfd === -100) {
                dir = FS.cwd()
            } else {
                var dirstream = FS.getStream(dirfd);
                if (!dirstream)
                    throw new FS.ErrnoError(9);
                dir = dirstream.path
            }
            path = PATH.join2(dir, path)
        }
        return path
    },
    doStat: function (func, path, buf) {
        try {
            var stat = func(path)
        } catch (e) {
            if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
                return -20
            }
            throw e
        }
        HEAP32[buf >> 2] = stat.dev;
        HEAP32[buf + 4 >> 2] = 0;
        HEAP32[buf + 8 >> 2] = stat.ino;
        HEAP32[buf + 12 >> 2] = stat.mode;
        HEAP32[buf + 16 >> 2] = stat.nlink;
        HEAP32[buf + 20 >> 2] = stat.uid;
        HEAP32[buf + 24 >> 2] = stat.gid;
        HEAP32[buf + 28 >> 2] = stat.rdev;
        HEAP32[buf + 32 >> 2] = 0;
        tempI64 = [stat.size >>> 0, (tempDouble = stat.size,
            +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)],
            HEAP32[buf + 40 >> 2] = tempI64[0],
            HEAP32[buf + 44 >> 2] = tempI64[1];
        HEAP32[buf + 48 >> 2] = 4096;
        HEAP32[buf + 52 >> 2] = stat.blocks;
        HEAP32[buf + 56 >> 2] = stat.atime.getTime() / 1e3 | 0;
        HEAP32[buf + 60 >> 2] = 0;
        HEAP32[buf + 64 >> 2] = stat.mtime.getTime() / 1e3 | 0;
        HEAP32[buf + 68 >> 2] = 0;
        HEAP32[buf + 72 >> 2] = stat.ctime.getTime() / 1e3 | 0;
        HEAP32[buf + 76 >> 2] = 0;
        tempI64 = [stat.ino >>> 0, (tempDouble = stat.ino,
            +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)],
            HEAP32[buf + 80 >> 2] = tempI64[0],
            HEAP32[buf + 84 >> 2] = tempI64[1];
        return 0
    },
    doMsync: function (addr, stream, len, flags) {
        var buffer = new Uint8Array(HEAPU8.subarray(addr, addr + len));
        FS.msync(stream, buffer, 0, len, flags)
    },
    doMkdir: function (path, mode) {
        path = PATH.normalize(path);
        if (path[path.length - 1] === "/")
            path = path.substr(0, path.length - 1);
        FS.mkdir(path, mode, 0);
        return 0
    },
    doMknod: function (path, mode, dev) {
        switch (mode & 61440) {
            case 32768:
            case 8192:
            case 24576:
            case 4096:
            case 49152:
                break;
            default:
                return -22
        }
        FS.mknod(path, mode, dev);
        return 0
    },
    doReadlink: function (path, buf, bufsize) {
        if (bufsize <= 0)
            return -22;
        var ret = FS.readlink(path);
        var len = Math.min(bufsize, lengthBytesUTF8(ret));
        var endChar = HEAP8[buf + len];
        stringToUTF8(ret, buf, bufsize + 1);
        HEAP8[buf + len] = endChar;
        return len
    },
    doAccess: function (path, amode) {
        if (amode & ~7) {
            return -22
        }
        var node;
        var lookup = FS.lookupPath(path, {
            follow: true
        });
        node = lookup.node;
        if (!node) {
            return -2
        }
        var perms = "";
        if (amode & 4)
            perms += "r";
        if (amode & 2)
            perms += "w";
        if (amode & 1)
            perms += "x";
        if (perms && FS.nodePermissions(node, perms)) {
            return -13
        }
        return 0
    },
    doDup: function (path, flags, suggestFD) {
        var suggest = FS.getStream(suggestFD);
        if (suggest)
            FS.close(suggest);
        return FS.open(path, flags, 0, suggestFD, suggestFD).fd
    },
    doReadv: function (stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
            var ptr = HEAP32[iov + i * 8 >> 2];
            var len = HEAP32[iov + (i * 8 + 4) >> 2];
            var curr = FS.read(stream, HEAP8, ptr, len, offset);
            if (curr < 0)
                return -1;
            ret += curr;
            if (curr < len)
                break
        }
        return ret
    },
    doWritev: function (stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
            var ptr = HEAP32[iov + i * 8 >> 2];
            var len = HEAP32[iov + (i * 8 + 4) >> 2];
            var curr = FS.write(stream, HEAP8, ptr, len, offset);
            if (curr < 0)
                return -1;
            ret += curr
        }
        return ret
    },
    varargs: 0,
    get: function (varargs) {
        SYSCALLS.varargs += 4;
        var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
        return ret
    },
    getStr: function () {
        var ret = UTF8ToString(SYSCALLS.get());
        return ret
    },
    getStreamFromFD: function () {
        var stream = FS.getStream(SYSCALLS.get());
        if (!stream)
            throw new FS.ErrnoError(9);
        return stream
    },
    get64: function () {
        var low = SYSCALLS.get()
            , high = SYSCALLS.get();
        if (low >= 0)
            assert(high === 0);
        else
            assert(high === -1);
        return low
    },
    getZero: function () {
        assert(SYSCALLS.get() === 0)
    }
};
function ___syscall10(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var path = SYSCALLS.getStr();
        FS.unlink(path);
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall114(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        abort("cannot wait on child processes")
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall12(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var path = SYSCALLS.getStr();
        FS.chdir(path);
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall140(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD()
            , offset_high = SYSCALLS.get()
            , offset_low = SYSCALLS.get()
            , result = SYSCALLS.get()
            , whence = SYSCALLS.get();
        var HIGH_OFFSET = 4294967296;
        var offset = offset_high * HIGH_OFFSET + (offset_low >>> 0);
        var DOUBLE_LIMIT = 9007199254740992;
        if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
            return -75
        }
        FS.llseek(stream, offset, whence);
        tempI64 = [stream.position >>> 0, (tempDouble = stream.position,
            +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)],
            HEAP32[result >> 2] = tempI64[0],
            HEAP32[result + 4 >> 2] = tempI64[1];
        if (stream.getdents && offset === 0 && whence === 0)
            stream.getdents = null;
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall145(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD()
            , iov = SYSCALLS.get()
            , iovcnt = SYSCALLS.get();
        return SYSCALLS.doReadv(stream, iov, iovcnt)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall146(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD()
            , iov = SYSCALLS.get()
            , iovcnt = SYSCALLS.get();
        return SYSCALLS.doWritev(stream, iov, iovcnt)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall183(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var buf = SYSCALLS.get()
            , size = SYSCALLS.get();
        if (size === 0)
            return -22;
        var cwd = FS.cwd();
        var cwdLengthInBytes = lengthBytesUTF8(cwd);
        if (size < cwdLengthInBytes + 1)
            return -34;
        stringToUTF8(cwd, buf, size);
        return buf
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall191(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var resource = SYSCALLS.get()
            , rlim = SYSCALLS.get();
        HEAP32[rlim >> 2] = -1;
        HEAP32[rlim + 4 >> 2] = -1;
        HEAP32[rlim + 8 >> 2] = -1;
        HEAP32[rlim + 12 >> 2] = -1;
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall195(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var path = SYSCALLS.getStr()
            , buf = SYSCALLS.get();
        return SYSCALLS.doStat(FS.stat, path, buf)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall202(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall199(a0, a1) {
    return ___syscall202(a0, a1)
}
var PROCINFO = {
    ppid: 1,
    pid: 42,
    sid: 42,
    pgid: 42
};
function ___syscall20(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        return PROCINFO.pid
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall201(a0, a1) {
    return ___syscall202(a0, a1)
}
function ___syscall220(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD()
            , dirp = SYSCALLS.get()
            , count = SYSCALLS.get();
        if (!stream.getdents) {
            stream.getdents = FS.readdir(stream.path)
        }
        var struct_size = 280;
        var pos = 0;
        var off = FS.llseek(stream, 0, 1);
        var idx = Math.floor(off / struct_size);
        while (idx < stream.getdents.length && pos + struct_size <= count) {
            var id;
            var type;
            var name = stream.getdents[idx];
            if (name[0] === ".") {
                id = 1;
                type = 4
            } else {
                var child = FS.lookupNode(stream.node, name);
                id = child.id;
                type = FS.isChrdev(child.mode) ? 2 : FS.isDir(child.mode) ? 4 : FS.isLink(child.mode) ? 10 : 8
            }
            tempI64 = [id >>> 0, (tempDouble = id,
                +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)],
                HEAP32[dirp + pos >> 2] = tempI64[0],
                HEAP32[dirp + pos + 4 >> 2] = tempI64[1];
            tempI64 = [(idx + 1) * struct_size >>> 0, (tempDouble = (idx + 1) * struct_size,
                +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)],
                HEAP32[dirp + pos + 8 >> 2] = tempI64[0],
                HEAP32[dirp + pos + 12 >> 2] = tempI64[1];
            HEAP16[dirp + pos + 16 >> 1] = 280;
            HEAP8[dirp + pos + 18 >> 0] = type;
            stringToUTF8(name, dirp + pos + 19, 256);
            pos += struct_size;
            idx += 1
        }
        FS.llseek(stream, idx * struct_size, 0);
        return pos
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall221(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD()
            , cmd = SYSCALLS.get();
        switch (cmd) {
            case 0:
                {
                    var arg = SYSCALLS.get();
                    if (arg < 0) {
                        return -22
                    }
                    var newStream;
                    newStream = FS.open(stream.path, stream.flags, 0, arg);
                    return newStream.fd
                }
            case 1:
            case 2:
                return 0;
            case 3:
                return stream.flags;
            case 4:
                {
                    var arg = SYSCALLS.get();
                    stream.flags |= arg;
                    return 0
                }
            case 12:
                {
                    var arg = SYSCALLS.get();
                    var offset = 0;
                    HEAP16[arg + offset >> 1] = 2;
                    return 0
                }
            case 13:
            case 14:
                return 0;
            case 16:
            case 8:
                return -22;
            case 9:
                ___setErrNo(22);
                return -1;
            default:
                {
                    return -22
                }
        }
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall3(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD()
            , buf = SYSCALLS.get()
            , count = SYSCALLS.get();
        return FS.read(stream, HEAP8, buf, count)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall33(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var path = SYSCALLS.getStr()
            , amode = SYSCALLS.get();
        return SYSCALLS.doAccess(path, amode)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall340(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var pid = SYSCALLS.get()
            , resource = SYSCALLS.get()
            , new_limit = SYSCALLS.get()
            , old_limit = SYSCALLS.get();
        if (old_limit) {
            HEAP32[old_limit >> 2] = -1;
            HEAP32[old_limit + 4 >> 2] = -1;
            HEAP32[old_limit + 8 >> 2] = -1;
            HEAP32[old_limit + 12 >> 2] = -1
        }
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall38(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var old_path = SYSCALLS.getStr()
            , new_path = SYSCALLS.getStr();
        FS.rename(old_path, new_path);
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall39(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var path = SYSCALLS.getStr()
            , mode = SYSCALLS.get();
        return SYSCALLS.doMkdir(path, mode)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall4(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD()
            , buf = SYSCALLS.get()
            , count = SYSCALLS.get();
        return FS.write(stream, HEAP8, buf, count)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall40(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var path = SYSCALLS.getStr();
        FS.rmdir(path);
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall5(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var pathname = SYSCALLS.getStr()
            , flags = SYSCALLS.get()
            , mode = SYSCALLS.get();
        var stream = FS.open(pathname, flags, mode);
        return stream.fd
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall54(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD()
            , op = SYSCALLS.get();
        switch (op) {
            case 21509:
            case 21505:
                {
                    if (!stream.tty)
                        return -25;
                    return 0
                }
            case 21510:
            case 21511:
            case 21512:
            case 21506:
            case 21507:
            case 21508:
                {
                    if (!stream.tty)
                        return -25;
                    return 0
                }
            case 21519:
                {
                    if (!stream.tty)
                        return -25;
                    var argp = SYSCALLS.get();
                    HEAP32[argp >> 2] = 0;
                    return 0
                }
            case 21520:
                {
                    if (!stream.tty)
                        return -25;
                    return -22
                }
            case 21531:
                {
                    var argp = SYSCALLS.get();
                    return FS.ioctl(stream, op, argp)
                }
            case 21523:
                {
                    if (!stream.tty)
                        return -25;
                    return 0
                }
            case 21524:
                {
                    if (!stream.tty)
                        return -25;
                    return 0
                }
            default:
                abort("bad ioctl syscall " + op)
        }
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall6(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD();
        FS.close(stream);
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___syscall77(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var who = SYSCALLS.get()
            , usage = SYSCALLS.get();
        _memset(usage, 0, 136);
        HEAP32[usage >> 2] = 1;
        HEAP32[usage + 4 >> 2] = 2;
        HEAP32[usage + 8 >> 2] = 3;
        HEAP32[usage + 12 >> 2] = 4;
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function __emscripten_syscall_munmap(addr, len) {
    if (addr === -1 || len === 0) {
        return -22
    }
    var info = SYSCALLS.mappings[addr];
    if (!info)
        return 0;
    if (len === info.len) {
        var stream = FS.getStream(info.fd);
        SYSCALLS.doMsync(addr, stream, len, info.flags);
        FS.munmap(stream);
        SYSCALLS.mappings[addr] = null;
        if (info.allocated) {
            _free(info.malloc)
        }
    }
    return 0
}
function ___syscall91(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var addr = SYSCALLS.get()
            , len = SYSCALLS.get();
        return __emscripten_syscall_munmap(addr, len)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError))
            abort(e);
        return -e.errno
    }
}
function ___unlock() { }
function _abort() {
    Module["abort"]()
}
var _ceil = Math_ceil;
function _clock() {
    if (_clock.start === undefined)
        _clock.start = Date.now();
    return (Date.now() - _clock.start) * (1e6 / 1e3) | 0
}
function _difftime(time1, time0) {
    return time1 - time0
}
function _dlopen() {
    abort("To use dlopen, you need to use Emscripten's linking support, see https://github.com/emscripten-core/emscripten/wiki/Linking")
}
function _dlerror() {
    return _dlopen.apply(null, arguments)
}
function _dlsym() {
    return _dlopen.apply(null, arguments)
}
function _emcctime() {
    return 1e3 * Math.floor(Date.now() - UI.Datestart)
}
function _emscripten_get_canvas_size(width, height, isFullscreen) {
    var canvas = Module["canvas"];
    HEAP32[width >> 2] = canvas.width;
    HEAP32[height >> 2] = canvas.height;
    HEAP32[isFullscreen >> 2] = Browser.isFullscreen ? 1 : 0
}
function _emscripten_get_heap_size() {
    return HEAP8.length
}
function _longjmp(env, value) {
    _setThrew(env, value || 1);
    throw "longjmp"
}
function _emscripten_longjmp(env, value) {
    _longjmp(env, value)
}
function _exit(status) {
    exit(status)
}
var _fabs = Math_abs;
var _floor = Math_floor;
function _getenv(name) {
    if (name === 0)
        return 0;
    name = UTF8ToString(name);
    if (!ENV.hasOwnProperty(name))
        return 0;
    if (_getenv.ret)
        _free(_getenv.ret);
    _getenv.ret = allocateUTF8(ENV[name]);
    return _getenv.ret
}
function _getpwnam() {
    throw "getpwnam: TODO"
}
function _getpwuid(uid) {
    return 0
}
function _gettimeofday(ptr) {
    var now = Date.now();
    HEAP32[ptr >> 2] = now / 1e3 | 0;
    HEAP32[ptr + 4 >> 2] = now % 1e3 * 1e3 | 0;
    return 0
}
var GL = {
    counter: 1,
    lastError: 0,
    buffers: [],
    mappedBuffers: {},
    programs: [],
    framebuffers: [],
    renderbuffers: [],
    textures: [],
    uniforms: [],
    shaders: [],
    vaos: [],
    contexts: {},
    currentContext: null,
    offscreenCanvases: {},
    timerQueriesEXT: [],
    currArrayBuffer: 0,
    currElementArrayBuffer: 0,
    byteSizeByTypeRoot: 5120,
    byteSizeByType: [1, 1, 2, 2, 4, 4, 4, 2, 3, 4, 8],
    programInfos: {},
    stringCache: {},
    unpackAlignment: 4,
    init: function () {
        GL.createLog2ceilLookup(GL.MAX_TEMP_BUFFER_SIZE);
        GL.miniTempBuffer = new Float32Array(GL.MINI_TEMP_BUFFER_SIZE);
        for (var i = 0; i < GL.MINI_TEMP_BUFFER_SIZE; i++) {
            GL.miniTempBufferViews[i] = GL.miniTempBuffer.subarray(0, i + 1)
        }
    },
    recordError: function recordError(errorCode) {
        if (!GL.lastError) {
            GL.lastError = errorCode
        }
    },
    getNewId: function (table) {
        var ret = GL.counter++;
        for (var i = table.length; i < ret; i++) {
            table[i] = null
        }
        return ret
    },
    MINI_TEMP_BUFFER_SIZE: 256,
    miniTempBuffer: null,
    miniTempBufferViews: [0],
    MAX_TEMP_BUFFER_SIZE: 2097152,
    numTempVertexBuffersPerSize: 64,
    log2ceilLookup: null,
    createLog2ceilLookup: function (maxValue) {
        GL.log2ceilLookup = new Uint8Array(maxValue + 1);
        var log2 = 0;
        var pow2 = 1;
        GL.log2ceilLookup[0] = 0;
        for (var i = 1; i <= maxValue; ++i) {
            if (i > pow2) {
                pow2 <<= 1;
                ++log2
            }
            GL.log2ceilLookup[i] = log2
        }
    },
    generateTempBuffers: function (quads, context) {
        var largestIndex = GL.log2ceilLookup[GL.MAX_TEMP_BUFFER_SIZE];
        context.tempVertexBufferCounters1 = [];
        context.tempVertexBufferCounters2 = [];
        context.tempVertexBufferCounters1.length = context.tempVertexBufferCounters2.length = largestIndex + 1;
        context.tempVertexBuffers1 = [];
        context.tempVertexBuffers2 = [];
        context.tempVertexBuffers1.length = context.tempVertexBuffers2.length = largestIndex + 1;
        context.tempIndexBuffers = [];
        context.tempIndexBuffers.length = largestIndex + 1;
        for (var i = 0; i <= largestIndex; ++i) {
            context.tempIndexBuffers[i] = null;
            context.tempVertexBufferCounters1[i] = context.tempVertexBufferCounters2[i] = 0;
            var ringbufferLength = GL.numTempVertexBuffersPerSize;
            context.tempVertexBuffers1[i] = [];
            context.tempVertexBuffers2[i] = [];
            var ringbuffer1 = context.tempVertexBuffers1[i];
            var ringbuffer2 = context.tempVertexBuffers2[i];
            ringbuffer1.length = ringbuffer2.length = ringbufferLength;
            for (var j = 0; j < ringbufferLength; ++j) {
                ringbuffer1[j] = ringbuffer2[j] = null
            }
        }
        if (quads) {
            context.tempQuadIndexBuffer = GLctx.createBuffer();
            context.GLctx.bindBuffer(context.GLctx.ELEMENT_ARRAY_BUFFER, context.tempQuadIndexBuffer);
            var numIndexes = GL.MAX_TEMP_BUFFER_SIZE >> 1;
            var quadIndexes = new Uint16Array(numIndexes);
            var i = 0
                , v = 0;
            while (1) {
                quadIndexes[i++] = v;
                if (i >= numIndexes)
                    break;
                quadIndexes[i++] = v + 1;
                if (i >= numIndexes)
                    break;
                quadIndexes[i++] = v + 2;
                if (i >= numIndexes)
                    break;
                quadIndexes[i++] = v;
                if (i >= numIndexes)
                    break;
                quadIndexes[i++] = v + 2;
                if (i >= numIndexes)
                    break;
                quadIndexes[i++] = v + 3;
                if (i >= numIndexes)
                    break;
                v += 4
            }
            context.GLctx.bufferData(context.GLctx.ELEMENT_ARRAY_BUFFER, quadIndexes, context.GLctx.STATIC_DRAW);
            context.GLctx.bindBuffer(context.GLctx.ELEMENT_ARRAY_BUFFER, null)
        }
    },
    getTempVertexBuffer: function getTempVertexBuffer(sizeBytes) {
        var idx = GL.log2ceilLookup[sizeBytes];
        var ringbuffer = GL.currentContext.tempVertexBuffers1[idx];
        var nextFreeBufferIndex = GL.currentContext.tempVertexBufferCounters1[idx];
        GL.currentContext.tempVertexBufferCounters1[idx] = GL.currentContext.tempVertexBufferCounters1[idx] + 1 & GL.numTempVertexBuffersPerSize - 1;
        var vbo = ringbuffer[nextFreeBufferIndex];
        if (vbo) {
            return vbo
        }
        var prevVBO = GLctx.getParameter(GLctx.ARRAY_BUFFER_BINDING);
        ringbuffer[nextFreeBufferIndex] = GLctx.createBuffer();
        GLctx.bindBuffer(GLctx.ARRAY_BUFFER, ringbuffer[nextFreeBufferIndex]);
        GLctx.bufferData(GLctx.ARRAY_BUFFER, 1 << idx, GLctx.DYNAMIC_DRAW);
        GLctx.bindBuffer(GLctx.ARRAY_BUFFER, prevVBO);
        return ringbuffer[nextFreeBufferIndex]
    },
    getTempIndexBuffer: function getTempIndexBuffer(sizeBytes) {
        var idx = GL.log2ceilLookup[sizeBytes];
        var ibo = GL.currentContext.tempIndexBuffers[idx];
        if (ibo) {
            return ibo
        }
        var prevIBO = GLctx.getParameter(GLctx.ELEMENT_ARRAY_BUFFER_BINDING);
        GL.currentContext.tempIndexBuffers[idx] = GLctx.createBuffer();
        GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, GL.currentContext.tempIndexBuffers[idx]);
        GLctx.bufferData(GLctx.ELEMENT_ARRAY_BUFFER, 1 << idx, GLctx.DYNAMIC_DRAW);
        GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, prevIBO);
        return GL.currentContext.tempIndexBuffers[idx]
    },
    newRenderingFrameStarted: function newRenderingFrameStarted() {
        if (!GL.currentContext) {
            return
        }
        var vb = GL.currentContext.tempVertexBuffers1;
        GL.currentContext.tempVertexBuffers1 = GL.currentContext.tempVertexBuffers2;
        GL.currentContext.tempVertexBuffers2 = vb;
        vb = GL.currentContext.tempVertexBufferCounters1;
        GL.currentContext.tempVertexBufferCounters1 = GL.currentContext.tempVertexBufferCounters2;
        GL.currentContext.tempVertexBufferCounters2 = vb;
        var largestIndex = GL.log2ceilLookup[GL.MAX_TEMP_BUFFER_SIZE];
        for (var i = 0; i <= largestIndex; ++i) {
            GL.currentContext.tempVertexBufferCounters1[i] = 0
        }
    },
    getSource: function (shader, count, string, length) {
        var source = "";
        for (var i = 0; i < count; ++i) {
            var len = length ? HEAP32[length + i * 4 >> 2] : -1;
            source += UTF8ToString(HEAP32[string + i * 4 >> 2], len < 0 ? undefined : len)
        }
        var type = GLctx.getShaderParameter(GL.shaders[shader], 35663);
        if (type == 35632) {
            if (GLEmulation.findToken(source, "dFdx") || GLEmulation.findToken(source, "dFdy") || GLEmulation.findToken(source, "fwidth")) {
                source = "#extension GL_OES_standard_derivatives : enable\n" + source;
                var extension = GLctx.getExtension("OES_standard_derivatives")
            }
        }
        return source
    },
    createContext: function (canvas, webGLContextAttributes) {
        var ctx = canvas.getContext("webgl", webGLContextAttributes) || canvas.getContext("experimental-webgl", webGLContextAttributes);
        return ctx ? GL.registerContext(ctx, webGLContextAttributes) : 0
    },
    registerContext: function (ctx, webGLContextAttributes) {
        var handle = _malloc(8);
        var context = {
            handle: handle,
            attributes: webGLContextAttributes,
            version: webGLContextAttributes.majorVersion,
            GLctx: ctx
        };
        if (ctx.canvas)
            ctx.canvas.GLctxObject = context;
        GL.contexts[handle] = context;
        if (typeof webGLContextAttributes.enableExtensionsByDefault === "undefined" || webGLContextAttributes.enableExtensionsByDefault) {
            GL.initExtensions(context)
        }
        return handle
    },
    makeContextCurrent: function (contextHandle) {
        GL.currentContext = GL.contexts[contextHandle];
        Module.ctx = GLctx = GL.currentContext && GL.currentContext.GLctx;
        return !(contextHandle && !GLctx)
    },
    getContext: function (contextHandle) {
        return GL.contexts[contextHandle]
    },
    deleteContext: function (contextHandle) {
        if (GL.currentContext === GL.contexts[contextHandle])
            GL.currentContext = null;
        if (typeof JSEvents === "object")
            JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);
        if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas)
            GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined;
        _free(GL.contexts[contextHandle]);
        GL.contexts[contextHandle] = null
    },
    acquireInstancedArraysExtension: function (ctx) {
        var ext = ctx.getExtension("ANGLE_instanced_arrays");
        if (ext) {
            ctx["vertexAttribDivisor"] = function (index, divisor) {
                ext["vertexAttribDivisorANGLE"](index, divisor)
            }
                ;
            ctx["drawArraysInstanced"] = function (mode, first, count, primcount) {
                ext["drawArraysInstancedANGLE"](mode, first, count, primcount)
            }
                ;
            ctx["drawElementsInstanced"] = function (mode, count, type, indices, primcount) {
                ext["drawElementsInstancedANGLE"](mode, count, type, indices, primcount)
            }
        }
    },
    acquireVertexArrayObjectExtension: function (ctx) {
        var ext = ctx.getExtension("OES_vertex_array_object");
        if (ext) {
            ctx["createVertexArray"] = function () {
                return ext["createVertexArrayOES"]()
            }
                ;
            ctx["deleteVertexArray"] = function (vao) {
                ext["deleteVertexArrayOES"](vao)
            }
                ;
            ctx["bindVertexArray"] = function (vao) {
                ext["bindVertexArrayOES"](vao)
            }
                ;
            ctx["isVertexArray"] = function (vao) {
                return ext["isVertexArrayOES"](vao)
            }
        }
    },
    acquireDrawBuffersExtension: function (ctx) {
        var ext = ctx.getExtension("WEBGL_draw_buffers");
        if (ext) {
            ctx["drawBuffers"] = function (n, bufs) {
                ext["drawBuffersWEBGL"](n, bufs)
            }
        }
    },
    initExtensions: function (context) {
        if (!context)
            context = GL.currentContext;
        if (context.initExtensionsDone)
            return;
        context.initExtensionsDone = true;
        var GLctx = context.GLctx;
        context.compressionExt = GLctx.getExtension("WEBGL_compressed_texture_s3tc");
        context.anisotropicExt = GLctx.getExtension("EXT_texture_filter_anisotropic");
        if (context.version < 2) {
            GL.acquireInstancedArraysExtension(GLctx);
            GL.acquireVertexArrayObjectExtension(GLctx);
            GL.acquireDrawBuffersExtension(GLctx)
        }
        GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query");
        var automaticallyEnabledExtensions = ["OES_texture_float", "OES_texture_half_float", "OES_standard_derivatives", "OES_vertex_array_object", "WEBGL_compressed_texture_s3tc", "WEBGL_depth_texture", "OES_element_index_uint", "EXT_texture_filter_anisotropic", "EXT_frag_depth", "WEBGL_draw_buffers", "ANGLE_instanced_arrays", "OES_texture_float_linear", "OES_texture_half_float_linear", "EXT_blend_minmax", "EXT_shader_texture_lod", "WEBGL_compressed_texture_pvrtc", "EXT_color_buffer_half_float", "WEBGL_color_buffer_float", "EXT_sRGB", "WEBGL_compressed_texture_etc1", "EXT_disjoint_timer_query", "WEBGL_compressed_texture_etc", "WEBGL_compressed_texture_astc", "EXT_color_buffer_float", "WEBGL_compressed_texture_s3tc_srgb", "EXT_disjoint_timer_query_webgl2"];
        var exts = GLctx.getSupportedExtensions();
        if (exts && exts.length > 0) {
            GLctx.getSupportedExtensions().forEach(function (ext) {
                if (automaticallyEnabledExtensions.indexOf(ext) != -1) {
                    GLctx.getExtension(ext)
                }
            })
        }
    },
    populateUniformTable: function (program) {
        var p = GL.programs[program];
        var ptable = GL.programInfos[program] = {
            uniforms: {},
            maxUniformLength: 0,
            maxAttributeLength: -1,
            maxUniformBlockNameLength: -1
        };
        var utable = ptable.uniforms;
        var numUniforms = GLctx.getProgramParameter(p, 35718);
        for (var i = 0; i < numUniforms; ++i) {
            var u = GLctx.getActiveUniform(p, i);
            var name = u.name;
            ptable.maxUniformLength = Math.max(ptable.maxUniformLength, name.length + 1);
            if (name.slice(-1) == "]") {
                name = name.slice(0, name.lastIndexOf("["))
            }
            var loc = GLctx.getUniformLocation(p, name);
            if (loc) {
                var id = GL.getNewId(GL.uniforms);
                utable[name] = [u.size, id];
                GL.uniforms[id] = loc;
                for (var j = 1; j < u.size; ++j) {
                    var n = name + "[" + j + "]";
                    loc = GLctx.getUniformLocation(p, n);
                    id = GL.getNewId(GL.uniforms);
                    GL.uniforms[id] = loc
                }
            }
        }
    }
};
function _glEnable(x0) {
    GLctx["enable"](x0)
}
function _glDisable(x0) {
    GLctx["disable"](x0)
}
function _glIsEnabled(x0) {
    return GLctx["isEnabled"](x0)
}
function emscriptenWebGLGet(name_, p, type) {
    if (!p) {
        GL.recordError(1281);
        return
    }
    var ret = undefined;
    switch (name_) {
        case 36346:
            ret = 1;
            break;
        case 36344:
            if (type != 0 && type != 1) {
                GL.recordError(1280)
            }
            return;
        case 36345:
            ret = 0;
            break;
        case 34466:
            var formats = GLctx.getParameter(34467);
            ret = formats ? formats.length : 0;
            break
    }
    if (ret === undefined) {
        var result = GLctx.getParameter(name_);
        switch (typeof result) {
            case "number":
                ret = result;
                break;
            case "boolean":
                ret = result ? 1 : 0;
                break;
            case "string":
                GL.recordError(1280);
                return;
            case "object":
                if (result === null) {
                    switch (name_) {
                        case 34964:
                        case 35725:
                        case 34965:
                        case 36006:
                        case 36007:
                        case 32873:
                        case 34229:
                        case 34068:
                            {
                                ret = 0;
                                break
                            }
                        default:
                            {
                                GL.recordError(1280);
                                return
                            }
                    }
                } else if (result instanceof Float32Array || result instanceof Uint32Array || result instanceof Int32Array || result instanceof Array) {
                    for (var i = 0; i < result.length; ++i) {
                        switch (type) {
                            case 0:
                                HEAP32[p + i * 4 >> 2] = result[i];
                                break;
                            case 2:
                                HEAPF32[p + i * 4 >> 2] = result[i];
                                break;
                            case 4:
                                HEAP8[p + i >> 0] = result[i] ? 1 : 0;
                                break
                        }
                    }
                    return
                } else {
                    try {
                        ret = result.name | 0
                    } catch (e) {
                        GL.recordError(1280);
                        err("GL_INVALID_ENUM in glGet" + type + "v: Unknown object returned from WebGL getParameter(" + name_ + ")! (error: " + e + ")");
                        return
                    }
                }
                break;
            default:
                GL.recordError(1280);
                err("GL_INVALID_ENUM in glGet" + type + "v: Native code calling glGet" + type + "v(" + name_ + ") and it returns " + result + " of type " + typeof result + "!");
                return
        }
    }
    switch (type) {
        case 1:
            tempI64 = [ret >>> 0, (tempDouble = ret,
                +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)],
                HEAP32[p >> 2] = tempI64[0],
                HEAP32[p + 4 >> 2] = tempI64[1];
            break;
        case 0:
            HEAP32[p >> 2] = ret;
            break;
        case 2:
            HEAPF32[p >> 2] = ret;
            break;
        case 4:
            HEAP8[p >> 0] = ret ? 1 : 0;
            break
    }
}
function _glGetBooleanv(name_, p) {
    emscriptenWebGLGet(name_, p, 4)
}
function _glGetIntegerv(name_, p) {
    emscriptenWebGLGet(name_, p, 0)
}
function stringToNewUTF8(jsString) {
    var length = lengthBytesUTF8(jsString) + 1;
    var cString = _malloc(length);
    stringToUTF8(jsString, cString, length);
    return cString
}
function _glGetString(name_) {
    if (GL.stringCache[name_])
        return GL.stringCache[name_];
    var ret;
    switch (name_) {
        case 7939:
            var exts = GLctx.getSupportedExtensions();
            var gl_exts = [];
            for (var i = 0; i < exts.length; ++i) {
                gl_exts.push(exts[i]);
                gl_exts.push("GL_" + exts[i])
            }
            ret = stringToNewUTF8(gl_exts.join(" "));
            break;
        case 7936:
        case 7937:
        case 37445:
        case 37446:
            var s = GLctx.getParameter(name_);
            if (!s) {
                GL.recordError(1280)
            }
            ret = stringToNewUTF8(s);
            break;
        case 7938:
            var glVersion = GLctx.getParameter(GLctx.VERSION);
            {
                glVersion = "OpenGL ES 2.0 (" + glVersion + ")"
            }
            ret = stringToNewUTF8(glVersion);
            break;
        case 35724:
            var glslVersion = GLctx.getParameter(GLctx.SHADING_LANGUAGE_VERSION);
            var ver_re = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/;
            var ver_num = glslVersion.match(ver_re);
            if (ver_num !== null) {
                if (ver_num[1].length == 3)
                    ver_num[1] = ver_num[1] + "0";
                glslVersion = "OpenGL ES GLSL ES " + ver_num[1] + " (" + glslVersion + ")"
            }
            ret = stringToNewUTF8(glslVersion);
            break;
        default:
            GL.recordError(1280);
            return 0
    }
    GL.stringCache[name_] = ret;
    return ret
}
function _glCreateShader(shaderType) {
    var id = GL.getNewId(GL.shaders);
    GL.shaders[id] = GLctx.createShader(shaderType);
    return id
}
function _glShaderSource(shader, count, string, length) {
    var source = GL.getSource(shader, count, string, length);
    GLctx.shaderSource(GL.shaders[shader], source)
}
function _glCompileShader(shader) {
    GLctx.compileShader(GL.shaders[shader])
}
function _glAttachShader(program, shader) {
    GLctx.attachShader(GL.programs[program], GL.shaders[shader])
}
function _glDetachShader(program, shader) {
    GLctx.detachShader(GL.programs[program], GL.shaders[shader])
}
function _glUseProgram(program) {
    GLctx.useProgram(GL.programs[program])
}
function _glDeleteProgram(id) {
    if (!id)
        return;
    var program = GL.programs[id];
    if (!program) {
        GL.recordError(1281);
        return
    }
    GLctx.deleteProgram(program);
    program.name = 0;
    GL.programs[id] = null;
    GL.programInfos[id] = null
}
function _glBindAttribLocation(program, index, name) {
    GLctx.bindAttribLocation(GL.programs[program], index, UTF8ToString(name))
}
function _glLinkProgram(program) {
    GLctx.linkProgram(GL.programs[program]);
    GL.populateUniformTable(program)
}
function _glBindBuffer(target, buffer) {
    if (target == GLctx.ARRAY_BUFFER) {
        GL.currArrayBuffer = buffer;
        GLImmediate.lastArrayBuffer = buffer
    } else if (target == GLctx.ELEMENT_ARRAY_BUFFER) {
        GL.currElementArrayBuffer = buffer
    }
    GLctx.bindBuffer(target, GL.buffers[buffer])
}
function _glGetFloatv(name_, p) {
    emscriptenWebGLGet(name_, p, 2)
}
function _glHint(x0, x1) {
    GLctx["hint"](x0, x1)
}
function _glEnableVertexAttribArray(index) {
    GLctx.enableVertexAttribArray(index)
}
function _glDisableVertexAttribArray(index) {
    GLctx.disableVertexAttribArray(index)
}
function _glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
    GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr)
}
function _glActiveTexture(x0) {
    GLctx["activeTexture"](x0)
}
var GLEmulation = {
    fogStart: 0,
    fogEnd: 1,
    fogDensity: 1,
    fogColor: null,
    fogMode: 2048,
    fogEnabled: false,
    vaos: [],
    currentVao: null,
    enabledVertexAttribArrays: {},
    hasRunInit: false,
    findToken: function (source, token) {
        function isIdentChar(ch) {
            if (ch >= 48 && ch <= 57)
                return true;
            if (ch >= 65 && ch <= 90)
                return true;
            if (ch >= 97 && ch <= 122)
                return true;
            return false
        }
        var i = -1;
        do {
            i = source.indexOf(token, i + 1);
            if (i < 0) {
                break
            }
            if (i > 0 && isIdentChar(source[i - 1])) {
                continue
            }
            i += token.length;
            if (i < source.length - 1 && isIdentChar(source[i + 1])) {
                continue
            }
            return true
        } while (true);
        return false
    },
    init: function () {
        if (GLEmulation.hasRunInit) {
            return
        }
        GLEmulation.hasRunInit = true;
        GLEmulation.fogColor = new Float32Array(4);
        err("WARNING: using emscripten GL emulation. This is a collection of limited workarounds, do not expect it to work.");
        var validCapabilities = {
            2884: 1,
            3042: 1,
            3024: 1,
            2960: 1,
            2929: 1,
            3089: 1,
            32823: 1,
            32926: 1,
            32928: 1
        };
        var glEnable = _glEnable;
        _glEnable = _emscripten_glEnable = function _glEnable(cap) {
            if (GLImmediate.lastRenderer)
                GLImmediate.lastRenderer.cleanup();
            if (cap == 2912) {
                if (GLEmulation.fogEnabled != true) {
                    GLImmediate.currentRenderer = null;
                    GLEmulation.fogEnabled = true
                }
                return
            } else if (cap == 3553) {
                return
            } else if (!(cap in validCapabilities)) {
                return
            }
            glEnable(cap)
        }
            ;
        var glDisable = _glDisable;
        _glDisable = _emscripten_glDisable = function _glDisable(cap) {
            if (GLImmediate.lastRenderer)
                GLImmediate.lastRenderer.cleanup();
            if (cap == 2912) {
                if (GLEmulation.fogEnabled != false) {
                    GLImmediate.currentRenderer = null;
                    GLEmulation.fogEnabled = false
                }
                return
            } else if (cap == 3553) {
                return
            } else if (!(cap in validCapabilities)) {
                return
            }
            glDisable(cap)
        }
            ;
        _glIsEnabled = _emscripten_glIsEnabled = function _glIsEnabled(cap) {
            if (cap == 2912) {
                return GLEmulation.fogEnabled ? 1 : 0
            } else if (!(cap in validCapabilities)) {
                return 0
            }
            return GLctx.isEnabled(cap)
        }
            ;
        var glGetBooleanv = _glGetBooleanv;
        _glGetBooleanv = _emscripten_glGetBooleanv = function _glGetBooleanv(pname, p) {
            var attrib = GLEmulation.getAttributeFromCapability(pname);
            if (attrib !== null) {
                var result = GLImmediate.enabledClientAttributes[attrib];
                HEAP8[p >> 0] = result === true ? 1 : 0;
                return
            }
            glGetBooleanv(pname, p)
        }
            ;
        var glGetIntegerv = _glGetIntegerv;
        _glGetIntegerv = _emscripten_glGetIntegerv = function _glGetIntegerv(pname, params) {
            switch (pname) {
                case 34018:
                    pname = GLctx.MAX_TEXTURE_IMAGE_UNITS;
                    break;
                case 35658:
                    {
                        var result = GLctx.getParameter(GLctx.MAX_VERTEX_UNIFORM_VECTORS);
                        HEAP32[params >> 2] = result * 4;
                        return
                    }
                case 35657:
                    {
                        var result = GLctx.getParameter(GLctx.MAX_FRAGMENT_UNIFORM_VECTORS);
                        HEAP32[params >> 2] = result * 4;
                        return
                    }
                case 35659:
                    {
                        var result = GLctx.getParameter(GLctx.MAX_VARYING_VECTORS);
                        HEAP32[params >> 2] = result * 4;
                        return
                    }
                case 34929:
                    pname = GLctx.MAX_COMBINED_TEXTURE_IMAGE_UNITS;
                    break;
                case 32890:
                    {
                        var attribute = GLImmediate.clientAttributes[GLImmediate.VERTEX];
                        HEAP32[params >> 2] = attribute ? attribute.size : 0;
                        return
                    }
                case 32891:
                    {
                        var attribute = GLImmediate.clientAttributes[GLImmediate.VERTEX];
                        HEAP32[params >> 2] = attribute ? attribute.type : 0;
                        return
                    }
                case 32892:
                    {
                        var attribute = GLImmediate.clientAttributes[GLImmediate.VERTEX];
                        HEAP32[params >> 2] = attribute ? attribute.stride : 0;
                        return
                    }
                case 32897:
                    {
                        var attribute = GLImmediate.clientAttributes[GLImmediate.COLOR];
                        HEAP32[params >> 2] = attribute ? attribute.size : 0;
                        return
                    }
                case 32898:
                    {
                        var attribute = GLImmediate.clientAttributes[GLImmediate.COLOR];
                        HEAP32[params >> 2] = attribute ? attribute.type : 0;
                        return
                    }
                case 32899:
                    {
                        var attribute = GLImmediate.clientAttributes[GLImmediate.COLOR];
                        HEAP32[params >> 2] = attribute ? attribute.stride : 0;
                        return
                    }
                case 32904:
                    {
                        var attribute = GLImmediate.clientAttributes[GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture];
                        HEAP32[params >> 2] = attribute ? attribute.size : 0;
                        return
                    }
                case 32905:
                    {
                        var attribute = GLImmediate.clientAttributes[GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture];
                        HEAP32[params >> 2] = attribute ? attribute.type : 0;
                        return
                    }
                case 32906:
                    {
                        var attribute = GLImmediate.clientAttributes[GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture];
                        HEAP32[params >> 2] = attribute ? attribute.stride : 0;
                        return
                    }
            }
            glGetIntegerv(pname, params)
        }
            ;
        var glGetString = _glGetString;
        _glGetString = _emscripten_glGetString = function _glGetString(name_) {
            if (GL.stringCache[name_])
                return GL.stringCache[name_];
            switch (name_) {
                case 7939:
                    var ret = stringToNewUTF8(GLctx.getSupportedExtensions().join(" ") + " GL_EXT_texture_env_combine GL_ARB_texture_env_crossbar GL_ATI_texture_env_combine3 GL_NV_texture_env_combine4 GL_EXT_texture_env_dot3 GL_ARB_multitexture GL_ARB_vertex_buffer_object GL_EXT_framebuffer_object GL_ARB_vertex_program GL_ARB_fragment_program GL_ARB_shading_language_100 GL_ARB_shader_objects GL_ARB_vertex_shader GL_ARB_fragment_shader GL_ARB_texture_cube_map GL_EXT_draw_range_elements" + (GL.currentContext.compressionExt ? " GL_ARB_texture_compression GL_EXT_texture_compression_s3tc" : "") + (GL.currentContext.anisotropicExt ? " GL_EXT_texture_filter_anisotropic" : ""));
                    GL.stringCache[name_] = ret;
                    return ret
            }
            return glGetString(name_)
        }
            ;
        GL.shaderInfos = {};
        var glCreateShader = _glCreateShader;
        _glCreateShader = _emscripten_glCreateShader = function _glCreateShader(shaderType) {
            var id = glCreateShader(shaderType);
            GL.shaderInfos[id] = {
                type: shaderType,
                ftransform: false
            };
            return id
        }
            ;
        function ensurePrecision(source) {
            if (!/precision +(low|medium|high)p +float *;/.test(source)) {
                source = "#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n" + source
            }
            return source
        }
        _glShaderSource = _emscripten_glShaderSource = function _glShaderSource(shader, count, string, length) {
            var source = GL.getSource(shader, count, string, length);
            if (GL.shaderInfos[shader].type == GLctx.VERTEX_SHADER) {
                var has_pm = source.search(/u_projection/) >= 0;
                var has_mm = source.search(/u_modelView/) >= 0;
                var has_pv = source.search(/a_position/) >= 0;
                var need_pm = 0
                    , need_mm = 0
                    , need_pv = 0;
                var old = source;
                source = source.replace(/ftransform\(\)/g, "(u_projection * u_modelView * a_position)");
                if (old != source)
                    need_pm = need_mm = need_pv = 1;
                old = source;
                source = source.replace(/gl_ProjectionMatrix/g, "u_projection");
                if (old != source)
                    need_pm = 1;
                old = source;
                source = source.replace(/gl_ModelViewMatrixTranspose\[2\]/g, "vec4(u_modelView[0][2], u_modelView[1][2], u_modelView[2][2], u_modelView[3][2])");
                if (old != source)
                    need_mm = 1;
                old = source;
                source = source.replace(/gl_ModelViewMatrix/g, "u_modelView");
                if (old != source)
                    need_mm = 1;
                old = source;
                source = source.replace(/gl_Vertex/g, "a_position");
                if (old != source)
                    need_pv = 1;
                old = source;
                source = source.replace(/gl_ModelViewProjectionMatrix/g, "(u_projection * u_modelView)");
                if (old != source)
                    need_pm = need_mm = 1;
                if (need_pv && !has_pv)
                    source = "attribute vec4 a_position; \n" + source;
                if (need_mm && !has_mm)
                    source = "uniform mat4 u_modelView; \n" + source;
                if (need_pm && !has_pm)
                    source = "uniform mat4 u_projection; \n" + source;
                GL.shaderInfos[shader].ftransform = need_pm || need_mm || need_pv;
                for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
                    old = source;
                    var need_vtc = source.search("v_texCoord" + i) == -1;
                    source = source.replace(new RegExp("gl_TexCoord\\[" + i + "\\]", "g"), "v_texCoord" + i).replace(new RegExp("gl_MultiTexCoord" + i, "g"), "a_texCoord" + i);
                    if (source != old) {
                        source = "attribute vec4 a_texCoord" + i + "; \n" + source;
                        if (need_vtc) {
                            source = "varying vec4 v_texCoord" + i + ";   \n" + source
                        }
                    }
                    old = source;
                    source = source.replace(new RegExp("gl_TextureMatrix\\[" + i + "\\]", "g"), "u_textureMatrix" + i);
                    if (source != old) {
                        source = "uniform mat4 u_textureMatrix" + i + "; \n" + source
                    }
                }
                if (source.indexOf("gl_FrontColor") >= 0) {
                    source = "varying vec4 v_color; \n" + source.replace(/gl_FrontColor/g, "v_color")
                }
                if (source.indexOf("gl_Color") >= 0) {
                    source = "attribute vec4 a_color; \n" + source.replace(/gl_Color/g, "a_color")
                }
                if (source.indexOf("gl_Normal") >= 0) {
                    source = "attribute vec3 a_normal; \n" + source.replace(/gl_Normal/g, "a_normal")
                }
                if (source.indexOf("gl_FogFragCoord") >= 0) {
                    source = "varying float v_fogFragCoord;   \n" + source.replace(/gl_FogFragCoord/g, "v_fogFragCoord")
                }
            } else {
                for (i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
                    old = source;
                    source = source.replace(new RegExp("gl_TexCoord\\[" + i + "\\]", "g"), "v_texCoord" + i);
                    if (source != old) {
                        source = "varying vec4 v_texCoord" + i + ";   \n" + source
                    }
                }
                if (source.indexOf("gl_Color") >= 0) {
                    source = "varying vec4 v_color; \n" + source.replace(/gl_Color/g, "v_color")
                }
                if (source.indexOf("gl_Fog.color") >= 0) {
                    source = "uniform vec4 u_fogColor;   \n" + source.replace(/gl_Fog.color/g, "u_fogColor")
                }
                if (source.indexOf("gl_Fog.end") >= 0) {
                    source = "uniform float u_fogEnd;   \n" + source.replace(/gl_Fog.end/g, "u_fogEnd")
                }
                if (source.indexOf("gl_Fog.scale") >= 0) {
                    source = "uniform float u_fogScale;   \n" + source.replace(/gl_Fog.scale/g, "u_fogScale")
                }
                if (source.indexOf("gl_Fog.density") >= 0) {
                    source = "uniform float u_fogDensity;   \n" + source.replace(/gl_Fog.density/g, "u_fogDensity")
                }
                if (source.indexOf("gl_FogFragCoord") >= 0) {
                    source = "varying float v_fogFragCoord;   \n" + source.replace(/gl_FogFragCoord/g, "v_fogFragCoord")
                }
                source = ensurePrecision(source)
            }
            GLctx.shaderSource(GL.shaders[shader], source)
        }
            ;
        _glCompileShader = _emscripten_glCompileShader = function _glCompileShader(shader) {
            GLctx.compileShader(GL.shaders[shader])
        }
            ;
        GL.programShaders = {};
        var glAttachShader = _glAttachShader;
        _glAttachShader = _emscripten_glAttachShader = function _glAttachShader(program, shader) {
            if (!GL.programShaders[program])
                GL.programShaders[program] = [];
            GL.programShaders[program].push(shader);
            glAttachShader(program, shader)
        }
            ;
        var glDetachShader = _glDetachShader;
        _glDetachShader = _emscripten_glDetachShader = function _glDetachShader(program, shader) {
            var programShader = GL.programShaders[program];
            if (!programShader) {
                err("WARNING: _glDetachShader received invalid program: " + program);
                return
            }
            var index = programShader.indexOf(shader);
            programShader.splice(index, 1);
            glDetachShader(program, shader)
        }
            ;
        var glUseProgram = _glUseProgram;
        _glUseProgram = _emscripten_glUseProgram = function _glUseProgram(program) {
            if (GL.currProgram != program) {
                GLImmediate.currentRenderer = null;
                GL.currProgram = program;
                GLImmediate.fixedFunctionProgram = 0;
                glUseProgram(program)
            }
        }
            ;
        var glDeleteProgram = _glDeleteProgram;
        _glDeleteProgram = _emscripten_glDeleteProgram = function _glDeleteProgram(program) {
            glDeleteProgram(program);
            if (program == GL.currProgram) {
                GLImmediate.currentRenderer = null;
                GL.currProgram = 0
            }
        }
            ;
        var zeroUsedPrograms = {};
        var glBindAttribLocation = _glBindAttribLocation;
        _glBindAttribLocation = _emscripten_glBindAttribLocation = function _glBindAttribLocation(program, index, name) {
            if (index == 0)
                zeroUsedPrograms[program] = true;
            glBindAttribLocation(program, index, name)
        }
            ;
        var glLinkProgram = _glLinkProgram;
        _glLinkProgram = _emscripten_glLinkProgram = function _glLinkProgram(program) {
            if (!(program in zeroUsedPrograms)) {
                GLctx.bindAttribLocation(GL.programs[program], 0, "a_position")
            }
            glLinkProgram(program)
        }
            ;
        var glBindBuffer = _glBindBuffer;
        _glBindBuffer = _emscripten_glBindBuffer = function _glBindBuffer(target, buffer) {
            glBindBuffer(target, buffer);
            if (target == GLctx.ARRAY_BUFFER) {
                if (GLEmulation.currentVao) {
                    assert(GLEmulation.currentVao.arrayBuffer == buffer || GLEmulation.currentVao.arrayBuffer == 0 || buffer == 0, "TODO: support for multiple array buffers in vao");
                    GLEmulation.currentVao.arrayBuffer = buffer
                }
            } else if (target == GLctx.ELEMENT_ARRAY_BUFFER) {
                if (GLEmulation.currentVao)
                    GLEmulation.currentVao.elementArrayBuffer = buffer
            }
        }
            ;
        var glGetFloatv = _glGetFloatv;
        _glGetFloatv = _emscripten_glGetFloatv = function _glGetFloatv(pname, params) {
            if (pname == 2982) {
                HEAPF32.set(GLImmediate.matrix[0], params >> 2)
            } else if (pname == 2983) {
                HEAPF32.set(GLImmediate.matrix[1], params >> 2)
            } else if (pname == 2984) {
                HEAPF32.set(GLImmediate.matrix[2 + GLImmediate.clientActiveTexture], params >> 2)
            } else if (pname == 2918) {
                HEAPF32.set(GLEmulation.fogColor, params >> 2)
            } else if (pname == 2915) {
                HEAPF32[params >> 2] = GLEmulation.fogStart
            } else if (pname == 2916) {
                HEAPF32[params >> 2] = GLEmulation.fogEnd
            } else if (pname == 2914) {
                HEAPF32[params >> 2] = GLEmulation.fogDensity
            } else if (pname == 2917) {
                HEAPF32[params >> 2] = GLEmulation.fogMode
            } else {
                glGetFloatv(pname, params)
            }
        }
            ;
        var glHint = _glHint;
        _glHint = _emscripten_glHint = function _glHint(target, mode) {
            if (target == 34031) {
                return
            }
            glHint(target, mode)
        }
            ;
        var glEnableVertexAttribArray = _glEnableVertexAttribArray;
        _glEnableVertexAttribArray = _emscripten_glEnableVertexAttribArray = function _glEnableVertexAttribArray(index) {
            glEnableVertexAttribArray(index);
            GLEmulation.enabledVertexAttribArrays[index] = 1;
            if (GLEmulation.currentVao)
                GLEmulation.currentVao.enabledVertexAttribArrays[index] = 1
        }
            ;
        var glDisableVertexAttribArray = _glDisableVertexAttribArray;
        _glDisableVertexAttribArray = _emscripten_glDisableVertexAttribArray = function _glDisableVertexAttribArray(index) {
            glDisableVertexAttribArray(index);
            delete GLEmulation.enabledVertexAttribArrays[index];
            if (GLEmulation.currentVao)
                delete GLEmulation.currentVao.enabledVertexAttribArrays[index]
        }
            ;
        var glVertexAttribPointer = _glVertexAttribPointer;
        _glVertexAttribPointer = _emscripten_glVertexAttribPointer = function _glVertexAttribPointer(index, size, type, normalized, stride, pointer) {
            glVertexAttribPointer(index, size, type, normalized, stride, pointer);
            if (GLEmulation.currentVao) {
                GLEmulation.currentVao.vertexAttribPointers[index] = [index, size, type, normalized, stride, pointer]
            }
        }
    },
    getAttributeFromCapability: function (cap) {
        var attrib = null;
        switch (cap) {
            case 3553:
                abort("GL_TEXTURE_2D is not a spec-defined capability for gl{Enable,Disable}ClientState.");
            case 32888:
                attrib = GLImmediate.TEXTURE0 + GLImmediate.clientActiveTexture;
                break;
            case 32884:
                attrib = GLImmediate.VERTEX;
                break;
            case 32885:
                attrib = GLImmediate.NORMAL;
                break;
            case 32886:
                attrib = GLImmediate.COLOR;
                break
        }
        return attrib
    }
};
var GLImmediate = {
    MapTreeLib: null,
    spawnMapTreeLib: function () {
        function CNaiveListMap() {
            var list = [];
            this.insert = function CNaiveListMap_insert(key, val) {
                if (this.contains(key | 0))
                    return false;
                list.push([key, val]);
                return true
            }
                ;
            var __contains_i;
            this.contains = function CNaiveListMap_contains(key) {
                for (__contains_i = 0; __contains_i < list.length; ++__contains_i) {
                    if (list[__contains_i][0] === key)
                        return true
                }
                return false
            }
                ;
            var __get_i;
            this.get = function CNaiveListMap_get(key) {
                for (__get_i = 0; __get_i < list.length; ++__get_i) {
                    if (list[__get_i][0] === key)
                        return list[__get_i][1]
                }
                return undefined
            }
        }
        function CMapTree() {
            function CNLNode() {
                var map = new CNaiveListMap;
                this.child = function CNLNode_child(keyFrag) {
                    if (!map.contains(keyFrag | 0)) {
                        map.insert(keyFrag | 0, new CNLNode)
                    }
                    return map.get(keyFrag | 0)
                }
                    ;
                this.value = undefined;
                this.get = function CNLNode_get() {
                    return this.value
                }
                    ;
                this.set = function CNLNode_set(val) {
                    this.value = val
                }
            }
            function CKeyView(root) {
                var cur;
                this.reset = function CKeyView_reset() {
                    cur = root;
                    return this
                }
                    ;
                this.reset();
                this.next = function CKeyView_next(keyFrag) {
                    cur = cur.child(keyFrag);
                    return this
                }
                    ;
                this.get = function CKeyView_get() {
                    return cur.get()
                }
                    ;
                this.set = function CKeyView_set(val) {
                    cur.set(val)
                }
            }
            var root;
            var staticKeyView;
            this.createKeyView = function CNLNode_createKeyView() {
                return new CKeyView(root)
            }
                ;
            this.clear = function CNLNode_clear() {
                root = new CNLNode;
                staticKeyView = this.createKeyView()
            }
                ;
            this.clear();
            this.getStaticKeyView = function CNLNode_getStaticKeyView() {
                staticKeyView.reset();
                return staticKeyView
            }
        }
        return {
            create: function () {
                return new CMapTree
            }
        }
    },
    TexEnvJIT: null,
    spawnTexEnvJIT: function () {
        var GL_TEXTURE0 = 33984;
        var GL_TEXTURE_1D = 3552;
        var GL_TEXTURE_2D = 3553;
        var GL_TEXTURE_3D = 32879;
        var GL_TEXTURE_CUBE_MAP = 34067;
        var GL_TEXTURE_ENV = 8960;
        var GL_TEXTURE_ENV_MODE = 8704;
        var GL_TEXTURE_ENV_COLOR = 8705;
        var GL_SRC0_RGB = 34176;
        var GL_SRC1_RGB = 34177;
        var GL_SRC2_RGB = 34178;
        var GL_SRC0_ALPHA = 34184;
        var GL_SRC1_ALPHA = 34185;
        var GL_SRC2_ALPHA = 34186;
        var GL_OPERAND0_RGB = 34192;
        var GL_OPERAND1_RGB = 34193;
        var GL_OPERAND2_RGB = 34194;
        var GL_OPERAND0_ALPHA = 34200;
        var GL_OPERAND1_ALPHA = 34201;
        var GL_OPERAND2_ALPHA = 34202;
        var GL_COMBINE_RGB = 34161;
        var GL_COMBINE_ALPHA = 34162;
        var GL_RGB_SCALE = 34163;
        var GL_ALPHA_SCALE = 3356;
        var GL_ADD = 260;
        var GL_BLEND = 3042;
        var GL_REPLACE = 7681;
        var GL_MODULATE = 8448;
        var GL_DECAL = 8449;
        var GL_COMBINE = 34160;
        var GL_SUBTRACT = 34023;
        var GL_INTERPOLATE = 34165;
        var GL_TEXTURE = 5890;
        var GL_CONSTANT = 34166;
        var GL_PRIMARY_COLOR = 34167;
        var GL_PREVIOUS = 34168;
        var GL_SRC_COLOR = 768;
        var GL_ONE_MINUS_SRC_COLOR = 769;
        var GL_SRC_ALPHA = 770;
        var GL_ONE_MINUS_SRC_ALPHA = 771;
        var TEXENVJIT_NAMESPACE_PREFIX = "tej_";
        var TEX_UNIT_UNIFORM_PREFIX = "uTexUnit";
        var TEX_COORD_VARYING_PREFIX = "vTexCoord";
        var PRIM_COLOR_VARYING = "vPrimColor";
        var TEX_MATRIX_UNIFORM_PREFIX = "uTexMatrix";
        var s_texUnits = null;
        var s_activeTexture = 0;
        var s_requiredTexUnitsForPass = [];
        function abort(info) {
            assert(false, "[TexEnvJIT] ABORT: " + info)
        }
        function abort_noSupport(info) {
            abort("No support: " + info)
        }
        function abort_sanity(info) {
            abort("Sanity failure: " + info)
        }
        function genTexUnitSampleExpr(texUnitID) {
            var texUnit = s_texUnits[texUnitID];
            var texType = texUnit.getTexType();
            var func = null;
            switch (texType) {
                case GL_TEXTURE_1D:
                    func = "texture2D";
                    break;
                case GL_TEXTURE_2D:
                    func = "texture2D";
                    break;
                case GL_TEXTURE_3D:
                    return abort_noSupport("No support for 3D textures.");
                case GL_TEXTURE_CUBE_MAP:
                    func = "textureCube";
                    break;
                default:
                    return abort_sanity("Unknown texType: 0x" + texType.toString(16))
            }
            var texCoordExpr = TEX_COORD_VARYING_PREFIX + texUnitID;
            if (TEX_MATRIX_UNIFORM_PREFIX != null) {
                texCoordExpr = "(" + TEX_MATRIX_UNIFORM_PREFIX + texUnitID + " * " + texCoordExpr + ")"
            }
            return func + "(" + TEX_UNIT_UNIFORM_PREFIX + texUnitID + ", " + texCoordExpr + ".xy)"
        }
        function getTypeFromCombineOp(op) {
            switch (op) {
                case GL_SRC_COLOR:
                case GL_ONE_MINUS_SRC_COLOR:
                    return "vec3";
                case GL_SRC_ALPHA:
                case GL_ONE_MINUS_SRC_ALPHA:
                    return "float"
            }
            return abort_noSupport("Unsupported combiner op: 0x" + op.toString(16))
        }
        function getCurTexUnit() {
            return s_texUnits[s_activeTexture]
        }
        function genCombinerSourceExpr(texUnitID, constantExpr, previousVar, src, op) {
            var srcExpr = null;
            switch (src) {
                case GL_TEXTURE:
                    srcExpr = genTexUnitSampleExpr(texUnitID);
                    break;
                case GL_CONSTANT:
                    srcExpr = constantExpr;
                    break;
                case GL_PRIMARY_COLOR:
                    srcExpr = PRIM_COLOR_VARYING;
                    break;
                case GL_PREVIOUS:
                    srcExpr = previousVar;
                    break;
                default:
                    return abort_noSupport("Unsupported combiner src: 0x" + src.toString(16))
            }
            var expr = null;
            switch (op) {
                case GL_SRC_COLOR:
                    expr = srcExpr + ".rgb";
                    break;
                case GL_ONE_MINUS_SRC_COLOR:
                    expr = "(vec3(1.0) - " + srcExpr + ".rgb)";
                    break;
                case GL_SRC_ALPHA:
                    expr = srcExpr + ".a";
                    break;
                case GL_ONE_MINUS_SRC_ALPHA:
                    expr = "(1.0 - " + srcExpr + ".a)";
                    break;
                default:
                    return abort_noSupport("Unsupported combiner op: 0x" + op.toString(16))
            }
            return expr
        }
        function valToFloatLiteral(val) {
            if (val == Math.round(val))
                return val + ".0";
            return val
        }
        function CTexEnv() {
            this.mode = GL_MODULATE;
            this.colorCombiner = GL_MODULATE;
            this.alphaCombiner = GL_MODULATE;
            this.colorScale = 1;
            this.alphaScale = 1;
            this.envColor = [0, 0, 0, 0];
            this.colorSrc = [GL_TEXTURE, GL_PREVIOUS, GL_CONSTANT];
            this.alphaSrc = [GL_TEXTURE, GL_PREVIOUS, GL_CONSTANT];
            this.colorOp = [GL_SRC_COLOR, GL_SRC_COLOR, GL_SRC_ALPHA];
            this.alphaOp = [GL_SRC_ALPHA, GL_SRC_ALPHA, GL_SRC_ALPHA];
            this.traverseKey = {
                7681: 0,
                8448: 1,
                260: 2,
                3042: 3,
                8449: 4,
                34160: 5,
                34023: 3,
                34165: 4,
                5890: 0,
                34166: 1,
                34167: 2,
                34168: 3,
                768: 0,
                769: 1,
                770: 2,
                771: 3
            };
            this.key0 = -1;
            this.key1 = 0;
            this.key2 = 0;
            this.computeKey0 = function () {
                var k = this.traverseKey;
                var key = k[this.mode] * 1638400;
                key += k[this.colorCombiner] * 327680;
                key += k[this.alphaCombiner] * 65536;
                key += (this.colorScale - 1) * 16384;
                key += (this.alphaScale - 1) * 4096;
                key += k[this.colorSrc[0]] * 1024;
                key += k[this.colorSrc[1]] * 256;
                key += k[this.colorSrc[2]] * 64;
                key += k[this.alphaSrc[0]] * 16;
                key += k[this.alphaSrc[1]] * 4;
                key += k[this.alphaSrc[2]];
                return key
            }
                ;
            this.computeKey1 = function () {
                var k = this.traverseKey;
                key = k[this.colorOp[0]] * 4096;
                key += k[this.colorOp[1]] * 1024;
                key += k[this.colorOp[2]] * 256;
                key += k[this.alphaOp[0]] * 16;
                key += k[this.alphaOp[1]] * 4;
                key += k[this.alphaOp[2]];
                return key
            }
                ;
            this.computeKey2 = function () {
                return this.envColor[0] * 16777216 + this.envColor[1] * 65536 + this.envColor[2] * 256 + 1 + this.envColor[3]
            }
                ;
            this.recomputeKey = function () {
                this.key0 = this.computeKey0();
                this.key1 = this.computeKey1();
                this.key2 = this.computeKey2()
            }
                ;
            this.invalidateKey = function () {
                this.key0 = -1;
                GLImmediate.currentRenderer = null
            }
        }
        function CTexUnit() {
            this.env = new CTexEnv;
            this.enabled_tex1D = false;
            this.enabled_tex2D = false;
            this.enabled_tex3D = false;
            this.enabled_texCube = false;
            this.texTypesEnabled = 0;
            this.traverseState = function CTexUnit_traverseState(keyView) {
                if (this.texTypesEnabled) {
                    if (this.env.key0 == -1) {
                        this.env.recomputeKey()
                    }
                    keyView.next(this.texTypesEnabled | this.env.key0 << 4);
                    keyView.next(this.env.key1);
                    keyView.next(this.env.key2)
                } else {
                    keyView.next(0)
                }
            }
        }
        CTexUnit.prototype.enabled = function CTexUnit_enabled() {
            return this.texTypesEnabled
        }
            ;
        CTexUnit.prototype.genPassLines = function CTexUnit_genPassLines(passOutputVar, passInputVar, texUnitID) {
            if (!this.enabled()) {
                return ["vec4 " + passOutputVar + " = " + passInputVar + ";"]
            }
            var lines = this.env.genPassLines(passOutputVar, passInputVar, texUnitID).join("\n");
            var texLoadLines = "";
            var texLoadRegex = /(texture.*?\(.*?\))/g;
            var loadCounter = 0;
            var load;
            while (load = texLoadRegex.exec(lines)) {
                var texLoadExpr = load[1];
                var secondOccurrence = lines.slice(load.index + 1).indexOf(texLoadExpr);
                if (secondOccurrence != -1) {
                    var prefix = TEXENVJIT_NAMESPACE_PREFIX + "env" + texUnitID + "_";
                    var texLoadVar = prefix + "texload" + loadCounter++;
                    var texLoadLine = "vec4 " + texLoadVar + " = " + texLoadExpr + ";\n";
                    texLoadLines += texLoadLine + "\n";
                    lines = lines.split(texLoadExpr).join(texLoadVar);
                    texLoadRegex = /(texture.*\(.*\))/g
                }
            }
            return [texLoadLines + lines]
        }
            ;
        CTexUnit.prototype.getTexType = function CTexUnit_getTexType() {
            if (this.enabled_texCube) {
                return GL_TEXTURE_CUBE_MAP
            } else if (this.enabled_tex3D) {
                return GL_TEXTURE_3D
            } else if (this.enabled_tex2D) {
                return GL_TEXTURE_2D
            } else if (this.enabled_tex1D) {
                return GL_TEXTURE_1D
            }
            return 0
        }
            ;
        CTexEnv.prototype.genPassLines = function CTexEnv_genPassLines(passOutputVar, passInputVar, texUnitID) {
            switch (this.mode) {
                case GL_REPLACE:
                    {
                        return ["vec4 " + passOutputVar + " = " + genTexUnitSampleExpr(texUnitID) + ";"]
                    }
                case GL_ADD:
                    {
                        var prefix = TEXENVJIT_NAMESPACE_PREFIX + "env" + texUnitID + "_";
                        var texVar = prefix + "tex";
                        var colorVar = prefix + "color";
                        var alphaVar = prefix + "alpha";
                        return ["vec4 " + texVar + " = " + genTexUnitSampleExpr(texUnitID) + ";", "vec3 " + colorVar + " = " + passInputVar + ".rgb + " + texVar + ".rgb;", "float " + alphaVar + " = " + passInputVar + ".a * " + texVar + ".a;", "vec4 " + passOutputVar + " = vec4(" + colorVar + ", " + alphaVar + ");"]
                    }
                case GL_MODULATE:
                    {
                        var line = ["vec4 " + passOutputVar, " = ", passInputVar, " * ", genTexUnitSampleExpr(texUnitID), ";"];
                        return [line.join("")]
                    }
                case GL_DECAL:
                    {
                        var prefix = TEXENVJIT_NAMESPACE_PREFIX + "env" + texUnitID + "_";
                        var texVar = prefix + "tex";
                        var colorVar = prefix + "color";
                        var alphaVar = prefix + "alpha";
                        return ["vec4 " + texVar + " = " + genTexUnitSampleExpr(texUnitID) + ";", ["vec3 " + colorVar + " = ", passInputVar + ".rgb * (1.0 - " + texVar + ".a)", " + ", texVar + ".rgb * " + texVar + ".a", ";"].join(""), "float " + alphaVar + " = " + passInputVar + ".a;", "vec4 " + passOutputVar + " = vec4(" + colorVar + ", " + alphaVar + ");"]
                    }
                case GL_BLEND:
                    {
                        var prefix = TEXENVJIT_NAMESPACE_PREFIX + "env" + texUnitID + "_";
                        var texVar = prefix + "tex";
                        var colorVar = prefix + "color";
                        var alphaVar = prefix + "alpha";
                        return ["vec4 " + texVar + " = " + genTexUnitSampleExpr(texUnitID) + ";", ["vec3 " + colorVar + " = ", passInputVar + ".rgb * (1.0 - " + texVar + ".rgb)", " + ", PRIM_COLOR_VARYING + ".rgb * " + texVar + ".rgb", ";"].join(""), "float " + alphaVar + " = " + texVar + ".a;", "vec4 " + passOutputVar + " = vec4(" + colorVar + ", " + alphaVar + ");"]
                    }
                case GL_COMBINE:
                    {
                        var prefix = TEXENVJIT_NAMESPACE_PREFIX + "env" + texUnitID + "_";
                        var colorVar = prefix + "color";
                        var alphaVar = prefix + "alpha";
                        var colorLines = this.genCombinerLines(true, colorVar, passInputVar, texUnitID, this.colorCombiner, this.colorSrc, this.colorOp);
                        var alphaLines = this.genCombinerLines(false, alphaVar, passInputVar, texUnitID, this.alphaCombiner, this.alphaSrc, this.alphaOp);
                        var scaledColor = this.colorScale == 1 ? colorVar : colorVar + " * " + valToFloatLiteral(this.colorScale);
                        var scaledAlpha = this.alphaScale == 1 ? alphaVar : alphaVar + " * " + valToFloatLiteral(this.alphaScale);
                        var line = ["vec4 " + passOutputVar, " = ", "vec4(", scaledColor, ", ", scaledAlpha, ")", ";"].join("");
                        return [].concat(colorLines, alphaLines, [line])
                    }
            }
            return abort_noSupport("Unsupported TexEnv mode: 0x" + this.mode.toString(16))
        }
            ;
        CTexEnv.prototype.genCombinerLines = function CTexEnv_getCombinerLines(isColor, outputVar, passInputVar, texUnitID, combiner, srcArr, opArr) {
            var argsNeeded = null;
            switch (combiner) {
                case GL_REPLACE:
                    argsNeeded = 1;
                    break;
                case GL_MODULATE:
                case GL_ADD:
                case GL_SUBTRACT:
                    argsNeeded = 2;
                    break;
                case GL_INTERPOLATE:
                    argsNeeded = 3;
                    break;
                default:
                    return abort_noSupport("Unsupported combiner: 0x" + combiner.toString(16))
            }
            var constantExpr = ["vec4(", valToFloatLiteral(this.envColor[0]), ", ", valToFloatLiteral(this.envColor[1]), ", ", valToFloatLiteral(this.envColor[2]), ", ", valToFloatLiteral(this.envColor[3]), ")"].join("");
            var src0Expr = argsNeeded >= 1 ? genCombinerSourceExpr(texUnitID, constantExpr, passInputVar, srcArr[0], opArr[0]) : null;
            var src1Expr = argsNeeded >= 2 ? genCombinerSourceExpr(texUnitID, constantExpr, passInputVar, srcArr[1], opArr[1]) : null;
            var src2Expr = argsNeeded >= 3 ? genCombinerSourceExpr(texUnitID, constantExpr, passInputVar, srcArr[2], opArr[2]) : null;
            var outputType = isColor ? "vec3" : "float";
            var lines = null;
            switch (combiner) {
                case GL_REPLACE:
                    {
                        var line = [outputType + " " + outputVar, " = ", src0Expr, ";"];
                        lines = [line.join("")];
                        break
                    }
                case GL_MODULATE:
                    {
                        var line = [outputType + " " + outputVar + " = ", src0Expr + " * " + src1Expr, ";"];
                        lines = [line.join("")];
                        break
                    }
                case GL_ADD:
                    {
                        var line = [outputType + " " + outputVar + " = ", src0Expr + " + " + src1Expr, ";"];
                        lines = [line.join("")];
                        break
                    }
                case GL_SUBTRACT:
                    {
                        var line = [outputType + " " + outputVar + " = ", src0Expr + " - " + src1Expr, ";"];
                        lines = [line.join("")];
                        break
                    }
                case GL_INTERPOLATE:
                    {
                        var prefix = TEXENVJIT_NAMESPACE_PREFIX + "env" + texUnitID + "_";
                        var arg2Var = prefix + "colorSrc2";
                        var arg2Line = getTypeFromCombineOp(this.colorOp[2]) + " " + arg2Var + " = " + src2Expr + ";";
                        var line = [outputType + " " + outputVar, " = ", src0Expr + " * " + arg2Var, " + ", src1Expr + " * (1.0 - " + arg2Var + ")", ";"];
                        lines = [arg2Line, line.join("")];
                        break
                    }
                default:
                    return abort_sanity("Unmatched TexEnv.colorCombiner?")
            }
            return lines
        }
            ;
        return {
            init: function (gl, specifiedMaxTextureImageUnits) {
                var maxTexUnits = 0;
                if (specifiedMaxTextureImageUnits) {
                    maxTexUnits = specifiedMaxTextureImageUnits
                } else if (gl) {
                    maxTexUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)
                }
                assert(maxTexUnits > 0);
                s_texUnits = [];
                for (var i = 0; i < maxTexUnits; i++) {
                    s_texUnits.push(new CTexUnit)
                }
            },
            setGLSLVars: function (uTexUnitPrefix, vTexCoordPrefix, vPrimColor, uTexMatrixPrefix) {
                TEX_UNIT_UNIFORM_PREFIX = uTexUnitPrefix;
                TEX_COORD_VARYING_PREFIX = vTexCoordPrefix;
                PRIM_COLOR_VARYING = vPrimColor;
                TEX_MATRIX_UNIFORM_PREFIX = uTexMatrixPrefix
            },
            genAllPassLines: function (resultDest, indentSize) {
                indentSize = indentSize || 0;
                s_requiredTexUnitsForPass.length = 0;
                var lines = [];
                var lastPassVar = PRIM_COLOR_VARYING;
                for (var i = 0; i < s_texUnits.length; i++) {
                    if (!s_texUnits[i].enabled())
                        continue;
                    s_requiredTexUnitsForPass.push(i);
                    var prefix = TEXENVJIT_NAMESPACE_PREFIX + "env" + i + "_";
                    var passOutputVar = prefix + "result";
                    var newLines = s_texUnits[i].genPassLines(passOutputVar, lastPassVar, i);
                    lines = lines.concat(newLines, [""]);
                    lastPassVar = passOutputVar
                }
                lines.push(resultDest + " = " + lastPassVar + ";");
                var indent = "";
                for (var i = 0; i < indentSize; i++)
                    indent += " ";
                var output = indent + lines.join("\n" + indent);
                return output
            },
            getUsedTexUnitList: function () {
                return s_requiredTexUnitsForPass
            },
            traverseState: function (keyView) {
                for (var i = 0; i < s_texUnits.length; i++) {
                    s_texUnits[i].traverseState(keyView)
                }
            },
            getTexUnitType: function (texUnitID) {
                assert(texUnitID >= 0 && texUnitID < s_texUnits.length);
                return s_texUnits[texUnitID].getTexType()
            },
            hook_activeTexture: function (texture) {
                s_activeTexture = texture - GL_TEXTURE0
            },
            hook_enable: function (cap) {
                var cur = getCurTexUnit();
                switch (cap) {
                    case GL_TEXTURE_1D:
                        if (!cur.enabled_tex1D) {
                            GLImmediate.currentRenderer = null;
                            cur.enabled_tex1D = true;
                            cur.texTypesEnabled |= 1
                        }
                        break;
                    case GL_TEXTURE_2D:
                        if (!cur.enabled_tex2D) {
                            GLImmediate.currentRenderer = null;
                            cur.enabled_tex2D = true;
                            cur.texTypesEnabled |= 2
                        }
                        break;
                    case GL_TEXTURE_3D:
                        if (!cur.enabled_tex3D) {
                            GLImmediate.currentRenderer = null;
                            cur.enabled_tex3D = true;
                            cur.texTypesEnabled |= 4
                        }
                        break;
                    case GL_TEXTURE_CUBE_MAP:
                        if (!cur.enabled_texCube) {
                            GLImmediate.currentRenderer = null;
                            cur.enabled_texCube = true;
                            cur.texTypesEnabled |= 8
                        }
                        break
                }
            },
            hook_disable: function (cap) {
                var cur = getCurTexUnit();
                switch (cap) {
                    case GL_TEXTURE_1D:
                        if (cur.enabled_tex1D) {
                            GLImmediate.currentRenderer = null;
                            cur.enabled_tex1D = false;
                            cur.texTypesEnabled &= ~1
                        }
                        break;
                    case GL_TEXTURE_2D:
                        if (cur.enabled_tex2D) {
                            GLImmediate.currentRenderer = null;
                            cur.enabled_tex2D = false;
                            cur.texTypesEnabled &= ~2
                        }
                        break;
                    case GL_TEXTURE_3D:
                        if (cur.enabled_tex3D) {
                            GLImmediate.currentRenderer = null;
                            cur.enabled_tex3D = false;
                            cur.texTypesEnabled &= ~4
                        }
                        break;
                    case GL_TEXTURE_CUBE_MAP:
                        if (cur.enabled_texCube) {
                            GLImmediate.currentRenderer = null;
                            cur.enabled_texCube = false;
                            cur.texTypesEnabled &= ~8
                        }
                        break
                }
            },
            hook_texEnvf: function (target, pname, param) {
                if (target != GL_TEXTURE_ENV)
                    return;
                var env = getCurTexUnit().env;
                switch (pname) {
                    case GL_RGB_SCALE:
                        if (env.colorScale != param) {
                            env.invalidateKey();
                            env.colorScale = param
                        }
                        break;
                    case GL_ALPHA_SCALE:
                        if (env.alphaScale != param) {
                            env.invalidateKey();
                            env.alphaScale = param
                        }
                        break;
                    default:
                        err("WARNING: Unhandled `pname` in call to `glTexEnvf`.")
                }
            },
            hook_texEnvi: function (target, pname, param) {
                if (target != GL_TEXTURE_ENV)
                    return;
                var env = getCurTexUnit().env;
                switch (pname) {
                    case GL_TEXTURE_ENV_MODE:
                        if (env.mode != param) {
                            env.invalidateKey();
                            env.mode = param
                        }
                        break;
                    case GL_COMBINE_RGB:
                        if (env.colorCombiner != param) {
                            env.invalidateKey();
                            env.colorCombiner = param
                        }
                        break;
                    case GL_COMBINE_ALPHA:
                        if (env.alphaCombiner != param) {
                            env.invalidateKey();
                            env.alphaCombiner = param
                        }
                        break;
                    case GL_SRC0_RGB:
                        if (env.colorSrc[0] != param) {
                            env.invalidateKey();
                            env.colorSrc[0] = param
                        }
                        break;
                    case GL_SRC1_RGB:
                        if (env.colorSrc[1] != param) {
                            env.invalidateKey();
                            env.colorSrc[1] = param
                        }
                        break;
                    case GL_SRC2_RGB:
                        if (env.colorSrc[2] != param) {
                            env.invalidateKey();
                            env.colorSrc[2] = param
                        }
                        break;
                    case GL_SRC0_ALPHA:
                        if (env.alphaSrc[0] != param) {
                            env.invalidateKey();
                            env.alphaSrc[0] = param
                        }
                        break;
                    case GL_SRC1_ALPHA:
                        if (env.alphaSrc[1] != param) {
                            env.invalidateKey();
                            env.alphaSrc[1] = param
                        }
                        break;
                    case GL_SRC2_ALPHA:
                        if (env.alphaSrc[2] != param) {
                            env.invalidateKey();
                            env.alphaSrc[2] = param
                        }
                        break;
                    case GL_OPERAND0_RGB:
                        if (env.colorOp[0] != param) {
                            env.invalidateKey();
                            env.colorOp[0] = param
                        }
                        break;
                    case GL_OPERAND1_RGB:
                        if (env.colorOp[1] != param) {
                            env.invalidateKey();
                            env.colorOp[1] = param
                        }
                        break;
                    case GL_OPERAND2_RGB:
                        if (env.colorOp[2] != param) {
                            env.invalidateKey();
                            env.colorOp[2] = param
                        }
                        break;
                    case GL_OPERAND0_ALPHA:
                        if (env.alphaOp[0] != param) {
                            env.invalidateKey();
                            env.alphaOp[0] = param
                        }
                        break;
                    case GL_OPERAND1_ALPHA:
                        if (env.alphaOp[1] != param) {
                            env.invalidateKey();
                            env.alphaOp[1] = param
                        }
                        break;
                    case GL_OPERAND2_ALPHA:
                        if (env.alphaOp[2] != param) {
                            env.invalidateKey();
                            env.alphaOp[2] = param
                        }
                        break;
                    case GL_RGB_SCALE:
                        if (env.colorScale != param) {
                            env.invalidateKey();
                            env.colorScale = param
                        }
                        break;
                    case GL_ALPHA_SCALE:
                        if (env.alphaScale != param) {
                            env.invalidateKey();
                            env.alphaScale = param
                        }
                        break;
                    default:
                        err("WARNING: Unhandled `pname` in call to `glTexEnvi`.")
                }
            },
            hook_texEnvfv: function (target, pname, params) {
                if (target != GL_TEXTURE_ENV)
                    return;
                var env = getCurTexUnit().env;
                switch (pname) {
                    case GL_TEXTURE_ENV_COLOR:
                        {
                            for (var i = 0; i < 4; i++) {
                                var param = HEAPF32[params + i * 4 >> 2];
                                if (env.envColor[i] != param) {
                                    env.invalidateKey();
                                    env.envColor[i] = param
                                }
                            }
                            break
                        }
                    default:
                        err("WARNING: Unhandled `pname` in call to `glTexEnvfv`.")
                }
            },
            hook_getTexEnviv: function (target, pname, param) {
                if (target != GL_TEXTURE_ENV)
                    return;
                var env = getCurTexUnit().env;
                switch (pname) {
                    case GL_TEXTURE_ENV_MODE:
                        HEAP32[param >> 2] = env.mode;
                        return;
                    case GL_TEXTURE_ENV_COLOR:
                        HEAP32[param >> 2] = Math.max(Math.min(env.envColor[0] * 255, 255, -255));
                        HEAP32[param + 1 >> 2] = Math.max(Math.min(env.envColor[1] * 255, 255, -255));
                        HEAP32[param + 2 >> 2] = Math.max(Math.min(env.envColor[2] * 255, 255, -255));
                        HEAP32[param + 3 >> 2] = Math.max(Math.min(env.envColor[3] * 255, 255, -255));
                        return;
                    case GL_COMBINE_RGB:
                        HEAP32[param >> 2] = env.colorCombiner;
                        return;
                    case GL_COMBINE_ALPHA:
                        HEAP32[param >> 2] = env.alphaCombiner;
                        return;
                    case GL_SRC0_RGB:
                        HEAP32[param >> 2] = env.colorSrc[0];
                        return;
                    case GL_SRC1_RGB:
                        HEAP32[param >> 2] = env.colorSrc[1];
                        return;
                    case GL_SRC2_RGB:
                        HEAP32[param >> 2] = env.colorSrc[2];
                        return;
                    case GL_SRC0_ALPHA:
                        HEAP32[param >> 2] = env.alphaSrc[0];
                        return;
                    case GL_SRC1_ALPHA:
                        HEAP32[param >> 2] = env.alphaSrc[1];
                        return;
                    case GL_SRC2_ALPHA:
                        HEAP32[param >> 2] = env.alphaSrc[2];
                        return;
                    case GL_OPERAND0_RGB:
                        HEAP32[param >> 2] = env.colorOp[0];
                        return;
                    case GL_OPERAND1_RGB:
                        HEAP32[param >> 2] = env.colorOp[1];
                        return;
                    case GL_OPERAND2_RGB:
                        HEAP32[param >> 2] = env.colorOp[2];
                        return;
                    case GL_OPERAND0_ALPHA:
                        HEAP32[param >> 2] = env.alphaOp[0];
                        return;
                    case GL_OPERAND1_ALPHA:
                        HEAP32[param >> 2] = env.alphaOp[1];
                        return;
                    case GL_OPERAND2_ALPHA:
                        HEAP32[param >> 2] = env.alphaOp[2];
                        return;
                    case GL_RGB_SCALE:
                        HEAP32[param >> 2] = env.colorScale;
                        return;
                    case GL_ALPHA_SCALE:
                        HEAP32[param >> 2] = env.alphaScale;
                        return;
                    default:
                        err("WARNING: Unhandled `pname` in call to `glGetTexEnvi`.")
                }
            },
            hook_getTexEnvfv: function (target, pname, param) {
                if (target != GL_TEXTURE_ENV)
                    return;
                var env = getCurTexUnit().env;
                switch (pname) {
                    case GL_TEXTURE_ENV_COLOR:
                        HEAPF32[param >> 2] = env.envColor[0];
                        HEAPF32[param + 4 >> 2] = env.envColor[1];
                        HEAPF32[param + 8 >> 2] = env.envColor[2];
                        HEAPF32[param + 12 >> 2] = env.envColor[3];
                        return
                }
            }
        }
    },
    vertexData: null,
    vertexDataU8: null,
    tempData: null,
    indexData: null,
    vertexCounter: 0,
    mode: -1,
    rendererCache: null,
    rendererComponents: [],
    rendererComponentPointer: 0,
    lastRenderer: null,
    lastArrayBuffer: null,
    lastProgram: null,
    lastStride: -1,
    matrix: [],
    matrixStack: [],
    currentMatrix: 0,
    tempMatrix: null,
    matricesModified: false,
    useTextureMatrix: false,
    VERTEX: 0,
    NORMAL: 1,
    COLOR: 2,
    TEXTURE0: 3,
    NUM_ATTRIBUTES: -1,
    MAX_TEXTURES: -1,
    totalEnabledClientAttributes: 0,
    enabledClientAttributes: [0, 0],
    clientAttributes: [],
    liveClientAttributes: [],
    currentRenderer: null,
    modifiedClientAttributes: false,
    clientActiveTexture: 0,
    clientColor: null,
    usedTexUnitList: [],
    fixedFunctionProgram: null,
    setClientAttribute: function setClientAttribute(name, size, type, stride, pointer) {
        var attrib = GLImmediate.clientAttributes[name];
        if (!attrib) {
            for (var i = 0; i <= name; i++) {
                if (!GLImmediate.clientAttributes[i]) {
                    GLImmediate.clientAttributes[i] = {
                        name: name,
                        size: size,
                        type: type,
                        stride: stride,
                        pointer: pointer,
                        offset: 0
                    }
                }
            }
        } else {
            attrib.name = name;
            attrib.size = size;
            attrib.type = type;
            attrib.stride = stride;
            attrib.pointer = pointer;
            attrib.offset = 0
        }
        GLImmediate.modifiedClientAttributes = true
    },
    addRendererComponent: function addRendererComponent(name, size, type) {
        if (!GLImmediate.rendererComponents[name]) {
            GLImmediate.rendererComponents[name] = 1;
            if (GLImmediate.enabledClientAttributes[name]) {
                console.log("Warning: glTexCoord used after EnableClientState for TEXTURE_COORD_ARRAY for TEXTURE0. Disabling TEXTURE_COORD_ARRAY...")
            }
            GLImmediate.enabledClientAttributes[name] = true;
            GLImmediate.setClientAttribute(name, size, type, 0, GLImmediate.rendererComponentPointer);
            GLImmediate.rendererComponentPointer += size * GL.byteSizeByType[type - GL.byteSizeByTypeRoot]
        } else {
            GLImmediate.rendererComponents[name]++
        }
    },
    disableBeginEndClientAttributes: function disableBeginEndClientAttributes() {
        for (var i = 0; i < GLImmediate.NUM_ATTRIBUTES; i++) {
            if (GLImmediate.rendererComponents[i])
                GLImmediate.enabledClientAttributes[i] = false
        }
    },
    getRenderer: function getRenderer() {
        if (GLImmediate.currentRenderer) {
            return GLImmediate.currentRenderer
        }
        var attributes = GLImmediate.liveClientAttributes;
        var cacheMap = GLImmediate.rendererCache;
        var keyView = cacheMap.getStaticKeyView().reset();
        var enabledAttributesKey = 0;
        for (var i = 0; i < attributes.length; i++) {
            enabledAttributesKey |= 1 << attributes[i].name
        }
        var fogParam = 0;
        if (GLEmulation.fogEnabled) {
            switch (GLEmulation.fogMode) {
                case 2049:
                    fogParam = 1;
                    break;
                case 9729:
                    fogParam = 2;
                    break;
                default:
                    fogParam = 3;
                    break
            }
        }
        keyView.next(enabledAttributesKey << 2 | fogParam);
        keyView.next(GL.currProgram);
        if (!GL.currProgram) {
            GLImmediate.TexEnvJIT.traverseState(keyView)
        }
        var renderer = keyView.get();
        if (!renderer) {
            renderer = GLImmediate.createRenderer();
            GLImmediate.currentRenderer = renderer;
            keyView.set(renderer);
            return renderer
        }
        GLImmediate.currentRenderer = renderer;
        return renderer
    },
    createRenderer: function createRenderer(renderer) {
        var useCurrProgram = !!GL.currProgram;
        var hasTextures = false;
        for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
            var texAttribName = GLImmediate.TEXTURE0 + i;
            if (!GLImmediate.enabledClientAttributes[texAttribName])
                continue;
            if (!useCurrProgram) {
                if (GLImmediate.TexEnvJIT.getTexUnitType(i) == 0) {
                    warnOnce("GL_TEXTURE" + i + " coords are supplied, but that texture unit is disabled in the fixed-function pipeline.")
                }
            }
            hasTextures = true
        }
        var ret = {
            init: function init() {
                var uTexUnitPrefix = "u_texUnit";
                var aTexCoordPrefix = "a_texCoord";
                var vTexCoordPrefix = "v_texCoord";
                var vPrimColor = "v_color";
                var uTexMatrixPrefix = GLImmediate.useTextureMatrix ? "u_textureMatrix" : null;
                if (useCurrProgram) {
                    if (GL.shaderInfos[GL.programShaders[GL.currProgram][0]].type == GLctx.VERTEX_SHADER) {
                        this.vertexShader = GL.shaders[GL.programShaders[GL.currProgram][0]];
                        this.fragmentShader = GL.shaders[GL.programShaders[GL.currProgram][1]]
                    } else {
                        this.vertexShader = GL.shaders[GL.programShaders[GL.currProgram][1]];
                        this.fragmentShader = GL.shaders[GL.programShaders[GL.currProgram][0]]
                    }
                    this.program = GL.programs[GL.currProgram];
                    this.usedTexUnitList = []
                } else {
                    if (GLEmulation.fogEnabled) {
                        switch (GLEmulation.fogMode) {
                            case 2049:
                                var fogFormula = "  float fog = exp(-u_fogDensity * u_fogDensity * ecDistance * ecDistance); \n";
                                break;
                            case 9729:
                                var fogFormula = "  float fog = (u_fogEnd - ecDistance) * u_fogScale; \n";
                                break;
                            default:
                                var fogFormula = "  float fog = exp(-u_fogDensity * ecDistance); \n";
                                break
                        }
                    }
                    GLImmediate.TexEnvJIT.setGLSLVars(uTexUnitPrefix, vTexCoordPrefix, vPrimColor, uTexMatrixPrefix);
                    var fsTexEnvPass = GLImmediate.TexEnvJIT.genAllPassLines("gl_FragColor", 2);
                    var texUnitAttribList = "";
                    var texUnitVaryingList = "";
                    var texUnitUniformList = "";
                    var vsTexCoordInits = "";
                    this.usedTexUnitList = GLImmediate.TexEnvJIT.getUsedTexUnitList();
                    for (var i = 0; i < this.usedTexUnitList.length; i++) {
                        var texUnit = this.usedTexUnitList[i];
                        texUnitAttribList += "attribute vec4 " + aTexCoordPrefix + texUnit + ";\n";
                        texUnitVaryingList += "varying vec4 " + vTexCoordPrefix + texUnit + ";\n";
                        texUnitUniformList += "uniform sampler2D " + uTexUnitPrefix + texUnit + ";\n";
                        vsTexCoordInits += "  " + vTexCoordPrefix + texUnit + " = " + aTexCoordPrefix + texUnit + ";\n";
                        if (GLImmediate.useTextureMatrix) {
                            texUnitUniformList += "uniform mat4 " + uTexMatrixPrefix + texUnit + ";\n"
                        }
                    }
                    var vsFogVaryingInit = null;
                    if (GLEmulation.fogEnabled) {
                        vsFogVaryingInit = "  v_fogFragCoord = abs(ecPosition.z);\n"
                    }
                    var vsSource = ["attribute vec4 a_position;", "attribute vec4 a_color;", "varying vec4 v_color;", texUnitAttribList, texUnitVaryingList, GLEmulation.fogEnabled ? "varying float v_fogFragCoord;" : null, "uniform mat4 u_modelView;", "uniform mat4 u_projection;", "void main()", "{", "  vec4 ecPosition = u_modelView * a_position;", "  gl_Position = u_projection * ecPosition;", "  v_color = a_color;", vsTexCoordInits, vsFogVaryingInit, "}", ""].join("\n").replace(/\n\n+/g, "\n");
                    this.vertexShader = GLctx.createShader(GLctx.VERTEX_SHADER);
                    GLctx.shaderSource(this.vertexShader, vsSource);
                    GLctx.compileShader(this.vertexShader);
                    var fogHeaderIfNeeded = null;
                    if (GLEmulation.fogEnabled) {
                        fogHeaderIfNeeded = ["", "varying float v_fogFragCoord; ", "uniform vec4 u_fogColor;      ", "uniform float u_fogEnd;       ", "uniform float u_fogScale;     ", "uniform float u_fogDensity;   ", "float ffog(in float ecDistance) { ", fogFormula, "  fog = clamp(fog, 0.0, 1.0); ", "  return fog;                 ", "}", ""].join("\n")
                    }
                    var fogPass = null;
                    if (GLEmulation.fogEnabled) {
                        fogPass = "gl_FragColor = vec4(mix(u_fogColor.rgb, gl_FragColor.rgb, ffog(v_fogFragCoord)), gl_FragColor.a);\n"
                    }
                    var fsSource = ["precision mediump float;", texUnitVaryingList, texUnitUniformList, "varying vec4 v_color;", fogHeaderIfNeeded, "void main()", "{", fsTexEnvPass, fogPass, "}", ""].join("\n").replace(/\n\n+/g, "\n");
                    this.fragmentShader = GLctx.createShader(GLctx.FRAGMENT_SHADER);
                    GLctx.shaderSource(this.fragmentShader, fsSource);
                    GLctx.compileShader(this.fragmentShader);
                    this.program = GLctx.createProgram();
                    GLctx.attachShader(this.program, this.vertexShader);
                    GLctx.attachShader(this.program, this.fragmentShader);
                    GLctx.bindAttribLocation(this.program, GLImmediate.VERTEX, "a_position");
                    GLctx.bindAttribLocation(this.program, GLImmediate.COLOR, "a_color");
                    GLctx.bindAttribLocation(this.program, GLImmediate.NORMAL, "a_normal");
                    var maxVertexAttribs = GLctx.getParameter(GLctx.MAX_VERTEX_ATTRIBS);
                    for (var i = 0; i < GLImmediate.MAX_TEXTURES && GLImmediate.TEXTURE0 + i < maxVertexAttribs; i++) {
                        GLctx.bindAttribLocation(this.program, GLImmediate.TEXTURE0 + i, "a_texCoord" + i);
                        GLctx.bindAttribLocation(this.program, GLImmediate.TEXTURE0 + i, aTexCoordPrefix + i)
                    }
                    GLctx.linkProgram(this.program)
                }
                this.textureMatrixVersion = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                this.positionLocation = GLctx.getAttribLocation(this.program, "a_position");
                this.texCoordLocations = [];
                for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
                    if (!GLImmediate.enabledClientAttributes[GLImmediate.TEXTURE0 + i]) {
                        this.texCoordLocations[i] = -1;
                        continue
                    }
                    if (useCurrProgram) {
                        this.texCoordLocations[i] = GLctx.getAttribLocation(this.program, "a_texCoord" + i)
                    } else {
                        this.texCoordLocations[i] = GLctx.getAttribLocation(this.program, aTexCoordPrefix + i)
                    }
                }
                this.colorLocation = GLctx.getAttribLocation(this.program, "a_color");
                if (!useCurrProgram) {
                    var prevBoundProg = GLctx.getParameter(GLctx.CURRENT_PROGRAM);
                    GLctx.useProgram(this.program);
                    {
                        for (var i = 0; i < this.usedTexUnitList.length; i++) {
                            var texUnitID = this.usedTexUnitList[i];
                            var texSamplerLoc = GLctx.getUniformLocation(this.program, uTexUnitPrefix + texUnitID);
                            GLctx.uniform1i(texSamplerLoc, texUnitID)
                        }
                    }
                    GLctx.vertexAttrib4fv(this.colorLocation, [1, 1, 1, 1]);
                    GLctx.useProgram(prevBoundProg)
                }
                this.textureMatrixLocations = [];
                for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
                    this.textureMatrixLocations[i] = GLctx.getUniformLocation(this.program, "u_textureMatrix" + i)
                }
                this.normalLocation = GLctx.getAttribLocation(this.program, "a_normal");
                this.modelViewLocation = GLctx.getUniformLocation(this.program, "u_modelView");
                this.projectionLocation = GLctx.getUniformLocation(this.program, "u_projection");
                this.hasTextures = hasTextures;
                this.hasNormal = GLImmediate.enabledClientAttributes[GLImmediate.NORMAL] && GLImmediate.clientAttributes[GLImmediate.NORMAL].size > 0 && this.normalLocation >= 0;
                this.hasColor = this.colorLocation === 0 || this.colorLocation > 0;
                this.floatType = GLctx.FLOAT;
                this.fogColorLocation = GLctx.getUniformLocation(this.program, "u_fogColor");
                this.fogEndLocation = GLctx.getUniformLocation(this.program, "u_fogEnd");
                this.fogScaleLocation = GLctx.getUniformLocation(this.program, "u_fogScale");
                this.fogDensityLocation = GLctx.getUniformLocation(this.program, "u_fogDensity");
                this.hasFog = !!(this.fogColorLocation || this.fogEndLocation || this.fogScaleLocation || this.fogDensityLocation)
            },
            prepare: function prepare() {
                var arrayBuffer;
                if (!GL.currArrayBuffer) {
                    var start = GLImmediate.firstVertex * GLImmediate.stride;
                    var end = GLImmediate.lastVertex * GLImmediate.stride;
                    assert(end <= GL.MAX_TEMP_BUFFER_SIZE, "too much vertex data");
                    arrayBuffer = GL.getTempVertexBuffer(end)
                } else {
                    arrayBuffer = GL.currArrayBuffer
                }
                if (!GL.currArrayBuffer) {
                    if (arrayBuffer != GLImmediate.lastArrayBuffer) {
                        GLctx.bindBuffer(GLctx.ARRAY_BUFFER, arrayBuffer);
                        GLImmediate.lastArrayBuffer = arrayBuffer
                    }
                    GLctx.bufferSubData(GLctx.ARRAY_BUFFER, start, GLImmediate.vertexData.subarray(start >> 2, end >> 2))
                }
                if (!GL.currProgram) {
                    if (GLImmediate.fixedFunctionProgram != this.program) {
                        GLctx.useProgram(this.program);
                        GLImmediate.fixedFunctionProgram = this.program
                    }
                }
                if (this.modelViewLocation && this.modelViewMatrixVersion != GLImmediate.matrixVersion[0]) {
                    this.modelViewMatrixVersion = GLImmediate.matrixVersion[0];
                    GLctx.uniformMatrix4fv(this.modelViewLocation, false, GLImmediate.matrix[0])
                }
                if (this.projectionLocation && this.projectionMatrixVersion != GLImmediate.matrixVersion[1]) {
                    this.projectionMatrixVersion = GLImmediate.matrixVersion[1];
                    GLctx.uniformMatrix4fv(this.projectionLocation, false, GLImmediate.matrix[1])
                }
                var clientAttributes = GLImmediate.clientAttributes;
                var posAttr = clientAttributes[GLImmediate.VERTEX];
                GLctx.vertexAttribPointer(this.positionLocation, posAttr.size, posAttr.type, false, GLImmediate.stride, posAttr.offset);
                GLctx.enableVertexAttribArray(this.positionLocation);
                if (this.hasNormal) {
                    var normalAttr = clientAttributes[GLImmediate.NORMAL];
                    GLctx.vertexAttribPointer(this.normalLocation, normalAttr.size, normalAttr.type, true, GLImmediate.stride, normalAttr.offset);
                    GLctx.enableVertexAttribArray(this.normalLocation)
                }
                if (this.hasTextures) {
                    for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
                        var attribLoc = this.texCoordLocations[i];
                        if (attribLoc === undefined || attribLoc < 0)
                            continue;
                        var texAttr = clientAttributes[GLImmediate.TEXTURE0 + i];
                        if (texAttr.size) {
                            GLctx.vertexAttribPointer(attribLoc, texAttr.size, texAttr.type, false, GLImmediate.stride, texAttr.offset);
                            GLctx.enableVertexAttribArray(attribLoc)
                        } else {
                            GLctx.vertexAttrib4f(attribLoc, 0, 0, 0, 1);
                            GLctx.disableVertexAttribArray(attribLoc)
                        }
                        var t = 2 + i;
                        if (this.textureMatrixLocations[i] && this.textureMatrixVersion[t] != GLImmediate.matrixVersion[t]) {
                            this.textureMatrixVersion[t] = GLImmediate.matrixVersion[t];
                            GLctx.uniformMatrix4fv(this.textureMatrixLocations[i], false, GLImmediate.matrix[t])
                        }
                    }
                }
                if (GLImmediate.enabledClientAttributes[GLImmediate.COLOR]) {
                    var colorAttr = clientAttributes[GLImmediate.COLOR];
                    GLctx.vertexAttribPointer(this.colorLocation, colorAttr.size, colorAttr.type, true, GLImmediate.stride, colorAttr.offset);
                    GLctx.enableVertexAttribArray(this.colorLocation)
                } else if (this.hasColor) {
                    GLctx.disableVertexAttribArray(this.colorLocation);
                    GLctx.vertexAttrib4fv(this.colorLocation, GLImmediate.clientColor)
                }
                if (this.hasFog) {
                    if (this.fogColorLocation)
                        GLctx.uniform4fv(this.fogColorLocation, GLEmulation.fogColor);
                    if (this.fogEndLocation)
                        GLctx.uniform1f(this.fogEndLocation, GLEmulation.fogEnd);
                    if (this.fogScaleLocation)
                        GLctx.uniform1f(this.fogScaleLocation, 1 / (GLEmulation.fogEnd - GLEmulation.fogStart));
                    if (this.fogDensityLocation)
                        GLctx.uniform1f(this.fogDensityLocation, GLEmulation.fogDensity)
                }
            },
            cleanup: function cleanup() {
                GLctx.disableVertexAttribArray(this.positionLocation);
                if (this.hasTextures) {
                    for (var i = 0; i < GLImmediate.MAX_TEXTURES; i++) {
                        if (GLImmediate.enabledClientAttributes[GLImmediate.TEXTURE0 + i] && this.texCoordLocations[i] >= 0) {
                            GLctx.disableVertexAttribArray(this.texCoordLocations[i])
                        }
                    }
                }
                if (this.hasColor) {
                    GLctx.disableVertexAttribArray(this.colorLocation)
                }
                if (this.hasNormal) {
                    GLctx.disableVertexAttribArray(this.normalLocation)
                }
                if (!GL.currProgram) {
                    GLctx.useProgram(null);
                    GLImmediate.fixedFunctionProgram = 0
                }
                if (!GL.currArrayBuffer) {
                    GLctx.bindBuffer(GLctx.ARRAY_BUFFER, null);
                    GLImmediate.lastArrayBuffer = null
                }
                GLImmediate.matricesModified = true
            }
        };
        ret.init();
        return ret
    },
    setupFuncs: function () {
        GLImmediate.MapTreeLib = GLImmediate.spawnMapTreeLib();
        GLImmediate.spawnMapTreeLib = null;
        GLImmediate.TexEnvJIT = GLImmediate.spawnTexEnvJIT();
        GLImmediate.spawnTexEnvJIT = null;
        GLImmediate.setupHooks()
    },
    setupHooks: function () {
        if (!GLEmulation.hasRunInit) {
            GLEmulation.init()
        }
        var glActiveTexture = _glActiveTexture;
        _glActiveTexture = _emscripten_glActiveTexture = function _glActiveTexture(texture) {
            GLImmediate.TexEnvJIT.hook_activeTexture(texture);
            glActiveTexture(texture)
        }
            ;
        var glEnable = _glEnable;
        _glEnable = _emscripten_glEnable = function _glEnable(cap) {
            GLImmediate.TexEnvJIT.hook_enable(cap);
            glEnable(cap)
        }
            ;
        var glDisable = _glDisable;
        _glDisable = _emscripten_glDisable = function _glDisable(cap) {
            GLImmediate.TexEnvJIT.hook_disable(cap);
            glDisable(cap)
        }
            ;
        var glTexEnvf = typeof _glTexEnvf != "undefined" ? _glTexEnvf : function () { }
            ;
        _glTexEnvf = _emscripten_glTexEnvf = function _glTexEnvf(target, pname, param) {
            GLImmediate.TexEnvJIT.hook_texEnvf(target, pname, param)
        }
            ;
        var glTexEnvi = typeof _glTexEnvi != "undefined" ? _glTexEnvi : function () { }
            ;
        _glTexEnvi = _emscripten_glTexEnvi = function _glTexEnvi(target, pname, param) {
            GLImmediate.TexEnvJIT.hook_texEnvi(target, pname, param)
        }
            ;
        var glTexEnvfv = typeof _glTexEnvfv != "undefined" ? _glTexEnvfv : function () { }
            ;
        _glTexEnvfv = _emscripten_glTexEnvfv = function _glTexEnvfv(target, pname, param) {
            GLImmediate.TexEnvJIT.hook_texEnvfv(target, pname, param)
        }
            ;
        _glGetTexEnviv = function _glGetTexEnviv(target, pname, param) {
            GLImmediate.TexEnvJIT.hook_getTexEnviv(target, pname, param)
        }
            ;
        _glGetTexEnvfv = function _glGetTexEnvfv(target, pname, param) {
            GLImmediate.TexEnvJIT.hook_getTexEnvfv(target, pname, param)
        }
            ;
        var glGetIntegerv = _glGetIntegerv;
        _glGetIntegerv = _emscripten_glGetIntegerv = function _glGetIntegerv(pname, params) {
            switch (pname) {
                case 35725:
                    {
                        var cur = GLctx.getParameter(GLctx.CURRENT_PROGRAM);
                        if (cur == GLImmediate.fixedFunctionProgram) {
                            HEAP32[params >> 2] = 0;
                            return
                        }
                        break
                    }
            }
            glGetIntegerv(pname, params)
        }
    },
    initted: false,
    init: function () {
        err("WARNING: using emscripten GL immediate mode emulation. This is very limited in what it supports");
        GLImmediate.initted = true;
        if (!Module.useWebGL)
            return;
        GLImmediate.MAX_TEXTURES = Module["GL_MAX_TEXTURE_IMAGE_UNITS"] || GLctx.getParameter(GLctx.MAX_TEXTURE_IMAGE_UNITS);
        GLImmediate.TexEnvJIT.init(GLctx, GLImmediate.MAX_TEXTURES);
        GLImmediate.NUM_ATTRIBUTES = 3 + GLImmediate.MAX_TEXTURES;
        GLImmediate.clientAttributes = [];
        GLEmulation.enabledClientAttribIndices = [];
        for (var i = 0; i < GLImmediate.NUM_ATTRIBUTES; i++) {
            GLImmediate.clientAttributes.push({});
            GLEmulation.enabledClientAttribIndices.push(false)
        }
        GLImmediate.matrix = [];
        GLImmediate.matrixStack = [];
        GLImmediate.matrixVersion = [];
        for (var i = 0; i < 2 + GLImmediate.MAX_TEXTURES; i++) {
            GLImmediate.matrixStack.push([]);
            GLImmediate.matrixVersion.push(0);
            GLImmediate.matrix.push(GLImmediate.matrixLib.mat4.create());
            GLImmediate.matrixLib.mat4.identity(GLImmediate.matrix[i])
        }
        GLImmediate.rendererCache = GLImmediate.MapTreeLib.create();
        GLImmediate.tempData = new Float32Array(GL.MAX_TEMP_BUFFER_SIZE >> 2);
        GLImmediate.indexData = new Uint16Array(GL.MAX_TEMP_BUFFER_SIZE >> 1);
        GLImmediate.vertexDataU8 = new Uint8Array(GLImmediate.tempData.buffer);
        GL.generateTempBuffers(true, GL.currentContext);
        GLImmediate.clientColor = new Float32Array([1, 1, 1, 1])
    },
    prepareClientAttributes: function prepareClientAttributes(count, beginEnd) {
        if (!GLImmediate.modifiedClientAttributes) {
            GLImmediate.vertexCounter = GLImmediate.stride * count / 4;
            return
        }
        GLImmediate.modifiedClientAttributes = false;
        var clientStartPointer = 2147483647;
        var bytes = 0;
        var minStride = 2147483647;
        var maxStride = 0;
        var attributes = GLImmediate.liveClientAttributes;
        attributes.length = 0;
        for (var i = 0; i < 3 + GLImmediate.MAX_TEXTURES; i++) {
            if (GLImmediate.enabledClientAttributes[i]) {
                var attr = GLImmediate.clientAttributes[i];
                attributes.push(attr);
                clientStartPointer = Math.min(clientStartPointer, attr.pointer);
                attr.sizeBytes = attr.size * GL.byteSizeByType[attr.type - GL.byteSizeByTypeRoot];
                bytes += attr.sizeBytes;
                minStride = Math.min(minStride, attr.stride);
                maxStride = Math.max(maxStride, attr.stride)
            }
        }
        if ((minStride != maxStride || maxStride < bytes) && !beginEnd) {
            if (!GLImmediate.restrideBuffer)
                GLImmediate.restrideBuffer = _malloc(GL.MAX_TEMP_BUFFER_SIZE);
            var start = GLImmediate.restrideBuffer;
            bytes = 0;
            for (var i = 0; i < attributes.length; i++) {
                var attr = attributes[i];
                var size = attr.sizeBytes;
                if (size % 4 != 0)
                    size += 4 - size % 4;
                attr.offset = bytes;
                bytes += size
            }
            for (var i = 0; i < attributes.length; i++) {
                var attr = attributes[i];
                var srcStride = Math.max(attr.sizeBytes, attr.stride);
                if ((srcStride & 3) == 0 && (attr.sizeBytes & 3) == 0) {
                    var size4 = attr.sizeBytes >> 2;
                    var srcStride4 = Math.max(attr.sizeBytes, attr.stride) >> 2;
                    for (var j = 0; j < count; j++) {
                        for (var k = 0; k < size4; k++) {
                            HEAP32[(start + attr.offset + bytes * j >> 2) + k] = HEAP32[(attr.pointer >> 2) + j * srcStride4 + k]
                        }
                    }
                } else {
                    for (var j = 0; j < count; j++) {
                        for (var k = 0; k < attr.sizeBytes; k++) {
                            HEAP8[start + attr.offset + bytes * j + k] = HEAP8[attr.pointer + j * srcStride + k]
                        }
                    }
                }
                attr.pointer = start + attr.offset
            }
            GLImmediate.stride = bytes;
            GLImmediate.vertexPointer = start
        } else {
            if (GL.currArrayBuffer) {
                GLImmediate.vertexPointer = 0
            } else {
                GLImmediate.vertexPointer = clientStartPointer
            }
            for (var i = 0; i < attributes.length; i++) {
                var attr = attributes[i];
                attr.offset = attr.pointer - GLImmediate.vertexPointer
            }
            GLImmediate.stride = Math.max(maxStride, bytes)
        }
        if (!beginEnd) {
            GLImmediate.vertexCounter = GLImmediate.stride * count / 4
        }
    },
    flush: function flush(numProvidedIndexes, startIndex, ptr) {
        assert(numProvidedIndexes >= 0 || !numProvidedIndexes);
        startIndex = startIndex || 0;
        ptr = ptr || 0;
        var renderer = GLImmediate.getRenderer();
        var numVertexes = 4 * GLImmediate.vertexCounter / GLImmediate.stride;
        if (!numVertexes)
            return;
        assert(numVertexes % 1 == 0, "`numVertexes` must be an integer.");
        var emulatedElementArrayBuffer = false;
        var numIndexes = 0;
        if (numProvidedIndexes) {
            numIndexes = numProvidedIndexes;
            if (!GL.currArrayBuffer && GLImmediate.firstVertex > GLImmediate.lastVertex) {
                assert(!GL.currElementArrayBuffer);
                for (var i = 0; i < numProvidedIndexes; i++) {
                    var currIndex = HEAPU16[ptr + i * 2 >> 1];
                    GLImmediate.firstVertex = Math.min(GLImmediate.firstVertex, currIndex);
                    GLImmediate.lastVertex = Math.max(GLImmediate.lastVertex, currIndex + 1)
                }
            }
            if (!GL.currElementArrayBuffer) {
                assert(numProvidedIndexes << 1 <= GL.MAX_TEMP_BUFFER_SIZE, "too many immediate mode indexes (a)");
                var indexBuffer = GL.getTempIndexBuffer(numProvidedIndexes << 1);
                GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, indexBuffer);
                GLctx.bufferSubData(GLctx.ELEMENT_ARRAY_BUFFER, 0, HEAPU16.subarray(ptr >> 1, ptr + (numProvidedIndexes << 1) >> 1));
                ptr = 0;
                emulatedElementArrayBuffer = true
            }
        } else if (GLImmediate.mode > 6) {
            if (GLImmediate.mode != 7)
                throw "unsupported immediate mode " + GLImmediate.mode;
            assert(GLImmediate.firstVertex % 4 == 0);
            ptr = GLImmediate.firstVertex * 3;
            var numQuads = numVertexes / 4;
            numIndexes = numQuads * 6;
            assert(ptr + (numIndexes << 1) <= GL.MAX_TEMP_BUFFER_SIZE, "too many immediate mode indexes (b)");
            GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, GL.currentContext.tempQuadIndexBuffer);
            emulatedElementArrayBuffer = true
        }
        renderer.prepare();
        if (numIndexes) {
            GLctx.drawElements(GLctx.TRIANGLES, numIndexes, GLctx.UNSIGNED_SHORT, ptr)
        } else {
            GLctx.drawArrays(GLImmediate.mode, startIndex, numVertexes)
        }
        if (emulatedElementArrayBuffer) {
            GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, GL.buffers[GL.currElementArrayBuffer] || null)
        }
        renderer.cleanup()
    }
};
GLImmediate.matrixLib = function () {
    var vec3 = {};
    var mat3 = {};
    var mat4 = {};
    var quat4 = {};
    var MatrixArray = Float32Array;
    vec3.create = function (vec) {
        var dest = new MatrixArray(3);
        if (vec) {
            dest[0] = vec[0];
            dest[1] = vec[1];
            dest[2] = vec[2]
        } else {
            dest[0] = dest[1] = dest[2] = 0
        }
        return dest
    }
        ;
    vec3.set = function (vec, dest) {
        dest[0] = vec[0];
        dest[1] = vec[1];
        dest[2] = vec[2];
        return dest
    }
        ;
    vec3.add = function (vec, vec2, dest) {
        if (!dest || vec === dest) {
            vec[0] += vec2[0];
            vec[1] += vec2[1];
            vec[2] += vec2[2];
            return vec
        }
        dest[0] = vec[0] + vec2[0];
        dest[1] = vec[1] + vec2[1];
        dest[2] = vec[2] + vec2[2];
        return dest
    }
        ;
    vec3.subtract = function (vec, vec2, dest) {
        if (!dest || vec === dest) {
            vec[0] -= vec2[0];
            vec[1] -= vec2[1];
            vec[2] -= vec2[2];
            return vec
        }
        dest[0] = vec[0] - vec2[0];
        dest[1] = vec[1] - vec2[1];
        dest[2] = vec[2] - vec2[2];
        return dest
    }
        ;
    vec3.multiply = function (vec, vec2, dest) {
        if (!dest || vec === dest) {
            vec[0] *= vec2[0];
            vec[1] *= vec2[1];
            vec[2] *= vec2[2];
            return vec
        }
        dest[0] = vec[0] * vec2[0];
        dest[1] = vec[1] * vec2[1];
        dest[2] = vec[2] * vec2[2];
        return dest
    }
        ;
    vec3.negate = function (vec, dest) {
        if (!dest) {
            dest = vec
        }
        dest[0] = -vec[0];
        dest[1] = -vec[1];
        dest[2] = -vec[2];
        return dest
    }
        ;
    vec3.scale = function (vec, val, dest) {
        if (!dest || vec === dest) {
            vec[0] *= val;
            vec[1] *= val;
            vec[2] *= val;
            return vec
        }
        dest[0] = vec[0] * val;
        dest[1] = vec[1] * val;
        dest[2] = vec[2] * val;
        return dest
    }
        ;
    vec3.normalize = function (vec, dest) {
        if (!dest) {
            dest = vec
        }
        var x = vec[0]
            , y = vec[1]
            , z = vec[2]
            , len = Math.sqrt(x * x + y * y + z * z);
        if (!len) {
            dest[0] = 0;
            dest[1] = 0;
            dest[2] = 0;
            return dest
        } else if (len === 1) {
            dest[0] = x;
            dest[1] = y;
            dest[2] = z;
            return dest
        }
        len = 1 / len;
        dest[0] = x * len;
        dest[1] = y * len;
        dest[2] = z * len;
        return dest
    }
        ;
    vec3.cross = function (vec, vec2, dest) {
        if (!dest) {
            dest = vec
        }
        var x = vec[0]
            , y = vec[1]
            , z = vec[2]
            , x2 = vec2[0]
            , y2 = vec2[1]
            , z2 = vec2[2];
        dest[0] = y * z2 - z * y2;
        dest[1] = z * x2 - x * z2;
        dest[2] = x * y2 - y * x2;
        return dest
    }
        ;
    vec3.length = function (vec) {
        var x = vec[0]
            , y = vec[1]
            , z = vec[2];
        return Math.sqrt(x * x + y * y + z * z)
    }
        ;
    vec3.dot = function (vec, vec2) {
        return vec[0] * vec2[0] + vec[1] * vec2[1] + vec[2] * vec2[2]
    }
        ;
    vec3.direction = function (vec, vec2, dest) {
        if (!dest) {
            dest = vec
        }
        var x = vec[0] - vec2[0]
            , y = vec[1] - vec2[1]
            , z = vec[2] - vec2[2]
            , len = Math.sqrt(x * x + y * y + z * z);
        if (!len) {
            dest[0] = 0;
            dest[1] = 0;
            dest[2] = 0;
            return dest
        }
        len = 1 / len;
        dest[0] = x * len;
        dest[1] = y * len;
        dest[2] = z * len;
        return dest
    }
        ;
    vec3.lerp = function (vec, vec2, lerp, dest) {
        if (!dest) {
            dest = vec
        }
        dest[0] = vec[0] + lerp * (vec2[0] - vec[0]);
        dest[1] = vec[1] + lerp * (vec2[1] - vec[1]);
        dest[2] = vec[2] + lerp * (vec2[2] - vec[2]);
        return dest
    }
        ;
    vec3.dist = function (vec, vec2) {
        var x = vec2[0] - vec[0]
            , y = vec2[1] - vec[1]
            , z = vec2[2] - vec[2];
        return Math.sqrt(x * x + y * y + z * z)
    }
        ;
    vec3.unproject = function (vec, view, proj, viewport, dest) {
        if (!dest) {
            dest = vec
        }
        var m = mat4.create();
        var v = new MatrixArray(4);
        v[0] = (vec[0] - viewport[0]) * 2 / viewport[2] - 1;
        v[1] = (vec[1] - viewport[1]) * 2 / viewport[3] - 1;
        v[2] = 2 * vec[2] - 1;
        v[3] = 1;
        mat4.multiply(proj, view, m);
        if (!mat4.inverse(m)) {
            return null
        }
        mat4.multiplyVec4(m, v);
        if (v[3] === 0) {
            return null
        }
        dest[0] = v[0] / v[3];
        dest[1] = v[1] / v[3];
        dest[2] = v[2] / v[3];
        return dest
    }
        ;
    vec3.str = function (vec) {
        return "[" + vec[0] + ", " + vec[1] + ", " + vec[2] + "]"
    }
        ;
    mat3.create = function (mat) {
        var dest = new MatrixArray(9);
        if (mat) {
            dest[0] = mat[0];
            dest[1] = mat[1];
            dest[2] = mat[2];
            dest[3] = mat[3];
            dest[4] = mat[4];
            dest[5] = mat[5];
            dest[6] = mat[6];
            dest[7] = mat[7];
            dest[8] = mat[8]
        }
        return dest
    }
        ;
    mat3.set = function (mat, dest) {
        dest[0] = mat[0];
        dest[1] = mat[1];
        dest[2] = mat[2];
        dest[3] = mat[3];
        dest[4] = mat[4];
        dest[5] = mat[5];
        dest[6] = mat[6];
        dest[7] = mat[7];
        dest[8] = mat[8];
        return dest
    }
        ;
    mat3.identity = function (dest) {
        if (!dest) {
            dest = mat3.create()
        }
        dest[0] = 1;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 0;
        dest[4] = 1;
        dest[5] = 0;
        dest[6] = 0;
        dest[7] = 0;
        dest[8] = 1;
        return dest
    }
        ;
    mat3.transpose = function (mat, dest) {
        if (!dest || mat === dest) {
            var a01 = mat[1]
                , a02 = mat[2]
                , a12 = mat[5];
            mat[1] = mat[3];
            mat[2] = mat[6];
            mat[3] = a01;
            mat[5] = mat[7];
            mat[6] = a02;
            mat[7] = a12;
            return mat
        }
        dest[0] = mat[0];
        dest[1] = mat[3];
        dest[2] = mat[6];
        dest[3] = mat[1];
        dest[4] = mat[4];
        dest[5] = mat[7];
        dest[6] = mat[2];
        dest[7] = mat[5];
        dest[8] = mat[8];
        return dest
    }
        ;
    mat3.toMat4 = function (mat, dest) {
        if (!dest) {
            dest = mat4.create()
        }
        dest[15] = 1;
        dest[14] = 0;
        dest[13] = 0;
        dest[12] = 0;
        dest[11] = 0;
        dest[10] = mat[8];
        dest[9] = mat[7];
        dest[8] = mat[6];
        dest[7] = 0;
        dest[6] = mat[5];
        dest[5] = mat[4];
        dest[4] = mat[3];
        dest[3] = 0;
        dest[2] = mat[2];
        dest[1] = mat[1];
        dest[0] = mat[0];
        return dest
    }
        ;
    mat3.str = function (mat) {
        return "[" + mat[0] + ", " + mat[1] + ", " + mat[2] + ", " + mat[3] + ", " + mat[4] + ", " + mat[5] + ", " + mat[6] + ", " + mat[7] + ", " + mat[8] + "]"
    }
        ;
    mat4.create = function (mat) {
        var dest = new MatrixArray(16);
        if (mat) {
            dest[0] = mat[0];
            dest[1] = mat[1];
            dest[2] = mat[2];
            dest[3] = mat[3];
            dest[4] = mat[4];
            dest[5] = mat[5];
            dest[6] = mat[6];
            dest[7] = mat[7];
            dest[8] = mat[8];
            dest[9] = mat[9];
            dest[10] = mat[10];
            dest[11] = mat[11];
            dest[12] = mat[12];
            dest[13] = mat[13];
            dest[14] = mat[14];
            dest[15] = mat[15]
        }
        return dest
    }
        ;
    mat4.set = function (mat, dest) {
        dest[0] = mat[0];
        dest[1] = mat[1];
        dest[2] = mat[2];
        dest[3] = mat[3];
        dest[4] = mat[4];
        dest[5] = mat[5];
        dest[6] = mat[6];
        dest[7] = mat[7];
        dest[8] = mat[8];
        dest[9] = mat[9];
        dest[10] = mat[10];
        dest[11] = mat[11];
        dest[12] = mat[12];
        dest[13] = mat[13];
        dest[14] = mat[14];
        dest[15] = mat[15];
        return dest
    }
        ;
    mat4.identity = function (dest) {
        if (!dest) {
            dest = mat4.create()
        }
        dest[0] = 1;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 0;
        dest[4] = 0;
        dest[5] = 1;
        dest[6] = 0;
        dest[7] = 0;
        dest[8] = 0;
        dest[9] = 0;
        dest[10] = 1;
        dest[11] = 0;
        dest[12] = 0;
        dest[13] = 0;
        dest[14] = 0;
        dest[15] = 1;
        return dest
    }
        ;
    mat4.transpose = function (mat, dest) {
        if (!dest || mat === dest) {
            var a01 = mat[1]
                , a02 = mat[2]
                , a03 = mat[3]
                , a12 = mat[6]
                , a13 = mat[7]
                , a23 = mat[11];
            mat[1] = mat[4];
            mat[2] = mat[8];
            mat[3] = mat[12];
            mat[4] = a01;
            mat[6] = mat[9];
            mat[7] = mat[13];
            mat[8] = a02;
            mat[9] = a12;
            mat[11] = mat[14];
            mat[12] = a03;
            mat[13] = a13;
            mat[14] = a23;
            return mat
        }
        dest[0] = mat[0];
        dest[1] = mat[4];
        dest[2] = mat[8];
        dest[3] = mat[12];
        dest[4] = mat[1];
        dest[5] = mat[5];
        dest[6] = mat[9];
        dest[7] = mat[13];
        dest[8] = mat[2];
        dest[9] = mat[6];
        dest[10] = mat[10];
        dest[11] = mat[14];
        dest[12] = mat[3];
        dest[13] = mat[7];
        dest[14] = mat[11];
        dest[15] = mat[15];
        return dest
    }
        ;
    mat4.determinant = function (mat) {
        var a00 = mat[0]
            , a01 = mat[1]
            , a02 = mat[2]
            , a03 = mat[3]
            , a10 = mat[4]
            , a11 = mat[5]
            , a12 = mat[6]
            , a13 = mat[7]
            , a20 = mat[8]
            , a21 = mat[9]
            , a22 = mat[10]
            , a23 = mat[11]
            , a30 = mat[12]
            , a31 = mat[13]
            , a32 = mat[14]
            , a33 = mat[15];
        return a30 * a21 * a12 * a03 - a20 * a31 * a12 * a03 - a30 * a11 * a22 * a03 + a10 * a31 * a22 * a03 + a20 * a11 * a32 * a03 - a10 * a21 * a32 * a03 - a30 * a21 * a02 * a13 + a20 * a31 * a02 * a13 + a30 * a01 * a22 * a13 - a00 * a31 * a22 * a13 - a20 * a01 * a32 * a13 + a00 * a21 * a32 * a13 + a30 * a11 * a02 * a23 - a10 * a31 * a02 * a23 - a30 * a01 * a12 * a23 + a00 * a31 * a12 * a23 + a10 * a01 * a32 * a23 - a00 * a11 * a32 * a23 - a20 * a11 * a02 * a33 + a10 * a21 * a02 * a33 + a20 * a01 * a12 * a33 - a00 * a21 * a12 * a33 - a10 * a01 * a22 * a33 + a00 * a11 * a22 * a33
    }
        ;
    mat4.inverse = function (mat, dest) {
        if (!dest) {
            dest = mat
        }
        var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3], a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7], a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11], a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32, d = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06, invDet;
        if (!d) {
            return null
        }
        invDet = 1 / d;
        dest[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
        dest[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet;
        dest[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
        dest[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet;
        dest[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet;
        dest[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
        dest[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet;
        dest[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
        dest[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
        dest[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet;
        dest[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
        dest[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet;
        dest[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet;
        dest[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
        dest[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet;
        dest[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;
        return dest
    }
        ;
    mat4.toRotationMat = function (mat, dest) {
        if (!dest) {
            dest = mat4.create()
        }
        dest[0] = mat[0];
        dest[1] = mat[1];
        dest[2] = mat[2];
        dest[3] = mat[3];
        dest[4] = mat[4];
        dest[5] = mat[5];
        dest[6] = mat[6];
        dest[7] = mat[7];
        dest[8] = mat[8];
        dest[9] = mat[9];
        dest[10] = mat[10];
        dest[11] = mat[11];
        dest[12] = 0;
        dest[13] = 0;
        dest[14] = 0;
        dest[15] = 1;
        return dest
    }
        ;
    mat4.toMat3 = function (mat, dest) {
        if (!dest) {
            dest = mat3.create()
        }
        dest[0] = mat[0];
        dest[1] = mat[1];
        dest[2] = mat[2];
        dest[3] = mat[4];
        dest[4] = mat[5];
        dest[5] = mat[6];
        dest[6] = mat[8];
        dest[7] = mat[9];
        dest[8] = mat[10];
        return dest
    }
        ;
    mat4.toInverseMat3 = function (mat, dest) {
        var a00 = mat[0], a01 = mat[1], a02 = mat[2], a10 = mat[4], a11 = mat[5], a12 = mat[6], a20 = mat[8], a21 = mat[9], a22 = mat[10], b01 = a22 * a11 - a12 * a21, b11 = -a22 * a10 + a12 * a20, b21 = a21 * a10 - a11 * a20, d = a00 * b01 + a01 * b11 + a02 * b21, id;
        if (!d) {
            return null
        }
        id = 1 / d;
        if (!dest) {
            dest = mat3.create()
        }
        dest[0] = b01 * id;
        dest[1] = (-a22 * a01 + a02 * a21) * id;
        dest[2] = (a12 * a01 - a02 * a11) * id;
        dest[3] = b11 * id;
        dest[4] = (a22 * a00 - a02 * a20) * id;
        dest[5] = (-a12 * a00 + a02 * a10) * id;
        dest[6] = b21 * id;
        dest[7] = (-a21 * a00 + a01 * a20) * id;
        dest[8] = (a11 * a00 - a01 * a10) * id;
        return dest
    }
        ;
    mat4.multiply = function (mat, mat2, dest) {
        if (!dest) {
            dest = mat
        }
        var a00 = mat[0]
            , a01 = mat[1]
            , a02 = mat[2]
            , a03 = mat[3]
            , a10 = mat[4]
            , a11 = mat[5]
            , a12 = mat[6]
            , a13 = mat[7]
            , a20 = mat[8]
            , a21 = mat[9]
            , a22 = mat[10]
            , a23 = mat[11]
            , a30 = mat[12]
            , a31 = mat[13]
            , a32 = mat[14]
            , a33 = mat[15]
            , b00 = mat2[0]
            , b01 = mat2[1]
            , b02 = mat2[2]
            , b03 = mat2[3]
            , b10 = mat2[4]
            , b11 = mat2[5]
            , b12 = mat2[6]
            , b13 = mat2[7]
            , b20 = mat2[8]
            , b21 = mat2[9]
            , b22 = mat2[10]
            , b23 = mat2[11]
            , b30 = mat2[12]
            , b31 = mat2[13]
            , b32 = mat2[14]
            , b33 = mat2[15];
        dest[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
        dest[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
        dest[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
        dest[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
        dest[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
        dest[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
        dest[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
        dest[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
        dest[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
        dest[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
        dest[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
        dest[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
        dest[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
        dest[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
        dest[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
        dest[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;
        return dest
    }
        ;
    mat4.multiplyVec3 = function (mat, vec, dest) {
        if (!dest) {
            dest = vec
        }
        var x = vec[0]
            , y = vec[1]
            , z = vec[2];
        dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12];
        dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13];
        dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];
        return dest
    }
        ;
    mat4.multiplyVec4 = function (mat, vec, dest) {
        if (!dest) {
            dest = vec
        }
        var x = vec[0]
            , y = vec[1]
            , z = vec[2]
            , w = vec[3];
        dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12] * w;
        dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13] * w;
        dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14] * w;
        dest[3] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15] * w;
        return dest
    }
        ;
    mat4.translate = function (mat, vec, dest) {
        var x = vec[0], y = vec[1], z = vec[2], a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23;
        if (!dest || mat === dest) {
            mat[12] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12];
            mat[13] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13];
            mat[14] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];
            mat[15] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15];
            return mat
        }
        a00 = mat[0];
        a01 = mat[1];
        a02 = mat[2];
        a03 = mat[3];
        a10 = mat[4];
        a11 = mat[5];
        a12 = mat[6];
        a13 = mat[7];
        a20 = mat[8];
        a21 = mat[9];
        a22 = mat[10];
        a23 = mat[11];
        dest[0] = a00;
        dest[1] = a01;
        dest[2] = a02;
        dest[3] = a03;
        dest[4] = a10;
        dest[5] = a11;
        dest[6] = a12;
        dest[7] = a13;
        dest[8] = a20;
        dest[9] = a21;
        dest[10] = a22;
        dest[11] = a23;
        dest[12] = a00 * x + a10 * y + a20 * z + mat[12];
        dest[13] = a01 * x + a11 * y + a21 * z + mat[13];
        dest[14] = a02 * x + a12 * y + a22 * z + mat[14];
        dest[15] = a03 * x + a13 * y + a23 * z + mat[15];
        return dest
    }
        ;
    mat4.scale = function (mat, vec, dest) {
        var x = vec[0]
            , y = vec[1]
            , z = vec[2];
        if (!dest || mat === dest) {
            mat[0] *= x;
            mat[1] *= x;
            mat[2] *= x;
            mat[3] *= x;
            mat[4] *= y;
            mat[5] *= y;
            mat[6] *= y;
            mat[7] *= y;
            mat[8] *= z;
            mat[9] *= z;
            mat[10] *= z;
            mat[11] *= z;
            return mat
        }
        dest[0] = mat[0] * x;
        dest[1] = mat[1] * x;
        dest[2] = mat[2] * x;
        dest[3] = mat[3] * x;
        dest[4] = mat[4] * y;
        dest[5] = mat[5] * y;
        dest[6] = mat[6] * y;
        dest[7] = mat[7] * y;
        dest[8] = mat[8] * z;
        dest[9] = mat[9] * z;
        dest[10] = mat[10] * z;
        dest[11] = mat[11] * z;
        dest[12] = mat[12];
        dest[13] = mat[13];
        dest[14] = mat[14];
        dest[15] = mat[15];
        return dest
    }
        ;
    mat4.rotate = function (mat, angle, axis, dest) {
        var x = axis[0], y = axis[1], z = axis[2], len = Math.sqrt(x * x + y * y + z * z), s, c, t, a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, b00, b01, b02, b10, b11, b12, b20, b21, b22;
        if (!len) {
            return null
        }
        if (len !== 1) {
            len = 1 / len;
            x *= len;
            y *= len;
            z *= len
        }
        s = Math.sin(angle);
        c = Math.cos(angle);
        t = 1 - c;
        a00 = mat[0];
        a01 = mat[1];
        a02 = mat[2];
        a03 = mat[3];
        a10 = mat[4];
        a11 = mat[5];
        a12 = mat[6];
        a13 = mat[7];
        a20 = mat[8];
        a21 = mat[9];
        a22 = mat[10];
        a23 = mat[11];
        b00 = x * x * t + c;
        b01 = y * x * t + z * s;
        b02 = z * x * t - y * s;
        b10 = x * y * t - z * s;
        b11 = y * y * t + c;
        b12 = z * y * t + x * s;
        b20 = x * z * t + y * s;
        b21 = y * z * t - x * s;
        b22 = z * z * t + c;
        if (!dest) {
            dest = mat
        } else if (mat !== dest) {
            dest[12] = mat[12];
            dest[13] = mat[13];
            dest[14] = mat[14];
            dest[15] = mat[15]
        }
        dest[0] = a00 * b00 + a10 * b01 + a20 * b02;
        dest[1] = a01 * b00 + a11 * b01 + a21 * b02;
        dest[2] = a02 * b00 + a12 * b01 + a22 * b02;
        dest[3] = a03 * b00 + a13 * b01 + a23 * b02;
        dest[4] = a00 * b10 + a10 * b11 + a20 * b12;
        dest[5] = a01 * b10 + a11 * b11 + a21 * b12;
        dest[6] = a02 * b10 + a12 * b11 + a22 * b12;
        dest[7] = a03 * b10 + a13 * b11 + a23 * b12;
        dest[8] = a00 * b20 + a10 * b21 + a20 * b22;
        dest[9] = a01 * b20 + a11 * b21 + a21 * b22;
        dest[10] = a02 * b20 + a12 * b21 + a22 * b22;
        dest[11] = a03 * b20 + a13 * b21 + a23 * b22;
        return dest
    }
        ;
    mat4.rotateX = function (mat, angle, dest) {
        var s = Math.sin(angle)
            , c = Math.cos(angle)
            , a10 = mat[4]
            , a11 = mat[5]
            , a12 = mat[6]
            , a13 = mat[7]
            , a20 = mat[8]
            , a21 = mat[9]
            , a22 = mat[10]
            , a23 = mat[11];
        if (!dest) {
            dest = mat
        } else if (mat !== dest) {
            dest[0] = mat[0];
            dest[1] = mat[1];
            dest[2] = mat[2];
            dest[3] = mat[3];
            dest[12] = mat[12];
            dest[13] = mat[13];
            dest[14] = mat[14];
            dest[15] = mat[15]
        }
        dest[4] = a10 * c + a20 * s;
        dest[5] = a11 * c + a21 * s;
        dest[6] = a12 * c + a22 * s;
        dest[7] = a13 * c + a23 * s;
        dest[8] = a10 * -s + a20 * c;
        dest[9] = a11 * -s + a21 * c;
        dest[10] = a12 * -s + a22 * c;
        dest[11] = a13 * -s + a23 * c;
        return dest
    }
        ;
    mat4.rotateY = function (mat, angle, dest) {
        var s = Math.sin(angle)
            , c = Math.cos(angle)
            , a00 = mat[0]
            , a01 = mat[1]
            , a02 = mat[2]
            , a03 = mat[3]
            , a20 = mat[8]
            , a21 = mat[9]
            , a22 = mat[10]
            , a23 = mat[11];
        if (!dest) {
            dest = mat
        } else if (mat !== dest) {
            dest[4] = mat[4];
            dest[5] = mat[5];
            dest[6] = mat[6];
            dest[7] = mat[7];
            dest[12] = mat[12];
            dest[13] = mat[13];
            dest[14] = mat[14];
            dest[15] = mat[15]
        }
        dest[0] = a00 * c + a20 * -s;
        dest[1] = a01 * c + a21 * -s;
        dest[2] = a02 * c + a22 * -s;
        dest[3] = a03 * c + a23 * -s;
        dest[8] = a00 * s + a20 * c;
        dest[9] = a01 * s + a21 * c;
        dest[10] = a02 * s + a22 * c;
        dest[11] = a03 * s + a23 * c;
        return dest
    }
        ;
    mat4.rotateZ = function (mat, angle, dest) {
        var s = Math.sin(angle)
            , c = Math.cos(angle)
            , a00 = mat[0]
            , a01 = mat[1]
            , a02 = mat[2]
            , a03 = mat[3]
            , a10 = mat[4]
            , a11 = mat[5]
            , a12 = mat[6]
            , a13 = mat[7];
        if (!dest) {
            dest = mat
        } else if (mat !== dest) {
            dest[8] = mat[8];
            dest[9] = mat[9];
            dest[10] = mat[10];
            dest[11] = mat[11];
            dest[12] = mat[12];
            dest[13] = mat[13];
            dest[14] = mat[14];
            dest[15] = mat[15]
        }
        dest[0] = a00 * c + a10 * s;
        dest[1] = a01 * c + a11 * s;
        dest[2] = a02 * c + a12 * s;
        dest[3] = a03 * c + a13 * s;
        dest[4] = a00 * -s + a10 * c;
        dest[5] = a01 * -s + a11 * c;
        dest[6] = a02 * -s + a12 * c;
        dest[7] = a03 * -s + a13 * c;
        return dest
    }
        ;
    mat4.frustum = function (left, right, bottom, top, near, far, dest) {
        if (!dest) {
            dest = mat4.create()
        }
        var rl = right - left
            , tb = top - bottom
            , fn = far - near;
        dest[0] = near * 2 / rl;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 0;
        dest[4] = 0;
        dest[5] = near * 2 / tb;
        dest[6] = 0;
        dest[7] = 0;
        dest[8] = (right + left) / rl;
        dest[9] = (top + bottom) / tb;
        dest[10] = -(far + near) / fn;
        dest[11] = -1;
        dest[12] = 0;
        dest[13] = 0;
        dest[14] = -(far * near * 2) / fn;
        dest[15] = 0;
        return dest
    }
        ;
    mat4.perspective = function (fovy, aspect, near, far, dest) {
        var top = near * Math.tan(fovy * Math.PI / 360)
            , right = top * aspect;
        return mat4.frustum(-right, right, -top, top, near, far, dest)
    }
        ;
    mat4.ortho = function (left, right, bottom, top, near, far, dest) {
        if (!dest) {
            dest = mat4.create()
        }
        var rl = right - left
            , tb = top - bottom
            , fn = far - near;
        dest[0] = 2 / rl;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 0;
        dest[4] = 0;
        dest[5] = 2 / tb;
        dest[6] = 0;
        dest[7] = 0;
        dest[8] = 0;
        dest[9] = 0;
        dest[10] = -2 / fn;
        dest[11] = 0;
        dest[12] = -(left + right) / rl;
        dest[13] = -(top + bottom) / tb;
        dest[14] = -(far + near) / fn;
        dest[15] = 1;
        return dest
    }
        ;
    mat4.lookAt = function (eye, center, up, dest) {
        if (!dest) {
            dest = mat4.create()
        }
        var x0, x1, x2, y0, y1, y2, z0, z1, z2, len, eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2], centerx = center[0], centery = center[1], centerz = center[2];
        if (eyex === centerx && eyey === centery && eyez === centerz) {
            return mat4.identity(dest)
        }
        z0 = eyex - centerx;
        z1 = eyey - centery;
        z2 = eyez - centerz;
        len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
        z0 *= len;
        z1 *= len;
        z2 *= len;
        x0 = upy * z2 - upz * z1;
        x1 = upz * z0 - upx * z2;
        x2 = upx * z1 - upy * z0;
        len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
        if (!len) {
            x0 = 0;
            x1 = 0;
            x2 = 0
        } else {
            len = 1 / len;
            x0 *= len;
            x1 *= len;
            x2 *= len
        }
        y0 = z1 * x2 - z2 * x1;
        y1 = z2 * x0 - z0 * x2;
        y2 = z0 * x1 - z1 * x0;
        len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
        if (!len) {
            y0 = 0;
            y1 = 0;
            y2 = 0
        } else {
            len = 1 / len;
            y0 *= len;
            y1 *= len;
            y2 *= len
        }
        dest[0] = x0;
        dest[1] = y0;
        dest[2] = z0;
        dest[3] = 0;
        dest[4] = x1;
        dest[5] = y1;
        dest[6] = z1;
        dest[7] = 0;
        dest[8] = x2;
        dest[9] = y2;
        dest[10] = z2;
        dest[11] = 0;
        dest[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
        dest[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
        dest[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
        dest[15] = 1;
        return dest
    }
        ;
    mat4.fromRotationTranslation = function (quat, vec, dest) {
        if (!dest) {
            dest = mat4.create()
        }
        var x = quat[0]
            , y = quat[1]
            , z = quat[2]
            , w = quat[3]
            , x2 = x + x
            , y2 = y + y
            , z2 = z + z
            , xx = x * x2
            , xy = x * y2
            , xz = x * z2
            , yy = y * y2
            , yz = y * z2
            , zz = z * z2
            , wx = w * x2
            , wy = w * y2
            , wz = w * z2;
        dest[0] = 1 - (yy + zz);
        dest[1] = xy + wz;
        dest[2] = xz - wy;
        dest[3] = 0;
        dest[4] = xy - wz;
        dest[5] = 1 - (xx + zz);
        dest[6] = yz + wx;
        dest[7] = 0;
        dest[8] = xz + wy;
        dest[9] = yz - wx;
        dest[10] = 1 - (xx + yy);
        dest[11] = 0;
        dest[12] = vec[0];
        dest[13] = vec[1];
        dest[14] = vec[2];
        dest[15] = 1;
        return dest
    }
        ;
    mat4.str = function (mat) {
        return "[" + mat[0] + ", " + mat[1] + ", " + mat[2] + ", " + mat[3] + ", " + mat[4] + ", " + mat[5] + ", " + mat[6] + ", " + mat[7] + ", " + mat[8] + ", " + mat[9] + ", " + mat[10] + ", " + mat[11] + ", " + mat[12] + ", " + mat[13] + ", " + mat[14] + ", " + mat[15] + "]"
    }
        ;
    quat4.create = function (quat) {
        var dest = new MatrixArray(4);
        if (quat) {
            dest[0] = quat[0];
            dest[1] = quat[1];
            dest[2] = quat[2];
            dest[3] = quat[3]
        }
        return dest
    }
        ;
    quat4.set = function (quat, dest) {
        dest[0] = quat[0];
        dest[1] = quat[1];
        dest[2] = quat[2];
        dest[3] = quat[3];
        return dest
    }
        ;
    quat4.calculateW = function (quat, dest) {
        var x = quat[0]
            , y = quat[1]
            , z = quat[2];
        if (!dest || quat === dest) {
            quat[3] = -Math.sqrt(Math.abs(1 - x * x - y * y - z * z));
            return quat
        }
        dest[0] = x;
        dest[1] = y;
        dest[2] = z;
        dest[3] = -Math.sqrt(Math.abs(1 - x * x - y * y - z * z));
        return dest
    }
        ;
    quat4.dot = function (quat, quat2) {
        return quat[0] * quat2[0] + quat[1] * quat2[1] + quat[2] * quat2[2] + quat[3] * quat2[3]
    }
        ;
    quat4.inverse = function (quat, dest) {
        var q0 = quat[0]
            , q1 = quat[1]
            , q2 = quat[2]
            , q3 = quat[3]
            , dot = q0 * q0 + q1 * q1 + q2 * q2 + q3 * q3
            , invDot = dot ? 1 / dot : 0;
        if (!dest || quat === dest) {
            quat[0] *= -invDot;
            quat[1] *= -invDot;
            quat[2] *= -invDot;
            quat[3] *= invDot;
            return quat
        }
        dest[0] = -quat[0] * invDot;
        dest[1] = -quat[1] * invDot;
        dest[2] = -quat[2] * invDot;
        dest[3] = quat[3] * invDot;
        return dest
    }
        ;
    quat4.conjugate = function (quat, dest) {
        if (!dest || quat === dest) {
            quat[0] *= -1;
            quat[1] *= -1;
            quat[2] *= -1;
            return quat
        }
        dest[0] = -quat[0];
        dest[1] = -quat[1];
        dest[2] = -quat[2];
        dest[3] = quat[3];
        return dest
    }
        ;
    quat4.length = function (quat) {
        var x = quat[0]
            , y = quat[1]
            , z = quat[2]
            , w = quat[3];
        return Math.sqrt(x * x + y * y + z * z + w * w)
    }
        ;
    quat4.normalize = function (quat, dest) {
        if (!dest) {
            dest = quat
        }
        var x = quat[0]
            , y = quat[1]
            , z = quat[2]
            , w = quat[3]
            , len = Math.sqrt(x * x + y * y + z * z + w * w);
        if (len === 0) {
            dest[0] = 0;
            dest[1] = 0;
            dest[2] = 0;
            dest[3] = 0;
            return dest
        }
        len = 1 / len;
        dest[0] = x * len;
        dest[1] = y * len;
        dest[2] = z * len;
        dest[3] = w * len;
        return dest
    }
        ;
    quat4.add = function (quat, quat2, dest) {
        if (!dest || quat === dest) {
            quat[0] += quat2[0];
            quat[1] += quat2[1];
            quat[2] += quat2[2];
            quat[3] += quat2[3];
            return quat
        }
        dest[0] = quat[0] + quat2[0];
        dest[1] = quat[1] + quat2[1];
        dest[2] = quat[2] + quat2[2];
        dest[3] = quat[3] + quat2[3];
        return dest
    }
        ;
    quat4.multiply = function (quat, quat2, dest) {
        if (!dest) {
            dest = quat
        }
        var qax = quat[0]
            , qay = quat[1]
            , qaz = quat[2]
            , qaw = quat[3]
            , qbx = quat2[0]
            , qby = quat2[1]
            , qbz = quat2[2]
            , qbw = quat2[3];
        dest[0] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
        dest[1] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
        dest[2] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
        dest[3] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
        return dest
    }
        ;
    quat4.multiplyVec3 = function (quat, vec, dest) {
        if (!dest) {
            dest = vec
        }
        var x = vec[0]
            , y = vec[1]
            , z = vec[2]
            , qx = quat[0]
            , qy = quat[1]
            , qz = quat[2]
            , qw = quat[3]
            , ix = qw * x + qy * z - qz * y
            , iy = qw * y + qz * x - qx * z
            , iz = qw * z + qx * y - qy * x
            , iw = -qx * x - qy * y - qz * z;
        dest[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        dest[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        dest[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
        return dest
    }
        ;
    quat4.scale = function (quat, val, dest) {
        if (!dest || quat === dest) {
            quat[0] *= val;
            quat[1] *= val;
            quat[2] *= val;
            quat[3] *= val;
            return quat
        }
        dest[0] = quat[0] * val;
        dest[1] = quat[1] * val;
        dest[2] = quat[2] * val;
        dest[3] = quat[3] * val;
        return dest
    }
        ;
    quat4.toMat3 = function (quat, dest) {
        if (!dest) {
            dest = mat3.create()
        }
        var x = quat[0]
            , y = quat[1]
            , z = quat[2]
            , w = quat[3]
            , x2 = x + x
            , y2 = y + y
            , z2 = z + z
            , xx = x * x2
            , xy = x * y2
            , xz = x * z2
            , yy = y * y2
            , yz = y * z2
            , zz = z * z2
            , wx = w * x2
            , wy = w * y2
            , wz = w * z2;
        dest[0] = 1 - (yy + zz);
        dest[1] = xy + wz;
        dest[2] = xz - wy;
        dest[3] = xy - wz;
        dest[4] = 1 - (xx + zz);
        dest[5] = yz + wx;
        dest[6] = xz + wy;
        dest[7] = yz - wx;
        dest[8] = 1 - (xx + yy);
        return dest
    }
        ;
    quat4.toMat4 = function (quat, dest) {
        if (!dest) {
            dest = mat4.create()
        }
        var x = quat[0]
            , y = quat[1]
            , z = quat[2]
            , w = quat[3]
            , x2 = x + x
            , y2 = y + y
            , z2 = z + z
            , xx = x * x2
            , xy = x * y2
            , xz = x * z2
            , yy = y * y2
            , yz = y * z2
            , zz = z * z2
            , wx = w * x2
            , wy = w * y2
            , wz = w * z2;
        dest[0] = 1 - (yy + zz);
        dest[1] = xy + wz;
        dest[2] = xz - wy;
        dest[3] = 0;
        dest[4] = xy - wz;
        dest[5] = 1 - (xx + zz);
        dest[6] = yz + wx;
        dest[7] = 0;
        dest[8] = xz + wy;
        dest[9] = yz - wx;
        dest[10] = 1 - (xx + yy);
        dest[11] = 0;
        dest[12] = 0;
        dest[13] = 0;
        dest[14] = 0;
        dest[15] = 1;
        return dest
    }
        ;
    quat4.slerp = function (quat, quat2, slerp, dest) {
        if (!dest) {
            dest = quat
        }
        var cosHalfTheta = quat[0] * quat2[0] + quat[1] * quat2[1] + quat[2] * quat2[2] + quat[3] * quat2[3], halfTheta, sinHalfTheta, ratioA, ratioB;
        if (Math.abs(cosHalfTheta) >= 1) {
            if (dest !== quat) {
                dest[0] = quat[0];
                dest[1] = quat[1];
                dest[2] = quat[2];
                dest[3] = quat[3]
            }
            return dest
        }
        halfTheta = Math.acos(cosHalfTheta);
        sinHalfTheta = Math.sqrt(1 - cosHalfTheta * cosHalfTheta);
        if (Math.abs(sinHalfTheta) < .001) {
            dest[0] = quat[0] * .5 + quat2[0] * .5;
            dest[1] = quat[1] * .5 + quat2[1] * .5;
            dest[2] = quat[2] * .5 + quat2[2] * .5;
            dest[3] = quat[3] * .5 + quat2[3] * .5;
            return dest
        }
        ratioA = Math.sin((1 - slerp) * halfTheta) / sinHalfTheta;
        ratioB = Math.sin(slerp * halfTheta) / sinHalfTheta;
        dest[0] = quat[0] * ratioA + quat2[0] * ratioB;
        dest[1] = quat[1] * ratioA + quat2[1] * ratioB;
        dest[2] = quat[2] * ratioA + quat2[2] * ratioB;
        dest[3] = quat[3] * ratioA + quat2[3] * ratioB;
        return dest
    }
        ;
    quat4.str = function (quat) {
        return "[" + quat[0] + ", " + quat[1] + ", " + quat[2] + ", " + quat[3] + "]"
    }
        ;
    return {
        vec3: vec3,
        mat3: mat3,
        mat4: mat4,
        quat4: quat4
    }
}();
function _glBegin(mode) {
    GLImmediate.enabledClientAttributes_preBegin = GLImmediate.enabledClientAttributes;
    GLImmediate.enabledClientAttributes = [];
    GLImmediate.clientAttributes_preBegin = GLImmediate.clientAttributes;
    GLImmediate.clientAttributes = [];
    for (var i = 0; i < GLImmediate.clientAttributes_preBegin.length; i++) {
        GLImmediate.clientAttributes.push({})
    }
    GLImmediate.mode = mode;
    GLImmediate.vertexCounter = 0;
    var components = GLImmediate.rendererComponents = [];
    for (var i = 0; i < GLImmediate.NUM_ATTRIBUTES; i++) {
        components[i] = 0
    }
    GLImmediate.rendererComponentPointer = 0;
    GLImmediate.vertexData = GLImmediate.tempData
}
function _glBlendFunc(x0, x1) {
    GLctx["blendFunc"](x0, x1)
}
function _glClear(x0) {
    GLctx["clear"](x0)
}
function _glClearColor(x0, x1, x2, x3) {
    GLctx["clearColor"](x0, x1, x2, x3)
}
function _emscripten_glColor4f(r, g, b, a) {
    r = Math.max(Math.min(r, 1), 0);
    g = Math.max(Math.min(g, 1), 0);
    b = Math.max(Math.min(b, 1), 0);
    a = Math.max(Math.min(a, 1), 0);
    if (GLImmediate.mode >= 0) {
        var start = GLImmediate.vertexCounter << 2;
        GLImmediate.vertexDataU8[start + 0] = r * 255;
        GLImmediate.vertexDataU8[start + 1] = g * 255;
        GLImmediate.vertexDataU8[start + 2] = b * 255;
        GLImmediate.vertexDataU8[start + 3] = a * 255;
        GLImmediate.vertexCounter++;
        GLImmediate.addRendererComponent(GLImmediate.COLOR, 4, GLctx.UNSIGNED_BYTE)
    } else {
        GLImmediate.clientColor[0] = r;
        GLImmediate.clientColor[1] = g;
        GLImmediate.clientColor[2] = b;
        GLImmediate.clientColor[3] = a
    }
}
function _glColor3f(r, g, b) {
    _emscripten_glColor4f(r, g, b, 1)
}
function _glDepthFunc(x0) {
    GLctx["depthFunc"](x0)
}
function _glEnd() {
    GLImmediate.prepareClientAttributes(GLImmediate.rendererComponents[GLImmediate.VERTEX], true);
    GLImmediate.firstVertex = 0;
    GLImmediate.lastVertex = GLImmediate.vertexCounter / (GLImmediate.stride >> 2);
    GLImmediate.flush();
    GLImmediate.disableBeginEndClientAttributes();
    GLImmediate.mode = -1;
    GLImmediate.enabledClientAttributes = GLImmediate.enabledClientAttributes_preBegin;
    GLImmediate.clientAttributes = GLImmediate.clientAttributes_preBegin;
    GLImmediate.currentRenderer = null;
    GLImmediate.modifiedClientAttributes = true
}
function _glFinish() {
    GLctx["finish"]()
}
function _glFlush() {
    GLctx["flush"]()
}
function _glFrustum(left, right, bottom, top_, nearVal, farVal) {
    GLImmediate.matricesModified = true;
    GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
    GLImmediate.matrixLib.mat4.multiply(GLImmediate.matrix[GLImmediate.currentMatrix], GLImmediate.matrixLib.mat4.frustum(left, right, bottom, top_, nearVal, farVal))
}
function _glLightfv() {
    throw "glLightfv: TODO"
}
function _glLineWidth(x0) {
    GLctx["lineWidth"](x0)
}
function _glLoadIdentity() {
    GLImmediate.matricesModified = true;
    GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
    GLImmediate.matrixLib.mat4.identity(GLImmediate.matrix[GLImmediate.currentMatrix])
}
function _glMatrixMode(mode) {
    if (mode == 5888) {
        GLImmediate.currentMatrix = 0
    } else if (mode == 5889) {
        GLImmediate.currentMatrix = 1
    } else if (mode == 5890) {
        GLImmediate.useTextureMatrix = true;
        GLImmediate.currentMatrix = 2 + GLImmediate.clientActiveTexture
    } else {
        throw "Wrong mode " + mode + " passed to glMatrixMode"
    }
}
function _glNormal3f() { }
function _glOrtho(left, right, bottom, top_, nearVal, farVal) {
    GLImmediate.matricesModified = true;
    GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
    GLImmediate.matrixLib.mat4.multiply(GLImmediate.matrix[GLImmediate.currentMatrix], GLImmediate.matrixLib.mat4.ortho(left, right, bottom, top_, nearVal, farVal))
}
function _glPolygonMode() { }
function _glPolygonOffset(x0, x1) {
    GLctx["polygonOffset"](x0, x1)
}
function _glPopMatrix() {
    if (GLImmediate.matrixStack[GLImmediate.currentMatrix].length == 0) {
        GL.recordError(1284);
        return
    }
    GLImmediate.matricesModified = true;
    GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
    GLImmediate.matrix[GLImmediate.currentMatrix] = GLImmediate.matrixStack[GLImmediate.currentMatrix].pop()
}
function _glPushMatrix() {
    GLImmediate.matricesModified = true;
    GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
    GLImmediate.matrixStack[GLImmediate.currentMatrix].push(Array.prototype.slice.call(GLImmediate.matrix[GLImmediate.currentMatrix]))
}
function _glRotated(angle, x, y, z) {
    GLImmediate.matricesModified = true;
    GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
    GLImmediate.matrixLib.mat4.rotate(GLImmediate.matrix[GLImmediate.currentMatrix], angle * Math.PI / 180, [x, y, z])
}
function _glScaled(x, y, z) {
    GLImmediate.matricesModified = true;
    GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
    GLImmediate.matrixLib.mat4.scale(GLImmediate.matrix[GLImmediate.currentMatrix], [x, y, z])
}
function _glScalef(x, y, z) {
    GLImmediate.matricesModified = true;
    GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
    GLImmediate.matrixLib.mat4.scale(GLImmediate.matrix[GLImmediate.currentMatrix], [x, y, z])
}
function _glShadeModel() {
    warnOnce("TODO: glShadeModel")
}
function _glTranslated(x, y, z) {
    GLImmediate.matricesModified = true;
    GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
    GLImmediate.matrixLib.mat4.translate(GLImmediate.matrix[GLImmediate.currentMatrix], [x, y, z])
}
function _glTranslatef(x, y, z) {
    GLImmediate.matricesModified = true;
    GLImmediate.matrixVersion[GLImmediate.currentMatrix] = GLImmediate.matrixVersion[GLImmediate.currentMatrix] + 1 | 0;
    GLImmediate.matrixLib.mat4.translate(GLImmediate.matrix[GLImmediate.currentMatrix], [x, y, z])
}
function _glVertex3f(x, y, z) {
    assert(GLImmediate.mode >= 0);
    GLImmediate.vertexData[GLImmediate.vertexCounter++] = x;
    GLImmediate.vertexData[GLImmediate.vertexCounter++] = y;
    GLImmediate.vertexData[GLImmediate.vertexCounter++] = z;
    GLImmediate.vertexData[GLImmediate.vertexCounter++] = 1;
    assert(GLImmediate.vertexCounter << 2 < GL.MAX_TEMP_BUFFER_SIZE);
    GLImmediate.addRendererComponent(GLImmediate.VERTEX, 4, GLctx.FLOAT)
}
function _glViewport(x0, x1, x2, x3) {
    GLctx["viewport"](x0, x1, x2, x3)
}
function _glinit(width, height, depth, flags, no) {
    var canvas;
    if (no == -1)
        canvas = Module["canvas"];
    else
        canvas = document.getElementById("gl3d_" + (no + 1));
    if (width == 0 && height == 0) {
        width = canvas.width;
        height = canvas.height
    }
    if (!SDL.addedResizeListener) {
        SDL.addedResizeListener = true;
        Browser.resizeListeners.push(function (w, h) {
            if (!SDL.settingVideoMode) {
                SDL.receiveEvent({
                    type: "resize",
                    w: w,
                    h: h
                })
            }
        })
    }
    if (width !== canvas.width || height !== canvas.height) {
        SDL.settingVideoMode = true;
        Browser.setCanvasSize(width, height);
        SDL.settingVideoMode = false
    }
    if (SDL.screen) {
        SDL.freeSurface(SDL.screen);
        assert(!SDL.screen)
    }
    if (SDL.GL)
        flags = flags | 67108864;
    flags = flags || 0;
    var is_SDL_HWSURFACE = flags & 1;
    var is_SDL_HWPALETTE = flags & 2097152;
    var is_SDL_OPENGL = flags & 67108864;
    var surf = _malloc(60);
    var pixelFormat = _malloc(44);
    var bpp = is_SDL_HWPALETTE ? 1 : 4;
    var buffer = 0;
    if (!is_SDL_HWSURFACE && !is_SDL_OPENGL) {
        buffer = _malloc(width * height * 4)
    }
    HEAP32[surf >> 2] = flags;
    HEAP32[surf + 4 >> 2] = pixelFormat;
    HEAP32[surf + 8 >> 2] = width;
    HEAP32[surf + 12 >> 2] = height;
    HEAP32[surf + 16 >> 2] = width * bpp;
    HEAP32[surf + 20 >> 2] = buffer;
    HEAP32[surf + 36 >> 2] = 0;
    HEAP32[surf + 40 >> 2] = 0;
    HEAP32[surf + 44 >> 2] = Module["canvas"].width;
    HEAP32[surf + 48 >> 2] = Module["canvas"].height;
    HEAP32[surf + 56 >> 2] = 1;
    HEAP32[pixelFormat >> 2] = -2042224636;
    HEAP32[pixelFormat + 4 >> 2] = 0;
    HEAP8[pixelFormat + 8 >> 0] = bpp * 8;
    HEAP8[pixelFormat + 9 >> 0] = bpp;
    SDL.GL = SDL.GL || is_SDL_OPENGL;
    var webGLContextAttributes = {
        antialias: SDL.glAttributes[13] != 0 && SDL.glAttributes[14] > 1,
        depth: SDL.glAttributes[6] > 0,
        stencil: SDL.glAttributes[7] > 0
    };
    var ctx;
    var contextAttributes = {
        antialias: false,
        alpha: false
    };
    if (webGLContextAttributes) {
        for (var attribute in webGLContextAttributes) {
            contextAttributes[attribute] = webGLContextAttributes[attribute]
        }
    }
    var contextHandle = GL.createContext(canvas, contextAttributes);
    if (contextHandle) {
        ctx = GL.getContext(contextHandle).GLctx
    }
    Module.ctx = ctx;
    GL.makeContextCurrent(contextHandle);
    Module.useWebGL = true;
    Browser.moduleContextCreatedCallbacks.forEach(function (callback) {
        callback()
    });
    Browser.init();
    SDL.surfaces[surf] = {
        width: width,
        height: height,
        canvas: canvas,
        ctx: ctx,
        surf: surf,
        buffer: buffer,
        pixelFormat: pixelFormat,
        alpha: 255,
        flags: flags,
        locked: 0,
        usePageCanvas: true,
        source: "screen",
        isFlagSet: function (flag) {
            return flags & flag
        }
    };
    SDL.screen = surf;
    return contextHandle
}
var _llvm_cos_f64 = Math_cos;
function _llvm_log10_f32(x) {
    return Math.log(x) / Math.LN10
}
function _llvm_log10_f64(a0) {
    return _llvm_log10_f32(a0)
}
var _llvm_sin_f64 = Math_sin;
function _llvm_stackrestore(p) {
    var self = _llvm_stacksave;
    var ret = self.LLVM_SAVEDSTACKS[p];
    self.LLVM_SAVEDSTACKS.splice(p, 1);
    stackRestore(ret)
}
function _llvm_stacksave() {
    var self = _llvm_stacksave;
    if (!self.LLVM_SAVEDSTACKS) {
        self.LLVM_SAVEDSTACKS = []
    }
    self.LLVM_SAVEDSTACKS.push(stackSave());
    return self.LLVM_SAVEDSTACKS.length - 1
}
function _llvm_trap() {
    abort("trap!")
}
var _llvm_trunc_f64 = Math_trunc;
var ___tm_current = 5095088;
var ___tm_timezone = (stringToUTF8("GMT", 5095136, 4),
    5095136);
function _tzset() {
    if (_tzset.called)
        return;
    _tzset.called = true;
    HEAP32[__get_timezone() >> 2] = (new Date).getTimezoneOffset() * 60;
    var winter = new Date(2e3, 0, 1);
    var summer = new Date(2e3, 6, 1);
    HEAP32[__get_daylight() >> 2] = Number(winter.getTimezoneOffset() != summer.getTimezoneOffset());
    function extractZone(date) {
        var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
        return match ? match[1] : "GMT"
    }
    var winterName = extractZone(winter);
    var summerName = extractZone(summer);
    var winterNamePtr = allocate(intArrayFromString(winterName), "i8", ALLOC_NORMAL);
    var summerNamePtr = allocate(intArrayFromString(summerName), "i8", ALLOC_NORMAL);
    if (summer.getTimezoneOffset() < winter.getTimezoneOffset()) {
        HEAP32[__get_tzname() >> 2] = winterNamePtr;
        HEAP32[__get_tzname() + 4 >> 2] = summerNamePtr
    } else {
        HEAP32[__get_tzname() >> 2] = summerNamePtr;
        HEAP32[__get_tzname() + 4 >> 2] = winterNamePtr
    }
}
function _localtime_r(time, tmPtr) {
    _tzset();
    var date = new Date(HEAP32[time >> 2] * 1e3);
    HEAP32[tmPtr >> 2] = date.getSeconds();
    HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
    HEAP32[tmPtr + 8 >> 2] = date.getHours();
    HEAP32[tmPtr + 12 >> 2] = date.getDate();
    HEAP32[tmPtr + 16 >> 2] = date.getMonth();
    HEAP32[tmPtr + 20 >> 2] = date.getFullYear() - 1900;
    HEAP32[tmPtr + 24 >> 2] = date.getDay();
    var start = new Date(date.getFullYear(), 0, 1);
    var yday = (date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24) | 0;
    HEAP32[tmPtr + 28 >> 2] = yday;
    HEAP32[tmPtr + 36 >> 2] = -(date.getTimezoneOffset() * 60);
    var summerOffset = new Date(2e3, 6, 1).getTimezoneOffset();
    var winterOffset = start.getTimezoneOffset();
    var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
    HEAP32[tmPtr + 32 >> 2] = dst;
    var zonePtr = HEAP32[__get_tzname() + (dst ? 4 : 0) >> 2];
    HEAP32[tmPtr + 40 >> 2] = zonePtr;
    return tmPtr
}
function _localtime(time) {
    return _localtime_r(time, ___tm_current)
}
function _emscripten_memcpy_big(dest, src, num) {
    HEAPU8.set(HEAPU8.subarray(src, src + num), dest)
}
function _mp_js_hook() {
    if (typeof window === "undefined") {
        var mp_interrupt_char = Module.ccall("mp_hal_get_interrupt_char", "number", ["number"], ["null"]);
        var fs = require("fs");
        var buf = Buffer.alloc(1);
        try {
            var n = fs.readSync(process.stdin.fd, buf, 0, 1);
            if (n > 0) {
                if (buf[0] == mp_interrupt_char) {
                    Module.ccall("mp_keyboard_interrupt", "null", ["null"], ["null"])
                } else {
                    process.stdout.write(String.fromCharCode(buf[0]))
                }
            }
        } catch (e) {
            if (e.code === "EAGAIN") { } else {
                throw e
            }
        }
    }
}
function _mp_js_ticks_ms() {
    return (new Date).getTime()
}
function _popen() {
    err("missing function: popen");
    abort(-1)
}
function _pthread_cond_wait() {
    return 0
}
function _raise(sig) {
    err("Calling stub instead of raise()");
    ___setErrNo(ERRNO_CODES.ENOSYS);
    warnOnce("raise() returning an error as we do not support it");
    return -1
}
function abortOnCannotGrowMemory(requestedSize) {
    abort("Cannot enlarge memory arrays to size " + requestedSize + " bytes (OOM). Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value " + HEAP8.length + ", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ")
}
function _emscripten_resize_heap(requestedSize) {
    abortOnCannotGrowMemory(requestedSize)
}
function _sigaction(signum, act, oldact) {
    err("Calling stub instead of sigaction()");
    return 0
}
function _sigemptyset(set) {
    HEAP32[set >> 2] = 0;
    return 0
}
var _sqrt = Math_sqrt;
function __isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}
function __arraySum(array, index) {
    var sum = 0;
    for (var i = 0; i <= index; sum += array[i++])
        ;
    return sum
}
var __MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var __MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function __addDays(date, days) {
    var newDate = new Date(date.getTime());
    while (days > 0) {
        var leap = __isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
        if (days > daysInCurrentMonth - newDate.getDate()) {
            days -= daysInCurrentMonth - newDate.getDate() + 1;
            newDate.setDate(1);
            if (currentMonth < 11) {
                newDate.setMonth(currentMonth + 1)
            } else {
                newDate.setMonth(0);
                newDate.setFullYear(newDate.getFullYear() + 1)
            }
        } else {
            newDate.setDate(newDate.getDate() + days);
            return newDate
        }
    }
    return newDate
}
function _strftime(s, maxsize, format, tm) {
    var tm_zone = HEAP32[tm + 40 >> 2];
    var date = {
        tm_sec: HEAP32[tm >> 2],
        tm_min: HEAP32[tm + 4 >> 2],
        tm_hour: HEAP32[tm + 8 >> 2],
        tm_mday: HEAP32[tm + 12 >> 2],
        tm_mon: HEAP32[tm + 16 >> 2],
        tm_year: HEAP32[tm + 20 >> 2],
        tm_wday: HEAP32[tm + 24 >> 2],
        tm_yday: HEAP32[tm + 28 >> 2],
        tm_isdst: HEAP32[tm + 32 >> 2],
        tm_gmtoff: HEAP32[tm + 36 >> 2],
        tm_zone: tm_zone ? UTF8ToString(tm_zone) : ""
    };
    var pattern = UTF8ToString(format);
    var EXPANSION_RULES_1 = {
        "%c": "%a %b %d %H:%M:%S %Y",
        "%D": "%m/%d/%y",
        "%F": "%Y-%m-%d",
        "%h": "%b",
        "%r": "%I:%M:%S %p",
        "%R": "%H:%M",
        "%T": "%H:%M:%S",
        "%x": "%m/%d/%y",
        "%X": "%H:%M:%S",
        "%Ec": "%c",
        "%EC": "%C",
        "%Ex": "%m/%d/%y",
        "%EX": "%H:%M:%S",
        "%Ey": "%y",
        "%EY": "%Y",
        "%Od": "%d",
        "%Oe": "%e",
        "%OH": "%H",
        "%OI": "%I",
        "%Om": "%m",
        "%OM": "%M",
        "%OS": "%S",
        "%Ou": "%u",
        "%OU": "%U",
        "%OV": "%V",
        "%Ow": "%w",
        "%OW": "%W",
        "%Oy": "%y"
    };
    for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule])
    }
    var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    function leadingSomething(value, digits, character) {
        var str = typeof value === "number" ? value.toString() : value || "";
        while (str.length < digits) {
            str = character[0] + str
        }
        return str
    }
    function leadingNulls(value, digits) {
        return leadingSomething(value, digits, "0")
    }
    function compareByDay(date1, date2) {
        function sgn(value) {
            return value < 0 ? -1 : value > 0 ? 1 : 0
        }
        var compare;
        if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
            if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
                compare = sgn(date1.getDate() - date2.getDate())
            }
        }
        return compare
    }
    function getFirstWeekStartDate(janFourth) {
        switch (janFourth.getDay()) {
            case 0:
                return new Date(janFourth.getFullYear() - 1, 11, 29);
            case 1:
                return janFourth;
            case 2:
                return new Date(janFourth.getFullYear(), 0, 3);
            case 3:
                return new Date(janFourth.getFullYear(), 0, 2);
            case 4:
                return new Date(janFourth.getFullYear(), 0, 1);
            case 5:
                return new Date(janFourth.getFullYear() - 1, 11, 31);
            case 6:
                return new Date(janFourth.getFullYear() - 1, 11, 30)
        }
    }
    function getWeekBasedYear(date) {
        var thisDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
        var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
        var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
        var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
        var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
        if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
                return thisDate.getFullYear() + 1
            } else {
                return thisDate.getFullYear()
            }
        } else {
            return thisDate.getFullYear() - 1
        }
    }
    var EXPANSION_RULES_2 = {
        "%a": function (date) {
            return WEEKDAYS[date.tm_wday].substring(0, 3)
        },
        "%A": function (date) {
            return WEEKDAYS[date.tm_wday]
        },
        "%b": function (date) {
            return MONTHS[date.tm_mon].substring(0, 3)
        },
        "%B": function (date) {
            return MONTHS[date.tm_mon]
        },
        "%C": function (date) {
            var year = date.tm_year + 1900;
            return leadingNulls(year / 100 | 0, 2)
        },
        "%d": function (date) {
            return leadingNulls(date.tm_mday, 2)
        },
        "%e": function (date) {
            return leadingSomething(date.tm_mday, 2, " ")
        },
        "%g": function (date) {
            return getWeekBasedYear(date).toString().substring(2)
        },
        "%G": function (date) {
            return getWeekBasedYear(date)
        },
        "%H": function (date) {
            return leadingNulls(date.tm_hour, 2)
        },
        "%I": function (date) {
            var twelveHour = date.tm_hour;
            if (twelveHour == 0)
                twelveHour = 12;
            else if (twelveHour > 12)
                twelveHour -= 12;
            return leadingNulls(twelveHour, 2)
        },
        "%j": function (date) {
            return leadingNulls(date.tm_mday + __arraySum(__isLeapYear(date.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon - 1), 3)
        },
        "%m": function (date) {
            return leadingNulls(date.tm_mon + 1, 2)
        },
        "%M": function (date) {
            return leadingNulls(date.tm_min, 2)
        },
        "%n": function () {
            return "\n"
        },
        "%p": function (date) {
            if (date.tm_hour >= 0 && date.tm_hour < 12) {
                return "AM"
            } else {
                return "PM"
            }
        },
        "%S": function (date) {
            return leadingNulls(date.tm_sec, 2)
        },
        "%t": function () {
            return "\t"
        },
        "%u": function (date) {
            return date.tm_wday || 7
        },
        "%U": function (date) {
            var janFirst = new Date(date.tm_year + 1900, 0, 1);
            var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7 - janFirst.getDay());
            var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
            if (compareByDay(firstSunday, endDate) < 0) {
                var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
                var firstSundayUntilEndJanuary = 31 - firstSunday.getDate();
                var days = firstSundayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
                return leadingNulls(Math.ceil(days / 7), 2)
            }
            return compareByDay(firstSunday, janFirst) === 0 ? "01" : "00"
        },
        "%V": function (date) {
            var janFourthThisYear = new Date(date.tm_year + 1900, 0, 4);
            var janFourthNextYear = new Date(date.tm_year + 1901, 0, 4);
            var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
            var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
            var endDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
            if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
                return "53"
            }
            if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
                return "01"
            }
            var daysDifference;
            if (firstWeekStartThisYear.getFullYear() < date.tm_year + 1900) {
                daysDifference = date.tm_yday + 32 - firstWeekStartThisYear.getDate()
            } else {
                daysDifference = date.tm_yday + 1 - firstWeekStartThisYear.getDate()
            }
            return leadingNulls(Math.ceil(daysDifference / 7), 2)
        },
        "%w": function (date) {
            return date.tm_wday
        },
        "%W": function (date) {
            var janFirst = new Date(date.tm_year, 0, 1);
            var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7 - janFirst.getDay() + 1);
            var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
            if (compareByDay(firstMonday, endDate) < 0) {
                var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
                var firstMondayUntilEndJanuary = 31 - firstMonday.getDate();
                var days = firstMondayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
                return leadingNulls(Math.ceil(days / 7), 2)
            }
            return compareByDay(firstMonday, janFirst) === 0 ? "01" : "00"
        },
        "%y": function (date) {
            return (date.tm_year + 1900).toString().substring(2)
        },
        "%Y": function (date) {
            return date.tm_year + 1900
        },
        "%z": function (date) {
            var off = date.tm_gmtoff;
            var ahead = off >= 0;
            off = Math.abs(off) / 60;
            off = off / 60 * 100 + off % 60;
            return (ahead ? "+" : "-") + String("0000" + off).slice(-4)
        },
        "%Z": function (date) {
            return date.tm_zone
        },
        "%%": function () {
            return "%"
        }
    };
    for (var rule in EXPANSION_RULES_2) {
        if (pattern.indexOf(rule) >= 0) {
            pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date))
        }
    }
    var bytes = intArrayFromString(pattern, false);
    if (bytes.length > maxsize) {
        return 0
    }
    writeArrayToMemory(bytes, s);
    return bytes.length - 1
}
function _strftime_l(s, maxsize, format, tm) {
    return _strftime(s, maxsize, format, tm)
}
function _sysconf(name) {
    switch (name) {
        case 30:
            return PAGE_SIZE;
        case 85:
            var maxHeapSize = 2 * 1024 * 1024 * 1024 - 65536;
            maxHeapSize = HEAPU8.length;
            return maxHeapSize / PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
            return 200809;
        case 79:
            return 0;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
            return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
            return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
            return 1024;
        case 31:
        case 42:
        case 72:
            return 32;
        case 87:
        case 26:
        case 33:
            return 2147483647;
        case 34:
        case 1:
            return 47839;
        case 38:
        case 36:
            return 99;
        case 43:
        case 37:
            return 2048;
        case 0:
            return 2097152;
        case 3:
            return 65536;
        case 28:
            return 32768;
        case 44:
            return 32767;
        case 75:
            return 16384;
        case 39:
            return 1e3;
        case 89:
            return 700;
        case 71:
            return 256;
        case 40:
            return 255;
        case 2:
            return 100;
        case 180:
            return 64;
        case 25:
            return 20;
        case 5:
            return 16;
        case 6:
            return 6;
        case 73:
            return 4;
        case 84:
            {
                if (typeof navigator === "object")
                    return navigator["hardwareConcurrency"] || 1;
                return 1
            }
    }
    ___setErrNo(22);
    return -1
}
function _system(command) {
    ___setErrNo(11);
    return -1
}
function _time(ptr) {
    var ret = Date.now() / 1e3 | 0;
    if (ptr) {
        HEAP32[ptr >> 2] = ret
    }
    return ret
}
function _usleep(useconds) {
    var msec = useconds / 1e3;
    if ((ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && self["performance"] && self["performance"]["now"]) {
        var start = self["performance"]["now"]();
        while (self["performance"]["now"]() - start < msec) { }
    } else {
        var start = Date.now();
        while (Date.now() - start < msec) { }
    }
    return 0
}
FS.staticInit();
if (ENVIRONMENT_HAS_NODE) {
    var fs = require("fs");
    var NODEJS_PATH = require("path");
    NODEFS.staticInit()
}
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas, vrDevice) {
    err("Module.requestFullScreen is deprecated. Please call Module.requestFullscreen instead.");
    Module["requestFullScreen"] = Module["requestFullscreen"];
    Browser.requestFullScreen(lockPointer, resizeCanvas, vrDevice)
}
    ;
Module["requestFullscreen"] = function Module_requestFullscreen(lockPointer, resizeCanvas, vrDevice) {
    Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice)
}
    ;
Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) {
    Browser.requestAnimationFrame(func)
}
    ;
Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) {
    Browser.setCanvasSize(width, height, noUpdates)
}
    ;
Module["pauseMainLoop"] = function Module_pauseMainLoop() {
    Browser.mainLoop.pause()
}
    ;
Module["resumeMainLoop"] = function Module_resumeMainLoop() {
    Browser.mainLoop.resume()
}
    ;
Module["getUserMedia"] = function Module_getUserMedia() {
    Browser.getUserMedia()
}
    ;
Module["createContext"] = function Module_createContext(canvas, useWebGL, setInModule, webGLContextAttributes) {
    return Browser.createContext(canvas, useWebGL, setInModule, webGLContextAttributes)
}
    ;
if (ENVIRONMENT_IS_NODE) {
    _emscripten_get_now = function _emscripten_get_now_actual() {
        var t = process["hrtime"]();
        return t[0] * 1e3 + t[1] / 1e6
    }
} else if (typeof dateNow !== "undefined") {
    _emscripten_get_now = dateNow
} else if (typeof performance === "object" && performance && typeof performance["now"] === "function") {
    _emscripten_get_now = function () {
        return performance["now"]()
    }
} else {
    _emscripten_get_now = Date.now
}
GLImmediate.setupFuncs();
Browser.moduleContextCreatedCallbacks.push(function () {
    GLImmediate.init()
});
var GLctx;
GL.init();
GLEmulation.init();
function intArrayFromString(stringy, dontAddNull, length) {
    var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
    var u8array = new Array(len);
    var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
    if (dontAddNull)
        u8array.length = numBytesWritten;
    return u8array
}
function nullFunc_dd(x) {
    abortFnPtrError(x, "dd")
}
function nullFunc_ddd(x) {
    abortFnPtrError(x, "ddd")
}
function nullFunc_di(x) {
    abortFnPtrError(x, "di")
}
function nullFunc_i(x) {
    abortFnPtrError(x, "i")
}
function nullFunc_ii(x) {
    abortFnPtrError(x, "ii")
}
function nullFunc_iidi(x) {
    abortFnPtrError(x, "iidi")
}
function nullFunc_iidiiii(x) {
    abortFnPtrError(x, "iidiiii")
}
function nullFunc_iii(x) {
    abortFnPtrError(x, "iii")
}
function nullFunc_iiii(x) {
    abortFnPtrError(x, "iiii")
}
function nullFunc_iiiid(x) {
    abortFnPtrError(x, "iiiid")
}
function nullFunc_iiiii(x) {
    abortFnPtrError(x, "iiiii")
}
function nullFunc_iiiiid(x) {
    abortFnPtrError(x, "iiiiid")
}
function nullFunc_iiiiii(x) {
    abortFnPtrError(x, "iiiiii")
}
function nullFunc_iiiiiid(x) {
    abortFnPtrError(x, "iiiiiid")
}
function nullFunc_iiiiiii(x) {
    abortFnPtrError(x, "iiiiiii")
}
function nullFunc_iiiiiiii(x) {
    abortFnPtrError(x, "iiiiiiii")
}
function nullFunc_iiiiiiiii(x) {
    abortFnPtrError(x, "iiiiiiiii")
}
function nullFunc_iiiiiiiiii(x) {
    abortFnPtrError(x, "iiiiiiiiii")
}
function nullFunc_iiiiiiiiiii(x) {
    abortFnPtrError(x, "iiiiiiiiiii")
}
function nullFunc_iiiiiiiiiiii(x) {
    abortFnPtrError(x, "iiiiiiiiiiii")
}
function nullFunc_iiiiiiiiiiiii(x) {
    abortFnPtrError(x, "iiiiiiiiiiiii")
}
function nullFunc_iiiiiiiiiiiiii(x) {
    abortFnPtrError(x, "iiiiiiiiiiiiii")
}
function nullFunc_iiiiiiiiiiiiiii(x) {
    abortFnPtrError(x, "iiiiiiiiiiiiiii")
}
function nullFunc_iiiiiiiiiiiiiiii(x) {
    abortFnPtrError(x, "iiiiiiiiiiiiiiii")
}
function nullFunc_iiiiiiiiiiiiiiiii(x) {
    abortFnPtrError(x, "iiiiiiiiiiiiiiiii")
}
function nullFunc_iiiiiiiiiiiiiiiiii(x) {
    abortFnPtrError(x, "iiiiiiiiiiiiiiiiii")
}
function nullFunc_iiiiiiiiiiiiiiiiiii(x) {
    abortFnPtrError(x, "iiiiiiiiiiiiiiiiiii")
}
function nullFunc_iiiiiiiiiiiiiiiiiiii(x) {
    abortFnPtrError(x, "iiiiiiiiiiiiiiiiiiii")
}
function nullFunc_iiiiiiiiiiiiiiiiiiiii(x) {
    abortFnPtrError(x, "iiiiiiiiiiiiiiiiiiiii")
}
function nullFunc_iiiiij(x) {
    abortFnPtrError(x, "iiiiij")
}
function nullFunc_jiji(x) {
    abortFnPtrError(x, "jiji")
}
function nullFunc_v(x) {
    abortFnPtrError(x, "v")
}
function nullFunc_vi(x) {
    abortFnPtrError(x, "vi")
}
function nullFunc_vid(x) {
    abortFnPtrError(x, "vid")
}
function nullFunc_vidddiii(x) {
    abortFnPtrError(x, "vidddiii")
}
function nullFunc_vidi(x) {
    abortFnPtrError(x, "vidi")
}
function nullFunc_vii(x) {
    abortFnPtrError(x, "vii")
}
function nullFunc_viid(x) {
    abortFnPtrError(x, "viid")
}
function nullFunc_viii(x) {
    abortFnPtrError(x, "viii")
}
function nullFunc_viiidd(x) {
    abortFnPtrError(x, "viiidd")
}
function nullFunc_viiii(x) {
    abortFnPtrError(x, "viiii")
}
function nullFunc_viiiii(x) {
    abortFnPtrError(x, "viiiii")
}
function nullFunc_viiiiii(x) {
    abortFnPtrError(x, "viiiiii")
}
function nullFunc_viiiiiii(x) {
    abortFnPtrError(x, "viiiiiii")
}
function nullFunc_viiiiiiii(x) {
    abortFnPtrError(x, "viiiiiiii")
}
function nullFunc_viiiiiiiii(x) {
    abortFnPtrError(x, "viiiiiiiii")
}
function nullFunc_viiiiiiiiii(x) {
    abortFnPtrError(x, "viiiiiiiiii")
}
function nullFunc_viiiiiiiiiii(x) {
    abortFnPtrError(x, "viiiiiiiiiii")
}
function nullFunc_viiiiiiiiiiii(x) {
    abortFnPtrError(x, "viiiiiiiiiiii")
}
function nullFunc_viiiiiiiiiiiii(x) {
    abortFnPtrError(x, "viiiiiiiiiiiii")
}
function nullFunc_viiiiiiiiiiiiii(x) {
    abortFnPtrError(x, "viiiiiiiiiiiiii")
}
function nullFunc_viiiiiiiiiiiiiii(x) {
    abortFnPtrError(x, "viiiiiiiiiiiiiii")
}
function nullFunc_viiiiiiiiiiiiiiii(x) {
    abortFnPtrError(x, "viiiiiiiiiiiiiiii")
}
function nullFunc_viiiiiiiiiiiiiiiii(x) {
    abortFnPtrError(x, "viiiiiiiiiiiiiiiii")
}
function nullFunc_viiiiiiiiiiiiiiiiii(x) {
    abortFnPtrError(x, "viiiiiiiiiiiiiiiiii")
}
function nullFunc_viiiiiiiiiiiiiiiiiii(x) {
    abortFnPtrError(x, "viiiiiiiiiiiiiiiiiii")
}
function nullFunc_viiiiiiiiiiiiiiiiiiii(x) {
    abortFnPtrError(x, "viiiiiiiiiiiiiiiiiiii")
}
function nullFunc_viijii(x) {
    abortFnPtrError(x, "viijii")
}
function invoke_dd(index, a1) {
    var sp = stackSave();
    try {
        return dynCall_dd(index, a1)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp")
            throw e;
        _setThrew(1, 0)
    }
}
function invoke_di(index, a1) {
    var sp = stackSave();
    try {
        return dynCall_di(index, a1)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp")
            throw e;
        _setThrew(1, 0)
    }
}
function invoke_i(index) {
    var sp = stackSave();
    try {
        return dynCall_i(index)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp")
            throw e;
        _setThrew(1, 0)
    }
}
function invoke_ii(index, a1) {
    var sp = stackSave();
    try {
        return dynCall_ii(index, a1)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp")
            throw e;
        _setThrew(1, 0)
    }
}
function invoke_iidi(index, a1, a2, a3) {
    var sp = stackSave();
    try {
        return dynCall_iidi(index, a1, a2, a3)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp")
            throw e;
        _setThrew(1, 0)
    }
}
function invoke_iii(index, a1, a2) {
    var sp = stackSave();
    try {
        return dynCall_iii(index, a1, a2)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp")
            throw e;
        _setThrew(1, 0)
    }
}
function invoke_iiii(index, a1, a2, a3) {
    var sp = stackSave();
    try {
        return dynCall_iiii(index, a1, a2, a3)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp")
            throw e;
        _setThrew(1, 0)
    }
}
function invoke_iiiii(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
        return dynCall_iiiii(index, a1, a2, a3, a4)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp")
            throw e;
        _setThrew(1, 0)
    }
}
function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
        return dynCall_iiiiii(index, a1, a2, a3, a4, a5)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp")
            throw e;
        _setThrew(1, 0)
    }
}
function invoke_v(index) {
    var sp = stackSave();
    try {
        dynCall_v(index)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp")
            throw e;
        _setThrew(1, 0)
    }
}
function invoke_vi(index, a1) {
    var sp = stackSave();
    try {
        dynCall_vi(index, a1)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp")
            throw e;
        _setThrew(1, 0)
    }
}
function invoke_vii(index, a1, a2) {
    var sp = stackSave();
    try {
        dynCall_vii(index, a1, a2)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp")
            throw e;
        _setThrew(1, 0)
    }
}
function invoke_viid(index, a1, a2, a3) {
    var sp = stackSave();
    try {
        dynCall_viid(index, a1, a2, a3)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp")
            throw e;
        _setThrew(1, 0)
    }
}
function invoke_viii(index, a1, a2, a3) {
    var sp = stackSave();
    try {
        dynCall_viii(index, a1, a2, a3)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp")
            throw e;
        _setThrew(1, 0)
    }
}
function invoke_viiidd(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
        dynCall_viiidd(index, a1, a2, a3, a4, a5)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp")
            throw e;
        _setThrew(1, 0)
    }
}
function invoke_viiii(index, a1, a2, a3, a4) {
    var sp = stackSave();
    try {
        dynCall_viiii(index, a1, a2, a3, a4)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp")
            throw e;
        _setThrew(1, 0)
    }
}
function invoke_viiiii(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
        dynCall_viiiii(index, a1, a2, a3, a4, a5)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp")
            throw e;
        _setThrew(1, 0)
    }
}
var asmGlobalArg = {};
var asmLibraryArg = {
    "f": setTempRet0,
    "d": getTempRet0,
    "b": abortStackOverflow,
    "Oa": nullFunc_dd,
    "Ia": nullFunc_ddd,
    "Ha": nullFunc_di,
    "Ba": nullFunc_i,
    "Oc": nullFunc_ii,
    "Fc": nullFunc_iidi,
    "xc": nullFunc_iidiiii,
    "tc": nullFunc_iii,
    "lc": nullFunc_iiii,
    "ec": nullFunc_iiiid,
    "_b": nullFunc_iiiii,
    "Ub": nullFunc_iiiiid,
    "Pb": nullFunc_iiiiii,
    "Lb": nullFunc_iiiiiid,
    "Cb": nullFunc_iiiiiii,
    "zb": nullFunc_iiiiiiii,
    "yb": nullFunc_iiiiiiiii,
    "xb": nullFunc_iiiiiiiiii,
    "wb": nullFunc_iiiiiiiiiii,
    "vb": nullFunc_iiiiiiiiiiii,
    "ub": nullFunc_iiiiiiiiiiiii,
    "tb": nullFunc_iiiiiiiiiiiiii,
    "sb": nullFunc_iiiiiiiiiiiiiii,
    "rb": nullFunc_iiiiiiiiiiiiiiii,
    "qb": nullFunc_iiiiiiiiiiiiiiiii,
    "pb": nullFunc_iiiiiiiiiiiiiiiiii,
    "ob": nullFunc_iiiiiiiiiiiiiiiiiii,
    "nb": nullFunc_iiiiiiiiiiiiiiiiiiii,
    "mb": nullFunc_iiiiiiiiiiiiiiiiiiiii,
    "lb": nullFunc_iiiiij,
    "kb": nullFunc_jiji,
    "jb": nullFunc_v,
    "ib": nullFunc_vi,
    "hb": nullFunc_vid,
    "gb": nullFunc_vidddiii,
    "fb": nullFunc_vidi,
    "eb": nullFunc_vii,
    "db": nullFunc_viid,
    "cb": nullFunc_viii,
    "bb": nullFunc_viiidd,
    "ab": nullFunc_viiii,
    "$a": nullFunc_viiiii,
    "_a": nullFunc_viiiiii,
    "Za": nullFunc_viiiiiii,
    "Ya": nullFunc_viiiiiiii,
    "Xa": nullFunc_viiiiiiiii,
    "Wa": nullFunc_viiiiiiiiii,
    "Va": nullFunc_viiiiiiiiiii,
    "Ua": nullFunc_viiiiiiiiiiii,
    "Ta": nullFunc_viiiiiiiiiiiii,
    "Sa": nullFunc_viiiiiiiiiiiiii,
    "Ra": nullFunc_viiiiiiiiiiiiiii,
    "Qa": nullFunc_viiiiiiiiiiiiiiii,
    "Pa": nullFunc_viiiiiiiiiiiiiiiii,
    "Na": nullFunc_viiiiiiiiiiiiiiiiii,
    "Ma": nullFunc_viiiiiiiiiiiiiiiiiii,
    "La": nullFunc_viiiiiiiiiiiiiiiiiiii,
    "Ka": nullFunc_viijii,
    "I": invoke_dd,
    "S": invoke_di,
    "x": invoke_i,
    "k": invoke_ii,
    "Ja": invoke_iidi,
    "i": invoke_iii,
    "r": invoke_iiii,
    "L": invoke_iiiii,
    "da": invoke_iiiiii,
    "w": invoke_v,
    "j": invoke_vi,
    "m": invoke_vii,
    "ca": invoke_viid,
    "l": invoke_viii,
    "z": invoke_viiidd,
    "H": invoke_viiii,
    "X": invoke_viiiii,
    "Ga": _SDL_GL_SetAttribute,
    "G": _SDL_GL_SwapBuffers,
    "Fa": _SDL_GetError,
    "Ea": _SDL_Init,
    "F": _SDL_Quit,
    "g": ___assert_fail,
    "Da": ___buildEnvironment,
    "o": ___cxa_allocate_exception,
    "Ca": ___cxa_pure_virtual,
    "n": ___cxa_throw,
    "Aa": ___cxa_uncaught_exceptions,
    "ba": ___lock,
    "za": ___map_file,
    "ea": ___setErrNo,
    "ya": ___syscall10,
    "xa": ___syscall114,
    "wa": ___syscall12,
    "va": ___syscall140,
    "ua": ___syscall145,
    "ta": ___syscall146,
    "Nc": ___syscall183,
    "Mc": ___syscall191,
    "Lc": ___syscall195,
    "Kc": ___syscall199,
    "Jc": ___syscall20,
    "Ic": ___syscall201,
    "Hc": ___syscall220,
    "W": ___syscall221,
    "Gc": ___syscall3,
    "Ec": ___syscall33,
    "Dc": ___syscall340,
    "Cc": ___syscall38,
    "Bc": ___syscall39,
    "Ac": ___syscall4,
    "zc": ___syscall40,
    "sa": ___syscall5,
    "aa": ___syscall54,
    "$": ___syscall6,
    "yc": ___syscall77,
    "wc": ___syscall91,
    "R": ___unlock,
    "h": _abort,
    "vc": _ceil,
    "A": _clock,
    "uc": _difftime,
    "ra": _dlerror,
    "qa": _dlopen,
    "pa": _dlsym,
    "c": _emcctime,
    "sc": _emscripten_asm_const_d,
    "oa": _emscripten_asm_const_i,
    "N": _emscripten_asm_const_ii,
    "rc": _emscripten_asm_const_iii,
    "na": _emscripten_asm_const_iiii,
    "qc": _emscripten_asm_const_iiiii,
    "pc": _emscripten_get_canvas_size,
    "oc": _emscripten_get_heap_size,
    "nc": _emscripten_longjmp,
    "mc": _emscripten_memcpy_big,
    "kc": _emscripten_resize_heap,
    "ma": _exit,
    "jc": _fabs,
    "ic": _floor,
    "K": _getenv,
    "la": _getpwnam,
    "hc": _getpwuid,
    "gc": _gettimeofday,
    "p": _glBegin,
    "fc": _glBlendFunc,
    "dc": _glClear,
    "ka": _glClearColor,
    "v": _glColor3f,
    "cc": _glDepthFunc,
    "C": _glDisable,
    "y": _glEnable,
    "q": _glEnd,
    "bc": _glFinish,
    "ac": _glFlush,
    "$b": _glFrustum,
    "Zb": _glGetFloatv,
    "ja": _glGetIntegerv,
    "V": _glLightfv,
    "B": _glLineWidth,
    "Q": _glLoadIdentity,
    "E": _glMatrixMode,
    "Yb": _glNormal3f,
    "Xb": _glOrtho,
    "Wb": _glPolygonMode,
    "Vb": _glPolygonOffset,
    "_": _glPopMatrix,
    "Z": _glPushMatrix,
    "Tb": _glRotated,
    "ia": _glScaled,
    "Sb": _glScalef,
    "Rb": _glShadeModel,
    "ha": _glTranslated,
    "ga": _glTranslatef,
    "D": _glVertex3f,
    "Qb": _glViewport,
    "Ob": _glinit,
    "P": _llvm_cos_f64,
    "u": _llvm_log10_f64,
    "O": _llvm_sin_f64,
    "t": _llvm_stackrestore,
    "s": _llvm_stacksave,
    "U": _llvm_trap,
    "Nb": _llvm_trunc_f64,
    "Mb": _localtime,
    "e": _longjmp,
    "Kb": _mp_js_hook,
    "M": _mp_js_ticks_ms,
    "Jb": _popen,
    "Ib": _pthread_cond_wait,
    "J": _raise,
    "Hb": _sigaction,
    "Gb": _sigemptyset,
    "Fb": _sqrt,
    "Eb": _strftime,
    "Db": _strftime_l,
    "Bb": _sysconf,
    "Y": _system,
    "T": _time,
    "fa": _usleep,
    "Ab": abortOnCannotGrowMemory,
    "a": DYNAMICTOP_PTR
};
var asm = Module["asm"](asmGlobalArg, asmLibraryArg, buffer);
Module["asm"] = asm;
var __ZN4giac13giac_rendererEPKc = Module["__ZN4giac13giac_rendererEPKc"] = function () {
    //assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    //assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["Pc"].apply(null, arguments)
}
    ;
var __ZSt18uncaught_exceptionv = Module["__ZSt18uncaught_exceptionv"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["Qc"].apply(null, arguments)
}
    ;
var ___errno_location = Module["___errno_location"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["Rc"].apply(null, arguments)
}
    ;
var __get_daylight = Module["__get_daylight"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["Sc"].apply(null, arguments)
}
    ;
var __get_timezone = Module["__get_timezone"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["Tc"].apply(null, arguments)
}
    ;
var __get_tzname = Module["__get_tzname"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["Uc"].apply(null, arguments)
}
    ;
var _caseval = Module["_caseval"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["Vc"].apply(null, arguments)
}
    ;
var _fflush = Module["_fflush"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["Wc"].apply(null, arguments)
}
    ;
var _free = Module["_free"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["Xc"].apply(null, arguments)
}
    ;
var _malloc = Module["_malloc"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["Yc"].apply(null, arguments)
}
    ;
var _memcpy = Module["_memcpy"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["Zc"].apply(null, arguments)
}
    ;
var _memset = Module["_memset"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["_c"].apply(null, arguments)
}
    ;
var _mp_js_do_str = Module["_mp_js_do_str"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["$c"].apply(null, arguments)
}
    ;
var _mp_js_init = Module["_mp_js_init"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["ad"].apply(null, arguments)
}
    ;
var _setThrew = Module["_setThrew"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["bd"].apply(null, arguments)
}
    ;
var establishStackSpace = Module["establishStackSpace"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["td"].apply(null, arguments)
}
    ;
var globalCtors = Module["globalCtors"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["ud"].apply(null, arguments)
}
    ;
var stackAlloc = Module["stackAlloc"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["vd"].apply(null, arguments)
}
    ;
var stackRestore = Module["stackRestore"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["wd"].apply(null, arguments)
}
    ;
var stackSave = Module["stackSave"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["xd"].apply(null, arguments)
}
    ;
var dynCall_dd = Module["dynCall_dd"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["cd"].apply(null, arguments)
}
    ;
var dynCall_di = Module["dynCall_di"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["dd"].apply(null, arguments)
}
    ;
var dynCall_i = Module["dynCall_i"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["ed"].apply(null, arguments)
}
    ;
var dynCall_ii = Module["dynCall_ii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["fd"].apply(null, arguments)
}
    ;
var dynCall_iidi = Module["dynCall_iidi"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["gd"].apply(null, arguments)
}
    ;
var dynCall_iii = Module["dynCall_iii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["hd"].apply(null, arguments)
}
    ;
var dynCall_iiii = Module["dynCall_iiii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["id"].apply(null, arguments)
}
    ;
var dynCall_iiiii = Module["dynCall_iiiii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["jd"].apply(null, arguments)
}
    ;
var dynCall_iiiiii = Module["dynCall_iiiiii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["kd"].apply(null, arguments)
}
    ;
var dynCall_v = Module["dynCall_v"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["ld"].apply(null, arguments)
}
    ;
var dynCall_vi = Module["dynCall_vi"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["md"].apply(null, arguments)
}
    ;
var dynCall_vii = Module["dynCall_vii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["nd"].apply(null, arguments)
}
    ;
var dynCall_viid = Module["dynCall_viid"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["od"].apply(null, arguments)
}
    ;
var dynCall_viii = Module["dynCall_viii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["pd"].apply(null, arguments)
}
    ;
var dynCall_viiidd = Module["dynCall_viiidd"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["qd"].apply(null, arguments)
}
    ;
var dynCall_viiii = Module["dynCall_viiii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["rd"].apply(null, arguments)
}
    ;
var dynCall_viiiii = Module["dynCall_viiiii"] = function () {
    assert(runtimeInitialized, "you need to wait for the runtime to be ready (e.g. wait for main() to be called)");
    assert(!runtimeExited, "the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
    return Module["asm"]["sd"].apply(null, arguments)
}
    ;
Module["asm"] = asm;
if (!Object.getOwnPropertyDescriptor(Module, "intArrayFromString"))
    Module["intArrayFromString"] = function () {
        abort("'intArrayFromString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "intArrayToString"))
    Module["intArrayToString"] = function () {
        abort("'intArrayToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
Module["ccall"] = ccall;
Module["cwrap"] = cwrap;
if (!Object.getOwnPropertyDescriptor(Module, "setValue"))
    Module["setValue"] = function () {
        abort("'setValue' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "getValue"))
    Module["getValue"] = function () {
        abort("'getValue' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "allocate"))
    Module["allocate"] = function () {
        abort("'allocate' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "getMemory"))
    Module["getMemory"] = function () {
        abort("'getMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "AsciiToString"))
    Module["AsciiToString"] = function () {
        abort("'AsciiToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "stringToAscii"))
    Module["stringToAscii"] = function () {
        abort("'stringToAscii' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "UTF8ArrayToString"))
    Module["UTF8ArrayToString"] = function () {
        abort("'UTF8ArrayToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "UTF8ToString"))
    Module["UTF8ToString"] = function () {
        abort("'UTF8ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF8Array"))
    Module["stringToUTF8Array"] = function () {
        abort("'stringToUTF8Array' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF8"))
    Module["stringToUTF8"] = function () {
        abort("'stringToUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "lengthBytesUTF8"))
    Module["lengthBytesUTF8"] = function () {
        abort("'lengthBytesUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "UTF16ToString"))
    Module["UTF16ToString"] = function () {
        abort("'UTF16ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF16"))
    Module["stringToUTF16"] = function () {
        abort("'stringToUTF16' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "lengthBytesUTF16"))
    Module["lengthBytesUTF16"] = function () {
        abort("'lengthBytesUTF16' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "UTF32ToString"))
    Module["UTF32ToString"] = function () {
        abort("'UTF32ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF32"))
    Module["stringToUTF32"] = function () {
        abort("'stringToUTF32' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "lengthBytesUTF32"))
    Module["lengthBytesUTF32"] = function () {
        abort("'lengthBytesUTF32' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "allocateUTF8"))
    Module["allocateUTF8"] = function () {
        abort("'allocateUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "stackTrace"))
    Module["stackTrace"] = function () {
        abort("'stackTrace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "addOnPreRun"))
    Module["addOnPreRun"] = function () {
        abort("'addOnPreRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "addOnInit"))
    Module["addOnInit"] = function () {
        abort("'addOnInit' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "addOnPreMain"))
    Module["addOnPreMain"] = function () {
        abort("'addOnPreMain' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "addOnExit"))
    Module["addOnExit"] = function () {
        abort("'addOnExit' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "addOnPostRun"))
    Module["addOnPostRun"] = function () {
        abort("'addOnPostRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
Module["writeStringToMemory"] = writeStringToMemory;
if (!Object.getOwnPropertyDescriptor(Module, "writeArrayToMemory"))
    Module["writeArrayToMemory"] = function () {
        abort("'writeArrayToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "writeAsciiToMemory"))
    Module["writeAsciiToMemory"] = function () {
        abort("'writeAsciiToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "addRunDependency"))
    Module["addRunDependency"] = function () {
        abort("'addRunDependency' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "removeRunDependency"))
    Module["removeRunDependency"] = function () {
        abort("'removeRunDependency' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "ENV"))
    Module["ENV"] = function () {
        abort("'ENV' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "FS"))
    Module["FS"] = function () {
        abort("'FS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "FS_createFolder"))
    Module["FS_createFolder"] = function () {
        abort("'FS_createFolder' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "FS_createPath"))
    Module["FS_createPath"] = function () {
        abort("'FS_createPath' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "FS_createDataFile"))
    Module["FS_createDataFile"] = function () {
        abort("'FS_createDataFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "FS_createPreloadedFile"))
    Module["FS_createPreloadedFile"] = function () {
        abort("'FS_createPreloadedFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "FS_createLazyFile"))
    Module["FS_createLazyFile"] = function () {
        abort("'FS_createLazyFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "FS_createLink"))
    Module["FS_createLink"] = function () {
        abort("'FS_createLink' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "FS_createDevice"))
    Module["FS_createDevice"] = function () {
        abort("'FS_createDevice' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "FS_unlink"))
    Module["FS_unlink"] = function () {
        abort("'FS_unlink' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "GL"))
    Module["GL"] = function () {
        abort("'GL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "dynamicAlloc"))
    Module["dynamicAlloc"] = function () {
        abort("'dynamicAlloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "warnOnce"))
    Module["warnOnce"] = function () {
        abort("'warnOnce' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "loadDynamicLibrary"))
    Module["loadDynamicLibrary"] = function () {
        abort("'loadDynamicLibrary' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "loadWebAssemblyModule"))
    Module["loadWebAssemblyModule"] = function () {
        abort("'loadWebAssemblyModule' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "getLEB"))
    Module["getLEB"] = function () {
        abort("'getLEB' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "getFunctionTables"))
    Module["getFunctionTables"] = function () {
        abort("'getFunctionTables' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "alignFunctionTables"))
    Module["alignFunctionTables"] = function () {
        abort("'alignFunctionTables' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "registerFunctions"))
    Module["registerFunctions"] = function () {
        abort("'registerFunctions' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "addFunction"))
    Module["addFunction"] = function () {
        abort("'addFunction' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "removeFunction"))
    Module["removeFunction"] = function () {
        abort("'removeFunction' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "getFuncWrapper"))
    Module["getFuncWrapper"] = function () {
        abort("'getFuncWrapper' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "prettyPrint"))
    Module["prettyPrint"] = function () {
        abort("'prettyPrint' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "makeBigInt"))
    Module["makeBigInt"] = function () {
        abort("'makeBigInt' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "dynCall"))
    Module["dynCall"] = function () {
        abort("'dynCall' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "getCompilerSetting"))
    Module["getCompilerSetting"] = function () {
        abort("'getCompilerSetting' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "stackSave"))
    Module["stackSave"] = function () {
        abort("'stackSave' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "stackRestore"))
    Module["stackRestore"] = function () {
        abort("'stackRestore' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "stackAlloc"))
    Module["stackAlloc"] = function () {
        abort("'stackAlloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "establishStackSpace"))
    Module["establishStackSpace"] = function () {
        abort("'establishStackSpace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "print"))
    Module["print"] = function () {
        abort("'print' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "printErr"))
    Module["printErr"] = function () {
        abort("'printErr' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "getTempRet0"))
    Module["getTempRet0"] = function () {
        abort("'getTempRet0' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "setTempRet0"))
    Module["setTempRet0"] = function () {
        abort("'setTempRet0' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
if (!Object.getOwnPropertyDescriptor(Module, "callMain"))
    Module["callMain"] = function () {
        abort("'callMain' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
    }
        ;
Module["Pointer_stringify"] = Pointer_stringify;
if (!Object.getOwnPropertyDescriptor(Module, "ALLOC_NORMAL"))
    Object.defineProperty(Module, "ALLOC_NORMAL", {
        get: function () {
            abort("'ALLOC_NORMAL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
        }
    });
if (!Object.getOwnPropertyDescriptor(Module, "ALLOC_STACK"))
    Object.defineProperty(Module, "ALLOC_STACK", {
        get: function () {
            abort("'ALLOC_STACK' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
        }
    });
if (!Object.getOwnPropertyDescriptor(Module, "ALLOC_DYNAMIC"))
    Object.defineProperty(Module, "ALLOC_DYNAMIC", {
        get: function () {
            abort("'ALLOC_DYNAMIC' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
        }
    });
if (!Object.getOwnPropertyDescriptor(Module, "ALLOC_NONE"))
    Object.defineProperty(Module, "ALLOC_NONE", {
        get: function () {
            abort("'ALLOC_NONE' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)")
        }
    });
function ExitStatus(status) {
    this.name = "ExitStatus";
    this.message = "Program terminated with exit(" + status + ")";
    this.status = status
}
dependenciesFulfilled = function runCaller() {
    if (!Module["calledRun"])
        run();
    if (!Module["calledRun"])
        dependenciesFulfilled = runCaller
}
    ;
function run(args) {
    args = args || arguments_;
    if (runDependencies > 0) {
        return
    }
    writeStackCookie();
    preRun();
    if (runDependencies > 0)
        return;
    if (Module["calledRun"])
        return;
    function doRun() {
        if (Module["calledRun"])
            return;
        Module["calledRun"] = true;
        if (ABORT)
            return;
        initRuntime();
        preMain();
        if (Module["onRuntimeInitialized"])
            Module["onRuntimeInitialized"]();
        assert(!Module["_main"], 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');
        postRun()
    }
    if (Module["setStatus"]) {
        Module["setStatus"]("Running...");
        setTimeout(function () {
            setTimeout(function () {
                Module["setStatus"]("")
            }, 1);
            doRun()
        }, 1)
    } else {
        doRun()
    }
    checkStackCookie()
}
Module["run"] = run;
function checkUnflushedContent() {
    var print = out;
    var printErr = err;
    var has = false;
    out = err = function (x) {
        has = true
    }
        ;
    try {
        var flush = Module["_fflush"];
        if (flush)
            flush(0);
        ["stdout", "stderr"].forEach(function (name) {
            var info = FS.analyzePath("/dev/" + name);
            if (!info)
                return;
            var stream = info.object;
            var rdev = stream.rdev;
            var tty = TTY.ttys[rdev];
            if (tty && tty.output && tty.output.length) {
                has = true
            }
        })
    } catch (e) { }
    out = print;
    err = printErr;
    if (has) {
        warnOnce("stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the FAQ), or make sure to emit a newline when you printf etc.")
    }
}
function exit(status, implicit) {
    checkUnflushedContent();
    if (implicit && Module["noExitRuntime"] && status === 0) {
        return
    }
    if (Module["noExitRuntime"]) {
        if (!implicit) {
            err("exit(" + status + ") called, but EXIT_RUNTIME is not set, so halting execution but not exiting the runtime or preventing further async execution (build with EXIT_RUNTIME=1, if you want a true shutdown)")
        }
    } else {
        ABORT = true;
        EXITSTATUS = status;
        exitRuntime();
        if (Module["onExit"])
            Module["onExit"](status)
    }
    quit_(status, new ExitStatus(status))
}
var abortDecorators = [];
function abort(what) {
    if (Module["onAbort"]) {
        Module["onAbort"](what)
    }
    what += "";
    out(what);
    err(what);
    ABORT = true;
    EXITSTATUS = 1;
    var extra = "";
    var output = "abort(" + what + ") at " + stackTrace() + extra;
    if (abortDecorators) {
        abortDecorators.forEach(function (decorator) {
            output = decorator(output, what)
        })
    }
    throw output
}
Module["abort"] = abort;
if (Module["preInit"]) {
    if (typeof Module["preInit"] == "function")
        Module["preInit"] = [Module["preInit"]];
    while (Module["preInit"].length > 0) {
        Module["preInit"].pop()()
    }
}
Module["noExitRuntime"] = true;
run();
