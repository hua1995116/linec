#!/usr/bin/env node
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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

program.version('0.1.0').option('-i, --ignore [dir]', 'ignore dir').parse(process.argv);

// console.log(program.ignore)

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
        chars: _extends({}, tableCars, {
            'top': '-',
            'top-mid': '-',
            'top-left': '-',
            'top-right': '-'
        }),
        style: _extends({}, tableStyle, {
            'head': ['magenta']
        })
    });
    var content = new Table({
        colWidths: tableColWidths,
        colAligns: tableColAligns,
        chars: _extends({}, tableCars, {
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
        chars: _extends({}, tableCars, {
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
function hanldeTable() {
    var tablesContent = [];
    var maxCount = 0;
    var maxIndex = -1;
    var totalFiles = 0;
    var totalBlank = 0;
    var totalCode = 0;
    Object.keys(langInfo).map(function (item, index) {
        if (maxCount < langInfo[item].totalLines) {
            maxCount = langInfo[item].totalLines;
            maxIndex = index;
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
        tablesContent: tablesContent
    };
}

/**
 *@desc push data into table and ouput
 */
function outputTbale() {
    var _initTable = initTable(),
        header = _initTable.header,
        content = _initTable.content,
        bottom = _initTable.bottom;

    var _hanldeTable = hanldeTable(),
        totalFiles = _hanldeTable.totalFiles,
        totalCode = _hanldeTable.totalCode,
        totalBlank = _hanldeTable.totalBlank,
        tablesContent = _hanldeTable.tablesContent;

    content.push.apply(content, _toConsumableArray(tablesContent));
    bottom.push(['SUM'.cyan, ('' + totalFiles).cyan, ('' + totalBlank).cyan, ('' + totalCode).cyan]);

    var totalTime = (new Date() - START_TIME) / 1000;
    var fileSpeed = (totalFiles / totalTime).toFixed(1);
    var lineSpeed = (totalFiles / totalTime).toFixed(1);

    console.log('T=' + totalTime + ' s', '(' + fileSpeed + ' files/s', lineSpeed + ' lines/s)');
    console.log(header.toString());
    console.log(content.toString());
    console.log(bottom.toString());
}

/**
 *@desc main entry
 */
function linec() {
    getFile(ROOTPATH);
    outputTbale();
}

linec();

module.exports = linec;