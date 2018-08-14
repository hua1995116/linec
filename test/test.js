const path = require('path');
const assert = require('chai').assert;

const {getFileData} = require('../src/linec');

describe('linec files test', () => {
    it('can linec dir', () => {
        const url = path.join(__dirname, '../example');
        console.log(url);

        const dirObj = JSON.stringify(getFileData(url));

        const expectData = '{"CSS":{"file":1,"blankLines":0,"totalLines":4,"color":"#563d7c"},"JavaScript":{"file":1,"blankLines":0,"totalLines":1,"color":"#f1e05a"},"JSON":{"file":1,"blankLines":0,"totalLines":3,"color":"#fff"},"Markdown":{"file":1,"blankLines":0,"totalLines":1,"color":"#fff"}}';

        assert.equal(dirObj, expectData);

    })
})