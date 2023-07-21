const placeNavbar = ( navbarPosition = { x: 0, y: 0 }, dropShadowString = defaultShadow, shadowColor = '#000000' ) => {

    const setATagsUndraggable = ( aTags ) => {
        for ( var aTag of aTags ){
            aTag.draggable = false;
        };
    };

    const moveNavbar = ( position ) => {
        navHeader.style.left = `${position.x}px`;
        navHeader.style.top = `${position.y}px`;
    };

    const scale = 1;
    const transition = 0.25;
    let opacity = 0.5;
    let offset = [];
    let navHeader = document.getElementById('navbar-container') || document.getElementsByClassName('fixed-top')[0];
    let aTags = navHeader.getElementsByTagName('a') || '';
    let navHeaderStub = document.getElementById('header') || '';

    navHeader.style.zIndex              = '1';
    navHeader.style.width               = 'unset';
    navHeader.style.left                = `${navbarPosition.x}px`;
    navHeader.style.top                 = `${navbarPosition.y}px`;
    navHeader.style.border              = '1px solid #333';
    navHeader.draggable                 = true;
    navHeader.style.position            = 'fixed';
    //navHeader.style.backgroundColor     = '#222';
    navHeader.style.opacity             = opacity;
    navHeader.style.filter              = `drop-shadow(${dropShadowString} ${shadowColor})`;
    navHeader.style.transition          = `all ${transition}s cubic-bezier(0.18, 0.89, 0.01, 1.01) 0s, top 0s, left 0s`;
    navHeader.style.scale               = scale;

    if (navHeaderStub) navHeader.appendChild( navHeaderStub );
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

        navbarPosition.x  = (( e.clientX - offset[0]) < 0 ) ? 0 : ( e.clientX - offset[0] );
        navbarPosition.y  = (( e.clientY - offset[1]) < 0 ) ? 0 : ( e.clientY - offset[1] );

        moveNavbar(
            {
                x: navbarPosition.x,
                y: navbarPosition.y
            }
        );

        chrome.storage.local.set({
            navbarPosition: navbarPosition
        });
    });

    navHeader.addEventListener('mouseenter', () => {
        navHeader.style.opacity = 0.88;
    });

    navHeader.addEventListener('mouseleave', () => {
        navHeader.style.opacity = opacity;
    });
}