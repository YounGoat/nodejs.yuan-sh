/**
 * 提取文件夹中的所有内容至其他目录。
 * @author youngoat@163.com
 */

'use strict';

var MODULE_REQUIRE
	, child_process = require('child_process')
	, fs = require('fs')
	, path = require('path')
	;

var CORE = require('../core');
var rm = require('./rm');

module.exports = function(source, options) {
	options = CORE.expand({
		// 默认：提取去上一级目录。
		dest: path.join(source, '..'),

		// 默认：如果目标目录下存在同名文件或文件夹，则拒绝执行全部操作。
		overwrite: false,

		// 默认：不保留原文件夹。
		keepSource: false
	}, options);

	// 参数规范化。
	if (options.target) {
		options.dest = options.target;
	}
	if (options.dst) {
		options.dest = options.dst;
	}

	if (!fs.existsSync(source)) throw [ 1, 'Source directory does not exist: ' + source ];
	if (!CORE.isDir(source)) throw [ 2, 'It is not a directory: ' + source ];

	var items = fs.readdirSync(source);

	items.forEach(function(itemName) {
		var dst = path.join(options.dest, itemName);
		if (fs.existsSync(dst)) {
			// 如果允许覆盖，则先删除重名对象。
			if (options.overwrite) {
				rm(dst);
			}
			// 否则强行终止命令执行。
			else throw [ 3, 'Target item exists already: ' +  dst ];
		}
	})

	items.forEach(function(itemName) {
		var src = path.join(source, itemName);
		var dst = path.join(options.dest, itemName);
		fs.renameSync(src, dst);
	});

	// 如果不保留原文件夹，则删除之。
	if (!options.keepSource) {
		fs.rmdir(source);
	}
};
