(() => {
    "use strict";

    let zmMontageLayout = document.getElementById('zmMontageLayout');
    chrome.runtime.sendMessage({montageOpen: true, zmMontageLayout: zmMontageLayout.value || document.getElementById('zmMontageLayout').value});

    //Listen for a change in the manual selection (dropdown) for the number of monitors in ZM webpage
    zmMontageLayout.addEventListener('input', () => {
        chrome.runtime.sendMessage({zmMontageChanged: true, value: zmMontageLayout.value || document.getElementById('zmMontageLayout').value});
    });
let images = document.getElementsByTagName('img');  //ClassName('imageFeed');
/* for (var i = 0; i < images.length; i++){
    //console.log(images[i]);
        //images[i].alt = '/icons/pattern.gif';

     images[i].onsu = () => {
        images[i].src = '/icons/header.png';
    }
        console.log(images[i].outerHTML);

} */


//Getting ready to populate the options page (or another) with certain things/options.
/*     if (zmMontageLayout.value === '1'){
        let monitors = document.getElementsByClassName('monitor');
        let i = 1;
        setInterval(() => {
            window.location = '#' + monitors[i++].id;
            if (i >= monitors.length) {
                i = 0;
            }
        }, 2000);
    } */
    //function scroll
/*     (function(){
        
    }) */
   // function sleep(ms){
  //      return new Promise(resolve => setTimeout(resolve, ms));
 //   }

//    while(1){
///    async function Scroll() {
    //    for (var i = 0; i < monitors.length; i++){
  //          await sleep(1000);
//            window.location = '#' + monitors[i].id;
     //   }
   // }
 //   Scroll(); */
//}
/* 
    for (var monitor of monitors) {
        console.log(monitor.id);
    };
    if (zmMontageLayout.value == 1){
        document.documentElement.style.scrollBehavior = 'smooth';
        for (var monitor of monitors){
            setTimeout(() => scroll(monitor), 2000);
        }
    } */
/*     function scroll(id){
        window.location = '#' + id;
        clearTimeout(this);
        console.log(id);
    } */
})();