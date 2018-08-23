const fs = require('fs');
const path = require('path');
const ignore = require('ignore');
const ROOTPATH = process.cwd();

/**
 * @param {path} cPath
 */
function handleIgnode(cPath, dir) {
    try {
        const currentPath = path.join(ROOTPATH, '.gitignore');
        const fileData = fs.readFileSync(currentPath, 'utf-8');
        const ignoreList = fileData.split('\n');
        const filterList = filterData(ignoreList).concat(dir);
        const ig = ignore().add(filterList);
        return ig.ignores(cPath);
    } catch (e) {
        const ig = ignore().add(dir);
        return ig.ignores(cPath);
    }
}

/**
 * @param {Array} list
 */
function filterData(list) {
    return list.filter(item => (item.trim() !== '' && item.trim() !== '\r' && !item.startsWith('#')));
}

module.exports = handleIgnode;
