"use strict";

document.addEventListener('DOMContentLoaded', () => {
	var slider = document.getElementById('monitorSlider');
	var sliderText = document.getElementById('sliderText');
	var hideHeader = document.getElementById('hideHeader');
	var toggleMonitors = document.getElementById('toggleMonitors');
	var colorPicker = document.getElementById('colorPicker');
	var gridWidth = document.getElementById('gridWidth');
	var closeIcon = document.getElementById('closeIcon');
	var toggleScroll = document.getElementById('toggleScroll');
	var flashAlarm = document.getElementById('flashAlarm');
	var flashWidth = document.getElementById('flashWidth');
	var maximizeSingleView = document.getElementById('maximizeSingleView');
	var invertColors = document.getElementById('invertColors');
	var dropShadow = document.getElementById('dropShadow');
	var shadowColor = document.getElementById('shadowColor');
	var borderRadius = document.getElementById('borderRadius');

	chrome.runtime.sendMessage({popupOpen: true}, (settings) => {
		cssLoader(settings.toggleDark);
		gridWidth.max = settings.widthMax;
		flashWidth.max = settings.widthMax;
		toggleMonitors.checked = settings.monitorOverride;
		slider.value = settings.monitors;
		sliderText.textContent = settings.monitors + ' Monitors Per Row';
		hideHeader.checked = settings.hideHeader;
		colorPicker.value = settings.gridColor || '#000000';
		gridWidth.value = settings.gridWidth;
		toggleScroll.checked = settings.toggleScroll;
		flashAlarm.checked = settings.flashAlarm;
		flashWidth.value = settings.flashWidth;
		maximizeSingleView.checked = settings.maximizeSingleView;
		invertColors.checked = settings.invertColors;
		dropShadow.checked = settings.dropShadow;
		shadowColor.value = settings.shadowColor;
		borderRadius.value = settings.borderRadius;
	});

	toggleMonitors.addEventListener('click', () => chrome.storage.local.set({monitorOverride: toggleMonitors.checked}));
	hideHeader.addEventListener('click', () => chrome.storage.local.set({hideHeader: hideHeader.checked}));
	toggleScroll.addEventListener('click', () => chrome.storage.local.set({toggleScroll: toggleScroll.checked}));
	flashAlarm.addEventListener('click', () => chrome.storage.local.set({flashAlarm: flashAlarm.checked}));
	maximizeSingleView.addEventListener('click', () => chrome.storage.local.set({maximizeSingleView: maximizeSingleView.checked}));
	invertColors.addEventListener('click', () => chrome.storage.local.set({invertColors: invertColors.checked}));
	dropShadow.addEventListener('click', () => chrome.storage.local.set({dropShadow: dropShadow.checked}));
	borderRadius.addEventListener('input', () => chrome.storage.local.set({borderRadius: borderRadius.value}));
	closeIcon.addEventListener('click', () => window.close());

	colorPicker.addEventListener('change', () => {
		var color = colorPicker.value || '#000000';
		chrome.storage.local.set({'gridColor': color});
	});

	shadowColor.addEventListener('change', () => {
		var color = shadowColor.value || '#000000';
		chrome.storage.local.set({'shadowColor': color})
	})

	logo.addEventListener('click', () => {
		chrome.storage.local.get('toggleDark', (toggleDark) => {
			chrome.storage.local.set({'toggleDark': !toggleDark.toggleDark});
			cssLoader(!toggleDark.toggleDark);
		});		
	});	

	slider.oninput = () => {
		sliderText.textContent = slider.value + ' Monitors Per Row';
		chrome.storage.local.set({'monitors': parseInt(slider.value, 10)});
}

	gridWidth.oninput = () => {
		chrome.storage.local.set({'gridWidth': parseFloat(gridWidth.value)});
	}

	flashWidth.oninput = () => {
		if (flashAlarm.checked){
			chrome.storage.local.set({'flashWidth': parseFloat(flashWidth.value)});
		}
	}
});

function cssLoader(toggleDark) {
	let head = document.getElementsByTagName('head')[0];
	let link = document.createElement('link');
	link.rel = 'stylesheet';
	link.type = 'text/css';

	if (toggleDark) {
		link.href = 'css/darkStylesheet.css';
	}
	else {
		link.href = 'css/stylesheet.css';
	}
	head.appendChild(link);
}