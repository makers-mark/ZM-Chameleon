    document.addEventListener('DOMContentLoaded', () => { 
        chrome.runtime.sendMessage({ title: document.title })
    });

 /*    document.addEventListener("dblclick", e => {
        window.history.back();
    }); */

    const titles = {
        MONTAGE       : 'ZM - Montage',
        CONSOLE       : 'ZM - Console',
        WATCH         : 'ZM - Watch',
        EVENT         : 'ZM - Event',
        EVENTS        : 'ZM - Events',
        LOGIN         : 'ZM - Login',
        GROUPS        : 'ZM - Groups',
        MONTAGEREVIEW : 'ZM - Montage Review',
        OPTIONS       : 'ZM - Options'
    };

    const defaultAspectRatio = '4/3';
    const defaultShadow      = '2px 4px 6px';
