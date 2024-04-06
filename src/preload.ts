import {
    CLEAR_ACCESS_KEY_TITLE,
    IMPORTANT_QUERY_MARK,
    RAINDROP_ACCESS_KEY,
    SET_ACCESS_KEY_TITLE,
    SHOW_ACCESS_KEY_TITLE
} from "./entity/const";
import {RaindropAPIImpl} from "./ports/raindrop";

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
            title: p.alias ?? p.content ?? 'invalid pin',
            description: p.alias ? p.content : '',
            pinContent: p.content,
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

    let localTimerId: NodeJS.Timeout;
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
        window.utools.setSubInputValue(`${itemData.pinContent} `);
    } else {
        window.utools.hideMainWindow();
        window.utools.shellOpenExternal(itemData.url);
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

    let [_0, _1, index, _3, alias, content] = searchWord.match(/^(@(-?\d+))?\s*(【([^】]+)】)?\s*(.+)$/);
    index = index !== undefined ? parseInt(index) : undefined;
    alias = alias !== undefined ? alias.trim() : undefined;
    content = content.trim()

    callbackSetList([
        {
            title: ADD_PIN,
            description: formatPin({index: index, alias: alias, content: content}),
            index: index,
            alias: alias,
            content: content,
        },
    ]);
}

const RAINDROP_PINS = "raindrop pins";
type RaindropPin = {
    index?: number,
    alias?: string,
    content: string
}

function pinSelect(action, itemData, callbackSetList) {
    let pins: Array<RaindropPin> = window.utools.dbStorage.getItem(RAINDROP_PINS) ?? [];
    switch (itemData.title) {
        case CLEAR_PIN:
            callbackSetList(pins.map((p, index) => ({
                title: formatPin(p),
                clearPin: true,
                index: index
            })));
            return;
        case CLEAR_ALL_PIN:
            window.utools.dbStorage.removeItem(RAINDROP_PINS);
            break;
        case ADD_PIN:
            pins.splice(itemData.index ?? pins.length, 0, {
                alias: itemData.alias,
                content: itemData.content
            });
            window.utools.dbStorage.setItem(RAINDROP_PINS, pins);
            break;
        default: // 清理某个 pin
            if (itemData.clearPin && typeof itemData.index === 'number') {
                pins.splice(itemData.index, 1);
                window.utools.dbStorage.setItem(RAINDROP_PINS, pins);
            }
    }
    window.utools.hideMainWindow();
    window.utools.outPlugin();
}

function formatPin(item: RaindropPin): string {
    let insertDesc = item.index === undefined ? '' : `(${item.index}) `;
    let pinDesc = `"${item.content}"`;
    let aliasDesc = item.alias === undefined ? '' : ` alias: ${item.alias}`;
    return `${insertDesc}${pinDesc}${aliasDesc}`
}
