window.exports = {
    "setting": {
        mode: "list",
        args: {
            enter: settingEnter,
            search: settingSearch,
            select: settingSelect,
            placeholder: "输入 Access Key 进行设置"
        }
    },
    "search": {
        mode: "list",
        args: {
            enter: searchEnter,
            search: searchSearch,
            select: searchSelect,
            placeholder: "搜索"
        }
    },
    "pin": {
        mode: "list",
        args: {
            enter: pinEnter,
            search: pinSearch,
            select: pinSelect,
            placeholder: "输入 Pin 进行设置"
        }
    },
};
/* utools preload event functions */
var SHOW_ACCESS_KEY_TITLE = "Show Access Key";
var CLEAR_ACCESS_KEY_TITLE = 'Clear Access Key';
var SET_ACCESS_KEY_TITLE = 'Set Access Key';
function settingEnter(action, callbackSetList) {
    settingSearch(action, '', callbackSetList);
}
function settingSearch(action, searchWord, callbackSetList) {
    if (searchWord == '') {
        callbackSetList([
            {
                title: SHOW_ACCESS_KEY_TITLE,
                description: 'show current access key value by system notification',
            },
            {
                title: CLEAR_ACCESS_KEY_TITLE,
                description: 'clear current access key',
            },
        ]);
    }
    else {
        callbackSetList([
            {
                title: SET_ACCESS_KEY_TITLE,
                description: "set access key to ".concat(searchWord),
                data: searchWord,
            },
        ]);
    }
}
var RAINDROP_ACCESS_KEY = "raindrop access key";
function settingSelect(action, itemData) {
    var _a;
    window.utools.hideMainWindow();
    switch (itemData.title) {
        case SHOW_ACCESS_KEY_TITLE:
            window.utools.showNotification("access key: ".concat(window.utools.dbStorage.getItem(RAINDROP_ACCESS_KEY), " ?? ''"));
            break;
        case CLEAR_ACCESS_KEY_TITLE:
            window.utools.dbStorage.removeItem(RAINDROP_ACCESS_KEY);
            raindropAPIObj = null;
            break;
        case SET_ACCESS_KEY_TITLE:
            if (typeof itemData.data === 'string' && itemData.data != "") {
                window.utools.dbStorage.setItem(RAINDROP_ACCESS_KEY, itemData.data);
                raindropAPIObj = null;
                window.utools.showNotification("access key: ".concat((_a = window.utools.dbStorage.getItem(RAINDROP_ACCESS_KEY)) !== null && _a !== void 0 ? _a : ''));
            }
            break;
    }
    window.utools.outPlugin();
}
function searchEnter(action, callbackSetList) {
    var _a;
    var pins = (_a = window.utools.dbStorage.getItem(RAINDROP_PINS)) !== null && _a !== void 0 ? _a : [];
    if (pins.length > 0) {
        callbackSetList(pins.map(function (p) {
            var _a;
            return ({
                title: (_a = p.content) !== null && _a !== void 0 ? _a : 'nothing',
                isPin: true
            });
        }));
    }
    else {
        callbackSetList([{ title: '~~ no pins ~~' }]);
    }
}
var raindropAPIObj;
var globalTimerId;
var globalAbort;
function searchSearch(action, searchWord, callbackSetList) {
    if (globalAbort != null) {
        globalAbort.abort();
    }
    if (globalTimerId != null) {
        clearTimeout(globalTimerId);
    }
    var localTimerId;
    var localAbort = new AbortController();
    localTimerId = setTimeout(function () {
        var _a;
        if (localAbort.signal.aborted) {
            return;
        }
        if (raindropAPIObj == null) {
            var accessKey = (_a = window.utools.dbStorage.getItem(RAINDROP_ACCESS_KEY)) !== null && _a !== void 0 ? _a : '';
            if (accessKey === '') {
                window.utools.showNotification('please set raindrop access key first');
                return;
            }
            raindropAPIObj = new RaindropAPIImpl(accessKey, { defaultPerPage: 25, defaultTimeoutMs: 10000 });
        }
        var _b = searchWord.match(/(@(-?\d+))?(.*)/), _0 = _b[0], _1 = _b[1], cId = _b[2], search = _b[3];
        raindropAPIObj.searchRaindrops({ search: search, collection: cId, abort: localAbort }).then(function (rsp) {
            var _a;
            if (((_a = rsp.items) !== null && _a !== void 0 ? _a : []).length > 0) {
                callbackSetList(rsp.items.map(function (v) {
                    var importantStr = v.important ? "".concat(IMPORTANT_QUERY_MARK, " ") : '';
                    var collectionStr = v.collectionId ? "@".concat(v.collectionId, " ") : '';
                    var tagStr = v.tags.length == 0 ? '' : "".concat(v.tags.map(function (tag) { return '#' + tag; }).join(' '), " ");
                    var descStr = (v.excerpt.length == 0) ? '' : (v.excerpt.length > 50 ? "\u3010".concat(v.excerpt.slice(0, 50), "...\u3011") : "\u3010".concat(v.excerpt, "\u3011"));
                    return {
                        title: v.title,
                        description: "".concat(importantStr).concat(collectionStr).concat(tagStr).concat(descStr),
                        icon: v.cover ? v.cover : 'assets/logo.png',
                        url: v.link
                    };
                }));
            }
            else {
                callbackSetList([{ title: '~~ nothing ~~' }]);
            }
        }).catch(function (reason) {
            if (reason.name !== 'AbortError') {
                window.utools.showNotification("search raindrop failed: ".concat(reason));
            }
        }).finally(function () {
            if (globalTimerId === localTimerId) {
                globalTimerId = null;
            }
            if (globalAbort === localAbort) {
                globalAbort = null;
            }
        });
    }, 50);
    globalTimerId = localTimerId;
    globalAbort = localAbort;
}
function searchSelect(action, itemData) {
    if (itemData.isPin) {
        window.utools.setSubInputValue("".concat(itemData.title, " "));
    }
    else {
        window.utools.hideMainWindow();
        var url = itemData.url;
        require('electron').shell.openExternal(url);
        window.utools.outPlugin();
    }
}
function pinEnter(action, callbackSetList) {
    pinSearch(action, '', callbackSetList);
}
var CLEAR_PIN = "Clear Pin";
var CLEAR_ALL_PIN = "Clear All Pin";
var ADD_PIN = "Add Pin";
function pinSearch(action, searchWord, callbackSetList) {
    if (searchWord.trim() == '') {
        callbackSetList([
            {
                title: CLEAR_PIN,
                description: 'Clear a specific Pin',
                showPins: true
            },
            {
                title: CLEAR_ALL_PIN,
                description: 'Clear all Pins',
            },
        ]);
        return;
    }
    var _a = searchWord.match(/(@(-?\d+))?\s*(.+)/), _0 = _a[0], _1 = _a[1], index = _a[2], content = _a[3];
    content = content.trim();
    if (index === undefined) {
        callbackSetList([
            {
                title: ADD_PIN,
                description: "append pin:\u3010".concat(content, "\u3011"),
                content: content,
            }
        ]);
    }
    else {
        callbackSetList([
            {
                title: ADD_PIN,
                description: "insert at ".concat(index, ", pin:\u3010").concat(content, "\u3011"),
                index: index,
                content: content,
            },
        ]);
    }
}
var RAINDROP_PINS = "raindrop pins";
function pinSelect(action, itemData, callbackSetList) {
    var _a, _b;
    var pins = (_a = window.utools.dbStorage.getItem(RAINDROP_PINS)) !== null && _a !== void 0 ? _a : [];
    switch (itemData.title) {
        case CLEAR_PIN:
            callbackSetList(pins.map(function (p, index) { return ({
                title: "@".concat(index, " ").concat(p.content),
                clearPin: true,
                index: index
            }); }));
            return;
        case CLEAR_ALL_PIN:
            window.utools.dbStorage.removeItem(RAINDROP_PINS);
            break;
        case ADD_PIN:
            pins.splice((_b = itemData.index) !== null && _b !== void 0 ? _b : pins.length, 0, { content: itemData.content });
            window.utools.dbStorage.setItem(RAINDROP_PINS, pins);
            break;
        default: // show pins to clear
            if (itemData.clearPin && typeof itemData.index === 'number') {
                pins.splice(itemData.index, 1);
                window.utools.dbStorage.setItem(RAINDROP_PINS, pins);
            }
    }
    window.utools.hideMainWindow();
    window.utools.outPlugin();
}
/* Raindrop API */
var IMPORTANT_QUERY_MARK = '❤️';
var RaindropAPIImpl = /** @class */ (function () {
    function RaindropAPIImpl(accessToken, options) {
        var _a, _b, _c;
        this.accessToken = accessToken;
        this.defaultCollection = (_a = options === null || options === void 0 ? void 0 : options.defaultCollection) !== null && _a !== void 0 ? _a : RaindropAPIImpl.ALL_COLLECTION_ID;
        this.defaultPerPage = (_b = options === null || options === void 0 ? void 0 : options.defaultPerPage) !== null && _b !== void 0 ? _b : 50;
        this.defaultTimeout = (_c = options === null || options === void 0 ? void 0 : options.defaultTimeoutMs) !== null && _c !== void 0 ? _c : 15000;
    }
    /**@exception Error*/
    RaindropAPIImpl.prototype.searchRaindrops = function (req) {
        var _a, _b, _c, _d, _e, _f, _g;
        var targetUrl = new URL("".concat(RaindropAPIImpl.RAINDROP_SEARCH_URL, "/").concat((_a = req.collection) !== null && _a !== void 0 ? _a : this.defaultCollection));
        targetUrl.searchParams.append("search", (_b = req.search) !== null && _b !== void 0 ? _b : '');
        targetUrl.searchParams.append("sort", (_c = req.sort) !== null && _c !== void 0 ? _c : '');
        targetUrl.searchParams.append("page", String((_d = req.page) !== null && _d !== void 0 ? _d : 0));
        targetUrl.searchParams.append("perpage", String((_e = req.perpage) !== null && _e !== void 0 ? _e : this.defaultPerPage));
        var headers = { Authorization: "Bearer ".concat(this.accessToken) };
        var controller = (_f = req.abort) !== null && _f !== void 0 ? _f : new AbortController();
        setTimeout(controller.abort, (_g = req.timeout) !== null && _g !== void 0 ? _g : this.defaultTimeout);
        return fetch(targetUrl, { headers: headers, signal: controller.signal }).then(function (rsp) { return rsp.json(); });
    };
    RaindropAPIImpl.RAINDROP_SEARCH_URL = "https://api.raindrop.io/rest/v1/raindrops";
    RaindropAPIImpl.ALL_COLLECTION_ID = 0;
    return RaindropAPIImpl;
}());
