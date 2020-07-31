"use strict";

var settings = {};

chrome.runtime.onInstalled.addListener( () => {
	chrome.declarativeContent.onPageChanged.removeRules(undefined, ()  => {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [
				new chrome.declarativeContent.PageStateMatcher({
					pageUrl: {queryPrefix: 'view=montage'}
				}),
				new chrome.declarativeContent.PageStateMatcher({
					pageUrl: {queryPrefix: 'view=watch'}
				}),
				new chrome.declarativeContent.PageStateMatcher({
					pageUrl: {queryPrefix: 'view=console'}
				})
			],
			actions: [new chrome.declarativeContent.ShowPageAction()]
		}]);
	});
	loadSettings();
	watchStorageChanges();
});

//var fontUrl = chrome.runtime.getURL('/fonts/Digital7-1e1Z.ttf');

function loadSettings(){
	chrome.storage.local.get({
		customLocation: '',
		alarmOpacity: 0.5,
		alertOpacity: 0.5,
		userName: '',
		password: '',
		maximizeSingleView: false,
		zmMontageLayout: 3,
		monitorOverride: false,
		monitors: 4,
		hideHeader: false,
		gridColor: '#000000',
		gridWidth: 0,
		toggleScroll: false,
		flashAlarm: false,
		toggleDark: false,
		flashWidth: 5,
		widthMax: 10,
		flashSpeed: 0.6,
		invertColors: false,
		showFps: true,
		fpsColor: '#ffffff',
		fpsPosX: 10,
		fpsPosY: 100,
		dropShadow: false,
		shadowColor: '#000000',
		borderRadius: 0,
		lockRecordButton: false
		}, (localStorage) => {
			settings = localStorage;
	})
}

function initMontage() {
	if (settings.monitorOverride) {
		chrome.tabs.insertCSS({ code: '.monitorFrame {width: ' + parseFloat(100 / settings.monitors) + '% !important;}' });
	}
	else {
		chrome.tabs.insertCSS({ code: '.monitorFrame {width: ' + parseFloat(100 / settings.zmMontageLayout) + '% !important;}' });
	}
	chrome.tabs.insertCSS({ code: 'div.monitorState{display: none !important;}#content{width: 100% !important;margin: 0px !important;}}#header{border-bottom: 0px !important;}' });
}

function changeDeclarativeContent(customLocation){
 	chrome.declarativeContent.onPageChanged.removeRules(undefined, ()  => {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [
				new chrome.declarativeContent.PageStateMatcher({
					pageUrl: {urlContains: customLocation}
				})
			],
		actions: [new chrome.declarativeContent.ShowPageAction()]
		}]);
	}); 
/* 	chrome.declarativeContent.onPageChanged.removeRules(undefined, ()  => {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [
				new chrome.declarativeContent.PageStateMatcher({
					css: ["div.monitorFrame"]                             //Montage page
				}),
				new chrome.declarativeContent.PageStateMatcher({
					css: ["form[name='monitorForm']"]                     //Console page
				})
			],
		actions: [new chrome.declarativeContent.ShowPageAction()]
		}]);
	});	*/
}

chrome.runtime.onMessage.addListener( (msg, sender, callback) => {
	var value = Object.getOwnPropertyNames(msg)[0];
	switch (value){
		case 'fullscreen':
			toggleFullscreenFn();
			break;

		case 'zmMontageChanged':
			settings.zmMontageLayout = msg.value;
			chrome.storage.local.set({'zmMontageLayout': msg.value});
			break;

		case 'popupOpen':
			callback(settings);
			break;

		case 'clearStorage':
			chrome.storage.local.clear();
			chrome.runtime.reload();
			location.reload(true);
			break;

		case 'montageOpen':
			settings.zmMontageLayout = msg.zmMontageLayout;
			chrome.storage.local.set({'zmMontageLayout': msg.zmMontageLayout});
			var settingNames = Object.getOwnPropertyNames(settings);
			for (var name in settingNames){
				if (settings[settingNames[name]] === true && settingNames[name] !== 'lockRecordButton' && settingNames[name] !== 'showFps' && settingNames[name] !== 'maximizeSingleView' && settingNames[name] !== 'toggleDark' && settingNames[name] !== 'invertColors' && settingNames[name] !== 'dropShadow') {
					window[settingNames[name]]();
				}
			}
			filterHandler();
			gridHandler();
			borderRadius();
			initMontage();
			break;

		case "setMonitor":
			chrome.storage.local.set({
				[msg.monitorName]: {
					'x': msg.positionX,
					'y': msg.positionY
				}
			});
			break;

		case "setFps":
			chrome.storage.local.set({
				'fpsPosX': msg.x,
				'fpsPosY': msg.y
			});
			break;

		case 'fullscreenWatch':
			if (msg.fullscreenWatch && settings.maximizeSingleView){
				maximizeSingleView();
				chrome.windows.getCurrent( (window) => chrome.windows.update(window.id, {state: 'fullscreen'}));
				chrome.storage.local.get({
					[msg.monitorName]: {
						'x': [msg.monitorName].x || 0,
						'y': [msg.monitorName].y || 0,
					}
				}, (obj) => {
						callback({obj: obj, showFps: settings.showFps, fpsColor: settings.fpsColor, x: settings.fpsPosX, y: settings.fpsPosY, lockRecordButton: settings.lockRecordButton});
						filterHandler();
				});
			} else {
				callback();
			}

	}
	//We have to return true or else the message port will close before storage.local.get is returned.
	return true;
});

function widthMax(){
 	if (settings.gridWidth > settings.widthMax){
		settings.gridWidth = settings.widthMax;
	}
	if (settings.flashWidth > settings.widthMax){
		settings.flashWidth = settings.widthMax;
	}
}

function maximizeSingleView(){
	if (settings.maximizeSingleView){
		chrome.tabs.insertCSS({code: 'img:first-child {object-fit: contain !important; width: 100vw !important; height: 100vh !important;}'});	
		chrome.tabs.insertCSS({code: 'div#content {margin: 0 !important;}'});
		chrome.tabs.insertCSS({code: 'div.navbar, div#header, div#monitorStatus, div#dvrControls, div#replayStatus, div#ptzControls, div#events {display: none !important;}'});
	}
}

function toggleFullscreenFn(){
	chrome.windows.getCurrent( (window) => {
		if (window.state !== 'fullscreen'){
			chrome.windows.update(window.id, {state: 'fullscreen'});
		} else {
			chrome.windows.update(window.id, {state: 'normal'});
		}
	});
}

const lastError = () => {
	const lastErrorMsg = chrome.runtime.lastError;
	if (lastErrorMsg){
		console.log(JSON.stringify(lastErrorMsg));
	}
}

function gridHandler(){
	chrome.tabs.insertCSS({code: 'img {border: ' + settings.gridWidth + 'px solid ' + settings.gridColor +' !important;}'});
}

function monitorOverride(){
	if (settings.monitorOverride){
		chrome.tabs.insertCSS({code: '.monitorFrame {width: ' + parseFloat(100/settings.monitors) + '% !important;}'});
	} else {
		if (settings.zmMontageLayout == 1){
			//freeform is selected in Zoneminder, so do nothing
			return;
		}
		chrome.tabs.insertCSS({code: '.monitorFrame {width: ' + parseFloat(100/settings.zmMontageLayout) + '% !important;}'});
	}
}

function toggleScroll(){
	if(settings.toggleScroll){
		chrome.tabs.insertCSS({code: 'body {overflow: hidden !important;}'});
	} else {
		chrome.tabs.insertCSS({code: 'body {overflow: visible !important;}'});
	}
}

function borderRadius(){
	chrome.tabs.insertCSS({code: 'img {border-radius: ' + settings.borderRadius + '% !important;}'});
}

function filterHandler(){
	if (settings.dropShadow && settings.invertColors){
		chrome.tabs.insertCSS({code: 'img {filter: drop-shadow(2px 4px 6px ' + settings.shadowColor + ') invert(1) !important;}'});
	} else if (settings.dropShadow && !settings.invertColors){
		chrome.tabs.insertCSS({code: 'img {filter: drop-shadow(2px 4px 6px ' + settings.shadowColor + ') !important;}'});
	} else if (!settings.dropShadow && settings.invertColors){
		chrome.tabs.insertCSS({code: 'img {filter: invert(1) !important;}'});
	} else {
		chrome.tabs.insertCSS({code: 'img {filter: none !important;}'});
	}
}

function flashAlarm(){
	const flash = () => {
		chrome.tabs.insertCSS({ code: '@-webkit-keyframes alarm {from, to {outline-color: transparent} 50% {outline-color: rgba(255,0,0,' + settings.alarmOpacity + ')}} img.alarm {outline: ' + settings.flashWidth + 'px solid rgba(255,0,0,' + settings.alarmOpacity + '); outline-offset: -' + settings.flashWidth + 'px; animation: alarm ' + settings.flashSpeed + 's linear infinite;}' }, () => {
			lastError();
		});
		chrome.tabs.insertCSS({ code: '@-webkit-keyframes alert {from, to {outline-color: transparent} 50% {outline-color: rgba(255,247,28,' + settings.alertOpacity + ')}} img.alert {outline: ' + settings.flashWidth + 'px solid rgba(255,247,28,' + settings.alertOpacity + '); outline-offset: -' + settings.flashWidth + 'px; animation: alert ' + settings.flashSpeed + 's linear infinite;}' }, () => {
			lastError();
		});
	};

	if (settings.flashAlarm){
		flash();
	} else {
		chrome.tabs.insertCSS({code: 'img.alarm, .alert {animation: none !important; outline: unset !important;}'});
	}
}

function hideHeader(){
	if (settings.hideHeader){
		chrome.tabs.insertCSS({code: 'div.navbar{display: none !important;}div#header{display: none !important;}'});
	} else {
		chrome.tabs.insertCSS({code: 'div.navbar{display: block !important;}div#header{display: block !important;}'});
	}
}

function watchStorageChanges(){
	chrome.storage.onChanged.addListener( (change) => {
		var values = Object.getOwnPropertyNames(change);
		values.forEach(function(value) {
			switch(value){
				default:
					settings[value] = change[value].newValue;
					break;

				case 'hideHeader':
					settings.hideHeader = change[value].newValue;
					hideHeader();
					break;

				case 'monitorOverride':
				case 'monitors':
				case 'zmMontageLayout':
					settings[value] = change[value].newValue;
					monitorOverride();
					break;

				case 'gridWidth':
				case 'gridColor':
					settings[value] = change[value].newValue;
					gridHandler();
					break;

				case 'customLocation':
					changeDeclarativeContent(change[value].newValue);
					break;

				case 'toggleScroll':
					settings.toggleScroll = change[value].newValue;
					toggleScroll();
					break;

				case 'dropShadow':
				case 'invertColors':
				case 'shadowColor':
					settings[value] = change[value].newValue;
					filterHandler();
					break;

				case 'borderRadius':
					settings[value] = change[value].newValue;
					borderRadius();
					break;

				case 'flashAlarm':
				case 'flashWidth':
					settings[value] = change[value].newValue;
					flashAlarm();
			}
		});
	}); 
}