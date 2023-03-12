declare const SHOW_ACCESS_KEY_TITLE = "Show Access Key";
declare const CLEAR_ACCESS_KEY_TITLE = "Clear Access Key";
declare const SET_ACCESS_KEY_TITLE = "Set Access Key";
declare function settingEnter(action: any, callbackSetList: any): void;
declare function settingSearch(action: any, searchWord: any, callbackSetList: any): void;
declare const RAINDROP_ACCESS_KEY = "raindrop access key";
declare function settingSelect(action: any, itemData: any, callbackSetList: any): void;
declare let raindropAPIObj: RaindropAPIImpl;
declare function searchSearch(action: any, searchWord: any, callbackSetList: any): void;
declare function searchSelect(action: any, itemData: any, callbackSetList: any): void;
declare const IMPORTANT_QUERY_MARK = "\u2764\uFE0F";
declare type SearchRaindropsReq = {
    search: string;
    collection?: number;
    sort?: string;
    page?: number;
    perpage?: number;
    timeout?: number;
};
declare type SearchRaindropsRsp = {
    count: number;
    items: Array<Raindrop>;
};
declare type Raindrop = {
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
};
declare type APIOptions = {
    defaultCollection?: number;
    defaultPerPage?: number;
    defaultTimeoutMs?: number;
};
declare class RaindropAPIImpl {
    private static RAINDROP_SEARCH_URL;
    private static ALL_COLLECTION_ID;
    defaultTimeout: number;
    defaultCollection: number;
    defaultPerPage: number;
    private readonly accessToken;
    constructor(accessToken: string, options?: APIOptions);
    /**@exception Error*/
    searchRaindrops(req: SearchRaindropsReq): Promise<SearchRaindropsRsp>;
}
