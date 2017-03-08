#	YSH, Yuan Shell

*ysh* or *yuan-sh* means Yuan Sh(ell). It is a Node.js module.

*ysh* makes it easier to run a set of commands and obtain the result (if needed) in Node.js, as if you are interacting with CLI shell like *bash*.

By far, 10 commands supported by *ysh*:

*	[clear-dir](#clear-dir)
*	[cp](#cp)
*	[extract](#extract)
*	[find](#find)
*	[md5](#md5)
*	[mkdir](#mkdir)
*	[mv](#mv)
*	[rm](#rm)
*	[unzip](#unzip)
*	[zip](#zip)

##	How to run?

```javascript
// Require YSH module.
const ysh = require('ysh');

// Run specified command synchronously.
var ret = ysh(<command-name>, <arg_1>, <arg_2>, ..., [ <options> ]);
```

If the command accomplished successfully, the returned value will be like:  
```javascript
{
	status: /*int*/ 0,
	// Some commands will return something when accomplished.
	data: /*mixed*/ <command-returned-data>
}
```

Otherwise, the returned value will be like:  
```javascript
{
	status: /*int*/ <status-larger-than-zero>,
	error: /*Error | string | undefined*/ <error>,
	errorName: /*string | undefined*/ <error-name>,
	errorMessage: /*string | undefined*/ <error-message>,
	errorStack: /*string | undefined*/ <error-stack>
}
```

##	Supported Commands

<a name="clear-dir">
###	clear-dir

To remove all files and folders recursively below the specified directory.

```javascript
var ret = ysh('clear-dir', '/path/to/dir/');
```

Predefined error status:  
*	1 = Target does not exist
*	2 = Target is not a valid directory

<a name="cp">
###	cp = Copy file or folder

To copy file or folder to new location.

```javascript
var options = {
	// To create the parent directory if it does NOT exist.
	// DEFAULT true
	createDir: true,

	// To regard the target location as a container.
	// DEFAULT false
	targetIsDir: false,

	// To remove the target file/folder firstly if it exists.
	// DEFAULT false
	overwrite: false
};
var ret = ysh('cp', '/path/of/source', '/path/of/target', options);
```

Predefined error status:  
*	1 = Source file/directory does not exist
*	2 = Target directory does not exist
*	3 = Failed to create target directory
*	4 = Target already exists
*	5 = Bash shell unavailable, failed to invoke system command "cp".

ATTENTION: If the target has already exist and it is a folder, ``ysh('mv', source, target)`` will overwrite (remove before copying) the target instead of create something below target.

<a name="extract">
###	extract = Move sub files / folders from a directory / packed file to parent directory

```javascript
var options = {
	// Path of directory where to put sub files / folders of source directory.
	// DEFAULT the parent directory of source
	dest: '/foo/bar'

	// To overwrite the existing files / folders below the dest directory.
	// DEFAULT false
	overwrite: false,

	// To keep the source directory.
	// DEFAULT false
	keepSource: false
}
var ret = ysh('extract', '/path/of/source', options);
```

Predefined error status:  
*	1 = Source directory does not exist
*	2 = It is not a directory or supported packed file
*	3 = Target item exists already

<a name="find">
###	find = Find files / folders

```javascript
var options = {
	// File types to be found.
	//   d = directory
	//   f = regular file
	//   l = symbolic link
	// DEFAULT 'df'
	type: 'df',

	// To return the absolute path.
	// DEFAULT false
	absolute: false,

	// To ignore the hidden files.
	// DEFAULT false
	noHidden: false,

	// The max depth to travel.
	// DEFAULT 0, means no limit
	depth: 0
};
var ret = ysh('find', '/path/of/root', options);

if (ret.status == 0) {
	// If success, ret.data will be an array of string.
	for (var i = 0; i < ret.data.length; i++) {
		// Each string equals to an absolute / relative path of a file / folder.
		// ...
	}
}
```

Predefined error status:  
*	1 = Source directory does not exist
*	2 = It is not a directory

<a name="md5">
###	md5 = Create MD5 digest

```javascript
var options = {
	// Salt text.
	// DEFAULT null
	salt: null,

	// Encoding of output digest.
	// DEFAULT hex
	encoding: 'hex'
};
var ret = ysh('md5', '/path/to/file', options);

if (ret.status == 0) {
	// The MD5 digest of the file content.
	ret.data;
}
```

Predefined error status:  
*	1 = File does not exist
*	2 = It is a directory while a regular file expected
*	3 = options.salt SHOULD be a buffer or string (utf8-encoded)

<a name="mkdir">
###	mkdir = Create directory

```javascript
ysh('mkdir', '/path/of/dir');
```

If the target exists, do nothing even if it is a file (not folder).

<a name="mv">
###	mv = Move file or folder to new location

```javascript
var options = {
	// To create the parent directory if it does NOT exist.
	// DEFAULT true
	createDir: true,

	// To regard the target location as a container.
	// DEFAULT false
	targetIsDir: false,

	// To remove the target file/folder firstly if it exists.
	// DEFAULT false
	overwrite: false
};
var ret = ysh('mv', '/path/of/source', '/path/of/target', options);
```

Predefined error status:  
*	1 = Source file/directory does not exist
*	2 = Target directory does not exist
*	3 = Failed to create target directory
*	4 = Target already exists

<a name="rm">
###	rm = Remove file / folder recursively

```javascript
var options = {
	// To remove folder which is not empty.
	// DEFAULT false
	force: false
}
ysh('rm', '/path/of/source', options);
```

Predefined error status:  
*	1 = Target does not exist
*	2 = Target is an directory and not empty

<a name="unzip">
###	unzip = Unzip packed file

```javascript
var options = {
	// To create target directory if not exists.
	// DEFAULT true
	createDir: true,

	// To remove the existing files / folders below target directory.
	// DEFAULT false
	clear: false,

	// To overwrite the existing synonymous files / folders.
	// DEFAULT false
	overwrite: false,

	// To keep the source packed file, otherwise it will be removed after unzip.
	// DEFAULT true
	keepSource: true
}
var ret = ysh('unzip', '/path/to/zip', '/path/of/target', options);
```

Predefined error status:  
*	1 = Source path does not exist or is not a regular file
* 	2 = Target directory does not exist
*	3 = Bash shell unavailable, failed to invoke system command "unzip"

<a name="zip">
###	zip = Create zip file

```javascript
var options = {
	// To create parent directory of target if not exists.
	// DEFAULT true
	createDir: true,

	// To remove the target file if exists.
	overwrite: false,

	// To put the sub files / folders into the target zip file,
	// and abandon the source folder itself.
	// If the source is a file, this option will be ignored.
	// DEFAULT false
	unshell: false
}
var ret = ysh('zip', '/path/of/source', '/path/of/target', options);
```

Predefined error status:  
*	1 = Source file/directory does not exist
*	2 = Target already exists
