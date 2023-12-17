import {jest, test} from "@jest/globals";
import * as process from "node:process";
// @ts-ignore
import {RaindropAPIImpl} from "../src/ports/raindrop";

jest.setTimeout(60000);

test("search something", async () => {
    try {
        let api = new RaindropAPIImpl(process.env["RAINDROP_CLIENT_TOKEN"]);
        let finished = false;
        let page = 0;
        while (!finished) {
            await api.searchRaindrops({search: "created:>2022-11-09", page: page}).then((data) => {
                if ((page + 1) * api.defaultPerPage >= data.count) {
                    finished = true;
                }

                console.log(data.items);
                page += 1;
            }).catch((err) => {
                console.error(err);
            });
        }
    } catch (e) {
        console.error(e);
    }
});
