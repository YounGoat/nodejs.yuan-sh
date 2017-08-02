/**
 * 移动文件或文件夹。
 * @author youngoat@163.com
 */

'use strict';

var MODULE_REQUIRE
	, child_process = require('child_process')
	, fs = require('fs')
	, os = require('os')
	, path = require('path')
	, yuan = require('yuan')
	;

var CORE = require('../core');
var mkdir = require('./mkdir');
var rm = require('./rm');

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

	// 待复制的文件或目录的名称（不含路径）。
	var basename;

	// 目的地容器目录。
	var targetDir;

	if (options.targetIsDir) {
		basename = path.basename(source);
		targetDir = target;
	}
	else {
		basename = path.basename(target);
		targetDir = path.join(target, '..');
	}

	// 如果目的地容器目录不在此，在选项允许时，创建之。
	if (!fs.existsSync(targetDir)) {
		if (!options.createDir) throw [ 2, 'Target directory does not exist: ' + targetDir ];
		if (mkdir(targetDir)) throw [ 3, 'Failed to create target directory: ' + targetDir ];
	}

	// 目的地的真实路径。
	var targetRealpath = path.join(targetDir, basename);

	// 如果目的地已经存在，在选项允许时，删除之。
	if (fs.existsSync(targetRealpath)) {
		if (options.overwrite) {
			rm(targetRealpath);
		}
		else {
			throw [ 4, 'Target already exists: ' + targetRealpath ];
		}
	}

	if (CORE.BASH_AVAILABLE) {
		var cmd = yuan.string.format('cp -R "%s" "%s"', source, targetRealpath);
		child_process.execSync(cmd);
	}
	else if (CORE.CMD_AVAILABLE) {
		var cmd;
		if (CORE.isDir(source)) {
			cmd = yuan.string.format('XCOPY /S/I "%s" "%s"', source, targetRealpath);
		}
		else {
			cmd = yuan.string.format('COPY "%s" "%s"', source, targetRealpath);
		}
		child_process.execSync(cmd);
	}
	else {
		throw [ 5, 'Bash shell unavailable, failed to invoke system command "cp".'];
	}   
};
