const fs = require('fs');
const path = require('path');
const ignore = require('ignore');
const ROOTPATH = process.cwd();

/**
 * @param {path} cPath
 */
function handleIgnode(cPath, ignoreList) {
    const relativePath = cPath.replace(ROOTPATH, '');
    const ig = ignore().add(ignoreList);
    return ig.ignores(relativePath);
}

/**
 * @param {Array} list
 */
function filterData(list) {
    return list.filter(item => (item.trim() !== '' && item.trim() !== '\r' && !item.startsWith('#')));
}

module.exports = handleIgnode;
