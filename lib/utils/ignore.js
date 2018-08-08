const fs = require('fs');
const path = require('path');
const ignore = require('ignore');
const ROOTPATH = process.cwd();

/**
 * @param {path} cPath
 */
function handleIgnode(cPath) {
    try {
        const currentPath = path.join(ROOTPATH, '.gitignore');
        const fileData = fs.readFileSync(currentPath, 'utf-8');
        const ignoreList = fileData.split('\n');
        const filterList = filterData(ignoreList);
        const ig = ignore().add(filterList);
        return ig.ignores(cPath);
    } catch (e) {
        return false;
    }
}

/**
 * @param {Array} list
 */
function filterData(list) {
    return list.filter(item => (item.trim() !== '' && item.trim() !== '\r' && !item.startsWith('#')));
}

module.exports = handleIgnode;
