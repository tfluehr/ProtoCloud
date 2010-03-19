// inspired/modified/ported from code created by Joseph Myers | http://www.codelib.net/
Object.extend(String.prototype, (function(){
    function colorScale(scalefactor){
        var hexstr = String(this).toLowerCase();
        var r = scalefactor;
        var a, i;
        if (!(hexstr.length === 4 || hexstr.length === 7) || !hexstr.startsWith('#')) {
            throw "'" + hexstr + "' is not in the proper format. Color must be in the form #abc or #aabbcc";
        }
        else if (hexstr.match(/[^#0-9a-f]/)) {
            throw "'" + hexstr + "' contains an invalid color value. Color must be in the form #abc or #aabbcc";
        }
        else if (typeof(r) === 'undefined' || r < 0){
            throw "'" + scalefactor + "' is invalid.  The Scale Factor must be a number greater than 0.  > 1 Will lighten the color. Between 0 and 1 will darken the color.";
        }
        else if (r === 1){
            return hexstr;
        }
        
        // start color parsing/setup
        hexstr = hexstr.sub("#", '').replace(/[^0-9a-f]+/ig, '');
        if (hexstr.length === 3) {
            a = hexstr.split('');
        }
        else if (hexstr.length === 6) {
            a = hexstr.match(/(\w{2})/g);
        }
        for (i = 0; i < a.length; i++) {
            if (a[i].length == 2) {
                a[i] = parseInt(a[i], 16);
            }
            else {
                a[i] = parseInt(a[i], 16);
                a[i] = a[i] * 16 + a[i];
            }
        }
        // end color parsing/setup
        
        // start color processing
        var maxColor = parseInt('ff', 16);
        var minColor = parseInt('ff', 16);
        function relsize(a){
            if (a == maxColor) {
                return Infinity;
            }
            return a / (maxColor - a);
        }
        
        function relsizeinv(y){
            if (y == Infinity) {
                return maxColor;
            }
            return maxColor * y / (1 + y);
        }
        
        for (i = 0; i < a.length; i++) {
            a[i] = relsizeinv(relsize(a[i]) * r);
            a[i] = Math.floor(a[i]).toString(16);
            if (a[i].length == 1) {
                a[i] = '0' + a[i];
            }
        }
       // end color processing
       return '#' + a.join('');
    }
    return {
        colorScale: colorScale
    };
})());

