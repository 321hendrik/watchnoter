//FirstView Component Constructor
function FirstView(parent) {

	var overallWidth = '90%';
	var overallBackground = '#a11d4c';

	function getDict () {
		if (Ti.App.Properties.hasProperty('watchnoter:dict')) {
			return Ti.App.Properties.getObject('watchnoter:dict');
		} else {
			return {};
		}
	}

	function setDict (dict) {
		Ti.App.Properties.setObject('watchnoter:dict', dict);
	}

	function updateEntry (key, data) {
		var dict = getDict();
		dict[key] = JSON.stringify(data);
		setDict(dict);
	}

	function getEntry (key) {
		var dict = getDict();
		return JSON.parse(dict[key]);
	}

	function removeEntry (key) {
		var dictOld = getDict();
		var dictNew = {};
		for (var k in dictOld) {
			if (k != key) {
				dictNew[k] = dictOld[k];
			}
		}
		setDict(dictNew);
	}

	function createCountBox (data) {
		var box = Ti.UI.createView({
			count: data.count,
			height: Ti.UI.FILL,
			width: '50%',
			layout: 'horizontal'
		});
		box.count = data.count;

		box.setCount = function (count) {
			if (count < 1) {
				return;
			}
			box.count = count;
			title.setText(data.title + ' ' + count);
			box.fireEvent('countchanged', {count: count});
		};

		box.getCount = function () {
			return box.count;
		};

		var up = Ti.UI.createLabel({
			text: '+',
			width: '33%',
			height: '100%',
			color: overallBackground,
			verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
			textAlign: Titanium.UI.TEXT_ALIGNMENT_CENTER,
			font: {
				fontSize: '18sp'
			}
		});
		up.addEventListener('singletap', function () {
			box.setCount(box.getCount() + 1);
		});
		box.add(up);

		var title = Ti.UI.createLabel({
			verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
			textAlign: Titanium.UI.TEXT_ALIGNMENT_CENTER,
			text: '',
			color: '#fff',
			height: '100%',
			width: '33%'
		});
		box.add(title);

		var down = Ti.UI.createLabel({
			text: '-',
			width: '33%',
			height: '100%',
			color: overallBackground,
			verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
			textAlign: Titanium.UI.TEXT_ALIGNMENT_CENTER,
			font: {
				fontSize: '18sp'
			}
		});
		down.addEventListener('singletap', function () {
			box.setCount(box.getCount() - 1);
		});
		box.add(down);

		box.setCount(data.count);

		return box;
	}

	function createEntryView (data) {
		var entry = Ti.UI.createView({
			title: data.title,
			season: data.season,
			episode: data.episode,
			width: overallWidth,
			height: 60,
			layout: 'vertical',
			backgroundColor: '#6fff',
			bottom: 10
		});

		var title = Ti.UI.createLabel({
			verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
			text: data.title,
			color: '#8fff',
			touchEnabled: false,
			backgroundColor: overallBackground,
			height: '50%',
			ellipsize: true,
			font: {
				fontSize: '22sp'
			},
			width: Ti.UI.FILL
		});
		entry.add(title);

		var bottomBox = Ti.UI.createView({
			height: '50%',
			width: Ti.UI.FILL,
			layout: 'horizontal'
		});
		entry.add(bottomBox);
		bottomBox.addEventListener('singletap', function () {
			updateEntry(entry.title, {title: entry.title, season: seasonBox.getCount(), episode: episodeBox.getCount()});
		});
		var seasonBox = createCountBox({
			title: 'S',
			count: data.season
		});
		seasonBox.addEventListener('countchanged', function () {
			episodeBox.setCount(1);
		});
		bottomBox.add(seasonBox);

		var episodeBox = createCountBox({
			title: 'E',
			count: data.episode
		});
		bottomBox.add(episodeBox);

		entry.addEventListener('longpress', function (e) {
			removeEntry(e.source.title);
			scroller.remove(entry);
		});

		return entry;
	}

	function createInputView (argument) {
		var view = Ti.UI.createTextField({
			width: overallWidth,
			height: 30,
			textAlign: Titanium.UI.TEXT_ALIGNMENT_CENTER,
			backgroundColor: '#6fff',
			hintText: 'Add new series',
			bottom: 10
		});
		view.addEventListener('return', function (e) {
			var data = {title: e.source.value, season: 1, episode: 1};
			updateEntry(e.source.value, data);
			scroller.add(createEntryView(data));
			e.source.value = '';
		});
		return view;
	}

	/**
	 * Draw View
	 */
	var self = Ti.UI.createView({
		height: Ti.UI.FILL,
		layout: 'vertical',
		backgroundColor: overallBackground
	});

	var spacer = Ti.UI.createView({
		height: 30,
		width: Ti.UI.FILL
	});
	self.add(spacer);

	var title = Ti.UI.createLabel({
		text: 'watchnoter',
		color: '#8000',
		bottom: 10,
		font: {
			fontSize: '26sp'
		}
	});
	self.add(title);

	self.add(createInputView());

	var scroller = Ti.UI.createScrollView({
		width: Ti.UI.FILL,
		height: Ti.UI.FILL,
		layout: 'vertical'
	});
	self.add(scroller);

	var dict = getDict();
	for (var key in dict) {
		var data = getEntry(key);
		scroller.add(createEntryView(data));
	}

	return self;
}

module.exports = FirstView;
