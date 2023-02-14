(() => {
    "use strict";

    document.addEventListener('DOMContentLoaded', () => {
        chrome.runtime.onMessage.addListener(( msg ) => {
            if ( msg ){
                placeNavbar( msg.navbarPosition, msg.dropShadow, 0.2)
            };
            return true;
        });

        let zmMontageLayout = document.getElementById('zmMontageLayout');

        chrome.runtime.sendMessage({
            montageOpen: true,
            zmMontageLayout: zmMontageLayout.value || document.getElementById('zmMontageLayout').value
        }, reply => {
            if ( reply ){
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
                if (reply.ghostHeader) placeNavbar(
                    reply.navbarPosition,
                    reply.dropShadow,
                    0.2
                );
            };
        });

        //Listen for a change in the manual selection (dropdown) for the number of monitors in ZM webpage
        zmMontageLayout.addEventListener('input', () => {
            chrome.runtime.sendMessage({ zmMontageChanged: true, value: zmMontageLayout.value || document.getElementById('zmMontageLayout').value });
        });
    });

    const placeNavbar = ( position, dropShadow, opacity ) => {

        const moveNavbar = ( position ) => {
            navHeader.style.left = `${position.x}px`;
            navHeader.style.top = `${position.y}px`;
        };

        const scale = 1;
        const transition = 0.5;
        let offset = [];
        let navHeader = document.getElementById('navbar-container');
        let aTags = navHeader.getElementsByTagName('a');
        let navHeaderStub = document.getElementById('header');

        navHeader.style.zIndex              = '1';
        navHeader.style.width               = 'unset';
        navHeader.style.left                = `${position.x}px`;
        navHeader.style.top                 = `${position.y}px`;
        navHeader.style.border              = '1px solid #333';
        navHeader.draggable                 = true;
        navHeader.style.position            = 'fixed';
        navHeader.style.backgroundColor     = '#222';
        navHeader.style.padding             = '4px 6px';
        navHeader.style.opacity             = opacity;
        navHeader.style.filter              = `drop-shadow(${dropShadow.string} ${dropShadow.color})`;
        navHeader.style.transition          = `all ${transition}s cubic-bezier(0.18, 0.89, 0.01, 1.01) 0s, top 0s, left 0s`;
        navHeader.style.scale               = scale;

        navHeader.appendChild( navHeaderStub );
        document.getElementById('content').appendChild( navHeader );

        setATagsUndraggable( aTags );

        navHeader.addEventListener('mousedown', e => {
            let bounds = navHeader.getBoundingClientRect();
            offset = [
                e.clientX - bounds.left,
                e.clientY - bounds.top
            ];
        });

        navHeader.addEventListener('dragstart', () => document.body.style.overflow = 'hidden' ); //handle scroll/drag

        navHeader.addEventListener('dragend', e => {
            document.body.style.overflow = 'auto';

            let x  = ((e.clientX - offset[0]) < 0) ? 0 : (e.clientX - offset[0]);
            let y  = ((e.clientY - offset[1]) < 0) ? 0 : (e.clientY - offset[1]);

            moveNavbar(
                {
                    x: position.x = x,
                    y: position.y = y
                }
            );

            chrome.storage.local.set({
                navbarPosition: position
            });
        });

        navHeader.addEventListener('mouseenter', () => {
            navHeader.style.opacity = 0.88;
        });

        navHeader.addEventListener('mouseleave', () => {
            navHeader.style.opacity = opacity;
        });

    }

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
        consoleDiv.draggable        = true; 

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

        document.getElementById('content').appendChild( consoleDiv );

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

    const showPanel = ( x, y, dropShadow, target ) => {

        /*const changeScale = scale => {
            let script = document.createElement('script');
            script.src = chrome.runtime.getURL('js/scaleScript.js?') + new URLSearchParams({'scale': scale});
            script.onload = function(){this.remove();};
            document.head.appendChild(script);
        };*/

        const movePanel = ( x, y ) => {
            panel.style.left = `${x}px`;
            panel.style.top = `${y}px`;

        };

        const opacity       = 0.4;
        const scale         = 0.95;
        const transition    = 0.5;

        let offset = [];
        let panel = document.getElementById( target );
        let aTags = panel.getElementsByTagName("a");

        //When you go to drag the panel and happen to click on a link in the panel to drag, you get the ghost of the link
        //shown in the drag. Setting the links as draggable false fixes this

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
        
        setATagsUndraggable( aTags );

        let scaleControl = document.getElementById('scaleControl');
        scaleControl.style.display = 'none';

        panel.appendChild( scaleControl );
        document.getElementById('content').appendChild( panel );

        panel.addEventListener('click', e => {
            //First click on dropdown toggles both the dropdown and info panel click (hideHeader), this fixes that
            //so that just what is clicked gets it.
            if (e.target.id === 'dropdown_bandwidth' || e.target.id === 'dropdown_storage' || e.target.id === 'scale'){
                return;
            }

            chrome.storage.local.get({
                hideHeader: true
            }, result => {
                chrome.storage.local.set({
                    hideHeader: !result.hideHeader
                })
            });
            return false;
        });

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
/* 
        panel.addEventListener('dragstart', (e) => {
            //e.preventDefault();
            return false;
        }); */

        panel.addEventListener('mouseenter', () => {
            panel.style.scale           = scale + 0.05;
            panel.style.opacity         = 0.88;

            panel.style.borderRadius    = `${Math.floor(Math.random() * 80)}px ${Math.floor(Math.random() * 80)}px`;

            scaleControl.style.display  = "block";
        });

        panel.addEventListener('mouseleave', () => {
            panel.style.scale           = scale;
            panel.style.opacity         = opacity;
            panel.style.borderRadius    = '100px';
            scaleControl.style.display  = "none";

            //Close Dropdowns that are open when mouse leaves panel
            panel.querySelectorAll("[aria-labelledby^='dropdown_']").forEach( el => {
                el.classList.remove('show');
            });
        });
    };

    const setATagsUndraggable = ( aTags ) => {
        for ( var aTag of aTags ){
            aTag.draggable = false;
        };
    };
    
})(
    (consoleIconSVG) = `M0,3.875c0-1.104,0.896-2,2-2h20.75c1.104,0,2,0.896,
2,2s-0.896,2-2,2H2C0.896,5.875,0,4.979,0,3.875z M22.75,10.375H2 c-1.104,0-2,
0.896-2,2c0,1.104,0.896,2,2,2h20.75c1.104,0,2-0.896,2-2C24.75,11.271,23.855
,10.375,22.75,10.375z M22.75,18.875H2 c-1.104,0-2,0.896-2,2s0.896,2,2,
2h20.75c1.104,0,2-0.896,2-2S23.855,18.875,22.75,18.875z`
);
