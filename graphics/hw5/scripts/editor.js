 var newEditor = function(name){
    var e_code = document.getElementById(name);
    //e_code.value = "vec2 vip"
    var cm = CodeMirror(e_code, {
        value : document.getElementById("shader").innerHTML,
        mode: 'text/x-glsl',
        tabMode: 'indent',
        firstLineNumber: 1,
        lineNumbers: true,
        theme: 'monokai'
    });
    return cm;
}