
export type Raindrop = {
    _id: number;
    collectionId: number;
    type: string;
    cover: string;
    title: string;
    tags: Array<string>;
    link: string;
    important?: boolean;
    excerpt: string;
    created: string;
    lastUpdate: string;
}
