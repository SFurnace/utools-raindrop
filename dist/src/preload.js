window.exports = {
    "setting": {
        mode: "list",
        args: {
            enter: settingEnter,
            search: settingSearch,
            select: settingSelect,
            placeholder: "搜索"
        }
    },
    "search": {
        mode: "list",
        args: {
            search: searchSearch,
            select: searchSelect,
            placeholder: "搜索"
        }
    }
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
                icon: ''
            },
            {
                title: CLEAR_ACCESS_KEY_TITLE,
                description: 'clear current access key',
                icon: ''
            },
        ]);
    }
    else {
        callbackSetList([
            {
                title: SET_ACCESS_KEY_TITLE,
                description: "set access key to ".concat(searchWord),
                data: searchWord,
                icon: ''
            },
        ]);
    }
}
var RAINDROP_ACCESS_KEY = "raindrop access key";
function settingSelect(action, itemData, callbackSetList) {
    window.utools.hideMainWindow();
    switch (itemData.title) {
        case SHOW_ACCESS_KEY_TITLE:
            window.utools.showNotification("access key: ".concat(window.utools.dbStorage.getItem(RAINDROP_ACCESS_KEY)));
            return;
        case CLEAR_ACCESS_KEY_TITLE:
            window.utools.dbStorage.removeItem(RAINDROP_ACCESS_KEY);
            raindropAPIObj = null;
            return;
        case SET_ACCESS_KEY_TITLE:
            if (typeof itemData.data === 'string' && itemData.data != "") {
                window.utools.dbStorage.setItem(RAINDROP_ACCESS_KEY, itemData.data);
                raindropAPIObj = null;
                window.utools.showNotification("access key: ".concat(window.utools.dbStorage.getItem(RAINDROP_ACCESS_KEY)));
            }
            return;
    }
    window.utools.outPlugin();
}
var raindropAPIObj;
function searchSearch(action, searchWord, callbackSetList) {
    if (raindropAPIObj == null) {
        var accessKey = window.utools.dbStorage.getItem(RAINDROP_ACCESS_KEY);
        if (accessKey === null || accessKey === '') {
            window.utools.showNotification('please set raindrop access key first');
            return;
        }
        raindropAPIObj = new RaindropAPIImpl(accessKey, { defaultPerPage: 25, defaultTimeoutMs: 10000 });
    }
    raindropAPIObj.searchRaindrops({ search: searchWord }).then(function (value) {
        if (value.items.length > 0) {
            callbackSetList(value.items.map(function (v) {
                var importantStr = v.important ? "".concat(IMPORTANT_QUERY_MARK, " ") : '';
                var tagStr = v.tags.length == 0 ? '' : "".concat(v.tags.map(function (tag) { return '#' + tag; }).join(' '), " ");
                var descStr = (v.excerpt.length == 0) ? '' : (v.excerpt.length > 50 ? "\u3010".concat(v.excerpt.slice(0, 50), "...\u3011") : "\u3010".concat(v.excerpt, "\u3011"));
                return {
                    title: v.title,
                    description: "".concat(importantStr).concat(tagStr).concat(descStr),
                    icon: v.cover ? v.cover : 'assets/logo.png',
                    url: v.link
                };
            }));
        }
        else {
            callbackSetList([
                {
                    title: '~~ nothing ~~',
                },
            ]);
        }
    }).catch(function (reason) {
        window.utools.showNotification("search raindrop failed: ".concat(reason));
    });
}
function searchSelect(action, itemData, callbackSetList) {
    window.utools.hideMainWindow();
    var url = itemData.url;
    require('electron').shell.openExternal(url);
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
        var _a, _b, _c, _d, _e;
        var targetUrl = new URL("".concat(RaindropAPIImpl.RAINDROP_SEARCH_URL, "/").concat((_a = req.collection) !== null && _a !== void 0 ? _a : this.defaultCollection));
        targetUrl.searchParams.append("search", req.search);
        targetUrl.searchParams.append("sort", (_b = req.sort) !== null && _b !== void 0 ? _b : '');
        targetUrl.searchParams.append("page", String((_c = req.page) !== null && _c !== void 0 ? _c : 0));
        targetUrl.searchParams.append("perpage", String((_d = req.perpage) !== null && _d !== void 0 ? _d : this.defaultPerPage));
        var headers = { Authorization: "Bearer ".concat(this.accessToken) };
        var controller = new AbortController();
        setTimeout(controller.abort, (_e = req.timeout) !== null && _e !== void 0 ? _e : this.defaultTimeout);
        return fetch(targetUrl, { headers: headers, signal: controller.signal }).then(function (rsp) {
            return rsp.json();
        });
    };
    RaindropAPIImpl.RAINDROP_SEARCH_URL = "https://api.raindrop.io/rest/v1/raindrops";
    RaindropAPIImpl.ALL_COLLECTION_ID = 0;
    return RaindropAPIImpl;
}());
