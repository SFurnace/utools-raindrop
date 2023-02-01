export type Raindrop = {
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

export type User = {
    id: number;
    name: string;
    email: string;
    groups: Array<CollectionGroup>;
}

export type CollectionGroup = {
    title: string;
    hidden: boolean;
    collectionIds: Array<number>;
}

export type Collection = {
    id: number;
    parentId?: number;
    title: string;
    coverUrl: string;
    createdTime: Date;
    lastUpdateTime: Date;
}
