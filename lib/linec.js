'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');
var fs = require('fs');
var program = require('commander');
var Table = require('cli-table');
var colors = require('colors');
var langColors = require('./static/colors');
var langExt = require('./static/ext');
var ignoreFilter = require('./utils/ignore');
var ROOTPATH = process.cwd();
var START_TIME = new Date();
var langInfo = {};
var FILE_COUNT = 0;

var tableColWidths = [15, 10, 10, 10];
var tableColAligns = ['left', 'right', 'right', 'right'];
var tableHead = ['language', 'files', 'blank', 'code'];
var tableStyle = {
    'padding-left': 0,
    'padding-right': 0,
    'border': ['white'],
    'head': ['white']
};
var tableCars = {
    'top': '',
    'top-mid': '',
    'top-left': '',
    'top-right': '',
    'bottom': '',
    'bottom-mid': '',
    'bottom-left': '',
    'bottom-right': '',
    'left': '',
    'left-mid': '',
    'mid': '',
    'mid-mid': '',
    'right': '',
    'right-mid': '',
    'middle': ''
};

program.version('0.1.0').option('-i, --ignore [dir]', 'ignore dir').option('-p, --path [dir]', 'ignore dir').option('-o, --output', 'ouput html').parse(process.argv);

// console.log(program.html)

var StreamLoad = function () {
    function StreamLoad(option) {
        _classCallCheck(this, StreamLoad);

        this.stream = option.stream;
        this.text = option.text;
        this.clearLine = 0;
    }

    _createClass(StreamLoad, [{
        key: 'setValue',
        value: function setValue(value) {
            this.text = value;
            this.render();
        }
    }, {
        key: 'render',
        value: function render() {
            this.clear();
            this.clearLine++;
            this.stream.write('read ' + this.text + ' file\n');
        }
    }, {
        key: 'clear',
        value: function clear() {
            if (!this.stream.isTTY) {
                return this;
            }

            for (var i = 0; i < this.clearLine; i++) {
                this.stream.moveCursor(0, -1);
                this.stream.clearLine();
                this.stream.cursorTo(0);
            }
            this.clearLine = 0;
        }
    }]);

    return StreamLoad;
}();

var progress = new StreamLoad({
    stream: process.stderr,
    text: 0
});

/**
 * @param {path} dirPath
 */
function getFile(dirPath) {

    var files = fs.readdirSync(dirPath);

    files.forEach(function (item) {

        var extname = path.extname(item).replace('\.', ''),
            currentPath = path.join(dirPath, item),
            isFile = fs.statSync(currentPath).isFile(),
            isDir = fs.statSync(currentPath).isDirectory();
        if (ignoreFilter(currentPath)) {
            return;
        }
        if (isFile) {
            var languageName = langExt[extname] || 'unkonw';
            if (languageName === 'unkonw') {
                return;
            }
            if (langInfo[languageName]) {
                langInfo[languageName].file++;
            } else {
                langInfo[languageName] = {
                    file: 1,
                    blankLines: 0,
                    totalLines: 0,
                    color: langColors[languageName] || '#fff'
                };
            }
            fileCount(languageName, currentPath);
        } else if (isDir) {
            getFile(currentPath);
        }
    });
}

/**
 * @desc
 * @param {String} name
 * @param {path} currentPath
 */
function fileCount(name, currentPath) {
    FILE_COUNT++;
    if (FILE_COUNT % 100 === 0) {
        progress.setValue(FILE_COUNT);
    }
    var lines = fs.readFileSync(currentPath, 'utf-8').split('\n');
    var rmLines = lines.filter(function (item) {
        return item.trim() !== '' && item.trim() !== '\r';
    });
    var blankLines = lines.length - rmLines.length;
    langInfo[name].totalLines += lines.length;
    langInfo[name].blankLines += blankLines;
}

/**
 * @desc init table setting
 */
function initTable() {
    var header = new Table({
        colWidths: tableColWidths,
        colAligns: tableColAligns,
        head: tableHead,
        chars: Object.assign({}, tableCars, {
            'top': '-',
            'top-mid': '-',
            'top-left': '-',
            'top-right': '-'
        }),
        style: Object.assign({}, tableStyle, {
            'head': ['magenta']
        })
    });
    var content = new Table({
        colWidths: tableColWidths,
        colAligns: tableColAligns,
        chars: Object.assign({}, tableCars, {
            'top': '-',
            'top-mid': '-',
            'top-left': '-',
            'top-right': '-',
            'bottom': '-',
            'bottom-mid': '-',
            'bottom-left': '-',
            'bottom-right': '-'
        }),
        style: tableStyle
    });
    var bottom = new Table({
        colWidths: tableColWidths,
        colAligns: tableColAligns,
        chars: Object.assign({}, tableCars, {
            'bottom': '-',
            'bottom-mid': '-',
            'bottom-left': '-',
            'bottom-right': '-'
        }),
        style: tableStyle
    });
    return {
        header: header,
        content: content,
        bottom: bottom
    };
}

/**
 * @desc handle max lines and push line into lines
 */
function hanldeTable(langInfo) {
    var tablesContent = [];
    var maxCount = 0;
    var maxIndex = -1;
    var maxName = null;
    var totalFiles = 0;
    var totalBlank = 0;
    var totalCode = 0;
    Object.keys(langInfo).map(function (item, index) {
        if (maxCount < langInfo[item].totalLines) {
            maxCount = langInfo[item].totalLines;
            maxIndex = index;
            maxName = item;
        }
        totalFiles += langInfo[item].file;
        totalBlank += langInfo[item].blankLines;
        totalCode += langInfo[item].totalLines;
        tablesContent.push([item, langInfo[item].file, langInfo[item].blankLines, langInfo[item].totalLines]);
    });
    var maxLine = tablesContent[maxIndex];
    var colorMax = [maxLine[0].yellow, ('' + maxLine[1]).yellow, ('' + maxLine[2]).yellow, ('' + maxLine[3]).yellow];
    tablesContent.splice(maxIndex, 1, colorMax);
    return {
        totalFiles: totalFiles,
        totalCode: totalCode,
        totalBlank: totalBlank,
        tablesContent: tablesContent,
        maxName: maxName
    };
}

/**
 *@desc push data into table and ouput
 */
function outputTbale(totalData) {
    var _initTable = initTable(),
        header = _initTable.header,
        content = _initTable.content,
        bottom = _initTable.bottom;

    var totalFiles = totalData.totalFiles,
        totalCode = totalData.totalCode,
        totalBlank = totalData.totalBlank,
        tablesContent = totalData.tablesContent;

    content.push.apply(content, _toConsumableArray(tablesContent));
    bottom.push(['SUM'.cyan, ('' + totalFiles).cyan, ('' + totalBlank).cyan, ('' + totalCode).cyan]);

    var _handleSpeed = handleSpeed(totalFiles),
        totalTime = _handleSpeed.totalTime,
        fileSpeed = _handleSpeed.fileSpeed,
        lineSpeed = _handleSpeed.lineSpeed;

    progress.clear();

    console.log('T=' + totalTime + ' s', '(' + fileSpeed + ' files/s', lineSpeed + ' lines/s)');
    console.log(header.toString());
    console.log(content.toString());
    console.log(bottom.toString());
}

function handleSpeed(totalFiles) {
    var totalTime = (new Date() - START_TIME) / 1000;
    var fileSpeed = (totalFiles / totalTime).toFixed(1);
    var lineSpeed = (totalFiles / totalTime).toFixed(1);
    return {
        totalTime: totalTime,
        fileSpeed: fileSpeed,
        lineSpeed: lineSpeed
    };
}

/**
 * @returns fileData
 */
function getFileData(targetPath) {
    getFile(targetPath);
    return langInfo;
}

/**
 * @param {Object} fileData
 * @param {Object} totalData
 */
function outputHtml(fileData, totalData) {
    var totalFiles = totalData.totalFiles,
        totalCode = totalData.totalCode,
        totalBlank = totalData.totalBlank,
        maxName = totalData.maxName;

    var _handleSpeed2 = handleSpeed(totalFiles),
        totalTime = _handleSpeed2.totalTime,
        fileSpeed = _handleSpeed2.fileSpeed,
        lineSpeed = _handleSpeed2.lineSpeed;

    var speed = '<div class="speed">T=' + totalTime + ' s, (' + fileSpeed + ' files/s, ' + lineSpeed + ' lines/s)</div>';
    var header = '<div class="header">\n                        <div class="col col-4">language</div><div class="col col-2">files</div><div class="col col-2">blank</div><div class="col col-2">code</div>\n                    </div>';
    var body = '<div class="body">';

    Object.keys(fileData).map(function (item) {
        var languageItem = fileData[item];
        var tr = '';
        if (item === maxName) {
            tr += '<div class="tr tr-max" style="color: ' + languageItem.color + '">';
        } else {
            tr += '<div class="tr" style="color: ' + languageItem.color + '">';
        }
        tr += '<div class="col col-4"">' + item + '</div><div class="col col-2">' + languageItem.file + '</div><div class="col col-2">' + languageItem.blankLines + '</div><div class="col col-2">' + languageItem.totalLines + '</div></div>';
        body += tr;
    });
    body += '</div>';

    var bottom = '<div class="bottom">\n                        <div class="col col-4">SUM</div><div class="col col-2">' + totalFiles + '</div><div class="col col-2">' + totalBlank + '</div><div class="col col-2">' + totalCode + '</div>\n                    </div>';
    var readData = fs.readFileSync('./src/static/template.html').toString();
    var ouputHtml = readData.replace('$', speed + header + body + bottom);
    var outputPath = process.cwd() + '/linec_output.html';
    fs.writeFileSync(outputPath, ouputHtml);
    console.log('\u5BFC\u51FA\u6210\u529F,\u76EE\u5F55\u4E3A' + outputPath);
}

/**
 *@desc main entry
 */
function linec() {
    var fileData = getFileData(ROOTPATH);
    var totalData = hanldeTable(fileData);
    if (program.output) {
        outputHtml(fileData, totalData);
    } else {
        outputTbale(totalData);
    }
}

module.exports = {
    getFileData: getFileData,
    hanldeTable: hanldeTable,
    linec: linec
};