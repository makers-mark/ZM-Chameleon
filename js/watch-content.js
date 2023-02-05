(() => {
    "use strict";

    let windowState;

    document.addEventListener('DOMContentLoaded', () => {

        let monitorName = document.getElementById('monitorName') || document.getElementsByTagName('img')[0].alt;
        monitorName     = monitorName.innerHTML || monitorName;
        let cancelAlarm = document.getElementById('cancelAlarmLink') || document.getElementById('enableAlmBtn');
        let forceAlarm  = document.getElementById('forceAlarmLink') || document.getElementById('forceAlmBtn');
        let maximizeSingleView;

        chrome.runtime.sendMessage({
            watchPageOpen: true,
            monitorName: monitorName
        }, monitorSettings => {
            if (monitorSettings){
                windowState = monitorSettings.windowState;
                maximizeSingleView = monitorSettings.maximizeSingleView;

                if (monitorSettings.overrideZoom) setupZoom(monitorSettings.zoomFactor);

                if (forceAlarm && cancelAlarm) placeRecordIcon(
                    monitorName,
                    monitorSettings.monitor[monitorName + '_rec'],
                    monitorSettings.lockRecordButton,
                    monitorSettings.recordButtonSize,
                    monitorSettings.disableRecordOnAlert
                );

                if (monitorSettings.showFps) showFpsFunc(
                    monitorName,
                    monitorSettings.fpsColor,
                    monitorSettings.monitor[monitorName + '_fps'],
                    undefined,   //Init value of 0.00 fps until the fps mutation observer updates.
                    monitorSettings.fpsSize
                )
            }
        });

        //The montage page opens a monitor in a new
        //window, so close it on double click
        document.addEventListener("dblclick", e => {

            if (windowState === 'popup'){  //Fix this, add window.type and windowType for popup to happen in older versions of zm
                window.close()
            } else {
                window.history.back();
                if (maximizeSingleView && windowState === 'normal'){
                    chrome.runtime.sendMessage({fullscreenToggle: true});
                }
            }
        });
    }); //DOMContentLoaded
})();
