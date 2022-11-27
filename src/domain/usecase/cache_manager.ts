import {Raindrop} from "../entity/raindrop";

export interface CacheManager {
    loadAll(): Array<Raindrop>;

    refreshAll(): Promise<Array<Raindrop>>;
}