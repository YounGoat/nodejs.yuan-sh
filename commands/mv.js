/**
 * 移动文件或文件夹。
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
var rm = require('./rm');
var cp = require('./cp');

module.exports = function(source, target, options) {
	options = CORE.expand({
		// 如果目的地容器目录不存在，更否创建该目录。
		createDir: true,

		// 是否将目的地路径（target）视为容器。
		targetIsDir: false,

		// 如果目的地路径已有内容，是否抹去原有内容？
		overwrite: false
	}, options);

	if (!fs.existsSync(source)) throw [ 1, 'Source file/directory does not exist: ' + source ];

	var basename, targetDir;
	if (options.targetIsDir) {
		basename = path.basename(source);
		targetDir = target;
	}
	else {
		basename = path.basename(target);
		targetDir = path.join(target, '..');
	}

	if (!fs.existsSync(targetDir)) {
		if (!options.createDir) throw [ 2, 'Target directory does not exist: ' + targetDir ];
		if (mkdir(targetDir)) throw [ 3, 'Failed to create target directory: ' + targetDir ];
	}

	var targetRealpath = path.join(targetDir, basename);
	if (fs.existsSync(targetRealpath)) {
		if (!options.overwrite) {
			throw [ 4, 'Target already exists: ' + targetRealpath ];
		}
		else {
			rm(targetRealpath);
		}
	}

	try {
		fs.renameSync(source, targetRealpath);    
	} catch (error) {
		if (error.code && error.code == 'EXDEV') {
			cp(source, targetRealpath, { overwrite: true });
			rm(source);
		}
		else {
			throw error;
		}
	}
};
