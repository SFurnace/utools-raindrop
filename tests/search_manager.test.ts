import {Raindrop} from "../src/domain/entity/raindrop";
import {CacheManager} from "../src/domain/usecase/cache_manager";
import {readFileSync} from "fs";
import {SearchManager, SearchManagerImpl} from "../src/domain/usecase/search_manager";
import {RaindropAPIImpl} from "../src/ports/raindrop";
import {fixRaindropJsonData} from "../src/domain/ports/helper";

class MockCache implements CacheManager {
    data: Array<Raindrop>;

    constructor(data: Array<Raindrop>) {
        this.data = data;
    }

    loadAll(): Array<Raindrop> {
        return this.data;
    }

    refreshAll(): Promise<Array<Raindrop>> {
        return Promise.resolve(this.data);
    }

}

test('basic search', () => {
    let data = JSON.parse(readFileSync("./tests/data.json", {encoding: "utf-8"}));
    let cache = new MockCache(data.map(fixRaindropJsonData));
    let search: SearchManager = new SearchManagerImpl(cache);

    console.log(search.search('#acg'));
});