// example 1
const fs = require("fs");

fs.readFile(__filename, () => {
  console.log("1");
  setImmediate(() => console.log("2"));
  process.nextTick(() => console.log("3"));
  Promise.resolve().then(() => console.log("4"));
});

process.nextTick(() => console.log("5"));
Promise.resolve().then(() => console.log("6"));
setTimeout(() => console.log("7"));

for (let i = 0; i < 2000000000; i++) {}

// output: 5, 6, 7, 1, 3, 4, 2
// Կոդը կարդալով գնում է
// Poll֊ի մեջ գրվում է 1
// NextTick-ի մեջ 5
// Promise֊ի մեջ 6
// Timer-ի մեջ 7 

// Սկսում է կանչել
// Առաջինը nextTick, հետո promise, քանի որ ունենք loop կանչվում ա timer, հետե poll-ը  , տեսնում ա, որ ունենք microtasks թողնում ա գործերը անցնում կատարում առաջինը nextTick,հետո Promise, նոր վերջում setImmediate

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// example 2

const fs = require("fs");
setTimeout(() => {
  console.log(1);
});
setTimeout(() => {
  console.log(2);
  process.nextTick(() => {
    console.log(3);
  });
  setImmediate(() => {
    console.log(4);
  });
});
setTimeout(() => {
  console.log(5);
});
setTimeout(() => {
  console.log(6);
  Promise.resolve(7).then((res) => {
    console.log(res);
  });
});
setTimeout(() => {
  console.log(8);
  fs.readFile(__filename, () => {
    console.log(9);
  });
});

// output: 1,2,3,5,6,7,8,9,4 or 1,2,3,5,6,7,8,4,9

// Քանի որ բոլոր timer են հերթով կանի։
// Կլինի 1,2 հետո microtask կտեսնի կտպի 3։ Կշարունակի 5,6 էլի կտեսնի  microtask կտպի 7։ Կշարունակի 8։
// Հետո արդեն ըստ պայմանի թե poll հասցրել ա կատարվի թե ոչ կտպի 4,9 կամ 9,4

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// example 3

const fs = require("fs");

console.log(1);
setTimeout(() => console.log("2"));
setImmediate(() => console.log("3"));
process.nextTick(() => console.log("4"));
fs.readFile(__filename, () => {
  console.log(13);
  setTimeout(() => console.log("5"));
  setImmediate(() => console.log("6"));
  process.nextTick(() => console.log("7"));
});

setTimeout(() => console.log("8"));
setImmediate(() => {
  console.log("9");
  process.nextTick(() => console.log("11"));
});
setImmediate(() => {
  console.log("12");
});
process.nextTick(() => console.log("10"));

//output: 1, 4, 10, 2, 8, 13,7,3,9,11,12,5,6

//Եթե անտեսենք ժամանակային առումով լինելը(stack-ը եթե դատարկ լինի setImmediate-ը առաջ չընկնի)
// Կլինի 1 քանի որ սինխռոն է։ Հետո 4,10 nextTick-ները։ Կանցնի  macrotasks-ին։ Կտպի 2,8 timer-ները։ Կհաջորդի poll-ը։ Կտպի 13, ու կկատարի nextTick-ը, կտպի 7։ Կշարունակի setImmediate-ները։ Կլինի 3,9 ու էլի կանի nextTick, 11: Կշարունակի 12։ Հետո նոր 5,6։

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// example 4
const fs = require("fs");
fs.readFile(__filename, () => {
  console.log(0);
});

setImmediate(() => {
  console.log(1);
});
setImmediate(() => {
  console.log(2);
});
setImmediate(() => {
  console.log(3);
});
setImmediate(() => {
  console.log(4);
  Promise.resolve(5).then((res) => {
    console.log(res);
  });
});

setImmediate(() => {
  console.log(6);
});
setImmediate(() => {
  console.log(7);
});
setImmediate(() => {
  console.log(8);
});

setTimeout(() => {
  console.log(9);
}, 1000);

//output: 0,1,2,3,4,5,6,7,8,9
// Եթե կրկին անտեսենք ժամանակային  պահը, կլինի սկզբում poll-ը։ Հետո հերթով setImmediate-ները։ Բայց երբ տեսնի promise-ը կտպի դա նոր կշարունակի։ Արդյունքում կստացվի 0,1,2,3,4,5,6,7,8,9։ 9ը timer֊ի մեջ է որի վրա կա հստակ ժամանակ, հետևաբար stack-ը դատարկ է լինելու, դրա համար կմնա վերջում։
// Իսկ եթե չանտեսենք կատարվելու արագությունները սկզբում կտպվեն setImmediate-ները։