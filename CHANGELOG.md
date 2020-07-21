#   yuan-sh Change Log

Notable changes to this project will be documented in this file. This project adheres to [Semantic Versioning 2.0.0](http://semver.org/).

##	[0.4.0] - Jul 21st, 2020

*	Upgrade command [mv](./commands/mv.js) to work in Docker container, avoiding EXDEV error.
*	Upgrade command [zip](./commands/zip.js) and [unzip](./commands/unzip.js) to avoid ENOBUF error.

##  [0.3.3] - May 8th, 2018

*   God damm it. I turned round to __adm-zip__ again. I have to depend on verion 0.4.7 because in version 0.4.9, the method `extractAll()` used in `ysh('unzip', ...)` does not work properly in Windows. However, a bug in `addLocalFolder()` already fixed in 0.4.9 still exists in 0.4.7. So, I have to invoke `addFile()` one by one for each items.

##  [0.3.1] - May 7th, 2018

*   Sorry, [__archiver__](https://www.npmjs.com/package/archiver) come back because [__adm-zip__](https://www.npmjs.com/package/adm-zip) is disappointing in Windows.

##  [0.3.0] - May 3rd, 2018

*   Dependency [__archiver__](https://www.npmjs.com/package/archiver) is removed and its duty is undertaken by [__adm-zip__](https://www.npmjs.com/package/adm-zip).

##  [0.2.0] - Mar 15th, 2018 - RISKY

*   Sub-command [unzip](./README.md#unzip) will depend on 3rd-party package [adm-zip](https://www.npmjs.com/package/adm-zip) when system command `unzip` not available.

---
This CHANGELOG.md follows [*Keep a CHANGELOG*](http://keepachangelog.com/).
