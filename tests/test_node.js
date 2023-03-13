let [_0, _1, index, content ] = `@100 haha`.match(/(@(\d+) )?\s*(\S+)\s*/)
console.log(index)
console.log(content)