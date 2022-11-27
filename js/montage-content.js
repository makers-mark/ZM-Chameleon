(() => {
    "use strict";
    //import placeConsoleButton from "./consoleBtn.js";
    document.addEventListener('DOMContentLoaded', () => {

        let zmMontageLayout = document.getElementById('zmMontageLayout');

        chrome.runtime.sendMessage({
            montageOpen: true,
            zmMontageLayout: zmMontageLayout.value || document.getElementById('zmMontageLayout').value},
           
            reply => {
                if (reply){
                    placeConsoleButton(
                        reply.consoleX,
                        reply.consoleY,
                        reply.consoleScale,
                        reply.strokeColor,
                        reply.strokeOpacity,
                        reply.fillColor,
                        reply.fillOpacity
                    );
                };
        });


        //Listen for a change in the manual selection (dropdown) for the number of monitors in ZM webpage
        zmMontageLayout.addEventListener('input', () => {
            chrome.runtime.sendMessage({zmMontageChanged: true, value: zmMontageLayout.value || document.getElementById('zmMontageLayout').value});
        });
    });
})();