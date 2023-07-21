let settings = {};
let tabId = [];
const w = 24.75;
const h = 21;

let ghostCSS =`
#navbar-container {
    transform-origin: top center;
    transform: perspective(100em) rotateX(-75deg);
}
div#navbar-container:hover {
    transform: rotate(0);
}`;

const defaultMontageCSS = '';
const defaultWatchCSS = '';
const defaultEventCSS = '';
const defaultGhostCSS =`
#navbar-container {
    transform-origin: top center;
    transform: perspective(100em) rotateX(-75deg);
}
div#navbar-container:hover {
    transform: rotate(0);
}
/*Header in 1.36*/
div.fixed-top.container-fluid {
    transform-origin: top center;
    transform: perspective(100em) rotateX(-75deg);
}
div.fixed-top.container-fluid:hover {
    transform: rotate(0);
}`;

const reloadFunc = `window.location.reload();`;

chrome.runtime.onUpdateAvailable.addListener( () => {
    chrome.runtime.reload();
});

chrome.runtime.onInstalled.addListener( ( why ) =>{

/*     if( why.reason === 'install' ) {
        chrome.tabs.create({
            url: "guide.html"
        });
    } */

    chrome.storage.local.get({
        //customLocation: '',
        alarmOpacity: 0.5,
        alertOpacity: 0.5,
        maximizeSingleView: true,
        maximizeEventView: true,
        monitorsPerRow: 3,
        hideHeader: {
            [titles.MONTAGE]: false,
            [titles.WATCH]: false,
            [titles.EVENT]: false
        },
        ghostHeader: {
            [titles.MONTAGE]: false,
            [titles.WATCH]: false,
            [titles.EVENT]: false,
            [titles.CONSOLE]: false
        },
        ghostCSS: defaultGhostCSS,
        customCSSMontage: defaultMontageCSS,
        customCSSWatch: defaultWatchCSS,
        customCSSEvent: defaultEventCSS,
        gridColor: '#000000',
        gridWidth: 0,
        toggleScroll: true,
        flashAlarm: true,
        toggleDark: true,
        flashWidth: 10,
        widthMax: 20,
        flashSpeed: 0.6,
        invertColors: false,
        hueRotate: 0,
        showFps: true,
        fpsColor: '#00ff00',
        fpsSize: 30,
        dropShadow: false,
        shadowColor: '#02e7f7',
        borderRadius: 0,
        lockRecordButton: false,
        disableRecordOnAlert: false,
        recordButtonSize: 70,
        dropShadowString: defaultShadow,
        inversionAmount: 1,
        transparentGrid: false,
        applyFilters: false,
        overrideMontageAspect: true,
        aspectRatio: defaultAspectRatio,
        maintainSingleMonitorAspect: false,
        overrideZoom: true,
        zoomFactor: 1.2,
        backgroundColor: '#222222',
        consoleScale: 2,
        eventStats: true,
        maintainEventAspect: false,
        eventStatsPosition: {x: 0, y: 0},
        consolePosition: {x: 5, y: 5},
        navbarPosition: {x: 0, y: 0},
        strokeColor: '#00c7b0',
        strokeOpacity: 0.18,
        fillColor: '#666ff0',
        fillOpacity: 0.14,
        panelPosition: {x: 200, y: 10},
        controlBarPosition: 94,
        eventsPageSticky: true,
        autoScale: '-1'
    }, localStorage => {
        settings = localStorage;
        chrome.storage.local.set( localStorage );
    });

/*     chrome.storage.local.set({
        hideHeader: {
            [titles.MONTAGE]: true,
            [titles.WATCH]: false,
            [titles.EVENT]: false
        }
    }, () => {
        chrome.storage.local.get(
            'hideHeader', ( edit ) => {
            edit.hideHeader[titles.EVENT] = true;
            console.log(settings)
            chrome.storage.local.set({
                hideHeader: edit.hideHeader
            })
        })
    }); */
    

/*     chrome.declarativeContent.onPageChanged.removeRules(undefined, ()  => {
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
                    pageUrl: {queryPrefix: 'view=event'}
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
    }); */
});

chrome.tabs.onRemoved.addListener( id => tabId = tabId.filter( tab => tab.id !== id ));

chrome.storage.onChanged.addListener( change => {
    Object.getOwnPropertyNames( change ).forEach( value => {
        switch( value ){

            default:
                settings[value] = change[value].newValue;
                break;

            case 'eventStats':
                settings[value] = change[value].newValue;
                eventStats();
                break;

            case 'eventsPageSticky':
                settings[value] = change[value].newValue;
                eventsPageSticky();
                break;

            case 'maintainEventAspect':
                settings[value] = change[value].newValue;
                maintainEventAspect();
                break;

            case 'maximizeEventView':
                settings[value] = change[value].newValue;
                maximizeEventView();
                eventStats();
                maintainEventAspect();
                break;

            case 'maximizeSingleView':
                settings[value] = change[value].newValue;
                maximizeSingleView();
                break;

            case 'maintainSingleMonitorAspect':
                settings[value] = change[value].newValue;
                maintainSingleMonitorAspect();
                break;

            case 'hideHeader':
                settings.hideHeader = change[value].newValue;
                hideHeader();
                break;

            case 'ghostCSS':
                settings.ghostCSS = change[value].newValue;
                ghostCSSApply( change[value] );
                break;

            case 'ghostHeader':
                settings[value] = change[value].newValue;
                ghostHeader();
                //hideHeader();
                break;

            case 'customCSSMontage':
            case 'customCSSWatch':
            case 'customCSSEvent':
                settings[value] = change[value].newValue;
                //console.log(Object.keys(change));
                //console.log(change)
                customCSS( value, change[value] );
                // Don't do anything, not even change the value of settings.customCSS
                // Keep here though, so the switch-case 'default:' doesn't get it!!!!
                // customCSS is handled with messaging
                break;

            case 'monitorsPerRow':
                settings[value] = change[value].newValue;
                changeMonitorsPerRow();
                break;

            case 'gridWidth':
            case 'gridColor':
            case 'transparentGrid':
                settings[value] = change[value].newValue;
                gridHandler();
                break;

/*             case 'customLocation':
                changeDeclarativeContent(change[value].newValue);
                break; */

            case 'toggleScroll':
                settings.toggleScroll = change[value].newValue;
                toggleScroll();
                break;

            case 'dropShadow':
            case 'invertColors':
            case 'shadowColor':
            case 'dropShadowString':
            case 'inversionAmount':
            case 'hueRotate':
            case 'applyFilters':
                settings[value] = change[value].newValue;
                filterHandler();
                break;

            case 'borderRadius':
                settings[value] = change[value].newValue;
                borderRadius( change[value].oldValue );
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
                flashAlarm();
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

            case 'showFps':
                settings[value] = change[value].newValue;
                showFps();
                break;

            case 'fpsColor':
            case 'fpsSize':
                settings[value] = change[value].newValue;
                fpsOverlay();
                break;
            
            case 'eventsPageSticky':
                settings[value] = change[value].newValue;
                eventsPageSticky();
                break;

            case 'autoScale':
                settings[value] = change[value].newValue;
                if ( settings.autoScale !== "-1" ) autoScaleFn();
                break;
        }
    });
});

chrome.runtime.onMessage.addListener(( msg, sender, callback ) => {
    let value = Object.getOwnPropertyNames( msg )[0];
    switch ( value ){
        case 'title':
            let title = '';
            console.log(msg.title);

            if ( /ZM - .* - Feed/.test( msg.title ) ){
                title = 'ZM - Watch';
            } else if ( /ZM - Event .*/.test( msg.title ) ){
                title = 'ZM - Event';
            } else if ( msg.title === 'ZM Chameleon' || msg.title === 'ZM Chameleon Options') {  //Popup.js && options.js
                return true;
            } else {
                title = msg.title;
            }

            tabId = tabId.filter( tab => tab.id !== sender.tab.id );
            tabId.push({ id: sender.tab.id, title: title });

            switch ( title ){
                default:
                    break;

                case titles.EVENTS:
                    eventsPageSticky();
                    break;

                case titles.WATCH:
                    if ( settings.applyFilters ) filterHandler();
                    if ( settings.maintainSingleMonitorAspect ) maintainSingleMonitorAspect();
                    maximizeSingleView( true );
                    if ( settings.hideHeader[titles.WATCH] ) hideHeader();
                    if ( settings.showFps ) showFps( true );
                    if ( settings.ghostHeader[titles.WATCH] ) ghostHeader( true );
                    if ( settings.customCSSWatch !== '' ) customCSS( titles.WATCH );
                    unhideBody( sender.tab.id );
                    break;
                
                case titles.MONTAGE:
                    if ( settings?.ghostHeader[titles.MONTAGE] ) ghostHeader( true );
                    filterHandler();
                    gridHandler();
                    maximizeMontage();
                    changeMonitorsPerRow();
                    if ( settings.overrideMontageAspect ) overrideMontageAspect();
                    if ( settings.hideHeader[titles.MONTAGE] ) hideHeader();
                    if ( settings.toggleScroll ) toggleScroll();
                    if ( settings.flashAlarm ) flashAlarm();
                    if ( settings.borderRadius ) borderRadius();
                    setBackgroundColor();
                    if ( settings.customCSSMontage !== '' ) customCSS( titles.MONTAGE );
                    if ( settings.autoScale !== '-1') autoScaleFn();
                    unhideBody( sender.tab.id );
                    break;

                case titles.EVENT:
                    maintainEventAspect();
                    if ( settings.hideHeader[titles.EVENT] ) hideHeader();
                    if ( settings.toggleScroll ) toggleScroll();
                    maximizeEventView( true );
                    eventStats();
                    if ( settings.ghostHeader[titles.EVENT] ) ghostHeader( true );
                    if ( settings.customCSSEvent !== '' ) customCSS( titles.EVENT );
                    unhideBody( sender.tab.id );
                    break;
                
                case titles.CONSOLE:
                    if ( settings.toggleScroll ) toggleScroll();
                    break;
            }
            break;

/*         case 'notification':
            chrome.notifications.create('', {  title: 'Just wanted to notify you', iconUrl: 'icons/icon-32.png', message: `${msg.message}`,  type: 'basic'});
            break; */
/*         case 'customCSSApply':
            // Custom CSS setting is handled differently than all the other settings. Since some
            // of the css can be overwritten by other setttings (like 'monitor shadows'...), when
            // you hit the 'apply' button on the options page it wouldn't actually 'apply' the
            // css in the textarea IF nothing actually changed in the value of the custom css.
            // This way (messaging instead of watching for the Storage value to change), forces
            // the custom css to actually apply no matter what has or has not changed.

            let key = Object.getOwnPropertyNames(msg)[1];
            let value = msg[key]; 
            console.log(`Key: ${key}, value: ${value}`)
            //chrome.storage.local.get(console.log);
            chrome.storage.local.set({ [key]: settings[key] = value }, () => {
                customCSS();
                //chrome.storage.local.get(console.log);
            });
            break; */
        
        case 'fullscreenToggle':
            toggleFullscreenFn();
            break;

        case 'popupOpen':
            callback({
                hideHeader: settings.hideHeader[titles.MONTAGE],
                toggleDark: settings.toggleDark,
                widthMax: settings.widthMax,
                monitorsPerRow: settings.monitorsPerRow,
                gridColor: settings.gridColor,
                gridWidth: settings.gridWidth,
                toggleScroll: settings.toggleScroll,
                flashAlarm: settings.flashAlarm,
                flashWidth: settings.flashWidth,
                maximizeSingleView: settings.maximizeSingleView,
                maximizeEventView: settings.maximizeEventView,
                invertColors: settings.invertColors,
                hueRotate: settings.hueRotate,
                dropShadow: settings.dropShadow,
                shadowColor: settings.shadowColor,
                borderRadius: settings.borderRadius,
                transparentGrid: settings.transparentGrid,
                overrideMontageAspect: settings.overrideMontageAspect
            });
            break;

        case 'clearStorage':
            if ( tabId.length > 1 ){
                chrome.storage.local.clear( () =>{
                    if ( !lastError() ) alert('Storage Cleared! Click OK to reload the extension and the ZoneMinder page.');
                    tabId.forEach( tab => {
                        chrome.tabs.executeScript( tab.id, { code: reloadFunc }, () => {
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

        default:
            break;
    };
    //We have to return true or else the message port
    //will close before storage.local.get is returned.
    return true;
});

const $sigData = `
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
console.log(
    `%c${$sigData}`,
    'background: linear-gradient(to right, #5433ff, #222222, #20bdff); font-size: 22px; font-family:monospace; color: cyan; border-radius: 11px;'
);

const eventsPageSticky = () => {
    const CSS = `
        div#navbar-container {
            display: block !important;
            position: sticky;
            top: 0px;
            z-index: 1;
            user-select: none;
            opacity: 0.95;
        }

        div.fixed-table-toolbar {
            height: 40px !important;
            background-color: '#222' !important;
        }
    `;
    const JS = `
        const navbarContainer = document.getElementById('navbar-container');
        const toolbar = document.getElementsByClassName('fixed-table-toolbar')[0];
        navbarContainer.appendChild(toolbar);
    `;


/*     const thead = document.getElementsByTagName('thead')[0];
    const tableDiv = document.createElement('div');
    tableDiv.classList = "bootstrap-table bootstrap4";

    let table = document.createElement('table');
    table.classList = "table-sm table-borderless table table-bordered table-hover";
    table.appendChild(thead);
    tableDiv.appendChild(table);
    tableDiv.classList = "row justify-content-center table-responsive-sm bootstrap-table bootstrap4";
    navbarContainer.appendChild(tableDiv); */

    tabId.filter( tab => tab.title === titles.EVENTS ).forEach( tab => {
        settings.eventsPageSticky ?
            chrome.tabs.executeScript( tab.id, {
                //target: { tabId: tab.id },
                code: JS
            }, () => {
                chrome.tabs.insertCSS( tab.id, {
                    //target: { tabId: tab.id },
                    code: CSS
                })
            }):
            chrome.tabs.removeCSS( tab.id, {
                //target: { tabId: tab.id },
                code: CSS
            })
    })
}

const eventStats = () => {
    const CSS = `
        .eventStats {
            z-index: 1 !important;
            position: fixed !important;
            background-color: rgba(30,30,30,0.55) !important;
            backdrop-filter: blur(3px) !important;
            display: block !important;
            border-radius: 15px !important;
            padding: 10px 2px !important;
            margin: 2px !important;
        }
        #eventStatsTable {
            display: block !important     /*zm adds display:none at certain window points
        }`;

    tabId.filter( tab => tab.title === titles.EVENT ).forEach( tab  => {
        if ( settings.eventStats ){
            chrome.tabs.executeScript( tab.id, {
                //target: { tabId: tab.id },
                code: `showEventStats( ${JSON.stringify( settings.eventStatsPosition )} );`
            }, chrome.tabs.insertCSS( tab.id, {
                    //target: { tabId: tab.id },
                    code: CSS
                })
            )
        } else {
            chrome.tabs.insertCSS( tab.id, {
                //target: { tabId: tab.id },
                code: `
                    .eventStats {
                        display: none !important;
                    }`
            });
        }
    });
}

const maintainEventAspect = () => {
    //if ( !settings.maximizeEventView ) return;
    tabId.filter( tab => tab.title === titles.EVENT ).forEach( tab  => {
        settings.maintainEventAspect ?
            chrome.tabs.insertCSS( tab.id, {
                //target: { tabId: tab.id },
                code: `
                    video, #videoobj {
                        object-fit: contain !important;
                    }`
            }) :
            chrome.tabs.insertCSS( tab.id, {
                //target: { tabId: tab.id },
                code: `
                    video, #videoobj {
                        object-fit: fill !important;
                    }`
            });
    });    
}


const maximizeEventView = ( initial = false ) => {
    const CSS = `
        #controlDiv {
            transition: opacity 0.5s;
            opacity: 0.5 !important;
            width: 100vw !important;
            height: auto !important;
            padding: 0px 10px;
            background-color: unset !important;
        }
        #controlDiv:hover {
            opacity: 0.9 !important;
        }
 
        img, video, #videoobj {
            width: 100vw !important;
            height: 100vh !important;
            overflow: visible !important;
        }
        
        #content {
            display: block !important;
            margin: 0px !important;
        }
        #eventVideo {
            display: block !important;
            position: fixed !important;
        }
        #alarmCues {
            position: absolute !important;
        }
        #toolbar {
            position: fixed !important;
            left: 2px;
            display: inline-block !important;
        }
        #replayCtrl {
            background-color: rgba(31,31,31,0.5);
            position: fixed !important;
            right: 2px;
            border-radius: 8px;
            padding: 2px 10px !important;

        }
        #progress {
            display: inline-block !important;
            width: 10em;
        }
        #dvrControls {
            margin: 0px !important;
            text-align: center !important;
            width: max-content !important;
            text-align: center !important;
            position: relative !important;
            display: inline-block !important;
        }
        #progressBar {
            top: 20px !important;
            background-color: rgba(30,30,30,0.6) !important;
        }

        .vjs-big-play-button {
            position: relative !important;
            margin: auto !important;
            top: 50% !important;
        }
        .d-flex.flex-row.flex-wrap.justify-content-between.px-3.py-1 {
            display: none !important;
        }

    `;

    tabId.filter( tab => tab.title === titles.EVENT ).forEach( tab  => {
        if ( settings.maximizeEventView ){
            chrome.tabs.insertCSS( tab.id, {
                //target: { tabId: tab.id },
                code: CSS
            });
            chrome.tabs.executeScript( tab.id, {
                //target: { tabId: tab.id },
                code: `
                    setupZoom( ${settings.zoomFactor} );
                    setupControlBar( ${settings.controlBarPosition} );
                `
            });
        } else {
            if ( !initial ){
                chrome.tabs.executeScript( tab.id, {
                    //target: { tabId: tab.id },
                    code: reloadFunc
                });
            }
        }
    });
}

/* 
chrome.scripting.executeScript({
    target: {
        tabId: sender.tab.id
    },
    args: [.1, {x:0, y:0}, '#ff0000', 0.8, '#00ff00', 0.4],
    func: (...args) => {placeMontageButton(...args)}
})
 */

const mergeHeader = () => {
    tabId.filter( tab => tab.title === titles.MONTAGE || tab.title === titles.WATCH ).forEach( tab => {
        chrome.tabs.executeScript( tab.id, {
            //target: { tabId: tab.id },
            code: `
                let navbar = document.getElementById('navbar-container');
                let header = document.getElementById('header');
                navbar.appendChild(header);
            `
        });
    });
}

const maximizeMontage = () => {
    tabId.filter( tab => tab.title === titles.MONTAGE ).forEach( tab => {
        chrome.tabs.executeScript( tab.id, {
            //target: { tabId: tab.id },
            code: `
                placeConsoleButton(
                    ${settings.consoleScale},
                    ${JSON.stringify(settings.consolePosition)},
                    '${settings.strokeColor}',
                    ${settings.strokeOpacity},
                    '${settings.fillColor}',
                    ${settings.fillOpacity}
                );
                showPanel(
                    ${JSON.stringify(settings.panelPosition)},
                    '${settings.dropShadowString}',
                    '${settings.shadowColor}'
                );

            `
        })
    })
}

const autoScaleFn = () => {
    tabId.filter( tab => tab.title === titles.MONTAGE ).forEach( tab => {
        chrome.tabs.executeScript( tab.id, {
            //target: { tabId: tab.id },
            code: `
                document.getElementById('scale').value = ${settings.autoScale};
                changeScale();

            `
        })
    })
}


const ghostCSSApply = ( change ) => {
    tabId.filter( tab => settings.ghostHeader[tab.title] ).forEach( tab => {
        chrome.tabs.removeCSS( tab.id, {
            //target: { tabId: tab.id },
            code: change.oldValue
        }, () => {
            chrome.tabs.insertCSS( tab.id, {
                //target: { tabId: tab.id },
                code: change.newValue
            });
        });
    });
}


const ghostHeader = ( initial = false ) => {
    tabId.forEach( tab => {
        if ( settings.ghostHeader[tab.title] ){
            chrome.tabs.insertCSS( tab.id, {
                //target: { tabId: tab.id },
                code: settings.ghostCSS
            }, () => {
                chrome.tabs.executeScript( tab.id, {
                    //target: { tabId: tab.id },
                    code: `
                        placeNavbar( ${JSON.stringify( settings.navbarPosition )},
                        '${settings.dropShadowString}',
                        '${settings.shadowColor}' );
                    `
                })
            })
        } else {
            if ( initial ){
                return;
            } else {
                chrome.tabs.executeScript( tab.id, {
                    //target: { tabId: tab.id },
                    code: reloadFunc
                })
            }
        }
    });
}

const customCSS = ( name, change = undefined ) => {
/*     console.table(name);
    console.table(change);
    console.table(tabId);
    console.table(settings) */
    switch ( name ){

        case titles.MONTAGE:
            tabId.filter( tab => tab.title === titles.MONTAGE ).forEach( tab => {
                chrome.tabs.insertCSS( tab.id, {
                    //target: { tabId: tab.id },
                    code: settings.customCSSMontage
                });
            });
            break;

        case titles.WATCH:
            tabId.filter( tab => tab.title === titles.WATCH ).forEach( tab => {
                chrome.tabs.insertCSS( tab.id, {
                    //target: { tabId: tab.id },
                    code: settings.customCSSWatch
                });
            });
            break;

        case titles.EVENT:
            tabId.filter( tab => tab.title === titles.EVENT ).forEach( tab => {    
                chrome.tabs.insertCSS( tab.id, {
                    //target: { tabId: tab.id },
                    code: settings.customCSSEvent
                });
            });
            break;

        case 'customCSSMontage':
            tabId.filter( tab => tab.title === titles.MONTAGE ).forEach( tab => {
                if ( change.oldValue ) chrome.tabs.removeCSS( tab.id, {
                    //target: { tabId: tab.id },
                    code: change.oldValue
                }, () => {
                    chrome.tabs.insertCSS( tab.id, {
                        //target: { tabId: tab.id },
                        code: change.newValue
                    });
                });
            });
            break

        case 'customCSSWatch':
            tabId.filter( tab => tab.title === titles.WATCH ).forEach( tab => {
                if ( change.oldValue ) chrome.tabs.removeCSS( tab.id, {
                    //target: { tabId: tab.id },
                    code: change.oldValue
                }, () => {
                    chrome.tabs.insertCSS( tab.id, {
                        //target: { tabId: tab.id },
                        code: change.newValue
                    });
                });
            });
            break

        case 'customCSSEvent':
            tabId.filter( tab => tab.title === titles.EVENT ).forEach( tab => {
                if ( change.oldValue ) chrome.tabs.removeCSS( tab.id, {
                    code: change.oldValue
                }, () => {
                    chrome.tabs.insertCSS( tab.id, {
                        //target: { tabId: tab.id },
                        code: change.newValue
                    });
                });
            });
            break;

        default:
            console.log(`no match for ${name}`);
            break;
    }

/*     tabId.forEach( tab => {
        switch ( tab.title ){
            case titles.MONTAGE:
                chrome.tabs.removeCSS( tab.id, { code: cssToBeRemoved });
                chrome.tabs.insertCSS( tab.id, { code: settings.customCSS });
                cssToBeRemoved = settings.customCSS;
                break;

            case titles.WATCH:
                chrome.tabs.removeCSS( tab.id, { code: cssToBeRemovedWatch });
                chrome.tabs.insertCSS( tab.id, { code: settings.customCSSWatch});
                cssToBeRemovedWatch = settings.customCSSWatch;
                break;

            case titles.EVENT:
                chrome.tabs.removeCSS( tab.id, { code: cssToBeRemovedEvent });
                chrome.tabs.insertCSS( tab.id, { code: settings.customCSSEvent });
                cssToBeRemovedEvent = settings.customCSSEvent;
                break;

            default:
                break;                  
        } */
    //})
}

const maintainSingleMonitorAspect = () => {
    tabId.filter(tab => tab.title === titles.WATCH ).forEach( tab  => {
        settings.maintainSingleMonitorAspect && settings.maximizeSingleView ?
            chrome.tabs.insertCSS( tab.id, {
                //target: { tabId: tab.id },
                code:
                `img:first-child {
                    object-fit: contain !important;
                }`
            }) :

            chrome.tabs.insertCSS( tab.id, {
                //target: { tabId: tab.id },
                code:
                `img:first-child {
                    object-fit: fill !important;
                }`
            })
    });
}

const showFps = ( initial = false ) => {
    tabId.filter( tab => tab.title === titles.WATCH ).forEach( tab => {
        if ( settings.showFps ){
            chrome.tabs.executeScript( tab.id, {
                //target: { tabId: tab.id },
                code: `showFpsFunc( ${JSON.stringify(settings.fpsColor)}, ${settings.fpsSize} );`
            });
        } else {
            if ( initial) return;
            chrome.tabs.executeScript( tab.id, {
                //target: { tabId: tab.id },
                code: `fpsSpan.remove();`
            });
        }
    });
}

const maximizeSingleView = ( initial = false ) => {
    const code = `
        .imageFeed img {
            border: none !important;
        }
        img:first-child {
            width: 100vw !important;
            height: 100vh !important;
        }
        div#content {
            margin: 0px !important;
        }
        .monitor, .monitorStream img {
            margin: 0px !important;
        }
        div.navbar, div#monitorStatus, .monitorStatus, div#dvrControls, div#replayStatus, div#ptzControls, div#events, div.warning {
            display: none !important;
        }
        div.d-flex {
            display: none !important;
        }
        `;
    tabId.filter( tab => tab.title === titles.WATCH ).forEach( tab => {
        if ( settings.maximizeSingleView ){
            chrome.tabs.insertCSS( tab.id, {
                //target: { tabId: tab.id },
                code: code
            }, () => {
                chrome.tabs.executeScript( tab.id, {
                    //target: { tabId: tab.id },
                    code: `
                        setupZoom( ${ settings.zoomFactor });
                        placeRecordIcon( ${settings.lockRecordButton}, ${settings.recordButtonSize}, ${settings.disableRecordOnAlert} );
                    `
                });
            });
            //chrome.tabs.executeScript( tab.id, { code: `js/watch-content.js` });
        } else {
            //chrome.tabs.removeCSS( tab.id, { code: code });
            if ( !initial ) chrome.tabs.executeScript( tab.id, { code: reloadFunc });
        }
    });
};

const overrideMontageAspect = () => {
    //Added 'svg' to handle montage view when 'Show Zones' is enabled

    const CSS = `
        img, svg {
            aspect-ratio:${settings.aspectRatio} !important;
        }`

    tabId.filter( tab => tab.title === titles.MONTAGE ).forEach( tab => {
        settings.overrideMontageAspect ?
            chrome.tabs.insertCSS( tab.id, { code: CSS }) :
            chrome.tabs.removeCSS( tab.id, { code: CSS });
    });
};

const borderRadius = ( oldValue = '0' ) => tabId.filter( tab => tab.title === titles.MONTAGE ).forEach( tab => {
        chrome.tabs.removeCSS( tab.id, { code:
            `img {
                border-radius:${oldValue}% !important;
            }`
        });            
        chrome.tabs.insertCSS( tab.id, { code:
            `img {
                border-radius:${settings.borderRadius}% !important;
            }`
        });
})

const gridHandler = () => {
    tabId.forEach( tab => {
        if ( tab.title === titles.MONTAGE ){
            settings.transparentGrid ?
                chrome.tabs.insertCSS( tab.id, { code:
                    `img {
                        border:${settings.gridWidth}px solid transparent !important;
                    }`
                }) : 
                chrome.tabs.insertCSS( tab.id, { code:
                    `img {
                        border:${settings.gridWidth}px solid ${settings.gridColor} !important;
                    }`
                });
        }
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

const changeMonitorsPerRow = () => {     ////DON'T REMOVE CSS FIRST, SEEMS FASTER AND MAKES NO APPARENT DIFFERENCE
    tabId.filter( tab => tab.title === titles.MONTAGE).forEach( tab => {
        chrome.tabs.insertCSS( tab.id, {
            //target: { tabId: tab.id },
            code: `
                #monitors > div {
                    width: ${100 / settings.monitorsPerRow}% !important;
                }`
        });
    });
}

const toggleScroll = () => {
    const CSS = 
        `::-webkit-scrollbar {
            width: 0px !important;
        }`
    tabId.forEach( tab => {
        settings.toggleScroll ?
            chrome.tabs.insertCSS( tab.id, { code: CSS }) :
            chrome.tabs.removeCSS( tab.id, { code: CSS })
    });
};

const filterHandler = () => {
    let filterString = 'filter: ';

    if ( settings.hueRotate !== 0 ){
        filterString += `hue-rotate(${settings.hueRotate}deg) `;
    }
    if ( settings.dropShadow ){
        filterString += `drop-shadow(${settings.dropShadowString} ${settings.shadowColor}) `;
    }
    if ( settings.invertColors ){
        filterString += `invert(${settings.inversionAmount}) `;
    }
    if ( filterString === `filter: ` ){
        filterString += `none `;
    }
    filterString += `!important;`

    tabId.filter( tab => tab.title === titles.MONTAGE || ( settings.applyFilters && tab.title === titles.WATCH )).forEach( tab => {
        chrome.tabs.insertCSS( tab.id, { code:
            `img, #panel {
                ${filterString}
            }`
        });
    });
};

const flashAlarm = () => {
    //At some point between ZM 1.34.x and 1.35.14, the img no longer got the alarm or alert
    //class. So div.alarm img and div.alert img were added below to the css selectors.
    const flash = ( id ) => {
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
    
    tabId.forEach( tab => 
        settings.flashAlarm && tab.title === titles.MONTAGE ?
            flash( tab.id ) :
            chrome.tabs.insertCSS( tab.id, { code:
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
    const CSS = `
        div.navbar {
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

    tabId.forEach( tab => {
        //if ( tab.title === titles.MONTAGE || tab.title === titles.EVENT){
            settings.hideHeader[tab.title] ?
                chrome.tabs.insertCSS( tab.id, { code: CSS }):
                chrome.tabs.removeCSS( tab.id, { code: CSS })
    })
}


const setBackgroundColor = () => {
    tabId.forEach( tab => {
        chrome.tabs.insertCSS( tab.id, { code:
            `body {
                background-color: ${ settings.backgroundColor } !important;
            }`
        });
    });
};

const fpsOverlay = () => tabId.forEach( tab => {
    if ( tab.title === titles.WATCH ){
        console.log('here')
        chrome.tabs.insertCSS( tab.id, { code:
            `#fpsSpan {
                color:      ${settings.fpsColor} !important;
                line-height: ${settings.fpsSize}px !important; 
                height:     ${settings.fpsSize}px !important; 
                font-size:   ${settings.fpsSize}px !important;
            }`
        });
    }
});

const zoomFactor = () => tabId.forEach( tab => {
    if ( tab.title === titles.WATCH || tab.title === titles.EVENT ){
        chrome.tabs.sendMessage( tab.id, {
            'zoomFactor': settings.zoomFactor
        });
    }
});
    
const updateConsoleIcon = () => tabId.filter( tab => tab.title === titles.MONTAGE).forEach( tab => {

    chrome.tabs.insertCSS( tab.id, { code:
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
    });

});

const unhideBody = id => {
    chrome.tabs.insertCSS( id, { code: `body {visibility: initial;}`} );
}
/* const changeDeclarativeContent = customLocation => {
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
}; */
