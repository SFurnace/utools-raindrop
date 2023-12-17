import {test, expect} from "@jest/globals";

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

test('split string', () => {
    let data = '    ';
    console.log(data.split(/\s+/));
});

test('array and class', () => {
    class A {
        // noinspection JSMismatchedCollectionQueryUpdate
        field: Array<string>;
    }

    try {
        let a = new A;
        a.field.push('');
        console.log(a);
    } catch (e) {
        expect(e instanceof TypeError).toBeTruthy();
    }
});

test("check boolean", () => {
    console.log(0 || 100);
    console.log(0.0 || 200);
    console.log(10 || 300);
    console.log(-10 || 400);
});
