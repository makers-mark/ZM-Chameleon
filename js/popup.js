(() => {
    "use strict";

    document.body.style.userSelect = 'none';

    let monitorSlider         = document.getElementById('monitorSlider');
    let sliderText            = document.getElementById('sliderText');
    let hideHeader            = document.getElementById('hideHeader');
    let colorPicker           = document.getElementById('colorPicker');
    let gridWidth             = document.getElementById('gridWidth');
    let closeIcon             = document.getElementById('closeIcon');
    let toggleScroll          = document.getElementById('toggleScroll');
    let flashAlarm            = document.getElementById('flashAlarm');
    let flashWidth            = document.getElementById('flashWidth');
    let maximizeSingleView    = document.getElementById('maximizeSingleView');
    let maximizeEventView     = document.getElementById('maximizeEventView');    
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
        monitorSlider.value             = sliderText.textContent = settings.monitorsPerRow;
        hideHeader.checked              = settings.hideHeader;
        colorPicker.value               = settings.gridColor || '#000000';
        gridWidth.value                 = settings.gridWidth;
        toggleScroll.checked            = settings.toggleScroll;
        flashAlarm.checked              = settings.flashAlarm;
        flashWidth.value                = settings.flashWidth;
        maximizeSingleView.checked      = settings.maximizeSingleView;
        maximizeEventView.checked       = settings.maximizeEventView;
        invertColors.checked            = settings.invertColors;
        dropShadow.checked              = settings.dropShadow;
        shadowColor.value               = settings.shadowColor || '#02e7f7';
        borderRadius.value              = settings.borderRadius;
        transparentGrid.checked         = settings.transparentGrid;
        overrideMontageAspect.checked   = settings.overrideMontageAspect;
        hueRotate.value                 = settings.hueRotate;
        chrome.storage.local.get(console.log)
    });

    closeIcon.addEventListener('click', () => window.close() );
    hideHeader.addEventListener('click', () => {
        chrome.storage.local.get( 'hideHeader', edit => {
            edit.hideHeader[titles.MONTAGE] = hideHeader.checked;
            chrome.storage.local.set({ hideHeader: edit.hideHeader });
        })
    })
    toggleScroll.addEventListener('click', () => chrome.storage.local.set({ toggleScroll: toggleScroll.checked }));
    flashAlarm.addEventListener('click', () => chrome.storage.local.set({ flashAlarm: flashAlarm.checked }));
    maximizeSingleView.addEventListener('click', () => chrome.storage.local.set({ maximizeSingleView: maximizeSingleView.checked }));
    maximizeEventView.addEventListener('click', () => chrome.storage.local.set({ maximizeEventView: maximizeEventView.checked }));
    invertColors.addEventListener('click', () => chrome.storage.local.set({ invertColors: invertColors.checked }));
    dropShadow.addEventListener('click', () => chrome.storage.local.set({ dropShadow: dropShadow.checked }));
    shadowColor.addEventListener('input', () => chrome.storage.local.set({ shadowColor: shadowColor.value || '#02e7f7' }));
    borderRadius.addEventListener('input', () => chrome.storage.local.set({ borderRadius: borderRadius.value }));
    borderRadius.addEventListener('wheel', e =>
        e.deltaY <= 0 ?
            chrome.storage.local.set({ borderRadius: borderRadius.valueAsNumber < 50 ? borderRadius.valueAsNumber += 2 : borderRadius.valueAsNumber }) :
            chrome.storage.local.set({ borderRadius: borderRadius.valueAsNumber > 0  ? borderRadius.valueAsNumber -= 2 : borderRadius.valueAsNumber })
    );
    transparentGrid.addEventListener('click', () => chrome.storage.local.set({ transparentGrid: transparentGrid.checked }));
    overrideMontageAspect.addEventListener('click', () => chrome.storage.local.set({ overrideMontageAspect: overrideMontageAspect.checked }));
    gridWidth.addEventListener('input', () => chrome.storage.local.set({ gridWidth: parseFloat( gridWidth.value ) }));
    flashWidth.addEventListener('input', () => chrome.storage.local.set({ flashWidth: parseFloat( flashWidth.value ) }));
    monitorSlider.addEventListener('input', () => chrome.storage.local.set({ monitorsPerRow: sliderText.textContent = monitorSlider.value }));
    monitorSlider.addEventListener('wheel', e => 
        e.deltaY <= 0 ?
            chrome.storage.local.set({ monitorsPerRow: sliderText.textContent = monitorSlider.valueAsNumber < 20 ? monitorSlider.valueAsNumber += 1 : monitorSlider.valueAsNumber }) :
            chrome.storage.local.set({ monitorsPerRow: sliderText.textContent = monitorSlider.valueAsNumber > 1  ? monitorSlider.valueAsNumber -= 1 : monitorSlider.valueAsNumber })
    );
 
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

    const gearIcon = `
        M17.5,10 C17.5,9.658125 17.469375,9.32375 17.425,8.99375 L19.910625,7.165 L17.410625,2.835 L14.584375,4.073125 C14.05375,3.6625 13.47,3.318125 12.84,3.060625 L12.5,0 L7.5,0 L7.16,3.060625 C6.53,3.31875 5.94625,3.6625 5.415625,4.073125 L2.59,2.835 L0.09,7.165 L2.575,8.99375 C2.530625,9.32375 2.5,9.658125 2.5,10 C2.5,10.341875 2.530625,10.67625 2.575,11.00625 L0.089375,12.835 L2.589375,17.165 L5.415625,15.926875 C5.94625,16.3375 6.53,16.681875 7.16,16.939375 L7.5,20 L12.5,20 L12.84,16.939375 C13.47,16.68125 14.05375,16.3375 14.584375,15.926875 L17.410625,17.165 L19.910625,12.835 L17.425,11.00625 C17.469375,10.67625 17.5,10.341875 17.5,10 Z M18.268125,13.17875 L16.886875,15.57125 L15.085625,14.781875 L14.405625,14.48375 L13.81875,14.93875 C13.365625,15.289375 12.876875,15.57375 12.36625,15.783125 L11.68,16.064375 L11.598125,16.801875 L11.38125,18.75 L8.61875,18.75 L8.4025,16.801875 L8.320625,16.064375 L7.634375,15.783125 C7.12375,15.57375 6.635,15.29 6.181875,14.93875 L5.595,14.48375 L4.915,14.781875 L3.11375,15.57125 L1.7325,13.17875 L3.316875,12.013125 L3.91375,11.57375 L3.815,10.839375 C3.770625,10.514375 3.75,10.2475 3.75,10 C3.75,9.7525 3.770625,9.485625 3.814375,9.16 L3.913125,8.425625 L3.31625,7.98625 L1.731875,6.820625 L3.113125,4.428125 L4.914375,5.2175 L5.594375,5.515625 L6.18125,5.06125 C6.634375,4.71 7.123125,4.42625 7.63375,4.216875 L8.32,3.935625 L8.401875,3.198125 L8.61875,1.25 L11.38125,1.25 L11.5975,3.198125 L11.679375,3.935625 L12.365625,4.216875 C12.87625,4.42625 13.365,4.71 13.818125,5.06125 L14.405,5.51625 L15.085,5.218125 L16.88625,4.42875 L18.2675,6.82125 L16.683125,7.986875 L16.08625,8.42625 L16.185,9.160625 C16.229375,9.485625 16.25,9.7525 16.25,10 C16.25,10.2475 16.229375,10.514375 16.185625,10.84 L16.086875,11.574375 L16.68375,12.01375 L18.268125,13.17875 Z M10,6.25 C7.92875,6.25 6.25,7.92875 6.25,10 C6.25,12.07125 7.92875,13.75 10,13.75 C12.07125,13.75 13.75,12.07125 13.75,10 C13.75,7.92875 12.07125,6.25 10,6.25 Z M10,12.67875 C8.523125,12.67875 7.32125,11.476875 7.32125,10 C7.32125,8.523125 8.523125,7.32125 10,7.32125 C11.476875,7.32125 12.67875,8.523125 12.67875,10 C12.67875,11.476875 11.476875,12.67875 10,12.67875 Z
        `
    let gearDiv = document.createElement('div');

    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    gearDiv.style.position = 'fixed'
    gearDiv.style.top = '90px';
    gearDiv.style.right = '3px';
    gearDiv.style.cursor = 'pointer';
    gearDiv.title = 'Open Options Page';
    gearDiv.addEventListener('click', () => chrome.runtime.openOptionsPage());

    //svg.setAttribute( 'viewBox', '0 0 20 20');
    svg.setAttribute( 'width', '20px');
    svg.setAttribute( 'height', '20px' );
    path.setAttribute( 'd', gearIcon );
    path.style.stroke = '#ccc';
    path.style.strokeOpacity = 0.7;
    path.style.fill = '#eee';
    path.style.fillOpacity = 0.4;
    
    svg.appendChild( path );
    gearDiv.appendChild( svg )
    document.body.appendChild( gearDiv );
})();
