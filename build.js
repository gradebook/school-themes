#! /usr/bin/env node

const {writeFile, mkdir} = require('fs').promises;
const {copy} = require('fs-extra');
const compileSchools = require('./lib/compile-schools');
const renderMaskableIcon = require('./lib/templates/icon-maskable');
const renderFavicon = require('./lib/templates/favicon');

async function run() {
	await mkdir('./dist/api/v0', {recursive: true});
	const schoolList = await compileSchools();
	const globalConfig = {};

	const writeQueue = [];

	for (const [name, contents] of schoolList) {
		globalConfig[name] = contents;
		const singleFile = {
			[name]: contents
		};
		writeQueue.push(writeFile(`./dist/api/v0/${name}.json`, JSON.stringify(singleFile)));
		writeQueue.push(writeFile(`./dist/api/v0/${name}-icon-maskable.svg`, renderMaskableIcon(contents.theme.primary)));
		writeQueue.push(writeFile(`./dist/api/v0/${name}-favicon.svg`, renderFavicon(contents.theme.primary)));
	}

	writeQueue.push(writeFile('./dist/api/v0/global.json', JSON.stringify(globalConfig)));

	writeQueue.push(
		copy('./site', './dist')
	);

	return Promise.all(writeQueue);
}

run().catch(error => {
	console.log(error.excludeStack ? error.toString() : error);
	process.exit(1);
});
