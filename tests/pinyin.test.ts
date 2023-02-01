import {readFileSync} from "fs";
import {Raindrop} from "../src/entity/raindrop";
import pinyin from "pinyin";

test("pinyin", () => {
    let data: Array<Raindrop> = JSON.parse(readFileSync("./tests/data.json", {encoding: "utf-8"}));

    data.forEach((v) => {
        let tmp = v.title.replace(/[^\u4e00-\u9fa5]/gi, '')
        let r0 = pinyin(tmp, {style: "normal"});
        let r1 = pinyin(tmp, {style: "first_letter"});
        console.log(`${tmp} => ${r0} + ${r1}`);
    });
});