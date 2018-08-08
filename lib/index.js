const path = require('path');
const fs = require('fs');
const program = require('commander');
const Table = require('cli-table');
const colors = require('colors');
const langColors = require('./static/colors');
const langExt = require('./static/ext');
const ROOTPATH = process.cwd();
const langInfo = {};


program
    .version('0.1.0')
    .option('-i, --ignore [dir]', 'ignore dir')
    .parse(process.argv);

// console.log(program.ignore)
const startTime = new Date();
/**
 * @param {String} dirPath
 * @returns {Object}
 */
function getFile(dirPath) {

    const files = fs.readdirSync(dirPath);

    files.forEach((item) => {

        const extname = path.extname(item).replace('\.', ''),
            currentPath = path.join(dirPath, item),
            isFile = fs.statSync(currentPath).isFile(),
            isDir = fs.statSync(currentPath).isDirectory();

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

getFile(ROOTPATH);

function fileCount(name, currentPath) {
    let lines = fs.readFileSync(currentPath, 'utf-8').split('\n');
    lines = lines.filter(item => (item.trim() !== '' && item.trim() !== '\r'));
    langInfo[name].lines += lines.length;
}

// console.log(JSON.stringify(langInfo));

const table = new Table({
    colWidths: [20, 10, 10],
    colAligns: ['left', 'right', 'right'],
    chars: {
        'top': '-',
        'top-mid': '-',
        'top-left': '-',
        'top-right': '-',
        'bottom': '-',
        'bottom-mid': '-',
        'bottom-left': '-',
        'bottom-right': '-',
        'left': '',
        'left-mid': '',
        'mid': '',
        'mid-mid': '',
        'right': '',
        'right-mid': '',
        'middle': ' '
    },
    style: {
        'padding-left': 0,
        'padding-right': 0,
        'border': ['white'],
        'head': ['white']
    }
});

const header = new Table({
    colWidths: [20, 10, 10],
    head: ['language', 'files', 'code'],
    colAligns: ['left', 'right', 'right'],
    chars: {
        'top': '-',
        'top-mid': '-',
        'top-left': '-',
        'top-right': '-',
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
        'middle': ' '
    },
    style: {
        'padding-left': 0,
        'padding-right': 0,
        'border': ['white'],
        'head': ['magenta']
    }
})

const bottom = new Table({
    colWidths: [20, 10, 10],
    colAligns: ['left', 'right', 'right'],
    chars: {
        'top': '',
        'top-mid': '',
        'top-left': '',
        'top-right': '',
        'bottom': '-',
        'bottom-mid': '-',
        'bottom-left': '-',
        'bottom-right': '-',
        'left': '',
        'left-mid': '',
        'mid': '',
        'mid-mid': '',
        'right': '',
        'right-mid': '',
        'middle': ' '
    },
    style: {
        'padding-left': 0,
        'padding-right': 0,
        'border': ['white'],
        'head': ['white']
    }
})

const tablesContent = [];
let maxCount = 0;
let maxIndex = -1;
let totalFiles = 0;
let totalCode = 0;
Object.keys(langInfo).map((item, index) => {
    if(maxCount < langInfo[item].lines) {
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
table.push(...tablesContent);
const totalTime = (new Date() - startTime) / 1000;

bottom.push(['SUM'.cyan, `${totalFiles}`.cyan, `${totalCode}`.cyan]);

console.log(`T=${totalTime} s`)
console.log(header.toString())
console.log(table.toString())
console.log(bottom.toString())
