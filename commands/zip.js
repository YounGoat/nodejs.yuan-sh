/**
 * 压缩成 zip 包。
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
var rm = require('./rm');
var mkdir = require('./mkdir');
var find = require('./find');

/**
 * @param {String} source
 * @param {String} target
 */
module.exports = function(source, target, options) {
	options = CORE.expand({
		// 如果目的地容器目录（压缩文件所在目录）不存在，更否创建该目录。
		createDir: true,

		// 此参数不可设定，只是用于解释此命令的行为模式。
		keepPath: false,

		// 如果目的地路径（压缩文件）已有内容，是否抹去原有内容？
		overwrite: false,

		// 此参数只有当源路径代表目录时有效。
		// 若设为 true，则将源目录下的内容直接放到压缩包根目录下，而抛弃源目录本身。
		unshell: false

	}, options);

	// 路径规范化。
	var sourceRealpath = path.resolve(source);
	var targetRealpath = path.resolve(target);

	// 源路径不存在。
	if (!fs.existsSync(sourceRealpath)) throw [ 1, 'Source file/directory does not exist: ' + sourceRealpath ];

	// 目标路径已存在，且不允许覆盖。
	if (fs.existsSync(targetRealpath)) {
		// 若允许覆盖，则先删除目标路径内容（不论其系文件还是目录）。
		if (options.overwrite) rm(targetRealpath);
		else throw [ 2, 'Target already exists: ' + targetRealpath ];
	}

	// 取目的地容器路径。
	var targetDir = path.dirname(targetRealpath);
	if (!fs.existsSync(targetDir)) {
		if (options.createDir) mkdir(targetDir);
	}

	if (CORE.BASH_AVAILABLE) {
		var cmd, workingDir;

		if (CORE.isDir(sourceRealpath) && options.unshell) {
			cmd = yuan.string.format('shopt -s dotglob && zip -r "%s" *', targetRealpath);
			workingDir = sourceRealpath;
		}
		else {
			cmd = yuan.string.format('zip -r "%s" "%s"', targetRealpath, path.basename(sourceRealpath));
			workingDir = path.dirname(sourceRealpath);
		}

		child_process.execSync(cmd, { cwd: workingDir, stdio: 'ignore' });
	}

	// addLocalFolder() in adm-zip is unavailable in Windows.
	// So, use archiver as replacement.
	// Unfortunately, the following code snippet is not fully sychronous in Windows.

	// else if (os.platform() == 'win32') {
	// 	var archiver = require('archiver');		
	// 	var archive = archiver.create('zip');
	// 	archive.pipe(fs.createWriteStream(targetRealpath));

	// 	var mapping;
	// 	if (CORE.isDir(sourceRealpath)) {
	// 		if (options.unshell) {
	// 			mapping = {
	// 				src: '**',
	// 				cwd: sourceRealpath
	// 			};
	// 		}
	// 		else {
	// 			mapping = {
	// 				src: path.join(path.basename(sourceRealpath), '**'),
	// 				cwd: path.dirname(sourceRealpath)
	// 			};
	// 		}

	// 	}
	// 	else {
	// 		mapping = {
	// 			src: sourceRealpath,
	// 			flatten: path.dirname(sourceRealpath)
	// 		};
	// 	}
	// 	CORE.expand(mapping, { expand: 1, dot: true });
	// 	archive.bulk([ mapping ]);
	// 	archive.finalize();
	// }

	// Let's turn round to adm-zip.
	else if (os.platform() == 'win32') {
		var AdmZip = require('adm-zip');	
		var zip = new AdmZip();
		if (CORE.isDir(sourceRealpath)) {
			var items = find(sourceRealpath);
			var basename = path.basename(sourceRealpath);
			for (var i = 0; i < items.length; i++) {
				var name = items[i];
				var pathname = path.join(sourceRealpath, name);
				var entryname = name.split('\\').join('/');
				if (!options.unshell) {
					entryname = basename + '/' + entryname;
				}
				var data = '';
				if (CORE.isDir(pathname)) {
					entryname += '/';
				}
				else {
					data = fs.readFileSync(pathname);
				}
				var comment = '';
				var attr = 0;
				zip.addFile(entryname, data, comment, attr);
			}
		}
		else {
			zip.addLocalFile(sourceRealpath);
		}
		zip.writeZip(targetRealpath);
	}

	else {
		var AdmZip = require('adm-zip');	
		var zip = new AdmZip();
		if (CORE.isDir(sourceRealpath)) {
			if (options.unshell) {
				zip.addLocalFolder(sourceRealpath, '');
			}
			else {
				zip.addLocalFolder(sourceRealpath, path.basename(sourceRealpath));
			}
		}
		else {
			zip.addLocalFile(sourceRealpath);
		}
		zip.writeZip(targetRealpath);

		// throw [ 3, 'Bash shell unavailable, failed to invoke system command "zip".'];
	}
};
