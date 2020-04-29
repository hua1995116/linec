'use strict';

var fs = require('fs');
var path = require('path');
var ignore = require('ignore');
var ROOTPATH = process.cwd();

/**
 * @param {path} cPath
 */
function handleIgnode(cPath, ignoreList) {
  var relativePath = cPath.replace(ROOTPATH, '');
  var ig = ignore().add(ignoreList);
  return ig.ignores(relativePath);
}

/**
 * @param {Array} list
 */
function filterData(list) {
  return list.filter(function (item) {
    return item.trim() !== '' && item.trim() !== '\r' && !item.startsWith('#');
  });
}

module.exports = handleIgnode;