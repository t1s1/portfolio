// set references
var viewerWindow = window.parent;
var viewerDocument = viewerWindow.document;

// set types
var launchTypes = {
  MAP : "imagemap",
  LINK : "link"
};
var mediaTypes = {
  SWF : "swf",
  VIDEO : "video",
  IMAGE : "image"
};

var oStyles = {
  PLAYER_URL : "http://eduweb.allscripts.com/LCMSvideo/videoPlayer.html",
  BTN_URL : "http://eduweb.allscripts.com/LCMSvideo/close-DK.png",
  BTN_SIZE : 36, // in px
  BTN_OFFSET : 16,
  RADIUS : 4,
  SHADOW : 4,
  SHADOW_COLOR : "#666",
  BG_COLOR : "#444",
  MASK_COLOR : "#202020",
  MASK_OPACITY : 0.3
};

// default values
var defaults = {
  SWF_WIDTH : 933,
  SWF_HEIGHT : 590,
  VIDEO_WIDTH : 768,
  VIDEO_HEIGHT : 432,
  IMAGE_WIDTH : 800,
  IMAGE_HEIGHT : 600,
  IMAGE_MARGIN : 8,
  VIDEO_MARGIN : 16,
  USE_OVERLAY : true,
  LINK_TEXT : "Watch video"
};
var limelightSettings = {
  PLAYER_ID : "limelight_player_716018",
  PLAYER_FORM : "00d1ffed53f04fbb8955021f0041128c"
};

/* * * * * * * * * PLUGINS * * * * * * * * */
/**
 * Expose(Mask)
 */
(function ($) {

  // static constructs
  $.tools = $.tools || {version: '@VERSION'};

  var tool;

  tool = $.tools.expose = {

    conf: {
      maskId: 'exposeMask',
      loadSpeed: 'slow',
      closeSpeed: 'fast',
      closeOnClick: false,
      closeOnEsc: true,

      // css settings
      zIndex: 9998,
      opacity: 0.8,
      startOpacity: 0,
      color: '#fff',

      // callbacks
      onLoad: null,
      onClose: null
    }
  };

  function viewport() {
    // simplified from original
    return [$(viewerDocument).width(), $(viewerDocument).height()];
  }

  function call(fn) {
    if (fn) { return fn.call($.mask); }
  }

  var mask, exposed, loaded, config, overlayIndex;


  $.mask = {

    load: function(conf, els) {

      // already loaded ?
      if (loaded) { return this; }

      // configuration
      if (typeof conf === 'string') {
        conf = {color: conf};
      }

      // use latest config
      conf = conf || config;

      config = conf = $.extend($.extend({}, tool.conf), conf);

      // get the mask
      mask = $("#" + conf.maskId, viewerDocument);

      // or create it
      if (!mask.length) {
        $("body", viewerDocument).append("<div id='"+conf.maskId+"'></div>");
        mask = $(("#"+conf.maskId), viewerDocument);
      }

      // set position and dimensions
      var size = viewport();

      mask.css({
        position:'absolute',
        top: 0,
        left: 0,
        width: size[0],
        height: size[1],
        display: 'none',
        opacity: conf.startOpacity,
        zIndex: conf.zIndex
      });

      if (conf.color) {
        mask.css("backgroundColor", conf.color);
      }

      // onBeforeLoad
      if (call(conf.onBeforeLoad) === false) {
        return this;
      }

      // esc button
      if (conf.closeOnEsc) {
        $(viewerDocument).bind("keydown.mask", function(e) {
          if (e.keyCode === 27) {
            $.mask.close(e);
          }
        });
      }

      // mask click closes
      if (conf.closeOnClick) {
        mask.bind("click.mask", function(e)  {
          $.mask.close(e);
        });
      }

      // resize mask when window is resized
      $(viewerWindow).bind("resize.mask", function() {
        $.mask.fit();
      });

      // exposed elements
      if (els && els.length) {

        overlayIndex = els.eq(0).css("zIndex");

        // make sure element is positioned absolutely or relatively
        $.each(els, function(index) {
          // need jQuery element reference
          var el = $(this);
          if (!/relative|absolute|fixed/i.test(el.css("position"))) {
            el.css("position", "relative");
          }
        });

        // make elements sit on top of the mask
        exposed = els.css({ zIndex: Math.max(conf.zIndex + 1, overlayIndex === 'auto' ? 0 : overlayIndex)});
      }

      // reveal mask
      mask.css({display: 'block'}).fadeTo(conf.loadSpeed, conf.opacity, function() {
        $.mask.fit();
        call(conf.onLoad);
        loaded = "full";
      });

      loaded = true;
      return this;
    },

    close: function() {
      if (loaded) {

        // onBeforeClose
        if (call(config.onBeforeClose) === false) { return this; }

        mask.fadeOut(config.closeSpeed, function()  {
          call(config.onClose);
          if (exposed) {
            exposed.css({zIndex: overlayIndex});
          }
          loaded = false;
        });

        // unbind various event listeners
        $(viewerDocument).unbind("keydown.mask");
        mask.unbind("click.mask");
        $(viewerWindow).unbind("resize.mask");
      }
      return this;
    },

    fit: function() {
      if (loaded) {
        var size = viewport();
        mask.css({width: size[0], height: size[1]});
      }
    },

    getMask: function() {
      return mask;
    },

    isLoaded: function(fully) {
      return fully ? loaded === 'full' : loaded;
    },

    getConf: function() {
      return config;
    },

    getExposed: function() {
      return exposed;
    }
  };

  $.fn.mask = function(conf) {
    $.mask.load(conf);
    return this;
  };

  $.fn.expose = function(conf) {
    $.mask.load(conf, this);
    return this;
  };
})(jQuery);
/**
 * Overlay
 */
(function ($){

  // static constructs
  $.tools = $.tools || {version: '@VERSION'};

  $.tools.overlay = {

    addEffect: function(name, loadFn, closeFn) {
      effects[name] = [loadFn, closeFn];
    },

    conf: {
      close: null,
      closeOnClick: false,
      closeOnEsc: true,
      closeSpeed: 'fast',
      effect: 'default',

      // since 1.2. fixed positioning not supported by IE6
      fixed: !$.browser.msie || $.browser.version > 6,

      left: 'center',
      load: false, // 1.2
      mask: null,
      oneInstance: true,
      speed: 'normal',
      target: null, // target element to be overlayed. by default taken from [rel]
      top: '10%'
    }
  };


  var instances = [], effects = {};

  // the default effect. nice and easy!
  $.tools.overlay.addEffect('default',

    /*
      onLoad/onClose functions must be called otherwise none of the
      user supplied callback methods won't be called
    */
    function(pos, onLoad) {

      var conf = this.getConf(),
         w = $(window);

      if (!conf.fixed)  {
        pos.top += w.scrollTop();
        pos.left += w.scrollLeft();
      }

      pos.position = conf.fixed ? 'fixed' : 'absolute';
      this.getOverlay().css(pos).fadeIn(conf.speed, onLoad);

    }, function(onClose) {
      this.getOverlay().fadeOut(this.getConf().closeSpeed, onClose);
    }
  );


  function Overlay(trigger, conf) {

    // private variables
    var self = this,
       fire = trigger.add(self),
       w = $(viewerWindow),
       closers,
       overlay,
       opened,
       maskConf = $.tools.expose && (conf.mask || conf.expose),
       uid = Math.random().toString().slice(10);


    // mask configuration
    if (maskConf) {
      if (typeof maskConf === 'string') { maskConf = {color: maskConf}; }
      maskConf.closeOnClick = maskConf.closeOnEsc = false;
    }

    // get overlay and trigger
    var jq = conf.target || trigger.attr("rel");
    var tjq = $(jq, viewerDocument);
    overlay = tjq ? $(tjq) : null || trigger;

    // overlay not found. cannot continue
    if (!overlay.length) { throw "Could not find Overlay: " + jq; }

    // trigger's click event
    if (trigger && trigger.index(overlay) === -1) {
      trigger.click(function(e) {
        self.load(e);
        return e.preventDefault();
      });
    }

    // API methods
    $.extend(self, {

      load: function(e) {
        // can be opened only once
        if (self.isOpened()) {  return self; }

        // find the effect
         var eff = effects[conf.effect];
         if (!eff) { throw "Overlay: cannot find effect : \"" + conf.effect + "\""; }

        // close other instances?
        if (conf.oneInstance) {
          $.each(instances, function() {
            this.close(e);
          });
        }

        // onBeforeLoad
        e = e || $.Event();
        e.type = "onBeforeLoad";
        fire.trigger(e);

        if (e.isDefaultPrevented()) {
          // do nothing
        }

        // opened
        opened = true;

        // possible mask effect
        if (maskConf) { $(overlay).expose(maskConf); }

        // position & dimensions
        var top = conf.top,
           left = conf.left,
           oWidth = overlay.outerWidth({margin:true}),
           oHeight = overlay.outerHeight({margin:true});

        if (typeof top === 'string')  {
          top = top === 'center' ? Math.max((w.height() - oHeight) / 2, 0) :
            parseInt(top, 10) / 100 * w.height();
        }

        if (left === 'center') { left = Math.max((w.width() - oWidth) / 2, 0); }


         // load effect
        eff[0].call(self, {top: top, left: left}, function() {
          if (opened) {
            e.type = "onLoad";
            fire.trigger(e);
          }
        });

        // mask.click closes overlay
        if (maskConf && conf.closeOnClick) {
          $.mask.getMask().one("click", self.close);
        }

        // when window is clicked outside overlay, we close
        if (conf.closeOnClick) {
          $(document).bind("click." + uid, function(e) {
            if (!$(e.target).parents(overlay).length) {
              self.close(e);
            }
          });
        }

        // keyboard::escape
        if (conf.closeOnEsc) {

          // one callback is enough if multiple instances are loaded simultaneously
          $(document).bind("keydown." + uid, function(e) {
            if (e.keyCode === 27) {
              self.close(e);
            }
          });
        }


        return self;
      },

      close: function(e) {

        if (!self.isOpened()) { return self; }

        e = e || $.Event();
        e.type = "onBeforeClose";
        fire.trigger(e);
        if (e.isDefaultPrevented()) { return; }

        opened = false;

        // close effect
        effects[conf.effect][1].call(self, function() {
          e.type = "onClose";
          fire.trigger(e);
        });

        // unbind the keyboard / clicking actions
        $(document).unbind("click." + uid).unbind("keydown." + uid);

        if (maskConf) {
          $.mask.close();
        }

        return self;
      },

      getOverlay: function() {
        return overlay;
      },

      getTrigger: function() {
        return trigger;
      },

      getClosers: function() {
        return closers;
      },

      isOpened: function()  {
        return opened;
      },

      // manipulate start, finish and speeds
      getConf: function() {
        return conf;
      }

    });

    // callbacks
    $.each("onBeforeLoad,onStart,onLoad,onBeforeClose,onClose".split(","), function(i, name) {

      // configuration
      if ($.isFunction(conf[name])) {
        $(self).bind(name, conf[name]);
      }

      // API
      self[name] = function(fn) {
        if (fn) { $(self).bind(name, fn); }
        return self;
      };
    });

    // close button
    closers = overlay.find(conf.close || ".close");

    if (!closers.length && !conf.close) {
      closers = $('<a class="close"></a>');
    closers.css({
        backgroundImage: "none",
        position: "absolute",
        right: "-9px",
        top:  "-9px",
        cursor: "pointer",
        height: "28px",
        width:  "28px"
      });
      overlay.prepend(closers);
    }

    closers.click(function(e) {
      self.close(e);
    });

    // autoload
    if (conf.load) { self.load(); }

  }

  // jQuery plugin initialization
  $.fn.overlay = function(conf) {

    // already constructed --> return API
    var el = this.data("overlay");
    if (el) { return el; }

    if ($.isFunction(conf)) {
      conf = {onBeforeLoad: conf};
    }

    conf = $.extend(true, {}, $.tools.overlay.conf, conf);

    this.each(function() {
      el = new Overlay($(this), conf);
      instances.push(el);
      $(this).data("overlay", el);
    });

    return conf.api ? el: this;
  };

})(jQuery);
/**
 * Apple effect
 */
(function ($){

  // version number
  var t = $.tools.overlay,
     w = $(viewerWindow);

  // extend global configuragion with effect specific defaults
  $.extend(t.conf, {
    start: {
      top: null,
      left: null
    },

    fadeInSpeed: 'fast',
    zIndex: 9999
  });

  // utility function
  function getPosition(el) {
    var p = {};
    // c is content iFrame
    var c = $("#groupFrame", viewerDocument).offset();
    // for image maps, offset must be relative to image, not map
    if( MediaOverlay.launchType() === launchTypes.MAP ) {
      var imgID = el.closest("map").attr("name");
      // get image that links to our map
      var img = $("img[useMap='#"+imgID+"']");
      var i = $(img).offset();
      var coords = el.attr("coords").split(",");
      var areaBox = {
          left : parseInt(coords[0],10),
          top : parseInt(coords[1],10),
          width : parseInt(coords[2],10) - parseInt(coords[0],10),
          height : parseInt(coords[3],10) - parseInt(coords[1],10)
        };
      p = {
        left : i.left + areaBox.left,
        top : i.top + areaBox.top
      };
      return {
        top : c.top + p.top + areaBox.height / 2,
        left : c.left + p.left + areaBox.width / 2
      };
    }
    else {
      p = el.offset();
      return {
        top: c.top + p.top + el.height() / 2,
        left: c.left + p.left + el.width() / 2
      };
    }
  }

//{{{ load

  var loadEffect = function(pos, onLoad) {

    var overlay = this.getOverlay(),
       conf = this.getConf(),
       trigger = this.getTrigger(),
       self = this,
       oWidth = overlay.outerWidth({margin:true}),
       oHeight = overlay.outerHeight({margin:true}),
       bg = overlay.data("bg"),
       position = conf.fixed ? 'fixed' : 'absolute';

    if (!bg) {

      var cssObj = {
        "-moz-border-radius": oStyles.RADIUS+"px",
        "-webkit-border-radius": oStyles.RADIUS+"px",
        "border-radius": oStyles.RADIUS+"px",
        "-moz-box-shadow": "0px 0px "+oStyles.SHADOW+"px "+oStyles.SHADOW_COLOR+"px",
        "-webkit-box-shadow": "0px 0px "+oStyles.SHADOW+"px "+oStyles.SHADOW_COLOR+"px",
        "box-shadow": "0px 0px "+oStyles.SHADOW+"px "+oStyles.SHADOW_COLOR+"px",
        "background-color": oStyles.BG_COLOR
      };
      
      $('body', viewerDocument).append("<div id='bg'></div>");
      bg = $("#bg", viewerDocument);
      bg.css(cssObj).width(oWidth).height(oHeight);
      overlay.data("bg", bg);
    }

    // initial top & left
    var itop = conf.start.top || Math.round(w.height() / 2),
       ileft = conf.start.left || Math.round(w.width() / 2);

    if (trigger) {
      var p = getPosition(trigger);
      itop = p.top;
      ileft = p.left;
    }

    // put overlay into final position
    if (conf.fixed) {
      itop -= w.scrollTop();
      ileft -= w.scrollLeft();
    } else {
      pos.top += w.scrollTop();
      pos.left += w.scrollLeft();
    }

    // initialize background image and make it visible
    bg.css({
      position: 'absolute',
      top: itop,
      left: ileft,
      width: 0,
      height: 0,
      zIndex: conf.zIndex
    }).show();

    pos.position = position;
    overlay.css(pos);

    // begin growing
    bg.animate(
      {
        top: overlay.css("top"),
        left: overlay.css("left"),
        width: oWidth,
        height: oHeight
      },
      conf.speed, function() {

      // set close button and content over the image
      overlay.css("zIndex", conf.zIndex + 1).fadeIn(conf.fadeInSpeed, function()  {

        if (self.isOpened() && !$(this).index(overlay)) {
          onLoad.call();
        } else {
          overlay.hide();
        }
      });

    }).css("position", position);

  };
//}}}


  var closeEffect = function(onClose) {

    // variables
    var overlay = this.getOverlay().hide(),
       conf = this.getConf(),
       trigger = this.getTrigger(),
       bg = overlay.data("bg"),

       css = {
         top: conf.start.top,
         left: conf.start.left,
         width: 0,
         height: 0
       };

    // trigger position
    if (trigger) { $.extend(css, getPosition(trigger)); }


    // change from fixed to absolute position
    if (conf.fixed) {
      bg.css({position: 'absolute'})
        .animate({ top: "+=" + w.scrollTop(), left: "+=" + w.scrollLeft()}, 0);
    }

    // shrink image
    bg.animate(css, conf.closeSpeed, onClose);
  };


  // add overlay effect
  t.addEffect("apple", loadEffect, closeEffect);

})(jQuery);
/* * * * * * * * * END OF PLUGINS * * * * * * * * */


/* Allscripts Media Overlay */

/* overrides */
function NewMedia(id) {} // SWFs
function NewExternalContainer(id){} // HTML, used for video

/* when document ready */
$(function() {
  // clean up if necessary
  $(window).unload( function () {
    $("#overlay", viewerDocument).remove();
  });
});

/* main module, all functionality in here
 */
var MediaOverlay = (function() {
  var mediaType, launchType;

  /* extracts and returns URL from ID in onClick attribute
   */
  function getURLFromOnClickAttr(onClickAttr) {
    var splitOnClick = onClickAttr.split("'");
    var id = splitOnClick[1];
    return OSDeliveryEngine.getURL(id);
  }

  /* styles close button in overlay
   */
  function buildCloseBtn() {
    var closeBtn = $(".close", viewerDocument);
    // styles for close button
    closeBtn.css({
      backgroundImage: "url("+oStyles.BTN_URL+")",
      position: "absolute",
      right: "-"+oStyles.BTN_OFFSET+"px",
      top: "-"+oStyles.BTN_OFFSET+"px",
      cursor: "pointer",
      height: oStyles.BTN_SIZE+"px",
      width: oStyles.BTN_SIZE+"px",
      "-moz-border-radius": oStyles.RADIUS+"px",
      "-webkit-border-radius": oStyles.RADIUS+"px",
      "border-radius": oStyles.RADIUS+"px",
      "-webkit-box-shadow": "0px 0px "+oStyles.SHADOW+"px "+oStyles.SHADOW_COLOR+"px",
      "box-shadow" : "0px 0px "+oStyles.SHADOW+"px "+oStyles.SHADOW_COLOR+"px",
      "background-color" : oStyles.BG_COLOR
    });
    // we use CSS sprites - hover( handlerIn(), handlerOut() )
    closeBtn.hover( 
      function() { $(this).css({ backgroundPosition: "0 "+oStyles.BTN_SIZE+"px" }); },
      function() { $(this).css({ backgroundPosition: "0 0" }); }
    );
  }

  /* returns element based on launch type
   */
  function getLaunchElement(launchType) {
    var element;
    if( launchType === launchTypes.MAP ) {
      element = $("area");
    }
    else if( launchType === launchTypes.LINK ) {
      element = $("a");
    }
    return element;
  }

  /* set width and height for media in overlay
   */
  function getDimensions(obj, defaultW, defaultH) {
    var width, height;

    // width
    if(obj.width !== undefined && !isNaN( parseInt(obj.width, 10) ) ) {
      width = parseInt(obj.width, 10);
    } 
    else {
      width = defaultW;
    }
    
    // height
    if(obj.height !== undefined && !isNaN( parseInt(obj.height, 10) ) ) {
      height = parseInt(obj.height, 10);
    } 
    else {
      height = defaultH;
    }

    return { w:width, h:height};
  }

  /* construct the overlay container and other elements (does not display yet) 
   */
  function createOverlayElement() {
    var overlay, contentWrap;

    // create overlay element if there isn't already one
    if ($("#overlay", viewerDocument).length < 1) {
      $("body", viewerDocument).append("<div class='apple_overlay' id='overlay'></div>");
    }
    overlay = $("#overlay", viewerDocument);

    // create contentWrap element if there isn't already one
    if ($("#overlayContentWrap", viewerDocument).length < 1) {
      overlay.append("<div id='overlayContentWrap' class='contentWrap'></div>");
      overlay.prepend('<a class="close"></a>');
    }
    contentWrap = $("#overlayContentWrap", viewerDocument);

    buildCloseBtn();

    // hide the whole thing until we need it
    $(".apple_overlay", viewerDocument).css({ display: "none" });
    
    // clear out old background div if there is one
    $("#bg", viewerDocument).remove();
  }
  
  /* for showing SWF (e.g. simulation) in overlay
   */
  function swfOverlay(width, height) {
    var launchElement = getLaunchElement(launchType);
    
    createOverlayElement(); 

    // check each launchElement (looking for unprocessed "NewMedia" ones)
    launchElement.each(function(index) {
      // need jQuery element reference
      var el = $(this);
      var onClickAttr = el.attr("onclick");
      var str = "";
      // 
      if(onClickAttr) { 
        str = onClickAttr.substring(0,8); 
      }
      // check to see if this is a Media Object link
      // if so, we use overlay
      if(str.toLowerCase() ===  "newmedia") {
        if( el.attr("target") === undefined || el.attr("target") === "" ) { 
          // go to next one, because we've already modified this element
          return true; // same as continue
        }
        // remove default pop-up behavior
        el.removeAttr("target");
        // setup <a> tags to link to overlay element
        el.attr("rel","#overlay");
        // add image width and height to tags
        el.attr("data-swf-width", width);
        el.attr("data-swf-height", height);

        // set up overlay 
        el.overlay({
          mask : {
            color : oStyles.MASK_COLOR,
            opacity : oStyles.MASK_OPACITY
          },
          effect: 'apple',
          top: 'center',
          onBeforeLoad: function() {
            var wrap = this.getOverlay().find(".contentWrap");
            // get url of this link
            var url = getURLFromOnClickAttr(this.getTrigger().attr("onclick"));
            // get stored width and height from trigger
            var swfWidth = parseInt(this.getTrigger().attr("data-swf-width"), 10);
            var swfHeight = parseInt(this.getTrigger().attr("data-swf-height"), 10);
            // build embed element
            var embedTag = "<embed style='margin:"+defaults.IMAGE_MARGIN+"px' width="+swfWidth+" height="+swfHeight+" wmode='opaque' bgcolor=#444 type='application/x-shockwave-flash' src='"+url+"' />";

            // see if embed object has been loaded already
            var embed = wrap.find('embed');
            if(embed.attr("src") === url) {
              return; // same, so forget it
            }
            // if so, remove it - we want to start fresh
            else {
              embed.remove();
            }
            // now embed the new one
            wrap.append(embedTag);
          },
          // called when closing
          onClose: function() {
            var wrap = this.getOverlay().find(".contentWrap");
            var embed = wrap.find('embed');
            embed.remove();
          }
        });
        // stop iterating launchElements, because we only wanted one
        return false; // same as break
      } // end if (newmedia)
    });
    // clean up
    $(window).unload( function () {
      $("#overlay", viewerDocument).remove();
    });
  }

  /* for showing image
   */
  function imgOverlay(width, height) {
    var launchElement = getLaunchElement(launchType);
    
    createOverlayElement();

    // check each launchElement (looking for unprocessed "NewMedia" ones)
    launchElement.each(function(index) {
      // need jQuery element reference
      var el = $(this);
      var onClickAttr = el.attr("onclick");
      var str = "";
      if(onClickAttr) { str = onClickAttr.substring(0,8); }
      // check to see if this is a Media Object link
      // if so, we use overlay
      if(str.toLowerCase() ===  "newmedia") {
        if( el.attr("target") === undefined || el.attr("target") === "" ) { 
          // go to next one, because we've already modified this element
          return true; // same as continue
        }
        // remove default pop-up behavior
        el.removeAttr("target");
        // setup tags to link to overlay element
        el.attr("rel","#overlay");
        // add image width and height to tags
        el.attr("data-img-width", width);
        el.attr("data-img-height", height);

        el.overlay({
          mask : {
            color : oStyles.MASK_COLOR,
            opacity : oStyles.MASK_OPACITY
          },
          effect: 'apple',
          top: 'center',
          onBeforeLoad: function() {
            var wrap = this.getOverlay().find(".contentWrap");
            // get url of this link
            var url = getURLFromOnClickAttr(this.getTrigger().attr("onclick"));
            // get stored width and height from trigger
            var imgWidth = parseInt(this.getTrigger().attr("data-img-width"), 10);
            var imgHeight = parseInt(this.getTrigger().attr("data-img-height"), 10);
            // build image element
            var imgTag = "<img style='margin:"+defaults.IMAGE_MARGIN+"px' width="+imgWidth+" height="+imgHeight+" src='"+url+"' />";
            // see if image has been loaded already
            var img = wrap.find('img');
            if(img.attr("src") === url) {
              return; // same image, so forget it
            }
            else {
              img.remove();
            }
            wrap.append(imgTag);
          },
          // called when closing
          onClose: function() {
            //
          }
        });
        // stop iterating launchElements, because we only wanted one
        return false; // same as break
      } // end if (newmedia)
    });
    // clean up
    $(window).unload( function () {
      $("#overlay", viewerDocument).remove();
    });
  }
  
  /* for showing video embedded in page
   */
  function videoEmbed(width, height, player, mediaID) {

    // styles for player container
    var bgCSS = {
      "-moz-border-radius": oStyles.RADIUS+"px",
      "-webkit-border-radius": oStyles.RADIUS+"px",
      "border-radius": oStyles.RADIUS+"px",
      "-moz-box-shadow": "0px 0px "+oStyles.SHADOW+"px "+oStyles.SHADOW_COLOR+"px",
      "-webkit-box-shadow": "0px 0px "+oStyles.SHADOW+"px "+oStyles.SHADOW_COLOR+"px",
      "box-shadow": "0px 0px "+oStyles.SHADOW+"px "+oStyles.SHADOW_COLOR+"px",
      "background-color": oStyles.BG_COLOR+"px",
      "text-align": "center",
      "display": "block",
      "position": "relative",
      "height": "100%",
      "width": "100%"
    };

    // styles for player positioning
    var playerCSS = {
      "position": "absolute",
      "top": "50%",
      "left": "50%",
      "margin-top": "-"+(height/2),
      "margin-left": "-"+(width/2)
    };

    // create player container
    var playerBg = $('<div id="playerBg"/>');
    // I didn't double the margin here
    playerBg.css(bgCSS).width(width+defaults.VIDEO_MARGIN).height(height+defaults.VIDEO_MARGIN);
    player.append(playerBg);

    // embed player
    playerBg.append( "<span class='LimelightEmbeddedPlayer'><object type='application/x-shockwave-flash' id='"+limelightSettings.PLAYER_ID+"' name='"+limelightSettings.PLAYER_ID+"' class='LimelightEmbeddedPlayerFlash' width='"+width+"' height='"+height+"' data='http://assets.delvenetworks.com/player/loader.swf'><param name='movie' value='http://assets.delvenetworks.com/player/loader.swf'/><param name='wmode' value='window'/><param name='allowScriptAccess' value='always'/><param name='allowFullScreen' value='true'/><param name='flashVars' value='mediaId="+mediaID+"&amp;limelightSettings.PLAYER_FORM="+limelightSettings.PLAYER_FORM+"'/></object><script>LimelightPlayerUtil.initEmbed('"+limelightSettings.PLAYER_ID+"');</script></span>" );
    playerBg.find(".LimelightEmbeddedPlayer").css(playerCSS);
  }
  
  // for showing video in overlay
  function videoOverlay(width, height, player, mediaID, linkText) {
    var playerURL = oStyles.PLAYER_URL+"?mID="+mediaID+"&pID="+limelightSettings.PLAYER_ID+"&pF="+limelightSettings.PLAYER_FORM+"&h="+height+"&w="+width+"&mgn="+defaults.VIDEO_MARGIN;
    
    // set up link to video and create reference to it
    var playerLinkHTML = "<a class='videoPlayerLink' href='#' name='"+mediaID+"_LINK' rel='#overlay'>"+linkText+"</a>";    
    var playerLink = $(playerLinkHTML).appendTo(player);
    
    createOverlayElement();

    // setup <a> tags to link to overlay element
    playerLink.attr("rel","#overlay");
   
    // set up overlay
    playerLink.overlay({
      mask : {
        color : oStyles.MASK_COLOR,
        opacity : oStyles.MASK_OPACITY
      },
      effect : 'apple',
      top : 'center',
      onBeforeLoad: function() {
        var wrap = this.getOverlay().find(".contentWrap");
        $("<iframe id='overlayIFrame' src='"+playerURL+"' width='"+(width+defaults.VIDEO_MARGIN*2)+"' height='"+(height+defaults.VIDEO_MARGIN*2)+"' frameborder='0'  scrolling='no'></iframe>").appendTo(wrap)
          .css("margin-top", oStyles.RADIUS+"px");
      },
      // called when closing
      onClose: function() {
        $("#overlayIFrame", viewerDocument).remove();
      }
    });
  }

  /* initialize module
   * USAGE: called from HTML object in LCMS, with obj passed:
   *   obj = {
   *     width,
   *     height,
   *     launcher,
   *     media, 
   *     mediaID, (if video)
   *     linktext, (if video)
   *     useOverlay (if video)
   *   }
   */
  function init(obj) {
    var dim, mediaID, linkText, useOverlay;

    // media type
    if( obj.media !== undefined ) {
      mediaType = obj.media.toLowerCase();
    } 
    else {
      // this alert is meant to be seen by authoring ID
      alert("Hey! media has not been defined. Acceptable types: "+mediaTypes.SWF+", "+mediaTypes.VIDEO);
    }

    // launch type
    if( obj.launcher !== undefined ) {
      launchType = obj.launcher.toLowerCase();
    } 
    else {
      alert("Hey! launcher has not been defined. Acceptable types: "+launchTypes.MAP+", "+launchTypes.LINK);
    }

    // currently we handle 3 types of media: VIDEO, IMAGE (e.g. jpg, etc), and SWF
    // Check first for VIDEO
    if( mediaType === mediaTypes.VIDEO ){
      // get width and height and load into dim obj (w, h)
      dim = getDimensions(obj, defaults.VIDEO_WIDTH, defaults.VIDEO_HEIGHT);

      // get media ID
      if(obj.mediaID !== undefined) {
        mediaID = obj.mediaID;
      }
      else {
        alert("Hey! mediaID has not been defined.");
      }
      
      // get text for link
      if(obj.linkText !== undefined) {
        linkText = obj.linkText; 
      } 
      else {
        linkText = defaults.LINK_TEXT;
      }
      
      // whether to use overlay
      if(obj.useOverlay !== undefined) {
        // make sure it works for both Booleans and strings
          useOverlay = String(obj.useOverlay).toLowerCase() === "true";
      } 
      else {
        useOverlay = defaults.USE_OVERLAY;
      }

      // iterate through the instances to find and configure new one
      $(".launchable").each(function(index) {
        // need jQuery element reference
        var el = $(this);
        // match media : "video" but ignore white spaces (and don't care about : or "")
        var searchRegEx = /media\W*video/i;
        // this means we have a video launcher
        if( el.siblings("script").html().search(searchRegEx) > 0 ) {
          // check to see if the id has been set. If not, that means it is new
          if( el.attr("id") === undefined || el.attr("id") === "" ) {
            // set the id
            el.attr("id", mediaID);
            // use either overlay or embed the video
            if( useOverlay ){
              videoOverlay(dim.w, dim.h, el, mediaID, linkText);
            }
            else {
              videoEmbed(dim.w, dim.h, el, mediaID);
            }
            // break from "each" because we found it
            return false;
          }
        }        
      });
    }
    else if( mediaType === mediaTypes.IMAGE ) {
      // get width and height and load into dim obj (w, h)
      dim = getDimensions(obj, defaults.IMAGE_WIDTH, defaults.IMAGE_HEIGHT);

      // iterate through the instances to find and configure new one
      $(".launchable").each(function(index) {
        // need jQuery element reference
        var el = $(this);
        // match media : "image" but ignore white spaces (and don't care about : or "")
        var searchRegEx = /media\W*image/i;
        // this means we have an image launcher
        if( el.siblings("script").html().search(searchRegEx) > 0 ) {
          // check to see if the id has been set. If not, that means it is new
          if( el.attr("id") === undefined || el.attr("id") === "" ) {
            // set the id
            el.attr("id", "img"+index);
            imgOverlay(dim.w, dim.h);
            // break from "each" because we found it
            return false;
          }
        }      
      });
    }
    else if( mediaType === mediaTypes.SWF ) {
      // get width and height and load into dim obj (w, h)
      dim = getDimensions(obj, defaults.SWF_WIDTH, defaults.SWF_HEIGHT);
      
      // iterate through the instances to find and configure new one
      $(".launchable").each(function(index) {
        // need jQuery element reference
        var el = $(this);
        // match media : "swf" but ignore white spaces (and don't care about : or "")
        var searchRegEx = /media\W*swf/i;
        // this means we have a SWF launcher
        if( el.siblings("script").html().search(searchRegEx) > 0 ) {
          // check to see if the id has been set. If not, that means it is new
          if( el.attr("id") === undefined || el.attr("id") === "" ) {
            // set the id
            el.attr("id", "swf"+index);
            swfOverlay(dim.w, dim.h);
            // break from "each" because we found it
            return false;
          }
        }      
      });
    }
  }
  // PUBLIC METHODS
  return { 
    set: init,
    launchType: function() { return launchType; }
  };
}());