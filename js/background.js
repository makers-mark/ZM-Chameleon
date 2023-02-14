(() => {
    "use strict";

    console.log(
        `%c${$sigData}`,
        'background: linear-gradient(to right, #5433ff, #222222, #20bdff); font-size: 22px; font-family:monospace; color: cyan; border-radius: 11px;'
    );
 
    let settings = {};
    let tabId = [];
    const w = 24.75;
    const h = 21;

    let cssToBeRemoved = defaultCustomCSS;

    chrome.runtime.onUpdateAvailable.addListener( () => {
        chrome.runtime.reload();
    });

    chrome.runtime.onInstalled.addListener( () =>{
        chrome.storage.local.get({
            customLocation: '',
            alarmOpacity: 0.5,
            alertOpacity: 0.5,
            maximizeSingleView: true,
            zmMontageLayout: 3,
            monitorOverride: true,
            monitors: 3,
            hideHeader: false,
            ghostHeader: false,
            ghostHeader: false,
            customCSS: defaultCustomCSS,
            cssToBeRemoved: '',
            gridColor: '#000000',
            gridWidth: 0,
            toggleScroll: true,
            flashAlarm: true,
            toggleDark: true,
            flashWidth: 10,
            widthMax: 20,
            flashSpeed: 0.6,
            invertColors: false,
            showFps: true,
            fpsColor: '#00ff00',
            fpsSize: 30,
            dropShadow: false,
            shadowColor: '#000000',
            borderRadius: 0,
            lockRecordButton: false,
            disableRecordOnAlert: false,
            recordButtonSize: 70,
            dropShadowString: '2px 4px 6px',
            inversionAmount: 1,
            transparentGrid: false,
            applyFilters: false,
            overrideMontageAspect: true,
            aspectRatio: '4/3',
            maintainSingleMonitorAspect: false,
            overrideZoom: true,
            zoomFactor: 1.2,
            backgroundColor: '#222222',
            consoleScale: 2,
            consolePosition: {
                x: 5,
                y: 5
            },
            navbarPosition: {
                x: 0,
                y: 0
            },
            strokeColor: '#00c7b0',
            strokeOpacity: 0.18,
            fillColor: '#666ff0',
            fillOpacity: 0.14,
            panelPosition: {
                x: 200,
                y: 10
            }
        }, localStorage => {
            settings = localStorage;
        });

        chrome.declarativeContent.onPageChanged.removeRules(undefined, ()  => {
            chrome.declarativeContent.onPageChanged.addRules([{
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {queryEquals: 'view=montage'}
                    }),
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {queryContains: 'showZones'}
                    }),                    
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {queryPrefix: 'view=watch'}
                    }),
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {queryPrefix: 'view=console'}
                    }),
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {      //Do not show Popup Icon for Montage Review
                            pathEquals: '/zm/',
                            queryEquals: ''
                        }
                    })
                ],
                actions: [new chrome.declarativeContent.ShowPageAction()]
            }]);
        });
    });

    chrome.tabs.onRemoved.addListener( id => {
        //If this is not here, when you change a value for certain things
        //(flash, grid, css filters) on the options page, it will error if
        //the ZoneMinder tab has closed. Those settings check for tabId
        //before attempting to insertCSS into a tab that no longer exists.
        if (tabId.includes(id)) tabId = tabId.filter( item => item !== id);
    });

    chrome.storage.onChanged.addListener( change => {
        Object.getOwnPropertyNames( change ).forEach( value => {

            switch( value ){

                default:
                    settings[value] = change[value].newValue; //MaximizeSingleView, panelPosition
                    break;

                case 'hideHeader':
                    settings.hideHeader = change[value].newValue;       //  \/\/ Don't run on Console page (who wants to hideheader of console? someone probably), just change the variables <<<<
                    hideHeader();
                    break;

                case 'ghostHeader':
                    settings.ghostHeader = change[value].newValue;
                    if ( settings.ghostHeader ) {
                        ghostHeader();
                        customCSS();
                    };
                    break;

                case 'customCSS':
                    settings[value] = change[value].newValue;
                    customCSS();
                    break;

                case 'monitorOverride':
                case 'monitors':
                case 'zmMontageLayout':
                    settings[value] = change[value].newValue;
                    monitorOverride();
                    break;

                case 'gridWidth':
                case 'gridColor':
                case 'transparentGrid':
                    settings[value] = change[value].newValue;
                    if ( tabId ) gridHandler();
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
                case 'dropShadowString':
                case 'inversionAmount':
                    settings[value] = change[value].newValue;
                    if ( tabId ) filterHandler();
                    break;

                case 'borderRadius':
                    settings[value] = change[value].newValue;
                    borderRadius();
                    break;
                
                case 'aspectRatio':
                case 'overrideMontageAspect':
                    settings[value] = change[value].newValue;
                    overrideMontageAspect();
                    break;

                case 'flashAlarm':
                case 'flashWidth':
                case 'alertOpacity':
                case 'alarmOpacity':
                case 'flashSpeed':
                    settings[value] = change[value].newValue;
                    if ( tabId ) flashAlarm();
                    break;

                case 'backgroundColor':
                    settings[value] = change[value].newValue;
                    setBackgroundColor();
                    break;

                case 'stroke':
                case 'strokeColor':
                case 'strokeOpacity':
                case 'fillColor':
                case 'fillOpacity':
                case 'consoleScale':
                    settings[value] = change[value].newValue;
                    updateConsoleIcon();
                    break;

                case 'zoomFactor':
                    settings[value] = change[value].newValue;
                    zoomFactor();
                    break;

                case 'fpsColor':
                case 'fpsSize':
                    settings[value] = change[value].newValue;
                    fpsOverlay();
                    break;
            }
        });
    });

    chrome.tabs.onUpdated.addListener(( id, tab ) => {
        if (tab.title && tab.title === 'ZM - Montage' && !tabId.includes( id )){
            tabId.push( id );
        }
    });

    chrome.runtime.onMessage.addListener(( msg, sender, callback ) => {
        let value = Object.getOwnPropertyNames( msg )[0];
        switch ( value ){
            case 'fullscreenToggle':
                toggleFullscreenFn();
                break;

            case 'zmMontageChanged':
                settings.zmMontageLayout = msg.value;
                chrome.storage.local.set({ zmMontageLayout: msg.value });
                break;

            case 'popupOpen':
                callback({
                    hideHeader: settings.hideHeader,
                    toggleDark: settings.toggleDark,
                    widthMax: settings.widthMax,
                    monitorOverride: settings.monitorOverride,
                    monitors: settings.monitors,
                    gridColor: settings.gridColor,
                    gridWidth: settings.gridWidth,
                    toggleScroll: settings.toggleScroll,
                    flashAlarm: settings.flashAlarm,
                    flashWidth: settings.flashWidth,
                    maximizeSingleView: settings.maximizeSingleView,
                    invertColors: settings.invertColors,
                    dropShadow: settings.dropShadow,
                    shadowColor: settings.shadowColor,
                    borderRadius: settings.borderRadius,
                    transparentGrid: settings.transparentGrid,
                    overrideMontageAspect: settings.overrideMontageAspect
                });
                break;

            case 'clearStorage':
                if ( tabId.length > 0 ){
                    chrome.storage.local.clear( () =>{
                        if ( !lastError() ) alert('Storage Cleared! Click OK to reload the extension and the ZoneMinder page.');
                        tabId.forEach( id => {
                            chrome.tabs.executeScript( id, { code: `window.location.reload();` }, () => {
                                chrome.runtime.reload();
                            });
                        });
                    });
                } else {
                    chrome.storage.local.clear( () => {
                        if ( !lastError() ) alert('Storage Cleared! Click OK to reload the extension.');
                        chrome.runtime.reload();
                    });
                }
                break;

            case 'montageOpen':
                callback({
                    consoleScale: settings.consoleScale,
                    consolePosition: settings.consolePosition,
                    strokeColor: settings.strokeColor,
                    strokeOpacity: settings.strokeOpacity,
                    fillColor: settings.fillColor,
                    fillOpacity: settings.fillOpacity,
                    panelPosition: settings.panelPosition,
                    dropShadow : {
                        string: settings.dropShadowString,
                        color: settings.shadowColor
                    },
                    navbarPosition: settings.navbarPosition,
                    ghostHeader: settings.ghostHeader
                });

                if (!tabId.includes( sender.tab.id )){
                    tabId.push( sender.tab.id );
                };

                chrome.storage.local.set({ zmMontageLayout: msg.zmMontageLayout });
                initMontage();
                monitorOverride();
                if ( settings.overrideMontageAspect ) overrideMontageAspect();
                if ( settings.hideHeader ) hideHeader();
                if ( settings.ghostHeader ){
                    ghostHeader();
                    customCSS();
                };
                if ( settings.toggleScroll ) toggleScroll();
                if ( settings.flashAlarm ) flashAlarm();
                filterHandler();
                gridHandler();
                if ( settings.borderRadius ) borderRadius();
                setBackgroundColor();
                break;

            case "setOverlay":
                chrome.storage.local.set({ [ msg.key ]: msg.value });
                break;

            case "goToConsole":
                chrome.windows.getCurrent( window => {
                    chrome.windows.update( window.id, { state: 'normal' });
                });
                break;

            case 'watchPageOpen':
                settings.maintainSingleMonitorAspect ?
                    chrome.tabs.insertCSS( sender.tab.id, { code:
                        `img:first-child {
                            object-fit: contain !important;
                        }`
                    }) :
                
                    chrome.tabs.insertCSS( sender.tab.id, { code:
                        `img:first-child {
                            object-fit: fill !important;
                        }`
                    });
                
                //If the watch page was clicked on from the montage page and not the
                //console page and the setting is selected in the popup. Maximize the monitor.
                if ( settings.maximizeSingleView ){
                    chrome.tabs.insertCSS( sender.tab.id, { code:
                        `.imageFeed img {
                            border: 0px !important;
                        }
                        img:first-child {
                            width: 100vw !important;
                            height: 100vh !important;
                        }
                        div#content {
                            margin: 0 !important;
                        }
                        .monitor {
                            margin: 0px !important;
                        }
                        div.navbar, div#header, div#monitorStatus, .monitorStatus, div#dvrControls, div#replayStatus, div#ptzControls, div#events, div.warning {
                            display: none !important;
                        }
                        div.fixed-top.container-fluid, div#header, div.d-flex {
                            display: none !important;
                        }
                        div#navbar-container {
                            display: none !important;
                        }`
                    });
                }
                chrome.storage.local.get({
                    [msg.monitorName + '_fps']: {
                        x: [].x || undefined,
                        y: [].y || undefined
                    },
                    [msg.monitorName + '_rec']: {
                        x: [].x || 0,
                        y: [].y || 0
                    }
                }, monitor => {
                    callback({
                        monitor: monitor,
                        showFps: settings.showFps,
                        fpsColor: settings.fpsColor,
                        lockRecordButton: settings.lockRecordButton,
                        disableRecordOnAlert: settings.disableRecordOnAlert,
                        recordButtonSize: settings.recordButtonSize,
                        fpsSize: settings.fpsSize,
                        maximizeSingleView: settings.maximizeSingleView,
                        overrideZoom: settings.overrideZoom,
                        zoomFactor: settings.zoomFactor
                    });
                    if (settings.applyFilters) filterHandler([sender.tab.id]);
                });
                break;

            case 'setPanel':
                chrome.storage.local.set({
                    panelPosition:  msg.panelPosition
                });
                //settings.panelPosition = msg.panelPosition;
/*                 chrome.tabs.executeScript(sender.tab.id, {code: `
                    let sc = document.getElementById('scale');
                    sc.value = '12.5';
                    changeScale();
                `}, () =>{

                }); */
                break;
            
            case 'default':
                break;
        };
        //We have to return true or else the message port
        //will close before storage.local.get is returned.
        return true;
    });

    const initMontage = () => {
        //if (debug){alert(`InitMontage, inserting css into these tabs: ${tabId}`)};
        tabId.forEach( id =>
            chrome.tabs.insertCSS( id, { code:
                `.monitorState {
                    display: none !important;
                }
                #content {
                    width: 100% !important;
                    margin: 0px !important;
                }
                #header {
                    border-bottom: 0px !important;
                    margin: 0px !important;
                }
                img {
                    width: 100% !important;
                }`    //Something around 1.36.10 made me have to put this
            })
        );
/*         
        if (settings.backgroundColor != ''){
            tabId.forEach( id => chrome.tabs.insertCSS(id, {
                code:
                `body {
                    background-color: ${settings.backgroundColor} !important;
                }`
            }));
        } */
    };

    const overrideMontageAspect = () => {
        //Added 'svg' to handle montage view when 'Show Zones' is enabled
        const CSS =
            `img, svg {
                aspect-ratio:${settings.aspectRatio} !important;
            }`
        tabId.forEach( id => {
            settings.overrideMontageAspect ?
                chrome.tabs.insertCSS( id, { code: CSS }) :
                chrome.tabs.removeCSS( id, { code: CSS });
        });
    };

    const borderRadius = () => tabId.forEach( id =>
        chrome.tabs.insertCSS( id, { code:
            `img {
                border-radius:${settings.borderRadius}% !important;
            }`
        })
    );

    const gridHandler = () => {
        tabId.forEach( id => {
            settings.transparentGrid ?
                chrome.tabs.insertCSS( id, { code:
                    `img {
                        border:${settings.gridWidth}px solid transparent !important;
                    }`
                }) : 
                chrome.tabs.insertCSS( id, { code:
                    `img {
                        border:${settings.gridWidth}px solid ${settings.gridColor} !important;
                    }`
                });
        });
    };

    const toggleFullscreenFn = () => {
        chrome.windows.getCurrent( window => {
            window.state !== 'fullscreen' ?
                chrome.windows.update( window.id, { state: 'fullscreen' }) : 
                chrome.windows.update( window.id, { state: 'normal' });
        });
    }

    const lastError = () => {
        const lastErrorMsg = chrome.runtime.lastError;
        if (lastErrorMsg){
            console.error(JSON.stringify(lastErrorMsg));
            return true;
        }
        return false;
    };

    const monitorOverride = () => {
        //if (debug){alert(`MonitorOverride, inserting css int these tabs: ${tabId}`)};
        tabId.forEach( id => {
            if ( settings.monitorOverride ){
                chrome.tabs.insertCSS( id, { code:  
                    `#monitors > div {
                        width: ${100 / settings.monitors}% !important;
                    }
                    img[id^="liveStream"] {
                        height: auto !important;
                    }`
                });
            } else {
                if ( settings.zmMontageLayout == 1){
                    //freeform is selected in ZoneMinder, so do nothing
                    return;
                }
                chrome.tabs.insertCSS( id, { code:  //.monitor added for 1.37
                    `#monitors > div {
                        width: ${100 / settings.zmMontageLayout}% !important;
                    }`
                });
            }
        });
    };

    const toggleScroll = () => {
        //if (debug){alert(`toggleScroll, inserting css int these tabs: ${tabId}`)};
        const CSS = 
            `::-webkit-scrollbar {
                width: 0px !important;
            }`
        tabId.forEach( id => {
            settings.toggleScroll ?
                chrome.tabs.insertCSS( id, { code: CSS }) :
                chrome.tabs.removeCSS( id, { code: CSS })
        });
    };

    const filterHandler = () => {
        tabId.forEach( sender => {
            if ( settings.dropShadow && settings.invertColors ){
                chrome.tabs.insertCSS( sender, { code:
                    `img, #panel {
                        filter: drop-shadow(${settings.dropShadowString} ${settings.shadowColor}) invert(${settings.inversionAmount}) !important;
                    }`
                });
            } else if (settings.dropShadow && !settings.invertColors){
                chrome.tabs.insertCSS( sender, { code:
                    `img, #panel {
                        filter: drop-shadow(${settings.dropShadowString} ${settings.shadowColor}) !important;
                    }`
                });
            } else if (!settings.dropShadow && settings.invertColors){
                chrome.tabs.insertCSS( sender, { code:
                    `img, #panel {
                        filter: invert(${settings.inversionAmount}) !important;
                    }`
                });
            } else {
                chrome.tabs.insertCSS( sender, { code:
                    `img, #panel {
                        filter: none !important;
                    }`
                });
            }
        });
    };

    const flashAlarm = () => {
        //At some point between ZM 1.34.x and 1.35.14, the img no longer got the alarm or alert
        //class. So div.alarm img and div.alert img were added below to the css selectors.
        const flash = ( id ) => {
            //if (debug){alert(`flashAlarm, inserting css int these tabs: ${id}`)};
            chrome.tabs.insertCSS( id, { code:
                `@-webkit-keyframes alarm {
                    from, to {
                        outline-color: transparent;
                    } 50% {
                        outline-color: rgba(255,0,0,${settings.alarmOpacity});
                    }
                }
                div.alarm > div.imageFeed > img, img.alarm {
                    outline: ${settings.flashWidth}px solid rgba(255,0,0,${settings.alarmOpacity});
                    outline-offset: -${settings.flashWidth}px;
                    animation: alarm ${settings.flashSpeed}s linear infinite;
                }
                @-webkit-keyframes alert {
                    from, to {
                        outline-color: transparent;
                    } 50% {
                        outline-color: rgba(255,247,28,${settings.alertOpacity});
                    }
                }
                div.alert > div.imageFeed > img, img.alert {
                    outline: ${settings.flashWidth}px solid rgba(255,247,28,${settings.alertOpacity});
                    outline-offset: -${settings.flashWidth}px;
                    animation: alert ${settings.flashSpeed}s linear infinite;
                }`
            }, () => {
                lastError();
            });
        };
        
        tabId.forEach( id => 
            settings.flashAlarm ?
                flash( id ) :
                chrome.tabs.insertCSS( id, { code:
                    `div.alarm img, div.alert img, img.alarm, img.alert {
                        animation: none;
                        outline: unset;
                    }`
                })
        );
    };

    const hideHeader = () => {
        //div.fixed-top new bootstrap header in 1.35.5
        //div#navbar-container added 1.37@25
        const CSS = 
            `div.navbar {
                display: none !important;
            }
            div#header {
                display: none !important;
            }
            div#navbar-container {
                display: none !important;
            }
            div.fixed-top {
                display: none !important;
            }
            div#page {
                padding-bottom: 0px !important;
                padding-right: 0px !important;
                padding-left: 0px !important;
            }`
        tabId.forEach( id => {
            settings.hideHeader?
                chrome.tabs.insertCSS( id, { code: CSS }):
                chrome.tabs.removeCSS( id, { code: CSS });
        });
    };

    const ghostHeader = () => { 
        tabId.forEach( id => {
            chrome.tabs.sendMessage( id, {
                'ghostHeader': settings.ghostHeader,
                'navbarPosition': settings.navbarPosition,
                'dropShadow': settings.dropShadow
            });
        });
    };

    const customCSS = () => {
        tabId.forEach( id => {
            chrome.tabs.removeCSS( id, { code: cssToBeRemoved });
            chrome.tabs.insertCSS( id, { code: settings.customCSS });
        });
        cssToBeRemoved = settings.customCSS;
    };

    const setBackgroundColor = () => {
        tabId.forEach( id => {
            chrome.tabs.insertCSS( id, { code:
                `body {
                    background-color: ${ settings.backgroundColor } !important;
                }`
            });
        });
    };

    const fpsOverlay = () => tabId.forEach( id => 
        chrome.tabs.insertCSS( id, { code:
        `#fpsSpan {
            color:      ${settings.fpsColor} !important;
            lineHeight: ${settings.fpsSize} !important; 
            height:     ${settings.fpsSize} !important; 
            fontSize:   ${settings.fpsSize} !important;
        }`
    }));
    
    const zoomFactor = () => tabId.forEach(
        id => chrome.tabs.sendMessage( id, {
            'zoomFactor': settings.zoomFactor
        })
    );
      
    const updateConsoleIcon = () => tabId.forEach( id => chrome.tabs.insertCSS( id, { code:
            `#consoleSvg {
                width: ${settings.consoleScale * w}px !important;
                height: ${settings.consoleScale * h}px !important;
            }
            #path {
                stroke:         ${settings.strokeColor} !important;
                stroke-Opacity: ${settings.strokeOpacity} !important;
                fill:           ${settings.fillColor} !important;
                fill-Opacity:   ${settings.fillOpacity} !important;
                transform:      scale(${settings.consoleScale}) !important;
            }`
    }));
    
    const changeDeclarativeContent = customLocation => {
        chrome.declarativeContent.onPageChanged.removeRules( undefined, ()  => {
            chrome.declarativeContent.onPageChanged.addRules([{
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: { urlContains: customLocation }
                    })
                ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
            }]);
        });
    };
})(
    ($sigData) = `
‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
        ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓        
        ▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓        
        ▓░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░▓▓▓▓▓░░░░░░░░░░▓▓▓▓▓░░░░░░░░░▓        
        ▓░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓░░░░▓▓▓▓▓▓░░░░░░░░▓▓▓▓▓▓░░░░░░░░░▓        
        ▓░░░░░░░░░░░░░░░░░░░░░▓▓▓▓░░░░░░▓▓▓▓▓▓▓░░░░░░▓▓▓▓▓▓▓░░░░░░░░░▓        
        ▓░░░░░░░░░░░░░░░░░░░▓▓▓▓░░░░░░░░▓▓▓▓░▓▓▓░░░░▓▓▓░▓▓▓▓░░░░░░░░░▓        
        ▓░░░░░░░░░░░░░░░░░▓▓▓▓░░░░░░░░░░▓▓▓▓░░▓▓▓░░▓▓▓░░▓▓▓▓░░░░░░░░░▓        
        ▓░░░░░░░░░░░░░░░▓▓▓▓░░░░░░░░░░░░▓▓▓▓░░░▓▓▓▓▓▓░░░▓▓▓▓░░░░░░░░░▓        
        ▓░░░░░░░░░░░░░▓▓▓▓░░░░░░░░░░░░░░▓▓▓▓░░░░▓▓▓▓░░░░▓▓▓▓░░░░░░░░░▓        
        ▓░░░░░░░░░░░▓▓▓▓░░░░░░░░░░░░░░░░▓▓▓▓░░░░░▓▓░░░░░▓▓▓▓░░░░░░░░░▓        
        ▓░░░░░░░░░▓▓▓▓░░░░░░░░░░░░░░░░░░▓▓▓▓░░░░░░░░░░░░▓▓▓▓░░░░░░░░░▓        
        ▓░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░▓▓▓▓░░░░░░░░░░░░▓▓▓▓░░░░░░░░░▓        
        ▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓        
        ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓        
          :l:,.             ....'...                                          
        ,oxkOOo.         .,:loddddddl:'.          ...                         
       .cllookOc.      .cdxkkkxkkkOkkOxl:'      .,clc,.                       
       .:lollx0o.    .:xOOO0OkOkkOkkkOOkxo,.   .:dxkOxc.                      
       .:lloxOO:.   .lxkOkOkxOkkOOkkOkdolloc'..:xxkOOOOx:.                    
        'looooc,..';odxkkoldxxdxxdxxolloooooc;;ldxO00KKK0koc::;,.             
        .;loddxkkkxxkxxkolddc::loloxoc:;,,,,;::cccclxO00KKKK0xoc:,.           
         .,cloxk00kxkxdllkOclo;oOocxo;,;::clooooolc:;:coxkkdc::loc.           
           .,:clxOxxxo:;lxkcoOxOOllxo::looooooooooollc;',:;,;coddo,           
            ..,;clddddllldxddOOOxoxkl:loooodoooddddoool:,.';loddddl'          
               .'cddddxkkkkkxk0OkkOkl:oddoolcccccclooddolccldddddo:,.         
               .:dxdddxkkxkxkOOOOkkdcldddlclool;'..;clodddddddddo;.;;.        
             .,lxxolodddxxkxxOOkdlclodddoc:okxdc..'cl:cdddddddddoc;c:.        
            .cddl:;,:cllodxxddxl;:llclddol::cooocccc:clddddddddddlcc'         
           .ldoc'   ..,:loddddxo;;clcccoddolc::c::::codddoooddddolcc,         
          .lxxxc.      ..,:loodxl,;:locccloddooooooodddddlccodddooloc.        
          ,dkkkl.         .',;lxxc',:loolccloddddddddddddoooddddddddo;.       
         .okOOOx,          .,cdxdl;',;looolcccllooddddddddddddddddol;.        
        'lxkOO00d;.       .,ldl,..,'..;:clloolllccclllllllllllllll:'          
      .;dkkxxxxkOxdl;.    'col'       ..',;cllooooollllcccccllcccll;.         
      ,odxdl:;;::clol,    .cddoc'          ...',,,,,;;:;:ccllc:::coc.         
      ..'..        .       ,loxOdc,.                    .':lc'..              
                           'ldxxdxOx:.                                        
                          .cdxxOOk00kdc;,'.                                   
                           .;lx00xoxkkdoddol;.                                
                             'okOxdo:,''''''.                                 
                              ,cc;'.                                          
                                                                              `
    , (defaultCustomCSS) =
`#navbar-container {
    transform-origin: top center;
    transform: perspective(100em) rotateX(-75deg);
}
div#navbar-container:hover {
    transform: rotate(0);
    div#header {
        transform: rotate(0);
    }  
}`);
