class User {
    id: number;
    name: string;
    email: string;
    groups: Array<CollectionGroup>;
}

class CollectionGroup {
    title: string;
    hidden: boolean;
    collectionIds: Array<number>;
}

class Collection {
    id: number;
    parentId: number | null;
    title: string;
    coverUrl: string;
    createdTime: Date;
    lastUpdateTime: Date;
}

class Raindrop {
    id: number;
    collectionId: number;
    type: string;
    coverUrl: string;
    title: string;
    tags: [string];
    link: string;
    important: boolean;
    createdTime: Date;
    lastUpdateTime: Date;
}

export {User, CollectionGroup, Collection, Raindrop};