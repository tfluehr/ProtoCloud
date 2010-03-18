// Prototype based implementation of of a Tag Cloud
// http://tfluehr.com

(function(){
    var REQUIRED_PROTOTYPE = '1.6.1';
    var REQUIRED_SCRIPTY = '2.0.0_a5';
    var checkRequirements = function(){
        function convertVersionString(versionString){ // taken from script.aculo.us
            var v = versionString.replace(/_.*|\./g, '');
            v = parseInt(v + '0'.times(4 - v.length), 10);
            return versionString.indexOf('_') > -1 ? v - 1 : v;
        }
        
        if ((typeof Prototype == 'undefined') ||
        (typeof Element == 'undefined') ||
        (typeof Element.Methods == 'undefined') ||
        (convertVersionString(Prototype.Version) <
        convertVersionString(REQUIRED_PROTOTYPE))) {
            throw ("ProtoCloud requires the Prototype JavaScript framework >= " +
            REQUIRED_PROTOTYPE +
            " from http://prototypejs.org/");
        }
        if ((typeof S2 == 'undefined') ||
        (convertVersionString(S2.Version) <
        convertVersionString(REQUIRED_SCRIPTY))) {
            throw ("ProtoCloud requires the script.aculo.us JavaScript framework >= " +
            REQUIRED_SCRIPTY +
            " from http://scripty2.com/");
        }
        
    };
    checkRequirements();
    // TODO: tests
    // TODO: start actually writing code.
    ProtoCloud = Class.create({
        initialize: function(target, options){
            // target is the div/id to create the tag cloud in.  
            // It's dimensions combined with the contents of options.data will control how many 
            // tags can be displayed
            this.target = $(target);
            this.setupOptions(options);
            this.targetLayout = this.target.getLayout();
        },
        setupOptions: function(options){
            var defaultOptions = {
                dataAttributes: {
                    count: 'count',
                    tag: 'name',
                    slug: 'slug'
                },
                isHref: false,
                style: 'RANDOM', // also support inline which is much simpler
                tagBaseClass: 'tag_', // tag level is added to this to form the css class which will control size/style
                tagLevels: [0, 1, 2, 3, 4],
                data: [] // array of objects to use for each tag
            };
            this.options = Object.deepExtend(defaultOptions, options);
        }
    });
    Element.addMethods('div', {
        cloudify: function(div, options){
             var ul = div.down('ul');
            var defaultOptions = {
                dataAttributes: {
                    count: 'count',
                    tag: 'name',
                    slug: 'href'
                },
                data: []
            };
            options = Object.deepExtend(defaultOptions, options);
            if (!options.data.size()) {
                options.isHref = true;
                var tagData = {};
                options.data = ul.select('li a').collect(function(link){
                    tagData[options.dataAttributes.tag] = link.innerHTML;
                    tagData[options.dataAttributes.slug] = link.href;
                    tagData[options.dataAttributes.count] = link.readAttribute(options[options.dataAttributes.count]);
                    return tagData;
                });
            }
            ul.remove();
            ul = null;
            return new ProtoCloud(div, options);
        }
    });
})();
