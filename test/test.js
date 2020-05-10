const path = require('path');
const assert = require('chai').assert;

const {linec, getFileData, hanldeTable} = require('../src/linec');

describe('linec files test', () => {
    it('can linec html', () => {
        const url = path.join(__dirname, '../example');

        const dirObj = linec('html', url)

        const expectData = '<div class="header"><div class="col col-2">language</div><div class="col col-2">files</div><div class="col col-2">blank</div><div class="col col-2">comments</div><div class="col col-2">code</div></div><div class="body"><div class="tr tr-max" style="color: #563d7c"><div class="col col-2"">CSS</div><div class="col col-2">1</div><div class="col col-2">0</div><div class="col col-2">0</div><div class="col col-2">4</div></div><div class="tr" style="color: #f1e05a"><div class="col col-2"">JavaScript</div><div class="col col-2">1</div><div class="col col-2">1</div><div class="col col-2">2</div><div class="col col-2">3</div></div><div class="tr" style="color: #fff"><div class="col col-2"">JSON</div><div class="col col-2">1</div><div class="col col-2">0</div><div class="col col-2">0</div><div class="col col-2">3</div></div><div class="tr" style="color: #fff"><div class="col col-2"">Markdown</div><div class="col col-2">1</div><div class="col col-2">0</div><div class="col col-2">0</div><div class="col col-2">1</div></div></div><div class="bottom"><div class="col col-2">SUM</div><div class="col col-2">4</div><div class="col col-2">1</div><div class="col col-2">2</div><div class="col col-2">11</div></div>';

        assert.equal(dirObj, expectData);

    })

    it('can linec table', () => {
        const url = path.join(__dirname, '../example');

        const dirObj = JSON.stringify(linec('table', url));

        const expectData = JSON.stringify([["\u001b[33mCSS\u001b[39m","\u001b[33m1\u001b[39m","\u001b[33m0\u001b[39m","\u001b[33m0\u001b[39m","\u001b[33m4\u001b[39m"],["JavaScript",1,1,2,3],["JSON",1,0,0,3],["Markdown",1,0,0,1]]);

        assert.equal(dirObj, expectData);

    })
})
