//FirstView Component Constructor
function FirstView(parent) {

	var overallWidth = '90%';
	var overallBackground = '#5f8fa1';

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
			title.setValue(data.title + ' ' + count);
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

		// done button for iOS
		var button = Ti.UI.createButton({
			backgroundColor: '#6fff',
			color: overallBackground,
			title: 'done'
		});
		button.addEventListener('click', function () {
			title.fireEvent('return', {source: title});
		});

		var title = Ti.UI.createTextField({
			keyboardToolbar: button,
			verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
			textAlign: Titanium.UI.TEXT_ALIGNMENT_CENTER,
			value: '',
			backgroundColor: 'transparent',
			color: '#fff',
			height: '100%',
			width: '33%',
			keyboardType: Titanium.UI.KEYBOARD_NUMBER_PAD
		});
		box.add(title);
		title.addEventListener('focus', function (e) {
			e.source.setValue('');
		});
		title.addEventListener('return', function (e) {
			if (e.source.getValue() !== '' && e.source.getValue() > 0) {
				try {
					var intValue = parseInt(e.source.getValue(), 10);
					box.setCount(intValue);
				} catch (err) {
					box.setCount(box.getCount());
				}
			} else {
				box.setCount(box.getCount());
			}
			e.source.blur();
		});

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
			height: (Ti.Platform.osname == 'android') ? 70 : 60,
			layout: 'vertical',
			backgroundColor: '#6fff',
			bottom: 10
		});

		var topBox = Ti.UI.createView({
			backgroundColor: overallBackground,
			height: (Ti.Platform.osname == 'android') ? '45%' : '50%',
			width: Ti.UI.FILL,
			layout: 'horizontal'
		});
		entry.add(topBox);

		var title = Ti.UI.createLabel({
			verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
			text: data.title,
			color: '#8fff',
			touchEnabled: false,
			height: Ti.UI.FILL,
			ellipsize: true,
			font: {
				fontSize: '22sp'
			},
			width: '95%'
		});
		topBox.add(title);

		var remove = Ti.UI.createLabel({
			text: 'X',
			color: '#4000',
			font: {
				fontSize: '18sp'
			},
			height: Ti.UI.FILL,
			width: '5%',
		});
		topBox.add(remove);
		remove.addEventListener('singletap', function (e) {
			removeEntry(entry.title);
			scroller.remove(entry);
		});

		var bottomBox = Ti.UI.createView({
			height: (Ti.Platform.osname == 'android') ? '55%' : '50%',
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

		return entry;
	}

	function createInputView (argument) {
		var view = Ti.UI.createTextField({
			width: overallWidth,
			height: (Ti.Platform.osname == 'android') ? 40 : 30,
			textAlign: Titanium.UI.TEXT_ALIGNMENT_CENTER,
			backgroundColor: '#6fff',
			hintText: 'Add new series',
			bottom: 10
		});

		if (Ti.Platform.osname == 'android') {
			function blockFocus (e) {
				e.source.blur();
				view.removeEventListener('focus', blockFocus);
			}

			view.addEventListener('focus', blockFocus);
		}

		view.addEventListener('return', function (e) {
			if (e.source.value === '') {
				return;
			}
			var data = {title: e.source.value, season: 1, episode: 1};
			updateEntry(e.source.value, data);
			scroller.add(createEntryView(data));
			e.source.setValue('');
			e.source.blur();
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
		color: '#4000',
		bottom: 10,
		font: {
			fontSize: '26sp'
		}
	});
	self.add(title);

	var inputView = createInputView();
	self.add(inputView);
	title.addEventListener('click', function () {
		inputView.blur();
	});

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
