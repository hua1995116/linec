const path = require('path');
const fs = require('fs');
const program = require('commander');
const Table = require('cli-table');
const colors = require('colors');
const logSymbols = require('log-symbols');
const langColors = require('./static/colors');
const langExt = require('./static/ext');
const ignoreFilter = require('./utils/ignore');
let ROOTPATH = process.cwd();
const START_TIME = new Date();
let TYPE = 'table';
let FILE_COUNT = 0;
const filterCustom = [];
const suffixList = [];

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
    .option('-i, --ignore [path] | List', `ignore path | <example> linec -i './dist'` )
    .option('-p, --path [path]', `linec path | <example> linec -p './dist'`)
    .option('-s, --suffix [name] | List', `linec name | <example> linec -s '.js'`)
    .option('-o, --output', 'ouput html | <example> linec -o')
    .parse(process.argv);

if(program.output) {
    TYPE = 'html';
}

if(program.suffix) {
    try {
        const list = program.suffix.split(',');
        suffixList.push(...list);
    } catch(e) {
        console.log(logSymbols.error, `linec -s <suffix> must have params'`.red);
        process.exit(0);
    }
}

if(program.path) {
    ROOTPATH = program.path;
    if(typeof ROOTPATH === 'boolean') {
        console.log(logSymbols.error, 'linec -p <path/file> must have params'.red);
        process.exit(0);
    }
}

if(program.ignore) {
    try {
        const dirList = program.ignore.split(',');
        console.log(dirList)
        filterCustom.push(...dirList);
    } catch(e) {
        console.log(logSymbols.error, 'linec -i <dir/file> must have params'.red);
        process.exit(0);
    }
}

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
    let maxIndex = 0;
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
    if (maxLine) {
        const colorMax = [maxLine[0].yellow, `${maxLine[1]}`.yellow, `${maxLine[2]}`.yellow, `${maxLine[3]}`.yellow]
        tablesContent.splice(maxIndex, 1, colorMax);
    }

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
    return tablesContent;
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
 * @param {path} dirPath
 */
function getFile(dirPath, langInfo) {

    const files = fs.readdirSync(dirPath);

    files.forEach((item) => {

        const extname = path.extname(item).replace('\.', ''),
            currentPath = path.join(dirPath, item),
            isFile = fs.statSync(currentPath).isFile(),
            isDir = fs.statSync(currentPath).isDirectory();
        if (ignoreFilter(currentPath, filterCustom)) {
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
            fileCount(languageName, currentPath, langInfo)
        } else if (isDir) {
            getFile(currentPath, langInfo);
        }
    })
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
    const lines = fs.readFileSync(currentPath, 'utf-8').split('\n');
    const rmLines = lines.filter(item => (item.trim() !== '' && item.trim() !== '\r'));
    const blankLines = lines.length - rmLines.length;
    langInfo[name].totalLines += lines.length;
    langInfo[name].blankLines += blankLines;
}

/**
 * @returns fileData
 */
function getFileData(targetPath) {
    const langInfo = {};
    getFile(targetPath, langInfo);
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
    const header = `<div class="header"><div class="col col-4">language</div><div class="col col-2">files</div><div class="col col-2">blank</div><div class="col col-2">code</div></div>`;
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

    const bottom = `<div class="bottom"><div class="col col-4">SUM</div><div class="col col-2">${totalFiles}</div><div class="col col-2">${totalBlank}</div><div class="col col-2">${totalCode}</div></div>`;
    const readData = fs.readFileSync(path.join(__dirname, '../src/static/template.html')).toString();
    const ouputHtml = readData.replace('$',speed + header + body + bottom )
    const outputPath = `${process.cwd()}/linec_output.html`;
    fs.writeFileSync(outputPath, ouputHtml);
    console.log(`导出成功,目录为${outputPath}`);
    return header + body + bottom;
}

/**
 *@desc main entry
 */
function linec(type, path) {
    const p = path || ROOTPATH;
    const t = type || TYPE;
    const fileData = getFileData(p);
    const totalData = hanldeTable(fileData);
    let output = null;
    if(t === 'html') {
        output = outputHtml(fileData, totalData);
    } else if(t === 'table') {
        output = outputTbale(totalData);
    }
    return output;
}

module.exports = {
    getFileData,
    hanldeTable,
    linec
};