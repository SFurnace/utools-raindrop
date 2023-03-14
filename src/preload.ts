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

const SHOW_ACCESS_KEY_TITLE = "Show Access Key";
const CLEAR_ACCESS_KEY_TITLE = 'Clear Access Key';
const SET_ACCESS_KEY_TITLE = 'Set Access Key';

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
    } else {
        callbackSetList([
            {
                title: SET_ACCESS_KEY_TITLE,
                description: `set access key to ${searchWord}`,
                data: searchWord,
            },
        ]);
    }
}

const RAINDROP_ACCESS_KEY = "raindrop access key";

function settingSelect(action, itemData) {
    window.utools.hideMainWindow();
    switch (itemData.title) {
        case SHOW_ACCESS_KEY_TITLE:
            window.utools.showNotification(`access key: ${window.utools.dbStorage.getItem(RAINDROP_ACCESS_KEY)} ?? ''`);
            break;
        case CLEAR_ACCESS_KEY_TITLE:
            window.utools.dbStorage.removeItem(RAINDROP_ACCESS_KEY);
            raindropAPIObj = null;
            break;
        case SET_ACCESS_KEY_TITLE:
            if (typeof itemData.data === 'string' && itemData.data != "") {
                window.utools.dbStorage.setItem(RAINDROP_ACCESS_KEY, itemData.data);
                raindropAPIObj = null;

                window.utools.showNotification(`access key: ${window.utools.dbStorage.getItem(RAINDROP_ACCESS_KEY) ?? ''}`);
            }
            break;
    }
    window.utools.outPlugin();
}

function searchEnter(action, callbackSetList) {
    let pins: Array<RaindropPin> = window.utools.dbStorage.getItem(RAINDROP_PINS) ?? [];
    if (pins.length > 0) {
        callbackSetList(pins.map((p) => ({
            title: p.content ?? 'nothing',
            isPin: true
        })));
    } else {
        callbackSetList([{title: '~~ no pins ~~'}]);
    }
}

let raindropAPIObj: RaindropAPIImpl;
let globalTimerId: any;
let globalAbort: AbortController;

function searchSearch(action, searchWord, callbackSetList) {
    if (globalAbort != null) {
        globalAbort.abort();
    }
    if (globalTimerId != null) {
        clearTimeout(globalTimerId);
    }

    let localTimerId;
    let localAbort = new AbortController();
    localTimerId = setTimeout(() => {
        if (localAbort.signal.aborted) {
            return;
        }

        if (raindropAPIObj == null) {
            let accessKey = window.utools.dbStorage.getItem(RAINDROP_ACCESS_KEY) ?? '';
            if (accessKey === '') {
                window.utools.showNotification('please set raindrop access key first');
                return;
            }
            raindropAPIObj = new RaindropAPIImpl(accessKey, {defaultPerPage: 25, defaultTimeoutMs: 10000});
        }
        let [_0, _1, cId, search] = searchWord.match(/(@(-?\d+))?(.*)/);
        raindropAPIObj.searchRaindrops({search: search, collection: cId, abort: localAbort}).then(rsp => {
            if ((rsp.items ?? []).length > 0) {
                callbackSetList(
                    rsp.items.map((v) => {
                        let importantStr = v.important ? `${IMPORTANT_QUERY_MARK} ` : '';
                        let collectionStr = v.collectionId ? `@${v.collectionId} ` : '';
                        let tagStr = v.tags.length == 0 ? '' : `${v.tags.map((tag) => '#' + tag).join(' ')} `;
                        let descStr = (v.excerpt.length == 0) ? '' : (v.excerpt.length > 50 ? `【${v.excerpt.slice(0, 50)}...】` : `【${v.excerpt}】`);
                        return {
                            title: v.title,
                            description: `${importantStr}${collectionStr}${tagStr}${descStr}`,
                            icon: v.cover ? v.cover : 'assets/logo.png',
                            url: v.link
                        };
                    })
                );
            } else {
                callbackSetList([{title: '~~ nothing ~~'}]);
            }
        }).catch(reason => {
            if (reason.name !== 'AbortError') {
                window.utools.showNotification(`search raindrop failed: ${reason}`);
            }
        }).finally(() => {
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
        window.utools.setSubInputValue(`${itemData.title} `);
    } else {
        window.utools.hideMainWindow();
        const url = itemData.url;
        require('electron').shell.openExternal(url);
        window.utools.outPlugin();
    }
}

function pinEnter(action, callbackSetList) {
    pinSearch(action, '', callbackSetList);
}

const CLEAR_PIN = "Clear Pin";
const CLEAR_ALL_PIN = "Clear All Pin";
const ADD_PIN = "Add Pin";

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

    let [_0, _1, index, content] = searchWord.match(/(@(-?\d+))?\s*(.+)/);
    content = content.trim();
    if (index === undefined) {
        callbackSetList([
            {
                title: ADD_PIN,
                description: `append pin:【${content}】`,
                content: content,
            }
        ]);
    } else {
        callbackSetList([
            {
                title: ADD_PIN,
                description: `insert at ${index}, pin:【${content}】`,
                index: index,
                content: content,
            },
        ]);
    }
}

const RAINDROP_PINS = "raindrop pins";
type RaindropPin = {
    content: string
}

function pinSelect(action, itemData, callbackSetList) {
    let pins: Array<RaindropPin> = window.utools.dbStorage.getItem(RAINDROP_PINS) ?? [];
    switch (itemData.title) {
        case CLEAR_PIN:
            callbackSetList(pins.map((p, index) => ({
                title: `@${index} ${p.content}`,
                clearPin: true,
                index: index
            })));
            return;
        case CLEAR_ALL_PIN:
            window.utools.dbStorage.removeItem(RAINDROP_PINS);
            break;
        case ADD_PIN:
            pins.splice(itemData.index ?? pins.length, 0, {content: itemData.content});
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

const IMPORTANT_QUERY_MARK = '❤️';

type SearchRaindropsReq = {
    search: string;
    collection?: number;
    sort?: string;
    page?: number;
    perpage?: number;
    timeout?: number;
    abort?: AbortController;
}

type SearchRaindropsRsp = {
    count: number;
    items: Array<Raindrop>;
}

type Raindrop = {
    _id: number;
    collectionId: number;
    type: string;
    cover: string;
    title: string;
    tags: Array<string>;
    link: string;
    important?: boolean;
    excerpt: string;
    created: string;
    lastUpdate: string;
}

type APIOptions = {
    defaultCollection?: number;
    defaultPerPage?: number;
    defaultTimeoutMs?: number;
}

class RaindropAPIImpl {
    private static RAINDROP_SEARCH_URL = "https://api.raindrop.io/rest/v1/raindrops";
    private static ALL_COLLECTION_ID = 0;

    defaultTimeout: number;
    defaultCollection: number;
    defaultPerPage: number;
    private readonly accessToken: string;

    constructor(accessToken: string, options?: APIOptions) {
        this.accessToken = accessToken;
        this.defaultCollection = options?.defaultCollection ?? RaindropAPIImpl.ALL_COLLECTION_ID;
        this.defaultPerPage = options?.defaultPerPage ?? 50;
        this.defaultTimeout = options?.defaultTimeoutMs ?? 15000;
    }

    /**@exception Error*/
    searchRaindrops(req: SearchRaindropsReq): Promise<SearchRaindropsRsp> {
        let targetUrl = new URL(`${RaindropAPIImpl.RAINDROP_SEARCH_URL}/${req.collection ?? this.defaultCollection}`);
        targetUrl.searchParams.append("search", req.search ?? '');
        targetUrl.searchParams.append("sort", req.sort ?? '');
        targetUrl.searchParams.append("page", String(req.page ?? 0));
        targetUrl.searchParams.append("perpage", String(req.perpage ?? this.defaultPerPage));
        let headers = {Authorization: `Bearer ${this.accessToken}`};
        let controller = req.abort ?? new AbortController();

        setTimeout(controller.abort, req.timeout ?? this.defaultTimeout);
        return fetch(targetUrl, {headers: headers, signal: controller.signal}).then(rsp => rsp.json());
    }
}
