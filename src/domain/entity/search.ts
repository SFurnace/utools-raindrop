import {Raindrop} from "./raindrop";

class Search {
    query: string;
    collectionId: number;
    onlyImportant: boolean;
}

class History {
    queryObj: Search;
    result: Array<Raindrop>;
}