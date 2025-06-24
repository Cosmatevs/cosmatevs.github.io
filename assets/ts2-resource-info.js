'use strict';

const ts2ResourceInfo = {};

/** Parses a tsv/csv file with data into an array and a map.
 * 
 * The file must have column names in its first row.
 * The column 'id' must be a hex number. It will be used in the map as the key. */
ts2ResourceInfo.parseToArrayAndMap = async function (fileUrl, valueSeparator, entryLoadedCallback = entry => {}) {
	let fileFetchResponse = await fetch(fileUrl);
	let fileContents = await fileFetchResponse.text();

	let fileLines = fileContents.split(/\r?\n/g);
	let columnNames = fileLines.shift().split(valueSeparator); // the first line

	let valueArray = [];
	let valueMap = new Map();

	fileLines.forEach(line => {
		line = line.trim();
		if (line.length == 0)
			return;

		let values = line.split(valueSeparator).map(value => value.trim());
		let entry = {};
		for (let i = 0; i < columnNames.length; i++) {
			entry[columnNames[i]] =
				values[i] === undefined || values[i].length == 0
					? null
					: values[i];
		}
		valueArray.push(entry);
		entryLoadedCallback(entry);

		let entryId = parseInt(entry.id, 16);
		valueMap.set(entryId, entry);
	});

	return {
		array: valueArray,
		map: valueMap
	};
}

/* Groups */

ts2ResourceInfo.initializeGroups = async function () {
	let groupInfos = await ts2ResourceInfo.parseToArrayAndMap('database/ts2-group-info.txt', '\t');

	groupInfos.array.forEach(groupInfo =>
		groupInfo.parent = groupInfos.map.get(parseInt(groupInfo.parentId, 16)) ?? null
	);

	ts2ResourceInfo.groupInfoArray = groupInfos.array;
	ts2ResourceInfo.groupInfoMap = groupInfos.map;
}

ts2ResourceInfo.getAllGroups = function () {
	if (ts2ResourceInfo.groupInfoArray === undefined)
		throw Error('Group info must be initialized first with initializeGroups()');

	return ts2ResourceInfo.groupInfoArray;
}

ts2ResourceInfo.getGroupById = function (id) {
	if (ts2ResourceInfo.groupInfoMap === undefined)
		throw Error('Group info must be initialized first with initializeGroups()');

	return ts2ResourceInfo.groupInfoMap.get(Number(id));
}

/* Types
   ts2-type-info.txt is based on https://github.com/sims-hacker-zone/SimPE/blob/autinerd/avalonia/SimPe/SimPe/Data/FileTypes.cs */

ts2ResourceInfo.initializeTypes = async function () {
	let typeInfos = await ts2ResourceInfo.parseToArrayAndMap(
		'database/ts2-type-info.txt',
		'\t',
		entry => entry.canHaveName = !!entry.canHaveName // convert to bool
	);

	ts2ResourceInfo.typeInfoArray = typeInfos.array;
	ts2ResourceInfo.typeInfoMap = typeInfos.map;
}

ts2ResourceInfo.getAllTypes = function () {
	if (ts2ResourceInfo.typeInfoArray === undefined)
		throw Error('Type info must be initialized first with initializeTypes()');

	return ts2ResourceInfo.typeInfoArray;
}

ts2ResourceInfo.getTypeById = function (id) {
	if (ts2ResourceInfo.typeInfoMap === undefined)
		throw Error('Type info must be initialized first with initializeTypes()');

	return ts2ResourceInfo.typeInfoMap.get(Number(id));
}
