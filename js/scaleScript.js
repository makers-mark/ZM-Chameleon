if ( param_ === undefined ){
    var param_ = new URLSearchParams(document.currentScript.src.split('?')[1]);
} else {
    param_ = new URLSearchParams(document.currentScript.src.split('?')[1]);
}

//console.log(param_.get('setScale'))

if ( param_.has('montageLayout')){

    selectLayout( param_.get('montageLayout') );
} else if ( param_.has('changeScale')){

    changeScale();
}
