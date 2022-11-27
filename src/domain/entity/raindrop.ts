export interface User {
    id: number;
    name: string;
    email: string;
    groups: Array<CollectionGroup>;
}

export interface CollectionGroup {
    title: string;
    hidden: boolean;
    collectionIds: Array<number>;
}

export interface Collection {
    id: number;
    parentId?: number;
    title: string;
    coverUrl: string;
    createdTime: Date;
    lastUpdateTime: Date;
}

export interface Raindrop {
    id: number;
    collectionId: number;
    type: string;
    coverUrl: string;
    title: string;
    pinyinTitle?: string;
    pinyinFirstLetterTitle?: string;
    tags: Array<string>;
    link: string;
    important?: boolean;
    createdTime: Date;
    lastUpdateTime: Date;
}
