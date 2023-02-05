(() => {
    "use strict";

    let slider = document.getElementById('monitorSlider');
    let sliderText = document.getElementById('sliderText');
    let hideHeader = document.getElementById('hideHeader');
    let toggleMonitors = document.getElementById('toggleMonitors');
    let colorPicker = document.getElementById('colorPicker');
    let gridWidth = document.getElementById('gridWidth');
    let closeIcon = document.getElementById('closeIcon');
    let toggleScroll = document.getElementById('toggleScroll');
    let flashAlarm = document.getElementById('flashAlarm');
    let flashWidth = document.getElementById('flashWidth');
    let maximizeSingleView = document.getElementById('maximizeSingleView');
    let invertColors = document.getElementById('invertColors');
    let dropShadow = document.getElementById('dropShadow');
    let shadowColor = document.getElementById('shadowColor');
    let borderRadius = document.getElementById('borderRadius');
    let transparentGrid = document.getElementById('transparentGrid');
    let overrideMontageAspect = document.getElementById('overrideMontageAspect');
    
    //Keep at the top 12/25/2020, no more initial two clicks (not double clicks) to change theme.
    const cssLoader = toggleDark => {
        let head = document.getElementsByTagName('head')[0];
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        toggleDark ?
            link.href = 'css/popup-dark-stylesheet.css' :
            link.href = 'css/popup-stylesheet.css';
        head.appendChild(link);
    };

    chrome.runtime.sendMessage({
        popupOpen: true
    }, settings => {
        cssLoader(settings.toggleDark);
        gridWidth.max = settings.widthMax;
        flashWidth.max = settings.widthMax;
        toggleMonitors.checked = settings.monitorOverride;
        slider.value = settings.monitors;
        sliderText.textContent = `Monitors Per Row: ${settings.monitors}`;
        hideHeader.checked = settings.hideHeader;
        colorPicker.value = settings.gridColor || '#000000';
        gridWidth.value = settings.gridWidth;
        toggleScroll.checked = settings.toggleScroll;
        flashAlarm.checked = settings.flashAlarm;
        flashWidth.value = settings.flashWidth;
        maximizeSingleView.checked = settings.maximizeSingleView;
        invertColors.checked = settings.invertColors;
        dropShadow.checked = settings.dropShadow;
        shadowColor.value = settings.shadowColor || '#000000';
        borderRadius.value = settings.borderRadius;
        transparentGrid.checked = settings.transparentGrid;
        overrideMontageAspect.checked = settings.overrideMontageAspect;
    });

    toggleMonitors.addEventListener('click', () => chrome.storage.local.set({
        monitorOverride: toggleMonitors.checked
    }));
    hideHeader.addEventListener('click', () => chrome.storage.local.set({
        hideHeader: hideHeader.checked
    }));
    toggleScroll.addEventListener('click', () => chrome.storage.local.set({
        toggleScroll: toggleScroll.checked
    }));
    flashAlarm.addEventListener('click', () => chrome.storage.local.set({
        flashAlarm: flashAlarm.checked
    }));
    maximizeSingleView.addEventListener('click', () => chrome.storage.local.set({
        maximizeSingleView: maximizeSingleView.checked
    }));
    invertColors.addEventListener('click', () => chrome.storage.local.set({
        invertColors: invertColors.checked
    }));
    dropShadow.addEventListener('click', () => chrome.storage.local.set({
        dropShadow: dropShadow.checked
    }));
    borderRadius.addEventListener('input', () => chrome.storage.local.set({
        borderRadius: borderRadius.value
    }));
    transparentGrid.addEventListener('click', () => chrome.storage.local.set({
        transparentGrid: transparentGrid.checked
    }));
    overrideMontageAspect.addEventListener('click', () => chrome.storage.local.set({
        overrideMontageAspect: overrideMontageAspect.checked
    }));

    closeIcon.addEventListener('click', () => window.close());

    colorPicker.addEventListener('change', () => {
        let color = colorPicker.value || '#000000';
        chrome.storage.local.set({gridColor: color});
    });

    shadowColor.addEventListener('input', () => {
        let color = shadowColor.value || '#000000';
        chrome.storage.local.set({shadowColor: color})
    });

    logo.addEventListener('click', () => {
        chrome.storage.local.get({toggleDark: false}, toggleDark => {
            chrome.storage.local.set({toggleDark: !toggleDark.toggleDark});
            cssLoader(!toggleDark.toggleDark);
        });		
    });	

    slider.oninput = () => {
        sliderText.textContent = `Monitors Per Row: ${slider.value}`;
        chrome.storage.local.set({monitors: slider.value});
    };

    gridWidth.oninput = () => chrome.storage.local.set({gridWidth: parseFloat(gridWidth.value)});
    flashWidth.oninput = () => chrome.storage.local.set({flashWidth: parseFloat(flashWidth.value)});
})();