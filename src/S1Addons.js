/*!
 * stolen from script.aculo.us version 2.0.0_a5
 * you really should use Scripty 2.  This file is here 
 * as a temporary solution to scripty2 still being in alpha.
 */

if (typeof(Object.deepExtend) == 'undefined') {
  Object.deepExtend = function(destination, source){
    for (var property in source) {
      if (source[property] && source[property].constructor &&
      source[property].constructor === Object) {
        destination[property] = destination[property] || {};
        arguments.callee(destination[property], source[property]);
      }
      else {
        destination[property] = source[property];
      }
    }
    return destination;
  };
}
if (typeof(S2) == 'undefined') {
  S2 = {
    CSS: {
      colorFromString: function(color){
        var value = '#', cols, i;
        if (color.slice(0, 4) == 'rgb(') {
          cols = color.slice(4, color.length - 1).split(',');
          i = 3;
          while (i--) {
            value += parseInt(cols[2 - i], 10).toColorPart();
          }
        }
        else {
          if (color.slice(0, 1) == '#') {
            if (color.length == 4) {
              for (i = 1; i < 4; i++) {
                value += (color.charAt(i) + color.charAt(i)).toLowerCase();
              }
            }
            if (color.length == 7) {
              value = color.toLowerCase();
            }
          }
        }
        return (value.length == 7 ? value : (arguments[1] || value));
      }
    }
  };
}
if (typeof(Element.Layout) == 'undefined') {
  (function(){
  
    function toDecimal(pctString){
      var match = pctString.match(/^(\d+)%?$/i);
      if (!match) 
        return null;
      return (Number(match[1]) / 100);
    }
    
    function getPixelValue(value, property){
      if (Object.isElement(value)) {
        element = value;
        value = element.getStyle(property);
      }
      if (value === null) {
        return null;
      }
      
      if ((/^\d+(px)?$/i).test(value)) {
        return window.parseInt(value, 10);
      }
      
      if (/\d/.test(value) && element.runtimeStyle) {
        var style = element.style.left, rStyle = element.runtimeStyle.left;
        element.runtimeStyle.left = element.currentStyle.left;
        element.style.left = value || 0;
        value = element.style.pixelLeft;
        element.style.left = style;
        element.runtimeStyle.left = rStyle;
        
        return value;
      }
      
      if (value.include('%')) {
        var decimal = toDecimal(value);
        var whole;
        if (property.include('left') || property.include('right') ||
        property.include('width')) {
          whole = $(element.parentNode).measure('width');
        }
        else if (property.include('top') || property.include('bottom') ||
        property.include('height')) {
          whole = $(element.parentNode).measure('height');
        }
        
        return whole * decimal;
      }
      
      return 0;
    }
    
    function toCSSPixels(number){
      if (Object.isString(number) && number.endsWith('px')) {
        return number;
      }
      return number + 'px';
    }
    
    function isDisplayed(element){
      var originalElement = element;
      while (element && element.parentNode) {
        var display = element.getStyle('display');
        if (display === 'none') {
          return false;
        }
        element = $(element.parentNode);
      }
      return true;
    }
    
    var hasLayout = Prototype.K;
    
    if ('currentStyle' in document.documentElement) {
      hasLayout = function(element){
        if (!element.currentStyle.hasLayout) {
          element.style.zoom = 1;
        }
        return element;
      };
    }
    
    
    Element.Layout = Class.create(Hash, {
      initialize: function($super, element, preCompute){
        $super();
        this.element = $(element);
        if (preCompute) {
          this._preComputing = true;
          this._begin();
        }
        Element.Layout.PROPERTIES.each(function(property){
          if (preCompute) {
            this._compute(property);
          }
          else {
            this._set(property, null);
          }
        }, this);
        if (preCompute) {
          this._end();
          this._preComputing = false;
        }
      },
      
      _set: function(property, value){
        return Hash.prototype.set.call(this, property, value);
      },
      
      
      set: function(property, value){
        throw "Properties of Element.Layout are read-only.";
      },
      
      get: function($super, property){
        var value = $super(property);
        return value === null ? this._compute(property) : value;
      },
      
      _begin: function(){
        if (this._prepared) 
          return;
        
        var element = this.element;
        if (isDisplayed(element)) {
          this._prepared = true;
          return;
        }
        
        var originalStyles = {
          position: element.style.position || '',
          width: element.style.width || '',
          visibility: element.style.visibility || '',
          display: element.style.display || ''
        };
        
        element.store('prototype_original_styles', originalStyles);
        
        var position = element.getStyle('position'), width = element.getStyle('width');
        
        element.setStyle({
          position: 'absolute',
          visibility: 'hidden',
          display: 'block'
        });
        
        var positionedWidth = element.getStyle('width');
        
        var newWidth;
        if (width && (positionedWidth === width)) {
          newWidth = window.parseInt(width, 10);
        }
        else if (width && (position === 'absolute' || position === 'fixed')) {
          newWidth = window.parseInt(width, 10);
        }
        else {
          var parent = element.parentNode, pLayout = $(parent).getLayout();
          
          
          newWidth = pLayout.get('width') -
          this.get('margin-left') -
          this.get('border-left') -
          this.get('padding-left') -
          this.get('padding-right') -
          this.get('border-right') -
          this.get('margin-right');
        }
        
        element.setStyle({
          width: newWidth + 'px'
        });
        
        this._prepared = true;
      },
      
      _end: function(){
        var element = this.element;
        var originalStyles = element.retrieve('prototype_original_styles');
        element.store('prototype_original_styles', null);
        element.setStyle(originalStyles);
        this._prepared = false;
      },
      
      _compute: function(property){
        var COMPUTATIONS = Element.Layout.COMPUTATIONS;
        if (!(property in COMPUTATIONS)) {
          throw "Property not found.";
        }
        
        var value = COMPUTATIONS[property].call(this, this.element);
        this._set(property, value);
        return value;
      }
    });
    
    Object.extend(Element.Layout, {
      PROPERTIES: $w('height width top left right bottom border-left border-right border-top border-bottom padding-left padding-right padding-top padding-bottom margin-top margin-bottom margin-left margin-right padding-box-width padding-box-height border-box-width border-box-height margin-box-width margin-box-height'),
      
      COMPOSITE_PROPERTIES: $w('padding-box-width padding-box-height margin-box-width margin-box-height border-box-width border-box-height'),
      
      COMPUTATIONS: {
        'height': function(element){
          if (!this._preComputing) 
            this._begin();
          
          var bHeight = this.get('border-box-height');
          if (bHeight <= 0) 
            return 0;
          
          var bTop = this.get('border-top'), bBottom = this.get('border-bottom');
          
          var pTop = this.get('padding-top'), pBottom = this.get('padding-bottom');
          
          if (!this._preComputing) 
            this._end();
          
          return bHeight - bTop - bBottom - pTop - pBottom;
        },
        
        'width': function(element){
          if (!this._preComputing) 
            this._begin();
          
          var bWidth = this.get('border-box-width');
          if (bWidth <= 0) 
            return 0;
          
          var bLeft = this.get('border-left'), bRight = this.get('border-right');
          
          var pLeft = this.get('padding-left'), pRight = this.get('padding-right');
          
          if (!this._preComputing) 
            this._end();
          
          return bWidth - bLeft - bRight - pLeft - pRight;
        },
        
        'padding-box-height': function(element){
          var height = this.get('height'), pTop = this.get('padding-top'), pBottom = this.get('padding-bottom');
          
          return height + pTop + pBottom;
        },
        
        'padding-box-width': function(element){
          var width = this.get('width'), pLeft = this.get('padding-left'), pRight = this.get('padding-right');
          
          return width + pLeft + pRight;
        },
        
        'border-box-height': function(element){
          return element.offsetHeight;
        },
        
        'border-box-width': function(element){
          return element.offsetWidth;
        },
        
        'margin-box-height': function(element){
          var bHeight = this.get('border-box-height'), mTop = this.get('margin-top'), mBottom = this.get('margin-bottom');
          
          if (bHeight <= 0) 
            return 0;
          
          return bHeight + mTop + mBottom;
        },
        
        'margin-box-width': function(element){
          var bWidth = this.get('border-box-width'), mLeft = this.get('margin-left'), mRight = this.get('margin-right');
          
          if (bWidth <= 0) 
            return 0;
          
          return bWidth + mLeft + mRight;
        },
        
        'top': function(element){
          var offset = positionedOffset(element);
          return offset.top;
        },
        
        'bottom': function(element){
          var offset = positionedOffset(element), parent = element.getOffsetParent(), pHeight = parent.measure('height');
          
          var mHeight = this.get('border-box-height');
          
          return pHeight - mHeight - offset.top;
        },
        
        'left': function(element){
          var offset = positionedOffset(element);
          return offset.left;
        },
        
        'right': function(element){
          var offset = positionedOffset(element), parent = element.getOffsetParent(), pWidth = parent.measure('width');
          
          var mWidth = this.get('border-box-width');
          
          return pWidth - mWidth - offset.left;
        },
        
        'padding-top': function(element){
          return getPixelValue(element, 'paddingTop');
        },
        
        'padding-bottom': function(element){
          return getPixelValue(element, 'paddingBottom');
        },
        
        'padding-left': function(element){
          return getPixelValue(element, 'paddingLeft');
        },
        
        'padding-right': function(element){
          return getPixelValue(element, 'paddingRight');
        },
        
        'border-top': function(element){
          return Object.isNumber(element.clientTop) ? element.clientTop : getPixelValue(element, 'borderTopWidth');
        },
        
        'border-bottom': function(element){
          return Object.isNumber(element.clientBottom) ? element.clientBottom : getPixelValue(element, 'borderBottomWidth');
        },
        
        'border-left': function(element){
          return Object.isNumber(element.clientLeft) ? element.clientLeft : getPixelValue(element, 'borderLeftWidth');
        },
        
        'border-right': function(element){
          return Object.isNumber(element.clientRight) ? element.clientRight : getPixelValue(element, 'borderRightWidth');
        },
        
        'margin-top': function(element){
          return getPixelValue(element, 'marginTop');
        },
        
        'margin-bottom': function(element){
          return getPixelValue(element, 'marginBottom');
        },
        
        'margin-left': function(element){
          return getPixelValue(element, 'marginLeft');
        },
        
        'margin-right': function(element){
          return getPixelValue(element, 'marginRight');
        }
      }
    });
    
    if ('getBoundingClientRect' in document.documentElement) {
      Object.extend(Element.Layout.COMPUTATIONS, {
        'right': function(element){
          var parent = hasLayout(element.getOffsetParent());
          var rect = element.getBoundingClientRect(), pRect = parent.getBoundingClientRect();
          
          return (pRect.right - rect.right).round();
        },
        
        'bottom': function(element){
          var parent = hasLayout(element.getOffsetParent());
          var rect = element.getBoundingClientRect(), pRect = parent.getBoundingClientRect();
          
          return (pRect.bottom - rect.bottom).round();
        }
      });
    }
    
    Element.Offset = Class.create({
      initialize: function(left, top){
        this.left = left.round();
        this.top = top.round();
        
        this[0] = this.left;
        this[1] = this.top;
      },
      
      relativeTo: function(offset){
        return new Element.Offset(this.left - offset.left, this.top - offset.top);
      },
      
      inspect: function(){
        return "#<Element.Offset left: #{left} top: #{top}>".interpolate(this);
      },
      
      toString: function(){
        return "[#{left}, #{top}]".interpolate(this);
      },
      
      toArray: function(){
        return [this.left, this.top];
      }
    });
    
    function getLayout(element){
      return new Element.Layout(element);
    }
    
    function measure(element, property){
      return $(element).getLayout().get(property);
    }
    
    function positionedOffset(element){
      var layout = element.getLayout();
      
      var valueT = 0, valueL = 0;
      do {
        valueT += element.offsetTop || 0;
        valueL += element.offsetLeft || 0;
        element = element.offsetParent;
        if (element) {
          if (isBody(element)) 
            break;
          var p = Element.getStyle(element, 'position');
          if (p !== 'static') 
            break;
        }
      }
      while (element);
      
      valueL -= layout.get('margin-top');
      valueT -= layout.get('margin-left');
      
      return new Element.Offset(valueL, valueT);
    }
    
    Element.addMethods({
      getLayout: getLayout,
      measure: measure
    });
    
    function isBody(element){
      return $w('BODY HTML').include(element.nodeName.toUpperCase());
    }
    
    if ('getBoundingClientRect' in document.documentElement) {
        var viewportOffset2 = function(element){
          element = $(element);
          var rect = element.getBoundingClientRect();
          return new Element.Offset(rect.left, rect.top);
        };
        positionedOffset = function(element){
          element = $(element);
          var parent = element.getOffsetParent();
          
          if (parent.nodeName.toUpperCase() === 'HTML') {
            return positionedOffset(element);
          }
          
          var eOffset = viewportOffset2(element), pOffset = isBody(parent) ? viewportOffset(parent) : viewportOffset2(parent);
          var retOffset = eOffset.relativeTo(pOffset);
          
          var layout = element.getLayout();
          var top = retOffset.top - layout.get('margin-top');
          var left = retOffset.left - layout.get('margin-left');
          
          return new Element.Offset(left, top);
        };
      }
    
  })();
}