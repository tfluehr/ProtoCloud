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
            this.target.addClassName(this.options.className);
            this.targetLayout = this.target.getLayout();
            
            this.createTags();
        },
        getTagData: function(tagData, id){
            return tagData[this.options.dataAttributes[id]];
        },
        getCount: function(tagData){
            return this.getTagData(tagData, 'count');
        },
        getTag: function(tagData){
            return this.getTagData(tagData, 'tag');
        },
        getSlug: function(tagData){
            return this.getTagData(tagData, 'slug');
        },
        createTags: function(){
            var ul = new Element('ul');
            var tag, tagOptions;
            this.options.data.each((function(tagData){
                if (this.options.tagForSlug) {
                    tagData[this.options.dataAttributes.slug] = Object.isUndefined(this.getSlug(tagData)) ? this.getTag(tagData) : this.getSlug(tagData);
                }
                tagOptions = {
                    'href': this.options.isHref ? this.getSlug(tagData) : this.options.hrefTemplate.evaluate(tagData)
                };
                if (this.options.showTitle) {
                    tagOptions.title = this.getTag(tagData) + ' (' + this.getCount(tagData) + ')';
                }
                tag = new Element('li').insert(new Element('a', tagOptions).setStyle({
                    fontSize: this.getFontSize(this.getCount(tagData))
                }).update(this.getTag(tagData) + (this.options.showCount ? ' (' + this.getCount(tagData) + ')' : '')));
                ul.insert(tag);
                ul.appendChild(document.createTextNode(' ')); // for proper wrapping we need a text node in between
            }).bind(this));
            this.target.update(ul);
        },
        setupOptions: function(options){
            var defaultOptions = {
                dataAttributes: {
                    count: 'count',
                    tag: 'name',
                    slug: 'slug'
                },
                minFontSize: 100, // minimum font size in percent
                maxFontSize: 200, // maximum font size in percent
                className: 'ProtoCloud',
                tagForSlug: false, // if true and slug is undefined on a tag then tag will be substituted in the hrefTemplate 
                hrefTemplate: new Template('javascript:alert("name: #{name}, count: #{count}, slug: #{slug}, ");'),
                showTitle: true,
                showCount: false,
                isHref: false,
                // style: 'RANDOM', // also support inline which is much simpler
                data: [] // array of objects to use for each tag
            };
            this.options = Object.deepExtend(defaultOptions, options);
            this.options.maxCount = this.options.data.max((function(tagData){
                return this.getCount(tagData);
            }).bind(this));
            this.options.minCount = this.options.data.min((function(tagData){
                return this.getCount(tagData);
            }).bind(this));
            //            this.options.data.each((function(tagData, index){
            //                
            //            }));
            this.options.slope = (this.options.maxFontSize - this.options.minFontSize) / (this.options.maxCount - this.options.minCount);
            this.options.yIntercept = (this.options.minFontSize - ((this.options.slope) * this.options.minCount));
        },
        getFontSize: function(count){
            return ((this.options.slope * count) + this.options.yIntercept) + '%';
        }
    });
    // TODO finish/simplify implementation 
    //    Element.addMethods('div', {
    //        cloudify: function(div, options){
    //            var ul = div.down('ul');
    //            var defaultOptions = {
    //                dataAttributes: {
    //                    'count': 'count',
    //                    'tag': 'name',
    //                    'slug': 'href'
    //                },
    //                data: []
    //            };
    //            options = Object.deepExtend(defaultOptions, options);
    //            if (!options.data.size()) {
    //                options.isHref = true;
    //                var tagData = {};
    //                options.data = ul.select('li a').collect(function(link){
    //                    tagData[options.dataAttributes.tag] = link.innerHTML;
    //                    tagData[options.dataAttributes.slug] = link.href;
    //                    tagData[options.dataAttributes.count] = link.readAttribute(options[options.dataAttributes.count]);
    //                    return tagData;
    //                });
    //            }
    //            ul.remove();
    //            ul = null;
    //            return new ProtoCloud(div, options);
    //        }
    //    });
})();
