/* Raindrop API */
import {Raindrop} from "../entity/raindrop";

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

type APIOptions = {
    defaultCollection?: number;
    defaultPerPage?: number;
    defaultTimeoutMs?: number;
}

export class RaindropAPIImpl {
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
