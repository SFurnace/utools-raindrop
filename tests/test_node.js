let c0 = new AbortController()
let c1 = new AbortController()

console.log(c0 == c1)
console.log(c0 === c1)
console.log(c0 === c0)
console.log(c1 === c1)