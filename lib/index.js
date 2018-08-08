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
        
        if(isFile) {
            const languageName = langExt[extname] || 'unkonw';
            if(languageName === 'unkonw') {
                return;
            }
            if(langInfo[languageName]) {
                langInfo[languageName].file++;
            } else {
                langInfo[languageName] = {
                    file: 1,
                    lines: 0,
                    color: langColors[languageName] || '#fff'
                }
            }
            fileCount(languageName, currentPath)
        } else if(isDir) {
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
    head: ['language', 'files', 'code']
});

Object.keys(langInfo).map(item => {
    table.push([item, langInfo[item].file, langInfo[item].lines]);
})
const totalTime = (new Date() - startTime) / 1000
console.log(`T=${totalTime} s`)
console.log(table.toString())
