/**
 * 删除文件或文件夹（支持递归删除）。
 * @author youngoat@163.com
 */

'use strict';

var MODULE_REQUIRE
	, child_process = require('child_process')
	, fs = require('fs')
	, path = require('path')
	;

var CORE = require('../core');
var mkdir = require('./mkdir');

module.exports = function(target, options) {
	options = CORE.expand({
		// 默认：强制删除不为空的目录。
		force: true
	}, options);

	if (!fs.existsSync(target)) throw [ 1, 'Target does not exist: ' + target ];

	var foo = function(pathname) {
		if (CORE.isDir(pathname)) {
			var items = fs.readdirSync(pathname);

			if (items.length && !options.force) throw [ 2, 'Target is an directory and not empty: ' + target ];

			// 删除目录内容。
			items.forEach(function(name) {
				foo(path.join(pathname, name));
			})

			// 删除目录。
			fs.rmdirSync(pathname);
		}
		else {
			// 删除文件。
			fs.unlinkSync(pathname);
		}
	};

	foo(target);
};
