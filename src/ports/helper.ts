import {Raindrop} from "../entity/raindrop";
import pinyin from "pinyin";

export function fixRaindropJsonData(v: Raindrop): Raindrop {
    return {
        id: v.id,
        collectionId: v.collectionId,
        type: v.type,
        coverUrl: v.coverUrl,
        title: v.title,
        tags: v.tags,
        link: v.link,
        important: v.important,

        pinyinFirstLetterTitle: v.pinyinFirstLetterTitle ? v.pinyinFirstLetterTitle : pinyin(v.title, {style: "first_letter"}).flat().join(''),
        pinyinTitle: v.pinyinTitle ? v.pinyinTitle : pinyin(v.title, {style: "normal"}).flat().join(''),
        createdTime: new Date(v.createdTime),
        lastUpdateTime: new Date(v.lastUpdateTime),
    };
}