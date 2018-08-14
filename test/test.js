const path = require('path');
const assert = require('chai').assert;

const {getFileData, hanldeTable} = require('../src/linec');

describe('linec files test', () => {
    it('can linec dir', () => {
        const url = path.join(__dirname, '../example');
        console.log(url);

        const dirObj = JSON.stringify(getFileData(url));

        const expectData = '{"CSS":{"file":1,"blankLines":0,"totalLines":4,"color":"#563d7c"},"JavaScript":{"file":1,"blankLines":0,"totalLines":1,"color":"#f1e05a"},"JSON":{"file":1,"blankLines":0,"totalLines":3,"color":"#fff"},"Markdown":{"file":1,"blankLines":0,"totalLines":1,"color":"#fff"}}';

        assert.equal(dirObj, expectData);

    })

    it('can linec table data', () => {

        const dirObj = JSON.stringify(hanldeTable({"CSS":{"file":1,"blankLines":0,"totalLines":4,"color":"#563d7c"},"JavaScript":{"file":1,"blankLines":0,"totalLines":1,"color":"#f1e05a"},"JSON":{"file":1,"blankLines":0,"totalLines":3,"color":"#fff"},"Markdown":{"file":1,"blankLines":0,"totalLines":1,"color":"#fff"}}));

        const expectData = '{"totalFiles":4,"totalCode":9,"totalBlank":0,"tablesContent":[["\\u001b[33mCSS\\u001b[39m","\\u001b[33m1\\u001b[39m","\\u001b[33m0\\u001b[39m","\\u001b[33m4\\u001b[39m"],["JavaScript",1,0,1],["JSON",1,0,3],["Markdown",1,0,1]]}';

        assert.equal(dirObj, expectData);

    })
})