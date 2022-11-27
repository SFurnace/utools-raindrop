import {Raindrop} from "../entity/raindrop";

export const ALL_COLLECTION_ID = 0;
export const UNSORTED_COLLECTION_ID = -1;
export const TRASH_COLLECTION_ID = -99;
export const IMPORTANT_QUERY_MARK = '❤️';

export interface SearchRaindropsReq {
    search: string;
    collection?: number;
    sort?: string;
    page?: number;
    perpage?: number;
    timeout?: number;
}

export interface SearchRaindropsRsp {
    count: number;
    items: Array<Raindrop>;
}

export interface RaindropAPI {
    /**@exception Error*/
    searchRaindrops(req: SearchRaindropsReq): Promise<SearchRaindropsRsp>;
}