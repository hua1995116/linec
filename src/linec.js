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
let FILE_COUNT = 0;

const tableColWidths = [15, 10, 10, 10];
const tableColAligns = ['left', 'right', 'right', 'right'];
const tableHead = ['language', 'files', 'blank', 'code']
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
    .option('-p, --path [dir]', 'ignore dir')
    .option('-o, --output', 'ouput html')
    .parse(process.argv);

// console.log(program.html)

class StreamLoad {
    constructor(option) {
        this.stream = option.stream;
        this.text = option.text;
        this.clearLine = 0;
    }
    setValue(value) {
        this.text = value;
        this.render();
    }
    render() {
        this.clear();
        this.clearLine++;
        this.stream.write(`read ${this.text} file\n`);
    }
    clear() {
        if (!this.stream.isTTY) {
            return this;
        }

        for (let i = 0; i < this.clearLine; i++) {
            this.stream.moveCursor(0, -1);
            this.stream.clearLine();
            this.stream.cursorTo(0);
        }
        this.clearLine = 0;
    }
}

const progress = new StreamLoad({
    stream: process.stderr,
    text: 0
})

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
        if (ignoreFilter(currentPath)) {
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
                    blankLines: 0,
                    totalLines: 0,
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
    FILE_COUNT++;
    if (FILE_COUNT % 100 === 0) {
        progress.setValue(FILE_COUNT);
    }
    const lines = fs.readFileSync(currentPath, 'utf-8').split('\n');
    const rmLines = lines.filter(item => (item.trim() !== '' && item.trim() !== '\r'));
    const blankLines = lines.length - rmLines.length;
    langInfo[name].totalLines += lines.length;
    langInfo[name].blankLines += blankLines;
}

/**
 * @desc init table setting
 */
function initTable() {
    const header = new Table({
        colWidths: tableColWidths,
        colAligns: tableColAligns,
        head: tableHead,
        chars: Object.assign({}, tableCars, {
            'top': '-',
            'top-mid': '-',
            'top-left': '-',
            'top-right': '-',
        }),
        style: Object.assign({}, tableStyle, {
            'head': ['magenta']
        })
    })
    const content = new Table({
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
            'bottom-right': '-',
        }),
        style: tableStyle
    });
    const bottom = new Table({
        colWidths: tableColWidths,
        colAligns: tableColAligns,
        chars: Object.assign({}, tableCars, {
            'bottom': '-',
            'bottom-mid': '-',
            'bottom-left': '-',
            'bottom-right': '-',
        }),
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
function hanldeTable(langInfo) {
    const tablesContent = [];
    let maxCount = 0;
    let maxIndex = -1;
    let maxName = null;
    let totalFiles = 0;
    let totalBlank = 0;
    let totalCode = 0;
    Object.keys(langInfo).map((item, index) => {
        if (maxCount < langInfo[item].totalLines) {
            maxCount = langInfo[item].totalLines;
            maxIndex = index;
            maxName = item;
        }
        totalFiles += langInfo[item].file;
        totalBlank += langInfo[item].blankLines;
        totalCode += langInfo[item].totalLines;
        tablesContent.push([item, langInfo[item].file, langInfo[item].blankLines, langInfo[item].totalLines]);
    })
    const maxLine = tablesContent[maxIndex];
    const colorMax = [maxLine[0].yellow, `${maxLine[1]}`.yellow, `${maxLine[2]}`.yellow, `${maxLine[3]}`.yellow]
    tablesContent.splice(maxIndex, 1, colorMax);
    return {
        totalFiles,
        totalCode,
        totalBlank,
        tablesContent,
        maxName
    }
}

/**
 *@desc push data into table and ouput
 */
function outputTbale(totalData) {
    const {
        header,
        content,
        bottom
    } = initTable();

    const {
        totalFiles,
        totalCode,
        totalBlank,
        tablesContent
    } = totalData;
    content.push(...tablesContent);
    bottom.push(['SUM'.cyan, `${totalFiles}`.cyan, `${totalBlank}`.cyan, `${totalCode}`.cyan]);

    const {
        totalTime,
        fileSpeed,
        lineSpeed
    } = handleSpeed(totalFiles);

    progress.clear();

    console.log(`T=${totalTime} s`, `(${fileSpeed} files/s`, `${lineSpeed} lines/s)`)
    console.log(header.toString())
    console.log(content.toString())
    console.log(bottom.toString())
}

function handleSpeed(totalFiles) {
    const totalTime = (new Date() - START_TIME) / 1000;
    const fileSpeed = (totalFiles / totalTime).toFixed(1);
    const lineSpeed = (totalFiles / totalTime).toFixed(1);
    return {
        totalTime,
        fileSpeed,
        lineSpeed
    }
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
    const {
        totalFiles,
        totalCode,
        totalBlank,
        maxName
    } = totalData;

    const {
        totalTime,
        fileSpeed,
        lineSpeed
    } = handleSpeed(totalFiles);
    const speed = `<div class="speed">T=${totalTime} s, (${fileSpeed} files/s, ${lineSpeed} lines/s)</div>`
    const header = `<div class="header">
                        <div class="col col-4">language</div><div class="col col-2">files</div><div class="col col-2">blank</div><div class="col col-2">code</div>
                    </div>`;
    let body = `<div class="body">`;

    Object.keys(fileData).map(item => {
        const languageItem = fileData[item];
        let tr = '';
        if(item === maxName) {
            tr += `<div class="tr tr-max" style="color: ${languageItem.color}">`;
        } else {
            tr += `<div class="tr" style="color: ${languageItem.color}">`;
        }
        tr += `<div class="col col-4"">${item}</div><div class="col col-2">${languageItem.file}</div><div class="col col-2">${languageItem.blankLines}</div><div class="col col-2">${languageItem.totalLines}</div></div>`;
        body += tr;
    })
    body += '</div>'

    const bottom = `<div class="bottom">
                        <div class="col col-4">SUM</div><div class="col col-2">${totalFiles}</div><div class="col col-2">${totalBlank}</div><div class="col col-2">${totalCode}</div>
                    </div>`;
    const readData = fs.readFileSync('./src/static/template.html').toString();
    const ouputHtml = readData.replace('$',speed + header + body + bottom )
    fs.writeFileSync(`${process.cwd()}/output.html`, ouputHtml);
}

/**
 *@desc main entry
 */
function linec() {
    const fileData = getFileData(ROOTPATH);
    const totalData = hanldeTable(fileData);
    if(program.html) {
        outputHtml(fileData, totalData);
    } else {
        outputTbale(totalData);
    }
}

module.exports = {
    getFileData,
    hanldeTable,
    linec
};