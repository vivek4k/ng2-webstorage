(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/core'], factory) :
    (factory((global.ng2Webstorage = global.ng2Webstorage || {}),global.ng.core));
}(this, (function (exports,_angular_core) { 'use strict';

var STORAGE;
(function (STORAGE) {
    STORAGE[STORAGE["local"] = 0] = "local";
    STORAGE[STORAGE["session"] = 1] = "session";
})(STORAGE || (STORAGE = {}));

var LIB_KEY = 'ng2-webstorage';
var LIB_KEY_SEPARATOR = '|';
var LIB_KEY_CASE_SENSITIVE = false;
var STORAGE_NAMES = (_a = {},
    _a[STORAGE.local] = 'local',
    _a[STORAGE.session] = 'session',
    _a);
var _a;

var CUSTOM_LIB_KEY = LIB_KEY;
var CUSTOM_LIB_KEY_SEPARATOR = LIB_KEY_SEPARATOR;
var CUSTOM_LIB_KEY_CASE_SENSITIVE = LIB_KEY_CASE_SENSITIVE;
function isManagedKey(sKey) {
    return sKey.indexOf(CUSTOM_LIB_KEY + CUSTOM_LIB_KEY_SEPARATOR) === 0;
}
var KeyStorageHelper = (function () {
    function KeyStorageHelper() {
    }
    KeyStorageHelper.isManagedKey = function (sKey) {
        return sKey.indexOf(CUSTOM_LIB_KEY + CUSTOM_LIB_KEY_SEPARATOR) === 0;
    };
    KeyStorageHelper.retrieveKeysFromStorage = function (storage) {
        return Object.keys(storage).filter(isManagedKey);
    };
    KeyStorageHelper.genKey = function (raw) {
        if (typeof raw !== 'string')
            throw Error('attempt to generate a storage key with a non string value');
        return "" + CUSTOM_LIB_KEY + CUSTOM_LIB_KEY_SEPARATOR + this.formatKey(raw);
    };
    KeyStorageHelper.formatKey = function (raw) {
        var key = raw.toString();
        return CUSTOM_LIB_KEY_CASE_SENSITIVE ? key : key.toLowerCase();
    };
    KeyStorageHelper.setStorageKeyPrefix = function (key) {
        if (key === void 0) { key = LIB_KEY; }
        CUSTOM_LIB_KEY = key;
    };
    KeyStorageHelper.setCaseSensitivity = function (enable) {
        if (enable === void 0) { enable = LIB_KEY_CASE_SENSITIVE; }
        CUSTOM_LIB_KEY_CASE_SENSITIVE = enable;
    };
    KeyStorageHelper.setStorageKeySeparator = function (separator) {
        if (separator === void 0) { separator = LIB_KEY_SEPARATOR; }
        CUSTOM_LIB_KEY_SEPARATOR = separator;
    };
    return KeyStorageHelper;
}());

var StorageObserverHelper = (function () {
    function StorageObserverHelper() {
    }
    StorageObserverHelper.observe = function (sType, sKey) {
        var oKey = this.genObserverKey(sType, sKey);
        if (oKey in this.observers)
            return this.observers[oKey];
        return this.observers[oKey] = new _angular_core.EventEmitter();
    };
    StorageObserverHelper.emit = function (sType, sKey, value) {
        var oKey = this.genObserverKey(sType, sKey);
        if (oKey in this.observers)
            this.observers[oKey].emit(value);
    };
    StorageObserverHelper.genObserverKey = function (sType, sKey) {
        return sType + '|' + sKey;
    };
    StorageObserverHelper.initStorage = function () {
        StorageObserverHelper.storageInitStream.emit(true);
    };
    StorageObserverHelper.observers = {};
    StorageObserverHelper.storageInitStream = new _angular_core.EventEmitter();
    StorageObserverHelper.storageInit$ = StorageObserverHelper.storageInitStream.asObservable();
    return StorageObserverHelper;
}());

var MockStorageHelper = (function () {
    function MockStorageHelper() {
    }
    MockStorageHelper.isSecuredField = function (field) {
        return !!~MockStorageHelper.securedFields.indexOf(field);
    };
    MockStorageHelper.getStorage = function (sType) {
        if (!this.mockStorages[sType])
            this.mockStorages[sType] = MockStorageHelper.generateStorage();
        return this.mockStorages[sType];
    };
    MockStorageHelper.generateStorage = function () {
        var storage = {};
        Object.defineProperties(storage, {
            setItem: {
                writable: false,
                enumerable: false,
                configurable: false,
                value: function (key, value) {
                    if (!MockStorageHelper.isSecuredField(key))
                        this[key] = value;
                },
            },
            getItem: {
                writable: false,
                enumerable: false,
                configurable: false,
                value: function (key) {
                    return !MockStorageHelper.isSecuredField(key) ? this[key] || null : null;
                },
            },
            removeItem: {
                writable: false,
                enumerable: false,
                configurable: false,
                value: function (key) {
                    if (!MockStorageHelper.isSecuredField(key))
                        delete this[key];
                },
            },
            length: {
                enumerable: false,
                configurable: false,
                get: function () {
                    return Object.keys(this).length;
                }
            }
        });
        return storage;
    };
    MockStorageHelper.securedFields = ['setItem', 'getItem', 'removeItem', 'length'];
    MockStorageHelper.mockStorages = {};
    return MockStorageHelper;
}());

var CACHED = (_a$1 = {}, _a$1[STORAGE.local] = {}, _a$1[STORAGE.session] = {}, _a$1);
var STORAGE_AVAILABILITY = (_b = {}, _b[STORAGE.local] = null, _b[STORAGE.session] = null, _b);
var WebStorageHelper = (function () {
    function WebStorageHelper() {
    }
    WebStorageHelper.store = function (sType, sKey, value) {
        this.getStorage(sType).setItem(sKey, JSON.stringify(value));
        CACHED[sType][sKey] = value;
        StorageObserverHelper.emit(sType, sKey, value);
    };
    WebStorageHelper.retrieve = function (sType, sKey) {
        if (sKey in CACHED[sType])
            return CACHED[sType][sKey];
        var value = this.retrieveFromStorage(sType, sKey);
        if (value !== null)
            CACHED[sType][sKey] = value;
        return value;
    };
    WebStorageHelper.retrieveFromStorage = function (sType, sKey) {
        var data = this.getStorage(sType).getItem(sKey);
        try {
            var parsedData = JSON.parse(data);
            if (parsedData && typeof parsedData === "object") {
                return parsedData;
            }
        }
        catch (err) {
            return data;
        }
        return data;
    };
    WebStorageHelper.refresh = function (sType, sKey) {
        if (!KeyStorageHelper.isManagedKey(sKey))
            return;
        var value = WebStorageHelper.retrieveFromStorage(sType, sKey);
        if (value === null) {
            delete CACHED[sType][sKey];
            StorageObserverHelper.emit(sType, sKey, null);
        }
        else if (value !== CACHED[sType][sKey]) {
            CACHED[sType][sKey] = value;
            StorageObserverHelper.emit(sType, sKey, value);
        }
    };
    WebStorageHelper.refreshAll = function (sType) {
        Object.keys(CACHED[sType]).forEach(function (sKey) { return WebStorageHelper.refresh(sType, sKey); });
    };
    WebStorageHelper.clearAll = function (sType) {
        var storage = this.getStorage(sType);
        KeyStorageHelper.retrieveKeysFromStorage(storage)
            .forEach(function (sKey) {
            storage.removeItem(sKey);
            delete CACHED[sType][sKey];
            StorageObserverHelper.emit(sType, sKey, null);
        });
    };
    WebStorageHelper.clear = function (sType, sKey) {
        this.getStorage(sType).removeItem(sKey);
        delete CACHED[sType][sKey];
        StorageObserverHelper.emit(sType, sKey, null);
    };
    WebStorageHelper.getStorage = function (sType) {
        if (this.isStorageAvailable(sType))
            return this.getWStorage(sType);
        else
            return MockStorageHelper.getStorage(sType);
    };
    WebStorageHelper.getWStorage = function (sType) {
        var storage;
        switch (sType) {
            case STORAGE.local:
                storage = localStorage;
                break;
            case STORAGE.session:
                storage = sessionStorage;
                break;
            default:
                throw Error('invalid storage type');
        }
        return storage;
    };
    WebStorageHelper.isStorageAvailable = function (sType) {
        if (typeof STORAGE_AVAILABILITY[sType] === 'boolean')
            return STORAGE_AVAILABILITY[sType];
        var isAvailable = true, storage;
        try {
            storage = this.getWStorage(sType);
            if (typeof storage === 'object') {
                storage.setItem('test-storage', 'foobar');
                storage.removeItem('test-storage');
            }
            else
                isAvailable = false;
        }
        catch (e) {
            isAvailable = false;
        }
        if (!isAvailable)
            console.warn(STORAGE_NAMES[sType] + " storage unavailable, Ng2Webstorage will use a fallback strategy instead");
        return STORAGE_AVAILABILITY[sType] = isAvailable;
    };
    return WebStorageHelper;
}());
var _a$1;
var _b;

var WebStorageService = (function () {
    function WebStorageService(sType) {
        if (sType === void 0) { sType = null; }
        this.sType = sType;
        this.sType = sType;
    }
    WebStorageService.prototype.store = function (raw, value) {
        var sKey = KeyStorageHelper.genKey(raw);
        WebStorageHelper.store(this.sType, sKey, value);
    };
    WebStorageService.prototype.retrieve = function (raw) {
        var sKey = KeyStorageHelper.genKey(raw);
        return WebStorageHelper.retrieve(this.sType, sKey);
    };
    WebStorageService.prototype.clear = function (raw) {
        if (raw)
            WebStorageHelper.clear(this.sType, KeyStorageHelper.genKey(raw));
        else
            WebStorageHelper.clearAll(this.sType);
    };
    WebStorageService.prototype.observe = function (raw) {
        var sKey = KeyStorageHelper.genKey(raw);
        return StorageObserverHelper.observe(this.sType, sKey);
    };
    WebStorageService.prototype.isStorageAvailable = function () {
        return WebStorageHelper.isStorageAvailable(this.sType);
    };
    return WebStorageService;
}());

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var LocalStorageService = (function (_super) {
    __extends(LocalStorageService, _super);
    function LocalStorageService() {
        return _super.call(this, STORAGE.local) || this;
    }
    LocalStorageService.decorators = [
        { type: _angular_core.Injectable },
    ];
    /** @nocollapse */
    LocalStorageService.ctorParameters = function () { return []; };
    return LocalStorageService;
}(WebStorageService));

var __extends$1 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var SessionStorageService = (function (_super) {
    __extends$1(SessionStorageService, _super);
    function SessionStorageService() {
        return _super.call(this, STORAGE.session) || this;
    }
    SessionStorageService.decorators = [
        { type: _angular_core.Injectable },
    ];
    /** @nocollapse */
    SessionStorageService.ctorParameters = function () { return []; };
    return SessionStorageService;
}(WebStorageService));

var WebstorageConfig = (function () {
    function WebstorageConfig(config) {
        this.prefix = LIB_KEY;
        this.separator = LIB_KEY_SEPARATOR;
        this.caseSensitive = LIB_KEY_CASE_SENSITIVE;
        if (config && config.prefix !== undefined) {
            this.prefix = config.prefix;
        }
        if (config && config.separator !== undefined) {
            this.separator = config.separator;
        }
        if (config && config.caseSensitive !== undefined) {
            this.caseSensitive = config.caseSensitive;
        }
    }
    return WebstorageConfig;
}());

function WebStorage(webSKey, sType, defaultValue) {
    if (defaultValue === void 0) { defaultValue = null; }
    return function (targetedClass, raw) {
        WebStorageDecorator(webSKey, sType, targetedClass, raw, defaultValue);
    };
}
function WebStorageDecorator(webSKey, sType, targetedClass, raw, defaultValue) {
    var key = webSKey || raw;
    Object.defineProperty(targetedClass, raw, {
        get: function () {
            var sKey = KeyStorageHelper.genKey(key);
            return WebStorageHelper.retrieve(sType, sKey);
        },
        set: function (value) {
            var sKey = KeyStorageHelper.genKey(key);
            this[sKey] = value;
            WebStorageHelper.store(sType, sKey, value);
        }
    });
    if (targetedClass[raw] === null && defaultValue !== undefined) {
        var sub_1 = StorageObserverHelper.storageInit$.subscribe(function () {
            targetedClass[raw] = defaultValue;
            sub_1.unsubscribe();
        });
    }
}

function LocalStorage(webSKey, defaultValue) {
    return function (targetedClass, raw) {
        WebStorageDecorator(webSKey, STORAGE.local, targetedClass, raw, defaultValue);
    };
}

function SessionStorage(webSKey, defaultValue) {
    return function (targetedClass, raw) {
        WebStorageDecorator(webSKey, STORAGE.session, targetedClass, raw, defaultValue);
    };
}

var WEBSTORAGE_CONFIG = new _angular_core.InjectionToken('WEBSTORAGE_CONFIG');
var Ng2Webstorage = (function () {
    function Ng2Webstorage(ngZone, config) {
        this.ngZone = ngZone;
        if (config) {
            KeyStorageHelper.setStorageKeyPrefix(config.prefix);
            KeyStorageHelper.setStorageKeySeparator(config.separator);
            KeyStorageHelper.setCaseSensitivity(config.caseSensitive);
        }
        this.initStorageListener();
        StorageObserverHelper.initStorage();
    }
    Ng2Webstorage.forRoot = function (config) {
        return {
            ngModule: Ng2Webstorage,
            providers: [
                {
                    provide: WEBSTORAGE_CONFIG,
                    useValue: config
                },
                {
                    provide: WebstorageConfig,
                    useFactory: provideConfig,
                    deps: [
                        WEBSTORAGE_CONFIG
                    ]
                }
            ]
        };
    };
    Ng2Webstorage.prototype.initStorageListener = function () {
        var _this = this;
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', function (event) {
                return _this.ngZone.run(function () {
                    var storage = window.sessionStorage === event.storageArea ? STORAGE.session : STORAGE.local;
                    if (event.key === null)
                        WebStorageHelper.refreshAll(storage);
                    else
                        WebStorageHelper.refresh(storage, event.key);
                });
            });
        }
    };
    Ng2Webstorage.decorators = [
        { type: _angular_core.NgModule, args: [{
                    declarations: [],
                    providers: [SessionStorageService, LocalStorageService],
                    imports: []
                },] },
    ];
    /** @nocollapse */
    Ng2Webstorage.ctorParameters = function () { return [
        { type: _angular_core.NgZone, },
        { type: WebstorageConfig, decorators: [{ type: _angular_core.Optional }, { type: _angular_core.Inject, args: [WebstorageConfig,] },] },
    ]; };
    return Ng2Webstorage;
}());
function provideConfig(config) {
    return new WebstorageConfig(config);
}

exports.WEBSTORAGE_CONFIG = WEBSTORAGE_CONFIG;
exports.Ng2Webstorage = Ng2Webstorage;
exports.provideConfig = provideConfig;
exports.WebstorageConfig = WebstorageConfig;
exports.LocalStorage = LocalStorage;
exports.SessionStorage = SessionStorage;
exports.WebStorage = WebStorage;
exports.WebStorageDecorator = WebStorageDecorator;
exports.WebStorageService = WebStorageService;
exports.LocalStorageService = LocalStorageService;
exports.SessionStorageService = SessionStorageService;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS51bWQuanMiLCJzb3VyY2VzIjpbIi4uL2Rpc3QvZW51bXMvc3RvcmFnZS5qcyIsIi4uL2Rpc3QvY29uc3RhbnRzL2xpYi5qcyIsIi4uL2Rpc3QvaGVscGVycy9rZXlTdG9yYWdlLmpzIiwiLi4vZGlzdC9oZWxwZXJzL3N0b3JhZ2VPYnNlcnZlci5qcyIsIi4uL2Rpc3QvaGVscGVycy9tb2NrU3RvcmFnZS5qcyIsIi4uL2Rpc3QvaGVscGVycy93ZWJTdG9yYWdlLmpzIiwiLi4vZGlzdC9zZXJ2aWNlcy93ZWJTdG9yYWdlLmpzIiwiLi4vZGlzdC9zZXJ2aWNlcy9sb2NhbFN0b3JhZ2UuanMiLCIuLi9kaXN0L3NlcnZpY2VzL3Nlc3Npb25TdG9yYWdlLmpzIiwiLi4vZGlzdC9pbnRlcmZhY2VzL2NvbmZpZy5qcyIsIi4uL2Rpc3QvZGVjb3JhdG9ycy93ZWJTdG9yYWdlLmpzIiwiLi4vZGlzdC9kZWNvcmF0b3JzL2xvY2FsU3RvcmFnZS5qcyIsIi4uL2Rpc3QvZGVjb3JhdG9ycy9zZXNzaW9uU3RvcmFnZS5qcyIsIi4uL2Rpc3QvYXBwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB2YXIgU1RPUkFHRTtcbihmdW5jdGlvbiAoU1RPUkFHRSkge1xuICAgIFNUT1JBR0VbU1RPUkFHRVtcImxvY2FsXCJdID0gMF0gPSBcImxvY2FsXCI7XG4gICAgU1RPUkFHRVtTVE9SQUdFW1wic2Vzc2lvblwiXSA9IDFdID0gXCJzZXNzaW9uXCI7XG59KShTVE9SQUdFIHx8IChTVE9SQUdFID0ge30pKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXN0b3JhZ2UuanMubWFwIiwiaW1wb3J0IHsgU1RPUkFHRSB9IGZyb20gJy4uL2VudW1zL3N0b3JhZ2UnO1xuZXhwb3J0IHZhciBMSUJfS0VZID0gJ25nMi13ZWJzdG9yYWdlJztcbmV4cG9ydCB2YXIgTElCX0tFWV9TRVBBUkFUT1IgPSAnfCc7XG5leHBvcnQgdmFyIExJQl9LRVlfQ0FTRV9TRU5TSVRJVkUgPSBmYWxzZTtcbmV4cG9ydCB2YXIgU1RPUkFHRV9OQU1FUyA9IChfYSA9IHt9LFxuICAgIF9hW1NUT1JBR0UubG9jYWxdID0gJ2xvY2FsJyxcbiAgICBfYVtTVE9SQUdFLnNlc3Npb25dID0gJ3Nlc3Npb24nLFxuICAgIF9hKTtcbnZhciBfYTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxpYi5qcy5tYXAiLCJpbXBvcnQgeyBMSUJfS0VZLCBMSUJfS0VZX0NBU0VfU0VOU0lUSVZFLCBMSUJfS0VZX1NFUEFSQVRPUiB9IGZyb20gJy4uL2NvbnN0YW50cy9saWInO1xudmFyIENVU1RPTV9MSUJfS0VZID0gTElCX0tFWTtcbnZhciBDVVNUT01fTElCX0tFWV9TRVBBUkFUT1IgPSBMSUJfS0VZX1NFUEFSQVRPUjtcbnZhciBDVVNUT01fTElCX0tFWV9DQVNFX1NFTlNJVElWRSA9IExJQl9LRVlfQ0FTRV9TRU5TSVRJVkU7XG5leHBvcnQgZnVuY3Rpb24gaXNNYW5hZ2VkS2V5KHNLZXkpIHtcbiAgICByZXR1cm4gc0tleS5pbmRleE9mKENVU1RPTV9MSUJfS0VZICsgQ1VTVE9NX0xJQl9LRVlfU0VQQVJBVE9SKSA9PT0gMDtcbn1cbnZhciBLZXlTdG9yYWdlSGVscGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBLZXlTdG9yYWdlSGVscGVyKCkge1xuICAgIH1cbiAgICBLZXlTdG9yYWdlSGVscGVyLmlzTWFuYWdlZEtleSA9IGZ1bmN0aW9uIChzS2V5KSB7XG4gICAgICAgIHJldHVybiBzS2V5LmluZGV4T2YoQ1VTVE9NX0xJQl9LRVkgKyBDVVNUT01fTElCX0tFWV9TRVBBUkFUT1IpID09PSAwO1xuICAgIH07XG4gICAgS2V5U3RvcmFnZUhlbHBlci5yZXRyaWV2ZUtleXNGcm9tU3RvcmFnZSA9IGZ1bmN0aW9uIChzdG9yYWdlKSB7XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhzdG9yYWdlKS5maWx0ZXIoaXNNYW5hZ2VkS2V5KTtcbiAgICB9O1xuICAgIEtleVN0b3JhZ2VIZWxwZXIuZ2VuS2V5ID0gZnVuY3Rpb24gKHJhdykge1xuICAgICAgICBpZiAodHlwZW9mIHJhdyAhPT0gJ3N0cmluZycpXG4gICAgICAgICAgICB0aHJvdyBFcnJvcignYXR0ZW1wdCB0byBnZW5lcmF0ZSBhIHN0b3JhZ2Uga2V5IHdpdGggYSBub24gc3RyaW5nIHZhbHVlJyk7XG4gICAgICAgIHJldHVybiBcIlwiICsgQ1VTVE9NX0xJQl9LRVkgKyBDVVNUT01fTElCX0tFWV9TRVBBUkFUT1IgKyB0aGlzLmZvcm1hdEtleShyYXcpO1xuICAgIH07XG4gICAgS2V5U3RvcmFnZUhlbHBlci5mb3JtYXRLZXkgPSBmdW5jdGlvbiAocmF3KSB7XG4gICAgICAgIHZhciBrZXkgPSByYXcudG9TdHJpbmcoKTtcbiAgICAgICAgcmV0dXJuIENVU1RPTV9MSUJfS0VZX0NBU0VfU0VOU0lUSVZFID8ga2V5IDoga2V5LnRvTG93ZXJDYXNlKCk7XG4gICAgfTtcbiAgICBLZXlTdG9yYWdlSGVscGVyLnNldFN0b3JhZ2VLZXlQcmVmaXggPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGlmIChrZXkgPT09IHZvaWQgMCkgeyBrZXkgPSBMSUJfS0VZOyB9XG4gICAgICAgIENVU1RPTV9MSUJfS0VZID0ga2V5O1xuICAgIH07XG4gICAgS2V5U3RvcmFnZUhlbHBlci5zZXRDYXNlU2Vuc2l0aXZpdHkgPSBmdW5jdGlvbiAoZW5hYmxlKSB7XG4gICAgICAgIGlmIChlbmFibGUgPT09IHZvaWQgMCkgeyBlbmFibGUgPSBMSUJfS0VZX0NBU0VfU0VOU0lUSVZFOyB9XG4gICAgICAgIENVU1RPTV9MSUJfS0VZX0NBU0VfU0VOU0lUSVZFID0gZW5hYmxlO1xuICAgIH07XG4gICAgS2V5U3RvcmFnZUhlbHBlci5zZXRTdG9yYWdlS2V5U2VwYXJhdG9yID0gZnVuY3Rpb24gKHNlcGFyYXRvcikge1xuICAgICAgICBpZiAoc2VwYXJhdG9yID09PSB2b2lkIDApIHsgc2VwYXJhdG9yID0gTElCX0tFWV9TRVBBUkFUT1I7IH1cbiAgICAgICAgQ1VTVE9NX0xJQl9LRVlfU0VQQVJBVE9SID0gc2VwYXJhdG9yO1xuICAgIH07XG4gICAgcmV0dXJuIEtleVN0b3JhZ2VIZWxwZXI7XG59KCkpO1xuZXhwb3J0IHsgS2V5U3RvcmFnZUhlbHBlciB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9a2V5U3RvcmFnZS5qcy5tYXAiLCJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbnZhciBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFN0b3JhZ2VPYnNlcnZlckhlbHBlcigpIHtcbiAgICB9XG4gICAgU3RvcmFnZU9ic2VydmVySGVscGVyLm9ic2VydmUgPSBmdW5jdGlvbiAoc1R5cGUsIHNLZXkpIHtcbiAgICAgICAgdmFyIG9LZXkgPSB0aGlzLmdlbk9ic2VydmVyS2V5KHNUeXBlLCBzS2V5KTtcbiAgICAgICAgaWYgKG9LZXkgaW4gdGhpcy5vYnNlcnZlcnMpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vYnNlcnZlcnNbb0tleV07XG4gICAgICAgIHJldHVybiB0aGlzLm9ic2VydmVyc1tvS2V5XSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB9O1xuICAgIFN0b3JhZ2VPYnNlcnZlckhlbHBlci5lbWl0ID0gZnVuY3Rpb24gKHNUeXBlLCBzS2V5LCB2YWx1ZSkge1xuICAgICAgICB2YXIgb0tleSA9IHRoaXMuZ2VuT2JzZXJ2ZXJLZXkoc1R5cGUsIHNLZXkpO1xuICAgICAgICBpZiAob0tleSBpbiB0aGlzLm9ic2VydmVycylcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzW29LZXldLmVtaXQodmFsdWUpO1xuICAgIH07XG4gICAgU3RvcmFnZU9ic2VydmVySGVscGVyLmdlbk9ic2VydmVyS2V5ID0gZnVuY3Rpb24gKHNUeXBlLCBzS2V5KSB7XG4gICAgICAgIHJldHVybiBzVHlwZSArICd8JyArIHNLZXk7XG4gICAgfTtcbiAgICBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIuaW5pdFN0b3JhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIFN0b3JhZ2VPYnNlcnZlckhlbHBlci5zdG9yYWdlSW5pdFN0cmVhbS5lbWl0KHRydWUpO1xuICAgIH07XG4gICAgU3RvcmFnZU9ic2VydmVySGVscGVyLm9ic2VydmVycyA9IHt9O1xuICAgIFN0b3JhZ2VPYnNlcnZlckhlbHBlci5zdG9yYWdlSW5pdFN0cmVhbSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIuc3RvcmFnZUluaXQkID0gU3RvcmFnZU9ic2VydmVySGVscGVyLnN0b3JhZ2VJbml0U3RyZWFtLmFzT2JzZXJ2YWJsZSgpO1xuICAgIHJldHVybiBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXI7XG59KCkpO1xuZXhwb3J0IHsgU3RvcmFnZU9ic2VydmVySGVscGVyIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zdG9yYWdlT2JzZXJ2ZXIuanMubWFwIiwidmFyIE1vY2tTdG9yYWdlSGVscGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBNb2NrU3RvcmFnZUhlbHBlcigpIHtcbiAgICB9XG4gICAgTW9ja1N0b3JhZ2VIZWxwZXIuaXNTZWN1cmVkRmllbGQgPSBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgICAgcmV0dXJuICEhfk1vY2tTdG9yYWdlSGVscGVyLnNlY3VyZWRGaWVsZHMuaW5kZXhPZihmaWVsZCk7XG4gICAgfTtcbiAgICBNb2NrU3RvcmFnZUhlbHBlci5nZXRTdG9yYWdlID0gZnVuY3Rpb24gKHNUeXBlKSB7XG4gICAgICAgIGlmICghdGhpcy5tb2NrU3RvcmFnZXNbc1R5cGVdKVxuICAgICAgICAgICAgdGhpcy5tb2NrU3RvcmFnZXNbc1R5cGVdID0gTW9ja1N0b3JhZ2VIZWxwZXIuZ2VuZXJhdGVTdG9yYWdlKCk7XG4gICAgICAgIHJldHVybiB0aGlzLm1vY2tTdG9yYWdlc1tzVHlwZV07XG4gICAgfTtcbiAgICBNb2NrU3RvcmFnZUhlbHBlci5nZW5lcmF0ZVN0b3JhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzdG9yYWdlID0ge307XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHN0b3JhZ2UsIHtcbiAgICAgICAgICAgIHNldEl0ZW06IHtcbiAgICAgICAgICAgICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFNb2NrU3RvcmFnZUhlbHBlci5pc1NlY3VyZWRGaWVsZChrZXkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1trZXldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXRJdGVtOiB7XG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICFNb2NrU3RvcmFnZUhlbHBlci5pc1NlY3VyZWRGaWVsZChrZXkpID8gdGhpc1trZXldIHx8IG51bGwgOiBudWxsO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVtb3ZlSXRlbToge1xuICAgICAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghTW9ja1N0b3JhZ2VIZWxwZXIuaXNTZWN1cmVkRmllbGQoa2V5KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzW2tleV07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsZW5ndGg6IHtcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcykubGVuZ3RoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzdG9yYWdlO1xuICAgIH07XG4gICAgTW9ja1N0b3JhZ2VIZWxwZXIuc2VjdXJlZEZpZWxkcyA9IFsnc2V0SXRlbScsICdnZXRJdGVtJywgJ3JlbW92ZUl0ZW0nLCAnbGVuZ3RoJ107XG4gICAgTW9ja1N0b3JhZ2VIZWxwZXIubW9ja1N0b3JhZ2VzID0ge307XG4gICAgcmV0dXJuIE1vY2tTdG9yYWdlSGVscGVyO1xufSgpKTtcbmV4cG9ydCB7IE1vY2tTdG9yYWdlSGVscGVyIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tb2NrU3RvcmFnZS5qcy5tYXAiLCJpbXBvcnQgeyBTVE9SQUdFIH0gZnJvbSAnLi4vZW51bXMvc3RvcmFnZSc7XG5pbXBvcnQgeyBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIgfSBmcm9tICcuL3N0b3JhZ2VPYnNlcnZlcic7XG5pbXBvcnQgeyBLZXlTdG9yYWdlSGVscGVyIH0gZnJvbSAnLi9rZXlTdG9yYWdlJztcbmltcG9ydCB7IE1vY2tTdG9yYWdlSGVscGVyIH0gZnJvbSAnLi9tb2NrU3RvcmFnZSc7XG5pbXBvcnQgeyBTVE9SQUdFX05BTUVTIH0gZnJvbSAnLi4vY29uc3RhbnRzL2xpYic7XG52YXIgQ0FDSEVEID0gKF9hID0ge30sIF9hW1NUT1JBR0UubG9jYWxdID0ge30sIF9hW1NUT1JBR0Uuc2Vzc2lvbl0gPSB7fSwgX2EpO1xudmFyIFNUT1JBR0VfQVZBSUxBQklMSVRZID0gKF9iID0ge30sIF9iW1NUT1JBR0UubG9jYWxdID0gbnVsbCwgX2JbU1RPUkFHRS5zZXNzaW9uXSA9IG51bGwsIF9iKTtcbnZhciBXZWJTdG9yYWdlSGVscGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBXZWJTdG9yYWdlSGVscGVyKCkge1xuICAgIH1cbiAgICBXZWJTdG9yYWdlSGVscGVyLnN0b3JlID0gZnVuY3Rpb24gKHNUeXBlLCBzS2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLmdldFN0b3JhZ2Uoc1R5cGUpLnNldEl0ZW0oc0tleSwgSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcbiAgICAgICAgQ0FDSEVEW3NUeXBlXVtzS2V5XSA9IHZhbHVlO1xuICAgICAgICBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIuZW1pdChzVHlwZSwgc0tleSwgdmFsdWUpO1xuICAgIH07XG4gICAgV2ViU3RvcmFnZUhlbHBlci5yZXRyaWV2ZSA9IGZ1bmN0aW9uIChzVHlwZSwgc0tleSkge1xuICAgICAgICBpZiAoc0tleSBpbiBDQUNIRURbc1R5cGVdKVxuICAgICAgICAgICAgcmV0dXJuIENBQ0hFRFtzVHlwZV1bc0tleV07XG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMucmV0cmlldmVGcm9tU3RvcmFnZShzVHlwZSwgc0tleSk7XG4gICAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbClcbiAgICAgICAgICAgIENBQ0hFRFtzVHlwZV1bc0tleV0gPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH07XG4gICAgV2ViU3RvcmFnZUhlbHBlci5yZXRyaWV2ZUZyb21TdG9yYWdlID0gZnVuY3Rpb24gKHNUeXBlLCBzS2V5KSB7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcy5nZXRTdG9yYWdlKHNUeXBlKS5nZXRJdGVtKHNLZXkpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIHBhcnNlZERhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICAgICAgaWYgKHBhcnNlZERhdGEgJiYgdHlwZW9mIHBhcnNlZERhdGEgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VkRGF0YTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9O1xuICAgIFdlYlN0b3JhZ2VIZWxwZXIucmVmcmVzaCA9IGZ1bmN0aW9uIChzVHlwZSwgc0tleSkge1xuICAgICAgICBpZiAoIUtleVN0b3JhZ2VIZWxwZXIuaXNNYW5hZ2VkS2V5KHNLZXkpKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB2YXIgdmFsdWUgPSBXZWJTdG9yYWdlSGVscGVyLnJldHJpZXZlRnJvbVN0b3JhZ2Uoc1R5cGUsIHNLZXkpO1xuICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBDQUNIRURbc1R5cGVdW3NLZXldO1xuICAgICAgICAgICAgU3RvcmFnZU9ic2VydmVySGVscGVyLmVtaXQoc1R5cGUsIHNLZXksIG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlICE9PSBDQUNIRURbc1R5cGVdW3NLZXldKSB7XG4gICAgICAgICAgICBDQUNIRURbc1R5cGVdW3NLZXldID0gdmFsdWU7XG4gICAgICAgICAgICBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIuZW1pdChzVHlwZSwgc0tleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBXZWJTdG9yYWdlSGVscGVyLnJlZnJlc2hBbGwgPSBmdW5jdGlvbiAoc1R5cGUpIHtcbiAgICAgICAgT2JqZWN0LmtleXMoQ0FDSEVEW3NUeXBlXSkuZm9yRWFjaChmdW5jdGlvbiAoc0tleSkgeyByZXR1cm4gV2ViU3RvcmFnZUhlbHBlci5yZWZyZXNoKHNUeXBlLCBzS2V5KTsgfSk7XG4gICAgfTtcbiAgICBXZWJTdG9yYWdlSGVscGVyLmNsZWFyQWxsID0gZnVuY3Rpb24gKHNUeXBlKSB7XG4gICAgICAgIHZhciBzdG9yYWdlID0gdGhpcy5nZXRTdG9yYWdlKHNUeXBlKTtcbiAgICAgICAgS2V5U3RvcmFnZUhlbHBlci5yZXRyaWV2ZUtleXNGcm9tU3RvcmFnZShzdG9yYWdlKVxuICAgICAgICAgICAgLmZvckVhY2goZnVuY3Rpb24gKHNLZXkpIHtcbiAgICAgICAgICAgIHN0b3JhZ2UucmVtb3ZlSXRlbShzS2V5KTtcbiAgICAgICAgICAgIGRlbGV0ZSBDQUNIRURbc1R5cGVdW3NLZXldO1xuICAgICAgICAgICAgU3RvcmFnZU9ic2VydmVySGVscGVyLmVtaXQoc1R5cGUsIHNLZXksIG51bGwpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIFdlYlN0b3JhZ2VIZWxwZXIuY2xlYXIgPSBmdW5jdGlvbiAoc1R5cGUsIHNLZXkpIHtcbiAgICAgICAgdGhpcy5nZXRTdG9yYWdlKHNUeXBlKS5yZW1vdmVJdGVtKHNLZXkpO1xuICAgICAgICBkZWxldGUgQ0FDSEVEW3NUeXBlXVtzS2V5XTtcbiAgICAgICAgU3RvcmFnZU9ic2VydmVySGVscGVyLmVtaXQoc1R5cGUsIHNLZXksIG51bGwpO1xuICAgIH07XG4gICAgV2ViU3RvcmFnZUhlbHBlci5nZXRTdG9yYWdlID0gZnVuY3Rpb24gKHNUeXBlKSB7XG4gICAgICAgIGlmICh0aGlzLmlzU3RvcmFnZUF2YWlsYWJsZShzVHlwZSkpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRXU3RvcmFnZShzVHlwZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBNb2NrU3RvcmFnZUhlbHBlci5nZXRTdG9yYWdlKHNUeXBlKTtcbiAgICB9O1xuICAgIFdlYlN0b3JhZ2VIZWxwZXIuZ2V0V1N0b3JhZ2UgPSBmdW5jdGlvbiAoc1R5cGUpIHtcbiAgICAgICAgdmFyIHN0b3JhZ2U7XG4gICAgICAgIHN3aXRjaCAoc1R5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgU1RPUkFHRS5sb2NhbDpcbiAgICAgICAgICAgICAgICBzdG9yYWdlID0gbG9jYWxTdG9yYWdlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBTVE9SQUdFLnNlc3Npb246XG4gICAgICAgICAgICAgICAgc3RvcmFnZSA9IHNlc3Npb25TdG9yYWdlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcignaW52YWxpZCBzdG9yYWdlIHR5cGUnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RvcmFnZTtcbiAgICB9O1xuICAgIFdlYlN0b3JhZ2VIZWxwZXIuaXNTdG9yYWdlQXZhaWxhYmxlID0gZnVuY3Rpb24gKHNUeXBlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgU1RPUkFHRV9BVkFJTEFCSUxJVFlbc1R5cGVdID09PSAnYm9vbGVhbicpXG4gICAgICAgICAgICByZXR1cm4gU1RPUkFHRV9BVkFJTEFCSUxJVFlbc1R5cGVdO1xuICAgICAgICB2YXIgaXNBdmFpbGFibGUgPSB0cnVlLCBzdG9yYWdlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgc3RvcmFnZSA9IHRoaXMuZ2V0V1N0b3JhZ2Uoc1R5cGUpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBzdG9yYWdlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHN0b3JhZ2Uuc2V0SXRlbSgndGVzdC1zdG9yYWdlJywgJ2Zvb2JhcicpO1xuICAgICAgICAgICAgICAgIHN0b3JhZ2UucmVtb3ZlSXRlbSgndGVzdC1zdG9yYWdlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaXNBdmFpbGFibGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaXNBdmFpbGFibGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzQXZhaWxhYmxlKVxuICAgICAgICAgICAgY29uc29sZS53YXJuKFNUT1JBR0VfTkFNRVNbc1R5cGVdICsgXCIgc3RvcmFnZSB1bmF2YWlsYWJsZSwgTmcyV2Vic3RvcmFnZSB3aWxsIHVzZSBhIGZhbGxiYWNrIHN0cmF0ZWd5IGluc3RlYWRcIik7XG4gICAgICAgIHJldHVybiBTVE9SQUdFX0FWQUlMQUJJTElUWVtzVHlwZV0gPSBpc0F2YWlsYWJsZTtcbiAgICB9O1xuICAgIHJldHVybiBXZWJTdG9yYWdlSGVscGVyO1xufSgpKTtcbmV4cG9ydCB7IFdlYlN0b3JhZ2VIZWxwZXIgfTtcbnZhciBfYSwgX2I7XG4vLyMgc291cmNlTWFwcGluZ1VSTD13ZWJTdG9yYWdlLmpzLm1hcCIsImltcG9ydCB7IEtleVN0b3JhZ2VIZWxwZXIsIFdlYlN0b3JhZ2VIZWxwZXIsIFN0b3JhZ2VPYnNlcnZlckhlbHBlciB9IGZyb20gJy4uL2hlbHBlcnMvaW5kZXgnO1xudmFyIFdlYlN0b3JhZ2VTZXJ2aWNlID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBXZWJTdG9yYWdlU2VydmljZShzVHlwZSkge1xuICAgICAgICBpZiAoc1R5cGUgPT09IHZvaWQgMCkgeyBzVHlwZSA9IG51bGw7IH1cbiAgICAgICAgdGhpcy5zVHlwZSA9IHNUeXBlO1xuICAgICAgICB0aGlzLnNUeXBlID0gc1R5cGU7XG4gICAgfVxuICAgIFdlYlN0b3JhZ2VTZXJ2aWNlLnByb3RvdHlwZS5zdG9yZSA9IGZ1bmN0aW9uIChyYXcsIHZhbHVlKSB7XG4gICAgICAgIHZhciBzS2V5ID0gS2V5U3RvcmFnZUhlbHBlci5nZW5LZXkocmF3KTtcbiAgICAgICAgV2ViU3RvcmFnZUhlbHBlci5zdG9yZSh0aGlzLnNUeXBlLCBzS2V5LCB2YWx1ZSk7XG4gICAgfTtcbiAgICBXZWJTdG9yYWdlU2VydmljZS5wcm90b3R5cGUucmV0cmlldmUgPSBmdW5jdGlvbiAocmF3KSB7XG4gICAgICAgIHZhciBzS2V5ID0gS2V5U3RvcmFnZUhlbHBlci5nZW5LZXkocmF3KTtcbiAgICAgICAgcmV0dXJuIFdlYlN0b3JhZ2VIZWxwZXIucmV0cmlldmUodGhpcy5zVHlwZSwgc0tleSk7XG4gICAgfTtcbiAgICBXZWJTdG9yYWdlU2VydmljZS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAocmF3KSB7XG4gICAgICAgIGlmIChyYXcpXG4gICAgICAgICAgICBXZWJTdG9yYWdlSGVscGVyLmNsZWFyKHRoaXMuc1R5cGUsIEtleVN0b3JhZ2VIZWxwZXIuZ2VuS2V5KHJhdykpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBXZWJTdG9yYWdlSGVscGVyLmNsZWFyQWxsKHRoaXMuc1R5cGUpO1xuICAgIH07XG4gICAgV2ViU3RvcmFnZVNlcnZpY2UucHJvdG90eXBlLm9ic2VydmUgPSBmdW5jdGlvbiAocmF3KSB7XG4gICAgICAgIHZhciBzS2V5ID0gS2V5U3RvcmFnZUhlbHBlci5nZW5LZXkocmF3KTtcbiAgICAgICAgcmV0dXJuIFN0b3JhZ2VPYnNlcnZlckhlbHBlci5vYnNlcnZlKHRoaXMuc1R5cGUsIHNLZXkpO1xuICAgIH07XG4gICAgV2ViU3RvcmFnZVNlcnZpY2UucHJvdG90eXBlLmlzU3RvcmFnZUF2YWlsYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFdlYlN0b3JhZ2VIZWxwZXIuaXNTdG9yYWdlQXZhaWxhYmxlKHRoaXMuc1R5cGUpO1xuICAgIH07XG4gICAgcmV0dXJuIFdlYlN0b3JhZ2VTZXJ2aWNlO1xufSgpKTtcbmV4cG9ydCB7IFdlYlN0b3JhZ2VTZXJ2aWNlIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD13ZWJTdG9yYWdlLmpzLm1hcCIsInZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU1RPUkFHRSB9IGZyb20gJy4uL2VudW1zL3N0b3JhZ2UnO1xuaW1wb3J0IHsgV2ViU3RvcmFnZVNlcnZpY2UgfSBmcm9tICcuL3dlYlN0b3JhZ2UnO1xudmFyIExvY2FsU3RvcmFnZVNlcnZpY2UgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhMb2NhbFN0b3JhZ2VTZXJ2aWNlLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIExvY2FsU3RvcmFnZVNlcnZpY2UoKSB7XG4gICAgICAgIHJldHVybiBfc3VwZXIuY2FsbCh0aGlzLCBTVE9SQUdFLmxvY2FsKSB8fCB0aGlzO1xuICAgIH1cbiAgICBMb2NhbFN0b3JhZ2VTZXJ2aWNlLmRlY29yYXRvcnMgPSBbXG4gICAgICAgIHsgdHlwZTogSW5qZWN0YWJsZSB9LFxuICAgIF07XG4gICAgLyoqIEBub2NvbGxhcHNlICovXG4gICAgTG9jYWxTdG9yYWdlU2VydmljZS5jdG9yUGFyYW1ldGVycyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFtdOyB9O1xuICAgIHJldHVybiBMb2NhbFN0b3JhZ2VTZXJ2aWNlO1xufShXZWJTdG9yYWdlU2VydmljZSkpO1xuZXhwb3J0IHsgTG9jYWxTdG9yYWdlU2VydmljZSB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bG9jYWxTdG9yYWdlLmpzLm1hcCIsInZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU1RPUkFHRSB9IGZyb20gJy4uL2VudW1zL3N0b3JhZ2UnO1xuaW1wb3J0IHsgV2ViU3RvcmFnZVNlcnZpY2UgfSBmcm9tICcuL3dlYlN0b3JhZ2UnO1xudmFyIFNlc3Npb25TdG9yYWdlU2VydmljZSA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFNlc3Npb25TdG9yYWdlU2VydmljZSwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBTZXNzaW9uU3RvcmFnZVNlcnZpY2UoKSB7XG4gICAgICAgIHJldHVybiBfc3VwZXIuY2FsbCh0aGlzLCBTVE9SQUdFLnNlc3Npb24pIHx8IHRoaXM7XG4gICAgfVxuICAgIFNlc3Npb25TdG9yYWdlU2VydmljZS5kZWNvcmF0b3JzID0gW1xuICAgICAgICB7IHR5cGU6IEluamVjdGFibGUgfSxcbiAgICBdO1xuICAgIC8qKiBAbm9jb2xsYXBzZSAqL1xuICAgIFNlc3Npb25TdG9yYWdlU2VydmljZS5jdG9yUGFyYW1ldGVycyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFtdOyB9O1xuICAgIHJldHVybiBTZXNzaW9uU3RvcmFnZVNlcnZpY2U7XG59KFdlYlN0b3JhZ2VTZXJ2aWNlKSk7XG5leHBvcnQgeyBTZXNzaW9uU3RvcmFnZVNlcnZpY2UgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNlc3Npb25TdG9yYWdlLmpzLm1hcCIsImltcG9ydCB7IExJQl9LRVksIExJQl9LRVlfQ0FTRV9TRU5TSVRJVkUsIExJQl9LRVlfU0VQQVJBVE9SIH0gZnJvbSAnLi4vY29uc3RhbnRzL2xpYic7XG52YXIgV2Vic3RvcmFnZUNvbmZpZyA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gV2Vic3RvcmFnZUNvbmZpZyhjb25maWcpIHtcbiAgICAgICAgdGhpcy5wcmVmaXggPSBMSUJfS0VZO1xuICAgICAgICB0aGlzLnNlcGFyYXRvciA9IExJQl9LRVlfU0VQQVJBVE9SO1xuICAgICAgICB0aGlzLmNhc2VTZW5zaXRpdmUgPSBMSUJfS0VZX0NBU0VfU0VOU0lUSVZFO1xuICAgICAgICBpZiAoY29uZmlnICYmIGNvbmZpZy5wcmVmaXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5wcmVmaXggPSBjb25maWcucHJlZml4O1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLnNlcGFyYXRvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLnNlcGFyYXRvciA9IGNvbmZpZy5zZXBhcmF0b3I7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcuY2FzZVNlbnNpdGl2ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLmNhc2VTZW5zaXRpdmUgPSBjb25maWcuY2FzZVNlbnNpdGl2ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gV2Vic3RvcmFnZUNvbmZpZztcbn0oKSk7XG5leHBvcnQgeyBXZWJzdG9yYWdlQ29uZmlnIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb25maWcuanMubWFwIiwiaW1wb3J0IHsgS2V5U3RvcmFnZUhlbHBlciwgV2ViU3RvcmFnZUhlbHBlciB9IGZyb20gJy4uL2hlbHBlcnMvaW5kZXgnO1xuaW1wb3J0IHsgU3RvcmFnZU9ic2VydmVySGVscGVyIH0gZnJvbSAnLi4vaGVscGVycy9zdG9yYWdlT2JzZXJ2ZXInO1xuZXhwb3J0IGZ1bmN0aW9uIFdlYlN0b3JhZ2Uod2ViU0tleSwgc1R5cGUsIGRlZmF1bHRWYWx1ZSkge1xuICAgIGlmIChkZWZhdWx0VmFsdWUgPT09IHZvaWQgMCkgeyBkZWZhdWx0VmFsdWUgPSBudWxsOyB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXRlZENsYXNzLCByYXcpIHtcbiAgICAgICAgV2ViU3RvcmFnZURlY29yYXRvcih3ZWJTS2V5LCBzVHlwZSwgdGFyZ2V0ZWRDbGFzcywgcmF3LCBkZWZhdWx0VmFsdWUpO1xuICAgIH07XG59XG5leHBvcnQgZnVuY3Rpb24gV2ViU3RvcmFnZURlY29yYXRvcih3ZWJTS2V5LCBzVHlwZSwgdGFyZ2V0ZWRDbGFzcywgcmF3LCBkZWZhdWx0VmFsdWUpIHtcbiAgICB2YXIga2V5ID0gd2ViU0tleSB8fCByYXc7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldGVkQ2xhc3MsIHJhdywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBzS2V5ID0gS2V5U3RvcmFnZUhlbHBlci5nZW5LZXkoa2V5KTtcbiAgICAgICAgICAgIHJldHVybiBXZWJTdG9yYWdlSGVscGVyLnJldHJpZXZlKHNUeXBlLCBzS2V5KTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBzS2V5ID0gS2V5U3RvcmFnZUhlbHBlci5nZW5LZXkoa2V5KTtcbiAgICAgICAgICAgIHRoaXNbc0tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIFdlYlN0b3JhZ2VIZWxwZXIuc3RvcmUoc1R5cGUsIHNLZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGlmICh0YXJnZXRlZENsYXNzW3Jhd10gPT09IG51bGwgJiYgZGVmYXVsdFZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmFyIHN1Yl8xID0gU3RvcmFnZU9ic2VydmVySGVscGVyLnN0b3JhZ2VJbml0JC5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGFyZ2V0ZWRDbGFzc1tyYXddID0gZGVmYXVsdFZhbHVlO1xuICAgICAgICAgICAgc3ViXzEudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9d2ViU3RvcmFnZS5qcy5tYXAiLCJpbXBvcnQgeyBXZWJTdG9yYWdlRGVjb3JhdG9yIH0gZnJvbSAnLi93ZWJTdG9yYWdlJztcbmltcG9ydCB7IFNUT1JBR0UgfSBmcm9tICcuLi9lbnVtcy9zdG9yYWdlJztcbmV4cG9ydCBmdW5jdGlvbiBMb2NhbFN0b3JhZ2Uod2ViU0tleSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXRlZENsYXNzLCByYXcpIHtcbiAgICAgICAgV2ViU3RvcmFnZURlY29yYXRvcih3ZWJTS2V5LCBTVE9SQUdFLmxvY2FsLCB0YXJnZXRlZENsYXNzLCByYXcsIGRlZmF1bHRWYWx1ZSk7XG4gICAgfTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxvY2FsU3RvcmFnZS5qcy5tYXAiLCJpbXBvcnQgeyBXZWJTdG9yYWdlRGVjb3JhdG9yIH0gZnJvbSAnLi93ZWJTdG9yYWdlJztcbmltcG9ydCB7IFNUT1JBR0UgfSBmcm9tICcuLi9lbnVtcy9zdG9yYWdlJztcbmV4cG9ydCBmdW5jdGlvbiBTZXNzaW9uU3RvcmFnZSh3ZWJTS2V5LCBkZWZhdWx0VmFsdWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldGVkQ2xhc3MsIHJhdykge1xuICAgICAgICBXZWJTdG9yYWdlRGVjb3JhdG9yKHdlYlNLZXksIFNUT1JBR0Uuc2Vzc2lvbiwgdGFyZ2V0ZWRDbGFzcywgcmF3LCBkZWZhdWx0VmFsdWUpO1xuICAgIH07XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zZXNzaW9uU3RvcmFnZS5qcy5tYXAiLCJpbXBvcnQgeyBJbmplY3QsIEluamVjdGlvblRva2VuLCBOZ01vZHVsZSwgTmdab25lLCBPcHRpb25hbCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU1RPUkFHRSB9IGZyb20gJy4vZW51bXMvc3RvcmFnZSc7XG5pbXBvcnQgeyBMb2NhbFN0b3JhZ2VTZXJ2aWNlLCBTZXNzaW9uU3RvcmFnZVNlcnZpY2UgfSBmcm9tICcuL3NlcnZpY2VzL2luZGV4JztcbmltcG9ydCB7IFdlYlN0b3JhZ2VIZWxwZXIgfSBmcm9tICcuL2hlbHBlcnMvd2ViU3RvcmFnZSc7XG5pbXBvcnQgeyBXZWJzdG9yYWdlQ29uZmlnIH0gZnJvbSAnLi9pbnRlcmZhY2VzL2NvbmZpZyc7XG5pbXBvcnQgeyBLZXlTdG9yYWdlSGVscGVyIH0gZnJvbSAnLi9oZWxwZXJzL2tleVN0b3JhZ2UnO1xuaW1wb3J0IHsgU3RvcmFnZU9ic2VydmVySGVscGVyIH0gZnJvbSAnLi9oZWxwZXJzL3N0b3JhZ2VPYnNlcnZlcic7XG5leHBvcnQgKiBmcm9tICcuL2ludGVyZmFjZXMvaW5kZXgnO1xuZXhwb3J0ICogZnJvbSAnLi9kZWNvcmF0b3JzL2luZGV4JztcbmV4cG9ydCAqIGZyb20gJy4vc2VydmljZXMvaW5kZXgnO1xuZXhwb3J0IHZhciBXRUJTVE9SQUdFX0NPTkZJRyA9IG5ldyBJbmplY3Rpb25Ub2tlbignV0VCU1RPUkFHRV9DT05GSUcnKTtcbnZhciBOZzJXZWJzdG9yYWdlID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBOZzJXZWJzdG9yYWdlKG5nWm9uZSwgY29uZmlnKSB7XG4gICAgICAgIHRoaXMubmdab25lID0gbmdab25lO1xuICAgICAgICBpZiAoY29uZmlnKSB7XG4gICAgICAgICAgICBLZXlTdG9yYWdlSGVscGVyLnNldFN0b3JhZ2VLZXlQcmVmaXgoY29uZmlnLnByZWZpeCk7XG4gICAgICAgICAgICBLZXlTdG9yYWdlSGVscGVyLnNldFN0b3JhZ2VLZXlTZXBhcmF0b3IoY29uZmlnLnNlcGFyYXRvcik7XG4gICAgICAgICAgICBLZXlTdG9yYWdlSGVscGVyLnNldENhc2VTZW5zaXRpdml0eShjb25maWcuY2FzZVNlbnNpdGl2ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbml0U3RvcmFnZUxpc3RlbmVyKCk7XG4gICAgICAgIFN0b3JhZ2VPYnNlcnZlckhlbHBlci5pbml0U3RvcmFnZSgpO1xuICAgIH1cbiAgICBOZzJXZWJzdG9yYWdlLmZvclJvb3QgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuZ01vZHVsZTogTmcyV2Vic3RvcmFnZSxcbiAgICAgICAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvdmlkZTogV0VCU1RPUkFHRV9DT05GSUcsXG4gICAgICAgICAgICAgICAgICAgIHVzZVZhbHVlOiBjb25maWdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvdmlkZTogV2Vic3RvcmFnZUNvbmZpZyxcbiAgICAgICAgICAgICAgICAgICAgdXNlRmFjdG9yeTogcHJvdmlkZUNvbmZpZyxcbiAgICAgICAgICAgICAgICAgICAgZGVwczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgV0VCU1RPUkFHRV9DT05GSUdcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfTtcbiAgICB9O1xuICAgIE5nMldlYnN0b3JhZ2UucHJvdG90eXBlLmluaXRTdG9yYWdlTGlzdGVuZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3N0b3JhZ2UnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMubmdab25lLnJ1bihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdG9yYWdlID0gd2luZG93LnNlc3Npb25TdG9yYWdlID09PSBldmVudC5zdG9yYWdlQXJlYSA/IFNUT1JBR0Uuc2Vzc2lvbiA6IFNUT1JBR0UubG9jYWw7XG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudC5rZXkgPT09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICBXZWJTdG9yYWdlSGVscGVyLnJlZnJlc2hBbGwoc3RvcmFnZSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIFdlYlN0b3JhZ2VIZWxwZXIucmVmcmVzaChzdG9yYWdlLCBldmVudC5rZXkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIE5nMldlYnN0b3JhZ2UuZGVjb3JhdG9ycyA9IFtcbiAgICAgICAgeyB0eXBlOiBOZ01vZHVsZSwgYXJnczogW3tcbiAgICAgICAgICAgICAgICAgICAgZGVjbGFyYXRpb25zOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJzOiBbU2Vzc2lvblN0b3JhZ2VTZXJ2aWNlLCBMb2NhbFN0b3JhZ2VTZXJ2aWNlXSxcbiAgICAgICAgICAgICAgICAgICAgaW1wb3J0czogW11cbiAgICAgICAgICAgICAgICB9LF0gfSxcbiAgICBdO1xuICAgIC8qKiBAbm9jb2xsYXBzZSAqL1xuICAgIE5nMldlYnN0b3JhZ2UuY3RvclBhcmFtZXRlcnMgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbXG4gICAgICAgIHsgdHlwZTogTmdab25lLCB9LFxuICAgICAgICB7IHR5cGU6IFdlYnN0b3JhZ2VDb25maWcsIGRlY29yYXRvcnM6IFt7IHR5cGU6IE9wdGlvbmFsIH0sIHsgdHlwZTogSW5qZWN0LCBhcmdzOiBbV2Vic3RvcmFnZUNvbmZpZyxdIH0sXSB9LFxuICAgIF07IH07XG4gICAgcmV0dXJuIE5nMldlYnN0b3JhZ2U7XG59KCkpO1xuZXhwb3J0IHsgTmcyV2Vic3RvcmFnZSB9O1xuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVDb25maWcoY29uZmlnKSB7XG4gICAgcmV0dXJuIG5ldyBXZWJzdG9yYWdlQ29uZmlnKGNvbmZpZyk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAuanMubWFwIl0sIm5hbWVzIjpbIkV2ZW50RW1pdHRlciIsIl9hIiwidGhpcyIsIkluamVjdGFibGUiLCJfX2V4dGVuZHMiLCJJbmplY3Rpb25Ub2tlbiIsIk5nTW9kdWxlIiwiTmdab25lIiwiT3B0aW9uYWwiLCJJbmplY3QiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFPLElBQUksT0FBTyxDQUFDO0FBQ25CLENBQUMsVUFBVSxPQUFPLEVBQUU7SUFDaEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUM7SUFDeEMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxT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
