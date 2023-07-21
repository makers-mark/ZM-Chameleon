/* const setZMMontageLayout = montageLayout => {
    let script = document.createElement('script');
    script.src = chrome.runtime.getURL( 'js/scaleScript.js?' ) + new URLSearchParams({ 'montageLayout': montageLayout });
    script.addEventListener('load', () => script.remove() );
    document.head.appendChild( script );
}; */

const changeScale = () => {
    let script = document.createElement('script');
    script.src = chrome.runtime.getURL( 'js/scaleScript.js?' ) + new URLSearchParams({ 'changeScale': true });
    script.addEventListener('load', () => script.remove() );
    document.head.appendChild( script );
};


const placeConsoleButton = (
        consoleScale = 2,
        consolePosition = {
            x: 5,
            y: 5
        },
        strokeColor = '#00c7b0',
        strokeOpacity = 0.18,
        fillColor = '#666ff0',
        fillOpacity = 0.14
) => {

    const w = 24.75;
    const h = 21;
    const consoleIconSVG = `
        M0,3.875c0-1.104,0.896-2,2-2h20.75c1.104,0,2,0.896,
        2,2s-0.896,2-2,2H2C0.896,5.875,0,4.979,0,3.875z M22.75,10.375H2 c-1.104,0-2,
        0.896-2,2c0,1.104,0.896,2,2,2h20.75c1.104,0,2-0.896,2-2C24.75,11.271,23.855
        ,10.375,22.75,10.375z M22.75,18.875H2 c-1.104,0-2,0.896-2,2s0.896,2,2,
        2h20.75c1.104,0,2-0.896,2-2S23.855,18.875,22.75,18.875z
    `;

    /*     chrome.storage.local.get({
        consoleScale: 2,
        consolePosition: {
            x: 5,
            y: 5
        },
        strokeColor: '#00c7b0',
        strokeOpacity: 0.18,
        fillColor: '#666ff0',
        fillOpacity: 0.14
    }, settings => { */

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
        })

        consoleDiv.addEventListener('mousedown', e => {
            let bounds = consoleDiv.getBoundingClientRect();
            offset = [
                e.clientX - bounds.left,
                e.clientY - bounds.top
            ];
        })

        const moveConsoleIcon = position => {
            consoleDiv.style.left = `${position.x}px`;
            consoleDiv.style.top = `${position.y}px`;
        }

        consoleDiv.addEventListener('dragend', e => {
            moveConsoleIcon( {
                x: consolePosition.x = e.clientX - offset[0],
                y: consolePosition.y = e.clientY - offset[1]
            })

            chrome.storage.local.set({
                consolePosition: consolePosition
            })
        })
    }

const showPanel = ( panelPosition = { x: 200, y: 10 }, dropShadowString = defaultShadow, shadowColor = '#000000' ) => {

    const movePanel = ( x, y ) => {
        panel.style.left = `${x}px`;
        panel.style.top = `${y}px`;
    };

    const opacity       = 0.4;
    const scale         = 0.95;
    const transition    = 0.5;

    const setATagsUndraggable = ( aTags ) => {
        for ( var aTag of aTags ){
            aTag.draggable = false;
        };
    };

    let offset = [];
    
    const brFactor = 80;
    let panel = document.getElementById( 'panel' );
    let aTags = panel.getElementsByTagName("a");

    //When you go to drag the panel and happen to click on a link in the panel to drag, you get the ghost of the link
    //shown in the drag. Setting the links as draggable false fixes this

    panel.style.zIndex              = '1';
    panel.style.width               = 'unset';
    panel.style.left                = `${panelPosition.x}px`;
    panel.style.top                 = `${panelPosition.y}px`;
    panel.style.border              = '1px solid #333';
    panel.draggable                 = true;
    panel.style.position            = 'fixed';
    panel.style.backgroundColor     = '#222';
    panel.style.borderRadius        = '100px';
    panel.style.padding             = '4px 6px';
    panel.style.opacity             = opacity;
    panel.style.filter              = `drop-shadow(${dropShadowString} ${shadowColor})`;
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
        if ( e.target.id === 'dropdown_bandwidth' || e.target.id === 'dropdown_storage' || e.target.id === 'scale' ){
            return;
        }

        chrome.storage.local.get( 'hideHeader', edit => {
            edit.hideHeader[titles.MONTAGE] = !edit.hideHeader[titles.MONTAGE];
            chrome.storage.local.set({
                hideHeader: edit.hideHeader
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
            panelPosition.x = e.clientX - offset[0],
            panelPosition.y = e.clientY - offset[1]
        );

        chrome.storage.local.set({
            panelPosition: {
                x: panelPosition.x,
                y: panelPosition.y
            }
        });
    });

    panel.addEventListener('mouseenter', () => {
        panel.style.scale           = scale + 0.05;
        panel.style.opacity         = 0.88;

        panel.style.borderRadius    = `${Math.floor( Math.random() * brFactor )}px ${Math.floor( Math.random() * brFactor )}px`;

        scaleControl.style.display  = "block";
    })

    panel.addEventListener('mouseleave', () => {
        panel.style.scale           = scale;
        panel.style.opacity         = opacity;
        //panel.style.borderRadius    = '100px';
        scaleControl.style.display  = "none";

        //Close Dropdowns that are open when mouse leaves panel
        panel.querySelectorAll("[aria-labelledby^='dropdown_']").forEach( el => {
            el.classList.remove('show');
        });
    })
}
