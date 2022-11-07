test("scope", () => {
    let funcArray: Array<() => void> = [];
    for (let i = 0; i < 10; i++) {
        funcArray.push(() => {
            console.log(i);
        });
    }
    for (let f of funcArray) {
        f();
    }
});