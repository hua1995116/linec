#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const program = require('commander');
const Table = require('cli-table');
const colors = require('colors');
const langColors = require('./static/colors');
const langExt = require('./static/ext');
const ignoreFilter = require('./utils/ignore');
const ROOTPATH = process.cwd();
const START_TIME = new Date();
const langInfo = {};

const tableColWidths = [20, 10, 10];
const tableColAligns = ['left', 'right', 'right'];
const tableStyle = {
    'padding-left': 0,
    'padding-right': 0,
    'border': ['white'],
    'head': ['white']
}
const tableCars = {
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
}

program
    .version('0.1.0')
    .option('-i, --ignore [dir]', 'ignore dir')
    .parse(process.argv);

// console.log(program.ignore)

/**
 * @param {path} dirPath
 */
function getFile(dirPath) {

    const files = fs.readdirSync(dirPath);

    files.forEach((item) => {

        const extname = path.extname(item).replace('\.', ''),
            currentPath = path.join(dirPath, item),
            isFile = fs.statSync(currentPath).isFile(),
            isDir = fs.statSync(currentPath).isDirectory();
        if(ignoreFilter(currentPath)) {
            return;
        }
        if (isFile) {
            const languageName = langExt[extname] || 'unkonw';
            if (languageName === 'unkonw') {
                return;
            }
            if (langInfo[languageName]) {
                langInfo[languageName].file++;
            } else {
                langInfo[languageName] = {
                    file: 1,
                    lines: 0,
                    color: langColors[languageName] || '#fff'
                }
            }
            fileCount(languageName, currentPath)
        } else if (isDir) {
            getFile(currentPath);
        }
    })
}

/**
 * @desc
 * @param {String} name
 * @param {path} currentPath
 */
function fileCount(name, currentPath) {
    let lines = fs.readFileSync(currentPath, 'utf-8').split('\n');
    lines = lines.filter(item => (item.trim() !== '' && item.trim() !== '\r'));
    langInfo[name].lines += lines.length;
}

/**
 * @desc init table setting
 */
function initTable() {
    const header = new Table({
        colWidths: tableColWidths,
        colAligns: tableColAligns,
        head: ['language', 'files', 'code'],
        chars: {
            ...tableCars,
            'top': '-',
            'top-mid': '-',
            'top-left': '-',
            'top-right': '-',
        },
        style: {
            ...tableStyle,
            'head': ['magenta']
        }
    })
    const content = new Table({
        colWidths: tableColWidths,
        colAligns: tableColAligns,
        chars: {
            ...tableCars,
            'top': '-',
            'top-mid': '-',
            'top-left': '-',
            'top-right': '-',
            'bottom': '-',
            'bottom-mid': '-',
            'bottom-left': '-',
            'bottom-right': '-',
        },
        style: tableStyle
    });
    const bottom = new Table({
        colWidths: tableColWidths,
        colAligns: tableColAligns,
        chars: {
            ...tableCars,
            'bottom': '-',
            'bottom-mid': '-',
            'bottom-left': '-',
            'bottom-right': '-',
        },
        style: tableStyle
    })
    return {
        header,
        content,
        bottom
    }
}

/**
 * @desc handle max lines and push line into lines
 */
function hanldeTable() {
    const tablesContent = [];
    let maxCount = 0;
    let maxIndex = -1;
    let totalFiles = 0;
    let totalCode = 0;
    Object.keys(langInfo).map((item, index) => {
        if (maxCount < langInfo[item].lines) {
            maxCount = langInfo[item].lines;
            maxIndex = index;
        }
        totalFiles += langInfo[item].file;
        totalCode += langInfo[item].lines;
        tablesContent.push([item, langInfo[item].file, langInfo[item].lines]);
    })
    const maxLine = tablesContent[maxIndex];
    const colorMax = [maxLine[0].yellow, `${maxLine[1]}`.yellow, `${maxLine[2]}`.yellow]
    tablesContent.splice(maxIndex, 1, colorMax);
    return {
        totalFiles,
        totalCode,
        tablesContent
    }
}

/**
 *@desc push data into table and ouput
 */
function outputTbale() {
    const {
        header,
        content,
        bottom
    } = initTable();

    const {
        totalFiles,
        totalCode,
        tablesContent
    } = hanldeTable();

    content.push(...tablesContent);
    bottom.push(['SUM'.cyan, `${totalFiles}`.cyan, `${totalCode}`.cyan]);

    const totalTime = (new Date() - START_TIME) / 1000;
    const fileSpeed = (totalFiles/totalTime).toFixed(1);
    const lineSpeed = (totalFiles/totalTime).toFixed(1);

    console.log(`T=${totalTime} s`, `(${fileSpeed} files/s`, `${lineSpeed} lines/s)`)
    console.log(header.toString())
    console.log(content.toString())
    console.log(bottom.toString())
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