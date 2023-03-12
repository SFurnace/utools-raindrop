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

const SHOW_ACCESS_KEY_TITLE = "Show Access Key";
const CLEAR_ACCESS_KEY_TITLE = 'Clear Access Key';
const SET_ACCESS_KEY_TITLE = 'Set Access Key';

function settingEnter(action, callbackSetList) {
    settingSearch(action, '', callbackSetList);
}

function settingSearch(action, searchWord, callbackSetList) { // 子输入框内容变化时被调用 可选 (未设置则无搜索)
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
    } else {
        callbackSetList([
            {
                title: SET_ACCESS_KEY_TITLE,
                description: `set access key to ${searchWord}`,
                data: searchWord,
                icon: ''
            },
        ]);
    }
}

const RAINDROP_ACCESS_KEY = "raindrop access key";

function settingSelect(action, itemData, callbackSetList) { // 用户选择列表中某个条目时被调用
    window.utools.hideMainWindow();
    switch (itemData.title) {
        case SHOW_ACCESS_KEY_TITLE:
            window.utools.showNotification(`access key: ${window.utools.dbStorage.getItem(RAINDROP_ACCESS_KEY)}`);
            return;
        case CLEAR_ACCESS_KEY_TITLE:
            window.utools.dbStorage.removeItem(RAINDROP_ACCESS_KEY);
            raindropAPIObj = null;
            return;
        case SET_ACCESS_KEY_TITLE:
            if (typeof itemData.data === 'string' && itemData.data != "") {
                window.utools.dbStorage.setItem(RAINDROP_ACCESS_KEY, itemData.data);
                raindropAPIObj = null;

                window.utools.showNotification(`access key: ${window.utools.dbStorage.getItem(RAINDROP_ACCESS_KEY)}`);
            }
            return;
    }
    window.utools.outPlugin();
}

let raindropAPIObj: RaindropAPIImpl;

function searchSearch(action, searchWord, callbackSetList) {
    if (raindropAPIObj == null) {
        let accessKey = window.utools.dbStorage.getItem(RAINDROP_ACCESS_KEY);
        if (accessKey === null || accessKey === '') {
            window.utools.showNotification('please set raindrop access key first');
            return;
        }
        raindropAPIObj = new RaindropAPIImpl(accessKey, {defaultPerPage: 25, defaultTimeoutMs: 10000});
    }

    raindropAPIObj.searchRaindrops({search: searchWord}).then(value => {
        if (value.items.length > 0) {
            callbackSetList(
                value.items.map((v) => {
                    let importantStr = v.important ? `${IMPORTANT_QUERY_MARK} ` : '';
                    let tagStr = v.tags.length == 0 ? '' : `${v.tags.map((tag) => '#' + tag).join(' ')} `;
                    let descStr = (v.excerpt.length == 0) ? '' : (v.excerpt.length > 50 ? `【${v.excerpt.slice(0, 50)}...】` : `【${v.excerpt}】`);
                    return {
                        title: v.title,
                        description: `${importantStr}${tagStr}${descStr}`,
                        icon: v.cover ? v.cover : 'assets/logo.png',
                        url: v.link
                    };
                })
            );
        } else {
            callbackSetList([
                {
                    title: '~~ nothing ~~',
                },
            ]);
        }
    }).catch(reason => {
        window.utools.showNotification(`search raindrop failed: ${reason}`);
    });
}

function searchSelect(action, itemData, callbackSetList) {
    window.utools.hideMainWindow();
    const url = itemData.url;
    require('electron').shell.openExternal(url);
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
        targetUrl.searchParams.append("search", req.search);
        targetUrl.searchParams.append("sort", req.sort ?? '');
        targetUrl.searchParams.append("page", String(req.page ?? 0));
        targetUrl.searchParams.append("perpage", String(req.perpage ?? this.defaultPerPage));
        let headers = {Authorization: `Bearer ${this.accessToken}`};
        let controller = new AbortController();

        setTimeout(controller.abort, req.timeout ?? this.defaultTimeout);
        return fetch(targetUrl, {headers: headers, signal: controller.signal}).then(rsp => {
            return rsp.json();
        });
    }
}
