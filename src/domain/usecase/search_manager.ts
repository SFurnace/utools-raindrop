import {Raindrop} from "../entity/raindrop";
import {CacheManager} from "./cache_manager";
import {IMPORTANT_QUERY_MARK} from "../ports/raindrop";

export interface SearchManager {
    search(query: string): Array<Raindrop>;
}

export class SearchManagerImpl implements SearchManager {
    cache: CacheManager;

    constructor(cache: CacheManager) {
        this.cache = cache;
    }

    search(query: string): Array<Raindrop> {
        let result = this.cache.loadAll();
        let param = this.parseQuery(query);

        if (param.isFilterValid()) {
            result = result.filter(param.filterFunc.bind(param));
        }
        if (param.isQueryValid()) {
            result = result.filter(param.filterByPointFunc.bind(param));
        }
        result.sort(param.compareFunc.bind(param));
        return result;
    }

    private parseQuery(query: string): SearchParam {
        let result = new SearchParam();
        let strs = query.split(/\s+/);
        for (let s of strs) {
            if (s.length > 0) {
                switch (true) {
                    case s.startsWith('#'):
                        result.tags.push(s.replace(/^#+/, ''));
                        break;
                    case s === IMPORTANT_QUERY_MARK:
                        result.important = true;
                        break;
                    default:
                        result.queries.push(s);
                }
            }
        }
        return result;
    }
}

class SearchParam {
    queries: Array<string> = [];
    tags: Array<string> = [];
    important: boolean = false;

    isQueryValid(): boolean {
        return this.queries.length > 0;
    }

    isFilterValid(): boolean {
        return this.tags.length > 0 || this.important;
    }

    filterFunc(v: Raindrop): boolean {
        if (this.important && !v.important) {
            return false;
        }
        if (this.tags.length > 0) {
            for (let tag of this.tags) {
                if (!v.tags.includes(tag)) {
                    return false;
                }
            }
        }
        return true;
    }

    filterByPointFunc(v: Raindrop): boolean {
        return this.calcPoints(v) > 0;
    }

    calcPoints(v: Raindrop): number {
        let result = 0;

        for (let q of this.queries) {
            if (v.title.includes(q)) {
                result += 2;
            }
            if (v.pinyinFirstLetterTitle?.includes(q)) {
                result += 2;
            }
            if (v.pinyinTitle?.includes(q)) {
                result += 2;
            }
            if (v.link.includes(q)) {
                result += 1;
            }
        }
        return result;
    }

    compareFunc(r0: Raindrop, r1: Raindrop): number {
        return (this.calcPoints(r0) - this.calcPoints(r1)) || ((r0.lastUpdateTime.getTime() > r1.lastUpdateTime.getTime()) ? 1 : -1);
    }
}
