(() => {
    "use strict";

    document.body.style.userSelect = 'none';

    let monitorSlider                = document.getElementById('monitorSlider');
    let sliderText            = document.getElementById('sliderText');
    let hideHeader            = document.getElementById('hideHeader');
    let toggleMonitors        = document.getElementById('toggleMonitors');
    let colorPicker           = document.getElementById('colorPicker');
    let gridWidth             = document.getElementById('gridWidth');
    let closeIcon             = document.getElementById('closeIcon');
    let toggleScroll          = document.getElementById('toggleScroll');
    let flashAlarm            = document.getElementById('flashAlarm');
    let flashWidth            = document.getElementById('flashWidth');
    let maximizeSingleView    = document.getElementById('maximizeSingleView');
    let invertColors          = document.getElementById('invertColors');
    let dropShadow            = document.getElementById('dropShadow');
    let shadowColor           = document.getElementById('shadowColor');
    let borderRadius          = document.getElementById('borderRadius');
    let transparentGrid       = document.getElementById('transparentGrid');
    let overrideMontageAspect = document.getElementById('overrideMontageAspect');
    let hueRotate             = document.getElementById('hueRotate');

    const cssLoader = toggleDark => {
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        toggleDark ?
            link.href = 'css/popup-dark-stylesheet.css' :
            link.href = 'css/popup-stylesheet.css';
        document.head.appendChild(link);
        return toggleDark;
    };

    chrome.runtime.sendMessage({
        popupOpen: true
    }, settings => {
        cssLoader( settings.toggleDark );
        gridWidth.max                   = settings.widthMax;
        flashWidth.max                  = settings.widthMax;
        toggleMonitors.checked          = settings.monitorOverride;
        monitorSlider.value             = sliderText.textContent = settings.monitors;
        hideHeader.checked              = settings.hideHeader;
        colorPicker.value               = settings.gridColor || '#000000';
        gridWidth.value                 = settings.gridWidth;
        toggleScroll.checked            = settings.toggleScroll;
        flashAlarm.checked              = settings.flashAlarm;
        flashWidth.value                = settings.flashWidth;
        maximizeSingleView.checked      = settings.maximizeSingleView;
        invertColors.checked            = settings.invertColors;
        dropShadow.checked              = settings.dropShadow;
        shadowColor.value               = settings.shadowColor || '#000000';
        borderRadius.value              = settings.borderRadius;
        transparentGrid.checked         = settings.transparentGrid;
        overrideMontageAspect.checked   = settings.overrideMontageAspect;
        hueRotate.value                 = settings.hueRotate;
    });

    closeIcon.addEventListener('click', () => window.close() );
    toggleMonitors.addEventListener('click', () => chrome.storage.local.set({ monitorOverride: toggleMonitors.checked }));
    hideHeader.addEventListener('click', () => chrome.storage.local.set({ hideHeader: hideHeader.checked }));
    toggleScroll.addEventListener('click', () => chrome.storage.local.set({ toggleScroll: toggleScroll.checked }));
    flashAlarm.addEventListener('click', () => chrome.storage.local.set({ flashAlarm: flashAlarm.checked }));
    maximizeSingleView.addEventListener('click', () => chrome.storage.local.set({ maximizeSingleView: maximizeSingleView.checked }));
    invertColors.addEventListener('click', () => chrome.storage.local.set({ invertColors: invertColors.checked }));
    dropShadow.addEventListener('click', () => chrome.storage.local.set({ dropShadow: dropShadow.checked }));
    shadowColor.addEventListener('input', () => chrome.storage.local.set({ shadowColor: shadowColor.value || '#000000' }));
    borderRadius.addEventListener('input', () => chrome.storage.local.set({ borderRadius: borderRadius.value }));
    transparentGrid.addEventListener('click', () => chrome.storage.local.set({ transparentGrid: transparentGrid.checked }));
    overrideMontageAspect.addEventListener('click', () => chrome.storage.local.set({ overrideMontageAspect: overrideMontageAspect.checked }));
    gridWidth.addEventListener('input', () => chrome.storage.local.set({ gridWidth: parseFloat( gridWidth.value ) }));
    flashWidth.addEventListener('input', () => chrome.storage.local.set({ flashWidth: parseFloat( flashWidth.value ) }));
    monitorSlider.addEventListener('input', () => chrome.storage.local.set({ monitors: sliderText.textContent = monitorSlider.value }));
    colorPicker.addEventListener('change', () => chrome.storage.local.set({ gridColor: colorPicker.value || '#000000' }));
    hueRotate.addEventListener('change', () => chrome.storage.local.set({ hueRotate: hueRotate.value }));
    logo.addEventListener('click', () => {
        chrome.storage.local.get({
            toggleDark: true
        }, toggleDark => {
            chrome.storage.local.set({
                toggleDark: cssLoader( !toggleDark.toggleDark )
            });
        });		
    });
})();
