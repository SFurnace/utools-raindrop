import * as process from "node:process";
import RaindropAPI from "../src/domain/repo/raindrop";

jest.setTimeout(30000);

test("search something", async () => {
    let api = new RaindropAPI(process.env["RAINDROP_CLIENT_TOKEN"]);

    try {
        await api.searchRaindrops(0, "预热").then((data) => {
            console.log(data);
        });
    } catch (e) {
        console.error(e);
    }
});
