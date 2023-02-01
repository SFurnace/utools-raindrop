import axios from "axios";
import {fixRaindropJsonData} from "./helper";
import {RaindropAPI, SearchRaindropsReq, SearchRaindropsRsp} from "../usecase/search_manager";


interface APIOptions {
    defaultCollection?: number;
    defaultPerPage?: number;
    defaultTimeout?: number;
}

export class RaindropAPIImpl implements RaindropAPI {
    private static RAINDROP_SEARCH_URL = "https://api.raindrop.io/rest/v1/raindrops";
    private static ALL_COLLECTION_ID = 0;

    defaultTimeout: number;
    defaultCollection: number;
    defaultPerPage: number;
    private accessToken: string;

    constructor(accessToken: string, options?: APIOptions) {
        this.accessToken = accessToken;
        this.defaultCollection = options?.defaultCollection ?? RaindropAPIImpl.ALL_COLLECTION_ID;
        this.defaultPerPage = options?.defaultPerPage ?? 50;
        this.defaultTimeout = options?.defaultTimeout ?? 15000;
    }

    /**@exception Error*/
    searchRaindrops(req: SearchRaindropsReq): Promise<SearchRaindropsRsp> {
        return axios.get(`${RaindropAPIImpl.RAINDROP_SEARCH_URL}/${req.collection ?? this.defaultCollection}`, {
            headers: {Authorization: `Bearer ${this.accessToken}`},
            params: {
                search: req.search,
                sort: req.sort,
                page: req.page,
                perpage: req.perpage ?? this.defaultPerPage,
            },
            timeout: req.timeout ?? this.defaultTimeout,
            responseType: 'json'
        }).then(rsp => {
            if (rsp.data['result'] !== true) {
                throw new Error("invalid search result: " + rsp.data);
            }

            return {
                count: rsp.data['count'],
                items: rsp.data['items'].map(item =>
                    fixRaindropJsonData({
                        id: item['_id'],
                        collectionId: item['collectionId'],
                        type: item['type'],
                        title: item['title'],
                        link: item['link'],
                        coverUrl: item['cover'],
                        tags: item['tags'],
                        important: item['important'],
                        createdTime: item['created'],
                        lastUpdateTime: item['lastUpdate']
                    }))
            };
        }).catch(err => {
            throw new Error("can't get raindrops: " + err.toString());
        });
    }
}
