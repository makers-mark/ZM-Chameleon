(() => {
    "use strict";

    document.addEventListener('DOMContentLoaded', () => {

        let zmMontageLayout = document.getElementById('zmMontageLayout');

        chrome.runtime.sendMessage({
            montageOpen: true,
            zmMontageLayout: zmMontageLayout.value || document.getElementById('zmMontageLayout').value
        }, reply => {
            if (reply){
                placeConsoleButton(
                    reply.consoleScale,
                    reply.consolePosition,
                    reply.strokeColor,
                    reply.strokeOpacity,
                    reply.fillColor,
                    reply.fillOpacity
                );
                showPanel(
                    reply.panelPosition.x,
                    reply.panelPosition.y,
                    reply.dropShadow,
                    'panel'
                );
            };
        });

        //Listen for a change in the manual selection (dropdown) for the number of monitors in ZM webpage
        zmMontageLayout.addEventListener('input', () => {
            chrome.runtime.sendMessage({zmMontageChanged: true, value: zmMontageLayout.value || document.getElementById('zmMontageLayout').value});
        });
    });

    const placeConsoleButton = (
        consoleScale,
        consolePosition,
        strokeColor,
        strokeOpacity,
        fillColor,
        fillOpacity
    ) => {
        const w = 24.75;
        const h = 21;
        let offset = [];
        let consoleSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let consoleDiv = document.createElement('div');

        consoleDiv.style.top        = `${consolePosition.y}px`;
        consoleDiv.style.left       = `${consolePosition.x}px`;
        consoleDiv.style.position   = 'fixed';
        consoleDiv.id               = 'consoleDiv';
        consoleDiv.draggable = true; 

        consoleSvg.style.overflow   = 'visible';
        consoleSvg.id               = 'consoleSvg';
        consoleSvg.setAttribute('width', `${consoleScale * w}`);
        consoleSvg.setAttribute('height', `${consoleScale * h}`);

        let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        path.id                     = 'path';
        path.style.stroke           = strokeColor;
        path.style.strokeWidth      = '1px';
        path.style.strokeOpacity    = strokeOpacity;
        path.style.fill             = fillColor;
        path.style.fillOpacity      = fillOpacity;
        path.style.transform        = `scale(${consoleScale})`;
        path.setAttribute('d', consoleIconSVG);

        consoleSvg.appendChild(path);
        consoleDiv.appendChild(consoleSvg);

        document.getElementById('content').appendChild(consoleDiv);

        consoleDiv.addEventListener('click', () => {
            window.location = '?view=console';
        });

        consoleDiv.addEventListener('mousedown', e => {
            let bounds = consoleDiv.getBoundingClientRect();
            offset = [
                e.clientX - bounds.left,
                e.clientY - bounds.top
            ];
        });

        consoleDiv.addEventListener('dragend', e => {
            consoleDiv.remove();
            placeConsoleButton(
                consoleScale,
                {
                    x: consolePosition.x = e.clientX - offset[0],
                    y: consolePosition.y = e.clientY - offset[1]
                },
                strokeColor,
                strokeOpacity,
                fillColor,
                fillOpacity
            );

            chrome.storage.local.set({
                consolePosition: consolePosition
            });
        });
    };

    const showPanel = (x, y, dropShadow, target) => {

        /*const changeScale = scale => {
            let script = document.createElement('script');
            script.src = chrome.runtime.getURL('js/scaleScript.js?') + new URLSearchParams({'scale': scale});
            script.onload = function(){this.remove();};
            document.head.appendChild(script);
        };*/

        const movePanel = (x, y) => {
            panel.style.left = `${x}px`;
            panel.style.top = `${y}px`;

        };

        const opacity = 0.4;
        const scale = 0.85;
        const transition = 0.5;

        let offset = [];
        let panel = document.getElementById(target);
        let aTags = panel.getElementsByTagName("a");

        //When you go to drag the panel and happen to click on a link in the panel to drag, you get the ghost of the link
        //shown in the drag. Setting the links as draggable false fixes this
        const setATagsUndraggable = () => {
            for (var aTag of aTags) aTag.draggable = false;
        }

        panel.style.zIndex              = '1';
        panel.style.width               = 'unset';
        panel.style.left                = `${x}px`;
        panel.style.top                 = `${y}px`;
        panel.style.border              = '1px solid #333';
        panel.draggable                 = true;
        panel.style.position            = 'fixed';
        panel.style.backgroundColor     = '#222';
        panel.style.borderRadius        = '100px';
        panel.style.padding             = '4px 6px';
        panel.style.opacity             = opacity;
        panel.style.filter              = `drop-shadow(${dropShadow.string} ${dropShadow.color})`;
        panel.style.transition          = `all ${transition}s cubic-bezier(0.18, 0.89, 0.01, 1.01) 0s, top 0s, left 0s`;
        panel.style.scale               = scale;
        setATagsUndraggable();

        let scaleControl = document.getElementById('scaleControl');
        scaleControl.style.display = 'none';

        panel.appendChild(scaleControl);
        document.getElementById('content').appendChild(panel);

        panel.addEventListener('mousedown', e => {
            let bounds = panel.getBoundingClientRect();
            offset = [
                e.clientX - bounds.left,
                e.clientY - bounds.top
            ];
        });

        panel.addEventListener('dragend', e => {

            movePanel(
                x = e.clientX - offset[0],
                y = e.clientY - offset[1]
            );

            chrome.storage.local.set({
                panelPosition: {
                    x:x,
                    y:y
                }
            });
        });

        panel.addEventListener('mouseenter', () => {
            panel.style.scale           = scale + 0.15;
            panel.style.opacity         = 0.9;
            panel.style.borderRadius    = '10px';
            panel.style.padding         = '2px 0px';
            scaleControl.style.display  = "block";
        });

        panel.addEventListener('mouseleave', () => {
            panel.style.scale           = scale;
            panel.style.opacity         = opacity;
            panel.style.padding         = '4px 6px';
            panel.style.borderRadius    = '100px';
            scaleControl.style.display  = "none";

            //Close Dropdowns that are open when mouse leaves panel
            panel.querySelectorAll("[aria-labelledby^='dropdown_']").forEach( el => {
                el.classList.remove('show');
            });
        });
    };
})(
    (consoleIconSVG) = `M0,3.875c0-1.104,0.896-2,2-2h20.75c1.104,0,2,0.896,
2,2s-0.896,2-2,2H2C0.896,5.875,0,4.979,0,3.875z M22.75,10.375H2 c-1.104,0-2,
0.896-2,2c0,1.104,0.896,2,2,2h20.75c1.104,0,2-0.896,2-2C24.75,11.271,23.855
,10.375,22.75,10.375z M22.75,18.875H2 c-1.104,0-2,0.896-2,2s0.896,2,2,
2h20.75c1.104,0,2-0.896,2-2S23.855,18.875,22.75,18.875z`
);
