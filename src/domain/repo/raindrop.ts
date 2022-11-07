import {Raindrop} from "../entity/raindrop";
import axios from "axios";

export default class RaindropAPI {
    static DEFAULT_TIMEOUT = 15000;
    static RAINDROP_SEARCH_URL = "https://api.raindrop.io/rest/v1/raindrops";

    private accessToken: string;
    private defaultTimeout: number;

    constructor(accessToken: string, timeout: number = RaindropAPI.DEFAULT_TIMEOUT) {
        this.accessToken = accessToken;
        this.defaultTimeout = timeout;
    }

    /**@exception Error*/
    async searchRaindrops(collection: number, queryStr: string, timeout: number = this.defaultTimeout): Promise<[Raindrop]> {
        return axios.get(`${RaindropAPI.RAINDROP_SEARCH_URL}/${collection}`, {
            headers: {Authorization: `Bearer ${this.accessToken}`},
            params: {search: queryStr},
            timeout: timeout,
            responseType: 'json'
        }).then(rsp => {
            if (rsp.data['result'] !== true) {
                throw new Error("invalid search result: " + rsp.data);
            }

            return rsp.data['items'].map(((item) => {
                return {
                    id: item['_id'],
                    collectionId: item['collectionId'],
                    type: item['type'],
                    title: item['title'],
                    link: item['link'],
                    coverUrl: item['cover'],
                    tags: item['tags'],
                    important: item['important'],
                    createdTime: new Date(item['created']),
                    lastUpdateTime: new Date(item['lastUpdate'])
                };
            }) as ((any) => Raindrop));
        }).catch(err => {
            throw new Error("can't get raindrops: " + err.toString());
        });
    }
}



