 // set references
var viewerWindow = window.parent;
var viewerDocument = viewerWindow.document;
 /* Minified plugins */
(function(a){function d(b){if(b){return b.call(a.mask)}}function c(){return[a(viewerDocument).width(),a(viewerDocument).height()]}a.tools=a.tools||{version:"@VERSION"};var b;b=a.tools.expose={conf:{maskId:"exposeMask",loadSpeed:"slow",closeSpeed:"fast",closeOnClick:false,closeOnEsc:true,zIndex:9998,opacity:.8,startOpacity:0,color:"#fff",onLoad:null,onClose:null}};var e,f,g,h,i;a.mask={load:function(j,k){if(g){alert("loaded");return this}if(typeof j=="string"){j={color:j}}j=j||h;h=j=a.extend(a.extend({},b.conf),j);e=a("#"+j.maskId,viewerDocument);if(!e.length){a("body",viewerDocument).append("<div id='"+j.maskId+"'></div>");e=a("#"+j.maskId,viewerDocument)}var l=c();e.css({position:"absolute",top:0,left:0,width:l[0],height:l[1],display:"none",opacity:j.startOpacity,zIndex:j.zIndex});if(j.color){e.css("backgroundColor",j.color)}if(d(j.onBeforeLoad)===false){return this}if(j.closeOnEsc){a(viewerDocument).bind("keydown.mask",function(b){if(b.keyCode==27){a.mask.close(b)}})}if(j.closeOnClick){e.bind("click.mask",function(b){a.mask.close(b)})}a(viewerWindow).bind("resize.mask",function(){a.mask.fit()});if(k&&k.length){i=k.eq(0).css("zIndex");a.each(k,function(){var b=a(this);if(!/relative|absolute|fixed/i.test(b.css("position"))){b.css("position","relative")}});f=k.css({zIndex:Math.max(j.zIndex+1,i=="auto"?0:i)})}e.css({display:"block"}).fadeTo(j.loadSpeed,j.opacity,function(){a.mask.fit();d(j.onLoad);g="full"});g=true;return this},close:function(){if(g){if(d(h.onBeforeClose)===false){return this}e.fadeOut(h.closeSpeed,function(){d(h.onClose);if(f){f.css({zIndex:i})}g=false});a(viewerDocument).unbind("keydown.mask");e.unbind("click.mask");a(viewerWindow).unbind("resize.mask")}unloadFlashObj();return this},fit:function(){if(g){var a=c();e.css({width:a[0],height:a[1]})}},getMask:function(){return e},isLoaded:function(a){return a?g=="full":g},getConf:function(){return h},getExposed:function(){return f}};a.fn.mask=function(b){a.mask.load(b);return this};a.fn.expose=function(b){a.mask.load(b,this);return this}})(jQuery);(function(a){function d(d,e){var f=this,g=d.add(f),h=a(viewerWindow),i,j,k,l=a.tools.expose&&(e.mask||e.expose),m=Math.random().toString().slice(10);if(l){if(typeof l=="string"){l={color:l}}l.closeOnClick=l.closeOnEsc=false}var n=e.target||d.attr("rel");var o=a(n,viewerDocument);j=o?a(o):null||d;if(!j.length){throw"Could not find Overlay: "+n}if(d&&d.index(j)==-1){d.click(function(a){f.load(a);return a.preventDefault()})}a.extend(f,{load:function(d){if(f.isOpened()){return f}var i=c[e.effect];if(!i){throw'Overlay: cannot find effect : "'+e.effect+'"'}if(e.oneInstance){a.each(b,function(){this.close(d)})}d=d||a.Event();d.type="onBeforeLoad";g.trigger(d);if(d.isDefaultPrevented()){}k=true;if(l){a(j).expose(l)}var n=e.top,o=e.left,p=j.outerWidth({margin:true}),q=j.outerHeight({margin:true});if(typeof n=="string"){n=n=="center"?Math.max((h.height()-q)/2,0):parseInt(n,10)/100*h.height()}if(o=="center"){o=Math.max((h.width()-p)/2,0)}i[0].call(f,{top:n,left:o},function(){if(k){d.type="onLoad";g.trigger(d)}});if(l&&e.closeOnClick){a.mask.getMask().one("click",f.close)}if(e.closeOnClick){a(document).bind("click."+m,function(b){if(!a(b.target).parents(j).length){f.close(b)}})}if(e.closeOnEsc){a(document).bind("keydown."+m,function(a){if(a.keyCode==27){f.close(a)}})}return f},close:function(b){if(!f.isOpened()){return f}b=b||a.Event();b.type="onBeforeClose";g.trigger(b);if(b.isDefaultPrevented()){return}k=false;c[e.effect][1].call(f,function(){b.type="onClose";g.trigger(b)});a(document).unbind("click."+m).unbind("keydown."+m);if(l){a.mask.close()}return f},getOverlay:function(){return j},getTrigger:function(){return d},getClosers:function(){return i},isOpened:function(){return k},getConf:function(){return e}});a.each("onBeforeLoad,onStart,onLoad,onBeforeClose,onClose".split(","),function(b,c){if(a.isFunction(e[c])){a(f).bind(c,e[c])}f[c]=function(b){if(b){a(f).bind(c,b)}return f}});i=j.find(e.close||".close");if(!i.length&&!e.close){i=a('<a class="close"></a>');i.css({backgroundImage:"none",position:"absolute",right:"-9px",top:"-9px",cursor:"pointer",height:"28px",width:"28px"});j.prepend(i)}i.click(function(a){f.close(a)});if(e.load){f.load()}}a.tools=a.tools||{version:"@VERSION"};a.tools.overlay={addEffect:function(a,b,d){c[a]=[b,d]},conf:{close:null,closeOnClick:false,closeOnEsc:true,closeSpeed:"fast",effect:"default",fixed:!a.browser.msie||a.browser.version>6,left:"center",load:false,mask:null,oneInstance:true,speed:"normal",target:null,top:"10%"}};var b=[],c={};a.tools.overlay.addEffect("default",function(b,c){var d=this.getConf(),e=a(window);if(!d.fixed){b.top+=e.scrollTop();b.left+=e.scrollLeft()}b.position=d.fixed?"fixed":"absolute";this.getOverlay().css(b).fadeIn(d.speed,c)},function(a){this.getOverlay().fadeOut(this.getConf().closeSpeed,a)});a.fn.overlay=function(c){var e=this.data("overlay");if(e){return e}if(a.isFunction(c)){c={onBeforeLoad:c}}c=a.extend(true,{},a.tools.overlay.conf,c);this.each(function(){e=new d(a(this),c);b.push(e);a(this).data("overlay",e)});return c.api?e:this}})(jQuery);(function(a){function d(b){var c=a("#groupFrame",viewerDocument).offset();var d=b.closest("map").attr("name");var e=a("img[useMap='#"+d+"']");var f=a(e).offset();var g=b.attr("coords").split(",");var h={left:parseInt(g[0],10),top:parseInt(g[1],10),width:parseInt(g[2],10)-parseInt(g[0],10),height:parseInt(g[3],10)-parseInt(g[1],10)};var i={left:f.left+h.left,top:f.top+h.top};return{top:c.top+i.top+h.height/2,left:c.left+i.left+h.width/2}}var b=a.tools.overlay,c=a(viewerWindow);a.extend(b.conf,{start:{top:null,left:null},fadeInSpeed:"fast",zIndex:9999});var e=function(b,e){var f=this.getOverlay(),g=this.getConf(),h=this.getTrigger(),i=this,j=f.outerWidth({margin:true}),k=f.outerHeight({margin:true}),l=f.data("bg"),m=g.fixed?"fixed":"absolute";if(!l){var n={"-moz-border-radius":"4px","-webkit-border-radius":"4px","border-radius":"4px","-moz-box-shadow":"0px 0px 4px #666","-webkit-box-shadow":"0px 0px 4px #666","box-shadow":"0px 0px 4px #666","background-color":"#444"};a("body",viewerDocument).append("<div id='bg'></div>");l=a("#bg",viewerDocument);l.css(n).width(j).height(k);f.data("bg",l)}var o=g.start.top||Math.round(c.height()/2),p=g.start.left||Math.round(c.width()/2);if(h){var q=d(h);o=q.top;p=q.left}if(g.fixed){o-=c.scrollTop();p-=c.scrollLeft()}else{b.top+=c.scrollTop();b.left+=c.scrollLeft()}l.css({position:"absolute",top:o,left:p,width:0,height:0,zIndex:g.zIndex}).show();b.position=m;f.css(b);l.animate({top:f.css("top"),left:f.css("left"),width:j,height:k},g.speed,function(){f.css("zIndex",g.zIndex+1).fadeIn(g.fadeInSpeed,function(){if(i.isOpened()&&!a(this).index(f)){e.call()}else{f.hide()}})}).css("position",m)};var f=function(b){var e=this.getOverlay().hide(),f=this.getConf(),g=this.getTrigger(),h=e.data("bg"),i={top:f.start.top,left:f.start.left,width:0,height:0};if(g){a.extend(i,d(g))}if(f.fixed){h.css({position:"absolute"}).animate({top:"+="+c.scrollTop(),left:"+="+c.scrollLeft()},0)}h.animate(i,f.closeSpeed,b)};b.addEffect("apple",e,f)})(jQuery)

//Remove embaded flash object from stage...
function unloadFlashObj(){
  // moved to onClose() in overlay()
}

function NewMedia(id){
  // override
}

$(function() {
  // clean up
  $(window).unload( function () {
    $("#overlay", viewerDocument).remove();
  });
});

var MediaOverlay = (function() {

  // default values
  var defaultWidth = 845;
  var defaultHeight = 716;

  function getURLFromOnClickAttr(onClick) {
    var splitOnClick = onClick.split("'");
    var id = splitOnClick[1];
    return OSDeliveryEngine.getURL(id);
  }
  
  /* 
   * media player appears in an overlay
   */
  function overlay(width, height) {
    
    // create overlay element if there isn't already one
    if ($("#overlay", viewerDocument).length < 1) {
      $("body", viewerDocument).append("<div class='apple_overlay' id='overlay'></div>");
    }
    var overlay = $("#overlay", viewerDocument);

    // create contentWrap element if there isn't already one
    if ($("#overlayContentWrap", viewerDocument).length < 1) {
      overlay.append("<div id='overlayContentWrap' class='contentWrap'></div>");
      overlay.prepend('<a class="close"></a>');
    }
    var contentWrap = $("#overlayContentWrap", viewerDocument);

    // hide the whole thing until we need it
    $(".apple_overlay", viewerDocument).css({ display: "none" });
    
    // close button is used to close the overlay
    var closeImgSrc = "http://eduweb.allscripts.com/LCMSvideo/close-DK.png";
    var closeBtn = $(".close", viewerDocument);
    // styles for close button
    closeBtn.css({
      backgroundImage: "url("+closeImgSrc+")",
      position: "absolute",
      right: "-16px",
      top:  "-16px",
      cursor: "pointer",
      height: "36px",
      width:  "36px",
      "-moz-border-radius": "4px",
      "-webkit-border-radius": "4px",
      "border-radius": "4px",
      "-moz-box-shadow": "0px 0px 4px #666",
      "-webkit-box-shadow": "0px 0px 4px #666",
      "box-shadow": "0px 0px 4px #666",
      "background-color": "#444"
    });
    // we use CSS sprites - hover( handlerIn(), handlerOut() )
    closeBtn.hover( 
      function() { $(this).css({ backgroundPosition: "0 36px" }); },
      function() { $(this).css({ backgroundPosition: "0 0" }); }
    );
    
    // clear out old background div if there is one
    $("#bg", viewerDocument).remove();

    $("area").each(function(index) {
      var onClickAttr = $(this).attr("onclick");
      var str = "";
      if(onClickAttr) { str = onClickAttr.substring(0,8); }
      // check to see if this is a Media Object link
      // if so, we use overlay
      if(str.toLowerCase() ==  "newmedia") {
        // remove default pop-up behavior
        $(this).removeAttr("target");
        // setup <a> tags to link to overlay element
        $(this).attr("rel","#overlay");

        $(this).overlay({
          mask: {
            color: '#202020',
            opacity: 0.3
            },
          effect: 'apple',
          top: 'center',
          onBeforeLoad: function() {
            var wrap = this.getOverlay().find(".contentWrap");
            // get url of this link
            var url = getURLFromOnClickAttr(this.getTrigger().attr("onclick"));
            // build embed element
            var embedTag = "<embed style='margin:8px' width="+width+" height="+height+" wmode='opaque' bgcolor=#444 type='application/x-shockwave-flash' src='"+url+"' />";

            // see if embed object has been loaded already
            var embed = wrap.find('embed');
              if(embed.attr("src") == url) {
                return; // same image, so forget it
              }
              else {
                embed.remove();
              }
            wrap.append(embedTag);
          },
          onClose: function() {
            var wrap = this.getOverlay().find(".contentWrap");
            var embed = wrap.find('embed');
            embed.remove();
          }
        });
      } // end if (newmedia)
    });
    // clean up
    $(window).unload( function () {
      $("#overlay", viewerDocument).remove();
    });
  }
  /* 
   * called to set up player, either to embed or overlay
   */
  function init(obj) {
    var width, height
    
    // width is optional
    if(obj.width != undefined && !isNaN( parseInt(obj.width) ) ) {
      width = parseInt(obj.width);
    } 
    else {
      width = defaultWidth;
    }
    
    // height is optional
    if(obj.height != undefined && !isNaN( parseInt(obj.height) ) ) {
      height = parseInt(obj.height);
    } 
    else {
      height = defaultHeight;
    }

    overlay(width, height);

  }
  // PUBLIC METHODS
  return { 
    set: init
  }
}());
