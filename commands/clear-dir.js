/**
 * 删除文件或文件夹（支持递归删除）。
 * @author jiangjing@ctrip.com
 */

'use strict';

var MODULE_REQUIRE
	, child_process = require('child_process')
	, fs = require('fs')
	, path = require('path')
	;

var CORE = require('../core');
var rm = require('./rm');

module.exports = function(target) {
	if (!fs.existsSync(target)) throw [ 1, 'Target does not exist: ' + target ];
	if (!CORE.isDir(target)) throw [ 2, 'Target is not a valid directory: ' + target ];

	fs.readdirSync(target).forEach(function(name) {
		var pathname = path.join(target, name);
		rm(pathname, { force: true });
	});
};
