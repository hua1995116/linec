'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var path = require('path');
var fs = require('fs');
var program = require('commander');
var Table = require('cli-table');
var colors = require('colors');
var logSymbols = require('log-symbols');
var langColors = require('./static/colors');
var langExt = require('./static/ext');
var commentParser = require('common-comment-parser').default;
var ignoreFilter = require('./utils/ignore');
var ROOTPATH = process.cwd();
var START_TIME = new Date();
var TYPE = 'table';
var FILE_COUNT = 0;
var filterCustom = [];
var suffixList = [];

var tableColWidths = [15, 10, 10, 10, 10];
var tableColAligns = ['left', 'right', 'right', 'right', 'right'];
var tableHead = ['language', 'files', 'blank', 'comments', 'code'];
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

program.version('0.1.0').option('-i, --ignore [path] | List', 'ignore path | <example> linec -i \'./dist\'').option('-p, --path [path]', 'linec path | <example> linec -p \'./dist\'').option('-s, --suffix [name] | List', 'linec name | <example> linec -s \'.js\'').option('-o, --output', 'ouput html | <example> linec -o').parse(process.argv);

if (program.output) {
    TYPE = 'html';
}

if (program.suffix) {
    try {
        var list = program.suffix.split(',');
        suffixList.push.apply(suffixList, _toConsumableArray(list));
    } catch (e) {
        console.log(logSymbols.error, 'linec -s <suffix> must have params\''.red);
        process.exit(0);
    }
}

if (program.path) {
    ROOTPATH = program.path;
    if (typeof ROOTPATH === 'boolean') {
        console.log(logSymbols.error, 'linec -p <path/file> must have params'.red);
        process.exit(0);
    }
}

if (program.ignore) {
    try {
        var dirList = program.ignore.split(',');
        console.log(dirList);
        filterCustom.push.apply(filterCustom, _toConsumableArray(dirList));
    } catch (e) {
        console.log(logSymbols.error, 'linec -i <dir/file> must have params'.red);
        process.exit(0);
    }
}

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
    var maxIndex = 0;
    var maxName = null;
    var totalFiles = 0;
    var totalBlank = 0;
    var totalCode = 0;
    var totalComments = 0;
    console.log(langInfo);
    Object.keys(langInfo).map(function (item, index) {
        if (maxCount < langInfo[item].totalLines) {
            maxCount = langInfo[item].totalLines;
            maxIndex = index;
            maxName = item;
        }
        totalFiles += langInfo[item].file;
        totalBlank += langInfo[item].blankLines;
        totalCode += langInfo[item].totalLines;
        totalComments += langInfo[item].commentLines;
        tablesContent.push([item, langInfo[item].file, langInfo[item].blankLines, langInfo[item].commentLines, langInfo[item].totalLines]);
    });
    var maxLine = tablesContent[maxIndex];
    if (maxLine) {
        var colorMax = [maxLine[0].yellow, ('' + maxLine[1]).yellow, ('' + maxLine[2]).yellow, ('' + maxLine[3]).yellow, ('' + maxLine[4]).yellow];
        tablesContent.splice(maxIndex, 1, colorMax);
    }

    return {
        totalFiles: totalFiles,
        totalCode: totalCode,
        totalBlank: totalBlank,
        totalComments: totalComments,
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
        totalComments = totalData.totalComments,
        tablesContent = totalData.tablesContent;

    content.push.apply(content, _toConsumableArray(tablesContent));
    bottom.push(['SUM'.cyan, ('' + totalFiles).cyan, ('' + totalBlank).cyan, ('' + totalComments).cyan, ('' + totalCode).cyan]);

    var _handleSpeed = handleSpeed(totalFiles),
        totalTime = _handleSpeed.totalTime,
        fileSpeed = _handleSpeed.fileSpeed,
        lineSpeed = _handleSpeed.lineSpeed;

    progress.clear();

    console.log('T=' + totalTime + ' s', '(' + fileSpeed + ' files/s', lineSpeed + ' lines/s)');
    console.log(header.toString());
    console.log(content.toString());
    console.log(bottom.toString());
    return tablesContent;
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
 * @param {path} dirPath
 */
function getFile(dirPath, langInfo) {

    var files = fs.readdirSync(dirPath);

    files.forEach(function (item) {
        var extname = path.extname(item).replace('\.', ''),
            currentPath = path.join(dirPath, item);
        var isFile = void 0,
            isDir = void 0;
        try {
            isFile = fs.statSync(currentPath).isFile(), isDir = fs.statSync(currentPath).isDirectory();
        } catch (e) {
            return;
        }
        if (ignoreFilter(currentPath, filterCustom)) {
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
                    commentLines: 0,
                    color: langColors[languageName] || '#fff'
                };
            }
            fileCount(languageName, currentPath, langInfo);
        } else if (isDir) {
            getFile(currentPath, langInfo);
        }
    });
}

/**
 * @desc
 * @param {String} name
 * @param {path} currentPath
 */
function fileCount(name, currentPath, langInfo) {
    FILE_COUNT++;
    if (FILE_COUNT % 100 === 0) {
        progress.setValue(FILE_COUNT);
    }
    var context = fs.readFileSync(currentPath, 'utf-8');
    var ext = path.extname(currentPath).replace('.', '');
    var lines = context.split(/(\n|\r)/);
    var rmLines = lines.filter(function (item) {
        return item.trim() !== '' && item.trim() !== '\r';
    });
    var commentLines = commentParser(context, ext).reduce(function (prev, current) {
        return prev + current.commentLine;
    }, 0);
    var blankLines = lines.length - rmLines.length;
    langInfo[name].totalLines += lines.length;
    langInfo[name].blankLines += blankLines;
    langInfo[name].commentLines += commentLines;
}

/**
 * @returns fileData
 */
function getFileData(targetPath) {
    var langInfo = {};
    getFile(targetPath, langInfo);
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
        totalComments = totalData.totalComments,
        maxName = totalData.maxName;

    var _handleSpeed2 = handleSpeed(totalFiles),
        totalTime = _handleSpeed2.totalTime,
        fileSpeed = _handleSpeed2.fileSpeed,
        lineSpeed = _handleSpeed2.lineSpeed;

    var speed = '<div class="speed">T=' + totalTime + ' s, (' + fileSpeed + ' files/s, ' + lineSpeed + ' lines/s)</div>';
    var header = '<div class="header"><div class="col col-2">language</div><div class="col col-2">files</div><div class="col col-2">blank</div><div class="col col-2">comments</div><div class="col col-2">code</div></div>';
    var body = '<div class="body">';

    Object.keys(fileData).map(function (item) {
        var languageItem = fileData[item];
        var tr = '';
        if (item === maxName) {
            tr += '<div class="tr tr-max" style="color: ' + languageItem.color + '">';
        } else {
            tr += '<div class="tr" style="color: ' + languageItem.color + '">';
        }
        tr += '<div class="col col-2"">' + item + '</div><div class="col col-2">' + languageItem.file + '</div><div class="col col-2">' + languageItem.blankLines + '</div><div class="col col-2">' + languageItem.commentLines + '</div><div class="col col-2">' + languageItem.totalLines + '</div></div>';
        body += tr;
    });
    body += '</div>';

    var bottom = '<div class="bottom"><div class="col col-2">SUM</div><div class="col col-2">' + totalFiles + '</div><div class="col col-2">' + totalBlank + '</div><div class="col col-2">' + totalComments + '</div><div class="col col-2">' + totalCode + '</div></div>';
    var readData = fs.readFileSync(path.join(__dirname, '../src/static/template.html')).toString();
    var ouputHtml = readData.replace('$', speed + header + body + bottom);
    var outputPath = process.cwd() + '/linec_output.html';
    fs.writeFileSync(outputPath, ouputHtml);
    console.log('\u5BFC\u51FA\u6210\u529F,\u76EE\u5F55\u4E3A' + outputPath);
    return header + body + bottom;
}

/**
 *@desc main entry
 */
function linec(type, cpath) {
    var p = cpath || ROOTPATH;
    var t = type || TYPE;
    try {
        var currentPath = path.join(p, '.gitignore');
        var _fileData = fs.readFileSync(currentPath, 'utf-8');
        var ignoreList = _fileData.split('\n');
        filterCustom.push.apply(filterCustom, _toConsumableArray(ignoreList));
    } catch (e) {}

    var fileData = getFileData(p);
    var totalData = hanldeTable(fileData);
    var output = null;
    if (t === 'html') {
        output = outputHtml(fileData, totalData);
    } else if (t === 'table') {
        output = outputTbale(totalData);
    }
    return output;
}

module.exports = {
    getFileData: getFileData,
    hanldeTable: hanldeTable,
    linec: linec
};