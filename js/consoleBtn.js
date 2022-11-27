const placeConsoleButton = (
    x,
    y,
    scale,
    strokeColor,
    strokeOpacity,
    fillColor,
    fillOpacity
) => {

    const w = 24.75;
    const h = 21;

    let consoleSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    consoleSvg.style.top        = `${y}%`;
    consoleSvg.style.left       = `${x}%`;
    consoleSvg.style.position   = 'fixed';
    consoleSvg.style.userSelect = 'none';
    consoleSvg.style.display    = 'flex';
    consoleSvg.style.overflow   = 'visible';
    consoleSvg.id               = 'consoleSvg';
    consoleSvg.setAttribute('width', `${scale * w}px`);
    consoleSvg.setAttribute('height', `${scale * h}px`);

    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    path.id = 'path';
    path.style.stroke           = strokeColor;
    path.style.strokeWidth      = '1px';
    path.style.strokeOpacity    = strokeOpacity;
    path.style.fill             = fillColor;
    path.style.fillOpacity      = fillOpacity;
    path.style.transform = `scale(${scale})`;
    path.setAttribute('d', 'M0,3.875c0-1.104,0.896-2,2-2h20.75c1.104,0,2,0.896,2,2s-0.896,2-2,2H2C0.896,5.875,0,4.979,0,3.875z M22.75,10.375H2 c-1.104,0-2,0.896-2,2c0,1.104,0.896,2,2,2h20.75c1.104,0,2-0.896,2-2C24.75,11.271,23.855,10.375,22.75,10.375z M22.75,18.875H2 c-1.104,0-2,0.896-2,2s0.896,2,2,2h20.75c1.104,0,2-0.896,2-2S23.855,18.875,22.75,18.875z');

    consoleSvg.appendChild(path);

    document.getElementById('content').appendChild(consoleSvg);
    consoleSvg.addEventListener('mousedown', () => {
        window.location = '?view=console';
    });
};        
