/************************************

authors : Nguyễn Minh Trường
first released by : Nguyễn Minh Trường in 2017
email : anhchangvt1994@gmail.com / fvn.truongnm@gmail.com
phone number : 0948621519

************************************/

$(function($) {
  var targetEl = "", // global for detect what component is running this plugin at current (biến toàn cục này dùng xác định component nào đang chạy fvnBox trong thời điểm hiện tại).
    imgsGB = "", // global for images list for the running component (global này dùng để lưu trữ danh sách image trong component đó, dù cho images đó nào ở các cấp element khác nhau trong component).
    optGB = "", // global for option component run this plugin (global này dùng lưu trữ options của component hiện tại)

    /*
        tất cả các biến global ngoài vai trò là những biến được sử dụng xuyên suốt plugin ra, thì nó còn dùng cho mục đích xác định đối tượng khởi chạy, 
        bởi plugin chỉ chạy các event functions trong 1 lần khởi chạy, và các event functions này được dùng cho toàn bộ các khởi chạy khác trong page.
        vd : component01, component02 chạy cùng fvnBox nhưng event functions chỉ khởi chạy 1 lần ở component01, sau đó được reuse cho cả component02, 03...
    */

    turnOn = false, // turnOn = false will come true after the event functions of "setup" module is actived, and it'll stop active more then
    imgID; // global varieties
  var fvnImgObj = {}, // global object for suffixImg (object toàn cục, dùng để lưu trữ các file có suffix nếu suffix được khai báo)
    wWidth, wHeight,pWidth,pHeight;    
  $.fn.fvnBox = function(opt, id) { // fvnBox plugin (khởi chạy fvnBox plugin)    
    if ($(this).length > 1) { //cause we maybe use same class for multiple components in a page, so this will help us to break them.
      // chúng ta có thể sử dụng chỉ 1 class cho nhiều components và dùng class đó để khởi chạy 1 plugin, tính năng này giúp plugin có thể phân chia tác vụ riêng biệt cho từng components.      
      const components = this;
      // return;
      return{
        except:function(item){
          var slick=false;
          setTimeout(function(){
            if(!slick){
              components.each(function(id, data) {
                $(data).fvnBox({ suffixImg: opt.suffixImg, number: opt.number, caption: opt.caption,scroll:opt.scroll, w:opt.w, h:opt.h }, id).except(item);          
              });          
            }
          },0);
          return {            
            slick:function(slick_opt){
              slick = true;
              components.each(function(id, data) {
                $(data).fvnBox({ suffixImg: opt.suffixImg, number: opt.number, caption: opt.caption, scroll:opt.scroll, w:opt.w, h:opt.h }, id).except(item).slick(slick_opt);          
              });          
            }
          };
        },
        slick:function(slick_opt){
          components.each(function(id, data) {
            $(data).fvnBox({ suffixImg: opt.suffixImg, number: opt.number, caption: opt.caption, scroll:opt.scroll, w:opt.w, h:opt.h }, id).except(undefined).slick(slick_opt);          
          });          
        }
      };
    }
    if ($("body").find(".fullImg").length === 0) {

      // auto add file css into bottom of head tag (tự động add file fancy css vào cuối head tag)
      
      $("<link>").appendTo("head").attr({
        rel:  "stylesheet",
        type: "text/css",
        href: "css/fancy.css"
      });

      // add new popup for fvnBox. (thêm mới cửa sổ bật hình ảnh cho fvnBox)

      $("body").append('<div class="fullImg hidden"><span class="close-lightBox"></span><div class="fvnInforBox hidden"><span class="fvnNumber"></span><span class="fvnCaption"></span></div><div class="navBox hidden"><span class="prevBtn">&nbsp;</span><span class="close-lightBox"></span><span class="nextBtn">&nbsp;</span></div><div class="imgBox"></div></div>');      

      // modify the resize function() for image in other screen size

      $(window).resize(function() {        
        fvnBoxFeature.setResizeImg({width:pWidth,height:pHeight});
      });

      // setting navBox by detecting what device on use.

      if (fvnBoxFeature.detectDevice()) {
        $(".fullImg").addClass("fvnNavBox");
      } else {
        $(".navBox").addClass("fvnNavBox");
      }

      // for IE, cause IE doesn't support remove and replaceWith functions in jquery, so we will custom a remove function if browser doesn't support
      // link for solution in it: https://stackoverflow.com/questions/20428877/javascript-remove-doesnt-work-in-ie

      fvnBoxFeature.settingRemoveFunc();      
    }    
    if (id === undefined) { id = "1"; }
    var curObj = "fvnBox" + (id < 10 ? "0" + id : id); // add new class for components to difference orther (thêm mới class để phân biệt chúng với nhau)
    while ($($("body").find("." + curObj)).length !== 0) {
      id++;
      curObj = "fvnBox" + (id < 10 ? "0" + id : id);
    }
    $(this).addClass(curObj);
    curObj = "." + curObj; // declare new class, to instead old class. (khai báo class mới được thêm, thay cho class trước đó)

    if (opt !== undefined) {
      if (!("suffixImg" in opt)) { // if current coponent have "opt.suffixImg" then must add list of images (nếu component hiện tại có opt.suffixImg thì mới thêm danh sách hình ảnh tương ứng với suffix đó)
        opt["suffixImg"] = undefined ;
      } else {
        if(opt.suffixImg !== undefined){
          setTimeout(function() {
            fvnBoxFeature["init"]({ opt: "setSuffix", suffix: opt.suffixImg }); // add new list images with suffix before. (thêm mới danh sách images được định nghĩa trước bởi suffix)        
          }, 0);
        }        
      }
    }
    var except=false;    
    $($(curObj).find("img")).attr("data-except",false);    
    setTimeout(function(){
      if(!except){
        fvnBoxFeature.setListImg(curObj,opt);        
      }
    },0);
    return {
      except: function(item,obj=curObj,option = opt){
        except = true;        
        fvnBoxFeature.except(item,obj,option);
        return {
          slick:function(slick_opt,obj=curObj){
            fvnBoxFeature.slick(obj,slick_opt,opt);
          }
        };
      },
      slick:function(slick_opt,obj=curObj){        
        setTimeout(function(){
          fvnBoxFeature.slick(obj,slick_opt);
        },0);
      }
    };
  };
  var setupFVNBox = {
    init: function(curObj, opt, imgs) {
      this.setup(curObj, opt, imgs);
    },
    setup: function(curObj, opt, imgs) {

      var currentPercent, prevPoint, distance; // declare available for mainbrain
      var pos;
      var target = ($(curObj).find("a").length != 0 ? "a" : $(curObj).find("li").length != 0 ? "li" : $(curObj).find("div").length != 0 ? "div" : $(curObj).find("dd").length != 0 ? "dd" : "img");
      fvnBoxController.detectEvent({ obj: curObj, tg: target });
      $(curObj).find("img").on("mousedown",function(e){
        pos = e.pageX;        
      });
      $(curObj).find("img").on("touchstart click", function(e) {        
        if($(this).attr("data-except")=="true"){
          var atag = $(e.target).parents("a");          
          if(atag.length>=1 && $(atag[0]).attr("href")=="#"){
            $(atag[0]).on("click",function(e){
              e.preventDefault();
            });
          }
        }else{
          // set percent value of window size.                            
          pWidth = opt.w;pHeight = opt.h;
          fvnBoxFeature["init"]({ opt: "setSizePercent",width:opt.w, height:opt.h });          
          targetEl = curObj;
          imgsGB = imgs;
          optGB = opt;
          imgID = $(this).attr("data-index");
          $(".navBox").addClass(curObj.split(".")[1]);
          if(!fvnBoxController.detectImgsLength(imgsGB)){
            $(".prevBtn,.nextBtn").css("display","none");  
          }else{
            $(".prevBtn,.nextBtn").removeAttr("style");
          }
          if (!fvnBoxFeature.detectDevice()) {    
            if(pos == e.pageX){
              fvnBoxAnimation.mainAnimate({ item: $(this), imgs: imgs, opt: opt });
              if (!turnOn) {
                setTimeout(function() {
                  navClickEvent();
                  navTouchEvent();
                }, 0);
                turnOn = true;
              }
              return false; 
            }            
          } else {
            var drag = false;              
            $(document).on("touchmove", function() {
              drag = true;
            });
            $(this).on("touchend", function(e) {
              if (!drag) {
                fvnBoxAnimation.mainAnimate({ item: $(this), imgs: imgs, opt: opt });
              } else {
                drag = false;
              }
              if (!turnOn) {
                setTimeout(function() {
                  navClickEvent();
                  navTouchEvent();
                }, 0);
                turnOn = true;
              }                                
              e.preventDefault();
            });
          }
        }        
      });

      function navTouchEvent() {
        $(".navBox" + targetEl).on("touchstart", function(e) {          
          $("body").addClass("preventWindowScroll");
          prevPoint = e.originalEvent.touches[0].pageX;
          distance = 0;
        }).on("touchmove", function(e) {
          var dragVariables = fvnBoxAnimation.dragAnimate({ event: e, prevPoint: prevPoint, distance: distance, outImg: false });
          prevPoint = dragVariables.prevPoint;
          distance = dragVariables.distance;
        }).on("touchend", function(e) {          
          $("body").removeClass("preventWindowScroll");
          var dragVariables = fvnBoxAnimation.dragAnimate({ prevPoint: prevPoint, distance: distance, outImg: true, imgs: imgsGB, opt: optGB });
        });
        $(".fullImg").on("touchstart", ".close-lightBox", function() {
          targetEl = fvnBoxController.settingClose(targetEl, $(this));
          return false;
        });
      }

      function navClickEvent() {
        $(".navBox" + targetEl).on("click", ".prevBtn, .nextBtn, .close-lightBox", function() {
          if ($(this)[0].className != "close-lightBox") {
            var src = fvnBoxController.detectContinueImg(targetEl, $(this));
            if (src !== undefined) {
              fvnBoxAnimation.mainAnimate({ item: $(src), imgs: imgsGB, opt: optGB });
            }
          } else {
            targetEl = fvnBoxController.settingClose(targetEl, $(this));
          }
        });
      }
    }
  };

  var fvnBoxAnimation = {
    mainAnimate: function(storage) {
      if (storage.type === undefined) {
        var animate = 50;
        var src, caption;
        if (storage.opt.caption) {
          caption = storage.item.attr("alt");
        }
        // check if have suffix                                
        if (storage.opt.suffixImg !== undefined) {
          if (storage.item.attr("data-src") === undefined) {
            storage.item.attr("data-src", fvnBoxController.detectSuffixImage(storage.item, storage.opt.suffixImg));
          }
          $("body").find(".fullImg").append("<img src=" + storage.item.attr("data-src") + " draggable='false'>").removeClass("hidden");
          src = storage.item.attr("data-src");
          animate = 0;
        } else {
          if($(storage.item[0]).attr("data-fvnScroll") === undefined){
            $("body").find(".fullImg").append(storage.item[0].outerHTML);
          }else{
            $("body").find(".fullImg").append("<div class='fvnScrollBox'><div class='fvnScrollContent'>"+storage.item[0].outerHTML+"</div></div>");
          }          
          src = storage.item.attr("src");
        }
        if ($($(".fullImg").find("img")).length > 2) {
          const scrollBox = $($(".fullImg").find("img")[0]).parents(".fvnScrollBox")[0];          
          if(scrollBox === undefined){
            $(".fullImg").find("img")[0].remove();
          }else{
            $(scrollBox).remove();
          }          
        }
        $('img').on('dragstart', function(event) {
          event.preventDefault();
        });
        fvnBoxController.settingTimer(storage.opt, storage.item[0], src, animate, caption, $(storage.imgs).length);
      }
    },
    dragAnimate: function(storage) {
      if (storage.type === undefined) {
        if (!storage.outImg) {
          var leftImgPos, leftImgBox;
          var curPoint = storage.event.originalEvent.touches[0].pageX;
          var left;
          if ($($(".fullImg").find("img"))[1] === undefined) {
            $($(".fullImg").find("img")).removeClass("returnAnimate quickMove").addClass("noneAnimate");
            $($(".fullImg").find(".imgBox")).removeClass("returnAnimate quickMove").addClass("noneAnimate");
          } else {
            $($(".fullImg").find("img")[0]).removeClass("returnAnimate").addClass("quickMove");
            $($(".fullImg").find(".imgBox")[0]).removeClass("returnAnimate").addClass("quickMove");
          }
          leftImgPos = $(".fullImg img").offset().left;
          leftImgBox = $(".fullImg .imgBox").offset().left;
          if (curPoint > storage.prevPoint) {
            leftImgPos = leftImgPos + 5;
            leftImgBox = leftImgBox + 5;
            storage.distance = storage.distance + 1;
          } else {
            leftImgPos = leftImgPos - 5;
            leftImgBox = leftImgBox - 5;
            storage.distance = storage.distance - 1;
          }
          $(".fullImg img").offset({ left: leftImgPos });
          $(".fullImg .imgBox").offset({ left: leftImgBox });
          $(".navBox").offset({ left: leftImgBox });
          return { prevPoint: storage.event.originalEvent.touches[0].pageX, distance: storage.distance };
        } else {
          var remove = false,
            outBorder;
          if ($(".fullImg img").hasClass("quickMove")) {
            outBorder = 3;
          } else {
            outBorder = 7;
          }
          $(".fullImg img").removeClass("noneAnimate quickMove");
          $(".fullImg .imgBox").removeClass("noneAnimate quickMove");          
          if (storage.distance >= outBorder && fvnBoxController.detectImgsLength(imgsGB)) {
            $(".fullImg img").addClass("outAnimate").css("left", 100 + "%");
            $(".fullImg .imgBox").addClass("outAnimate").css("left", 100 + "%");
            remove = true;
          } else if (storage.distance <= -outBorder && fvnBoxController.detectImgsLength(imgsGB)) {
            $(".fullImg img").addClass("outAnimate").css("left", 0);
            $(".fullImg .imgBox").addClass("outAnimate").css("left", 0);
            remove = true;
          } else {
            $(".fullImg img").addClass("returnAnimate").css("left", "");
            $(".fullImg .imgBox").addClass("returnAnimate").css("left", "");
          }
          if (remove) {
            var img = $(".fullImg img");
            imgBox = $(".fullImg .imgBox");
            $(".navBox").addClass("noneAnimate");
            $(".fullImg").append("<div class='imgBox'></div>");
            var height = imgBox[0].clientHeight;
            var width = imgBox[0].clientWidth;
            setTimeout(function() {
              var src = fvnBoxController.detectContinueImg(targetEl, storage.distance >= outBorder ? [{ className: "nextBtn" }] : [{ className: "prevBtn" }]);
              fvnBoxAnimation.mainAnimate({ item: $(src), imgs: storage.imgs, opt: storage.opt });
            }, 50);
            setTimeout(function() {
              img.css({ height: img.height() / 3, width: img.width() / 3 });
              imgBox.css({ "height": imgBox[0].clientHeight / 2 + "px !important", "width": imgBox[0].clientWidth / 2 + "px !important" });
            }, 70);
            setTimeout(function() {
              imgBox.css({ height: height, width: width });
            }, 600);
            setTimeout(function() {
              img.addClass("remove");
              imgBox.addClass("remove");
            }, 980);
            setTimeout(function() {
              $(".fullImg .remove").remove();
            }, 1000);
          }
          $(".navBox").css("left", "");
        }
      }
    }
  };

  var fvnBoxController = {
    detectEvent: function(event) {
      // if (event.tg != "img" && !fvnBoxFeature.detectDevice()) {                
      //   $(event.obj).find(event.tg).click(function(e) {
      //     e.preventDefault();
      //     $(this).find("img").click();
      //   });
      // }
    },
    detectSuffixImage: function(img, suffix) {
      var src = img.attr("src");
      var oldImg = src.split("/")[$(this).length];
      var newImg;
      if (fvnImgObj === undefined) {
        newImg = src;
      } else {
        $.each(fvnImgObj[suffix], function(id, data) {
          if (oldImg.split(".")[0] == data) {
            newImg = src.split(oldImg)[0] + oldImg.split(".")[0] + "-" + suffix + "." + oldImg.split(".")[1];
            return;
          }
        });
        if (newImg === undefined) {
          newImg = src;
        }
        return newImg;
      }
    },
    detectImageSize: function(curW, curH, scroll) {      
      if(!scroll){        
        if (curW > wWidth) {
          currentPercent = (wWidth / curW) * 100;
          curW = wWidth;
          curH = (curH * currentPercent) / 100;
        }
        if (curH > wHeight) {
          currentPercent = (wHeight / curH) * 100;
          curH = wHeight;
          curW = (curW * currentPercent) / 100;
        }        
        if (curW > wWidth || curH > wHeight) {
          return arguments.callee(curW, curH, false);
        } else {          
          return { "trueWidth": curW, "trueHeight": curH, "actualWidth": undefined,"actualHeight":undefined};          
        }
      }else{        
        const rootW = curW,rootH = curH;        
        if(rootW > rootH){                    
          let ratioH = $(window).outerHeight(true) * 0.5,ratioW = $(window).outerWidth(true) * 0.8;
          if(curH > ratioH){
            currentPercent = (ratioH / curH) * 100;
            curH = ratioH;  
            curW = (curW * currentPercent) / 100;
          }          
          if(curW > ratioW){
            return {"trueWidth":curW,"trueHeight":curH,"actualWidth":ratioW,"actualHeight":undefined}; 
          }
          else{
            return arguments.callee(rootW, rootH, false);
          }        
        }else{
          let ratioH = $(window).outerHeight(true) * 0.7,ratioW = $(window).outerWidth(true) * 0.8;
          if(curW > ratioW){
            currentPercent = (ratioW / curW) * 100;
            curW = ratioW;  
            curH = (curH * currentPercent) / 100;
          }          
          if(curH > ratioH){
            return {"trueWidth":curW,"trueHeight":curH,"actualWidth":undefined,"actualHeight":ratioH}; 
          }
          else{
            return arguments.callee(rootW, rootH, false);
          }
        }
      }      
    },
    detectContinueImg: function(targetEl, nav) { 
      if (targetEl != "") {
        if (nav[0].className == "prevBtn") {
          if (imgID > 0) {
            imgID--;
          } else {            
            imgID = imgsGB.length - 1;
          }
        } else if (nav[0].className == "nextBtn") {
          if (imgID < imgsGB.length - 1) {
            imgID++;
          } else {
            imgID = 0;
          }
        }
        var getImgByID = imgsGB[imgID];
        return getImgByID;
      }
    },
    calcActualSize:function(fvnScroll,item){      
      var imgSize;
      if(fvnScroll === undefined){
        imgSize = fvnBoxController.detectImageSize($(item).prop("naturalWidth"), $(item).prop("naturalHeight"),false);          
      }else{
        imgSize = fvnBoxController.detectImageSize($(item).prop("naturalWidth"), $(item).prop("naturalHeight"),true);
      }        
      trueW = parseInt(imgSize.trueWidth);
      trueH = parseInt(imgSize.trueHeight);
      actualWidth = (imgSize.actualWidth !== undefined ? parseInt(imgSize.actualWidth) : undefined);
      actualHeight = (imgSize.actualHeight !== undefined ? parseInt(imgSize.actualHeight) : undefined);       
      var increaseSize,navWidth;      
      if(fvnBoxFeature.detectDevice()){
        increaseSize = 10;
        navWidth = 1;
      }else{
        increaseSize = 70;
      }
      var scrollBox,scrollContent,imgBox,navBox,fvnInforBox,commonSize;        
      if(actualWidth!==undefined && actualHeight === undefined){
        scrollBox = {"width":actualWidth,"height":trueH+increaseSize};
        scrollContent = {"overflow-x":"auto","overflow-y":"hidden","padding-bottom":"17px"};
        imgBox = {"width":actualWidth+10,"height":trueH+10};
        navBox = {"width":actualWidth * (navWidth !== undefined ? navWidth : 1.25),"height":trueH};
        fvnInforBox = {"width":actualWidth,"height":trueH+increaseSize};
      }else if(actualWidth===undefined && actualHeight !== undefined){
        scrollBox = {"width":trueW + increaseSize,"height":actualHeight};
        scrollContent = {"overflow-x":"hidden","overflow-y":"auto","padding-right":"17px"};
        imgBox = {"width":trueW + 10,"height":actualHeight + 10};
        navBox = {"width":trueW * (navWidth !== undefined ? navWidth : 1.45),"height":actualHeight};
        fvnInforBox = {"width":trueW,"height":actualHeight};
      }else if(actualWidth===undefined && actualHeight === undefined){
        commonSize = {"width":trueW + 10,"height": trueH + 10,"z-index":""};
      }
      return {"scrollBox":scrollBox,"scrollContent":scrollContent,"imgBox":imgBox,"navBox":navBox,"fvnInforBox":fvnInforBox,"commonSize":commonSize};
    },
    settingTimer: function(opt, item, src, animate, caption, imgs) {
      $(".fullImg").find("img[src*='" + src + "']").load(function() {
        // get width and height in fact of that image acording to % width and height of window                                                
        var itemSize;
        const closeBtn = $(".navBox").find(".close-lightBox");
        $(closeBtn).removeClass("cordx cordy");        
        itemSize = fvnBoxController.calcActualSize($(item).attr("data-fvnScroll"),this);
        console.log(itemSize);
        var scrollBox,scrollContent,imgBox,navBox,fvnInforBox,commonSize;
        scrollBox = itemSize.scrollBox;
        scrollContent = itemSize.scrollContent;
        imgBox = itemSize.imgBox;
        navBox = itemSize.navBox;
        fvnInforBox = itemSize.fvnInforBox;
        commonSize = itemSize.commonSize;
               
        // animte for fancybox

        $("body").find(".fullImg").removeClass("hidden");        
        $("body").find(".navBox").removeClass("hidden");
        $("body").find(".fvnInforBox").removeClass("hidden");        
        setTimeout(function(){
          $("body").find(".fullImg img").css({ "width": parseInt(trueW), "height": parseInt(trueH) });              
          if($("body").find(".fvnScrollBox").length > 0){          
            $("body").find(".fvnScrollBox").css(scrollBox !== undefined ? scrollBox : commonSize);                    
          }        
        },100)        
        setTimeout(function() {
          var id = 0,          
          scrollItem = $($(".fullImg").find("img")[0]).parents(".fvnScrollBox")[0];          
          if ($($(".fullImg").find("img")).length == 2) {
            $($(".fullImg").find("img")[0]).removeClass("appearOpa").addClass("disappearOpa");
            if(scrollItem !== undefined){
              $(scrollItem).removeClass("appearOpa").addClass("disappearOpa");
            }
            id = 1;
          }
          scrollItem = $($(".fullImg").find("img")[id]).parents(".fvnScrollBox")[0];          
          $($(".fullImg").find("img")[id]).addClass("appearOpa");
          if(scrollItem !== undefined){
            $("body").find(".fvnScrollContent").css(scrollContent !== undefined ? scrollContent : {});            
            if(commonSize !== undefined){
              $(scrollItem).addClass("appearOpa").css({"z-index":""});
            }else{
              $(scrollItem).addClass("appearOpa").css({"z-index":"99999"});             
              if(trueW > trueH){                
                $(closeBtn).addClass("cordx");
                console.log("run");
              }else{
                $(closeBtn).addClass("cordy");
              }
              fvnBoxFeature.setCustomScroll($(scrollItem),$($(".fullImg").find("img")[id]).parent(".fvnScrollContent")[0],trueW > trueH ? "x" : "y");
            }
          }
        }, 200);
        setTimeout(function() {
          $("body").find(".imgBox").css(imgBox !== undefined ? imgBox : commonSize);                    
          $("body").find(".navBox").css(navBox !== undefined ? navBox : commonSize);          
          $("body").find(".fvnInforBox").css(fvnInforBox !== undefined ? fvnInforBox : commonSize);
          if (opt.number) {
            $("body").find(".fvnInforBox .fvnNumber").html(parseInt(imgID) + 1 + " of " + imgs);
          } else {
            $("body").find(".fvnInforBox .fvnNumber").html("");
          }
          if (caption !== undefined && opt.caption) {
            $("body").find(".fvnInforBox .fvnCaption").html(caption);
          } else {
            $("body").find(".fvnInforBox .fvnCaption").html("");
          }
        }, animate);
      });
    },
    settingClose: function(targetEl, nav) {
      if (targetEl != "" && targetEl !== undefined) {
        $(".navBox").removeClass(targetEl.split(".")[1]);
        $(".fullImg").addClass("hidden").find("img").remove();
        $(".fullImg").find(".imgBox").css({ "width": "", "height": "" });
        $(".navBox").addClass("hidden");
        $(".fvnInforBox").addClass("hidden");
        targetEl = "";
        return targetEl;
      }
    },
    detectImgsLength:function(imgs){
      var check = false;
      if(imgs.length != 1){
        check = true;
      }
      return check;
    }
  };

  var fvnBoxFeature = {
    init: function(fn_Opt) {
      if (fn_Opt.opt == "setSuffix") {
        this.setListSuffix(fn_Opt.suffix);
      } else if (fn_Opt.opt == "setSizePercent") {              
        this.setSizePercent(fn_Opt.width===undefined?80:fn_Opt.width>90?90:fn_Opt.width<50?50:fn_Opt.width,fn_Opt.height===undefined?80:fn_Opt.height>90?90:fn_Opt.height<50?50:fn_Opt.height);
      }
    },
    setListSuffix: function(suffix) {
      if (fvnImgObj[suffix] === undefined) {
        fvnImgObj[suffix] = {};
        var imgSrc = $("body img").attr("src");
        var imgName = imgSrc.split("/")[$(this).length];
        imgSrc = imgSrc.split(imgName)[0];
        $.get(imgSrc, function(data) {
          $(data).find("a[href*=" + suffix + "]").each(function(id, data) {
            var rootImgSrc = $(data).attr("href").split("-" + suffix)[0];
            fvnImgObj[suffix][id] = rootImgSrc;
          });
        });
      }
    },
    setCustomScroll:function(parent,item,cordinate){  
    console.log(item)          ;
      var scrollContent = parent,
      wrapperContent = item,
      content = $(item).find("img"),
      contentPos = 0,
      beginDrag = false,
      scroller,
      scrollerCordinate,
      topPos,
      rootPos; 
      function calcScrollCordinate() {
        if(cordinate == "x"){
          let visibleRatio = scrollContent.outerWidth(true) / $(wrapperContent).prop("scrollWidth");
          return visibleRatio * scrollContent.outerWidth(true);
        }else{
          let visibleRatio = scrollContent.outerHeight(true) / $(wrapperContent).prop("scrollHeight");
          return visibleRatio * scrollContent.outerHeight(true);
        }                        
      }

      function moveScroller(ev){
        if(cordinate == "x"){
          let scrollPercent = ev.target.scrollLeft / $(wrapperContent).prop("scrollWidth");
          topPos = scrollPercent * (scrollContent.outerWidth(true) - 5);
          scroller.style.left = topPos+'px';
        }else{
          let scrollPercent = ev.target.scrollTop / $(wrapperContent).prop("scrollHeight");
          topPos = scrollPercent * (scrollContent.outerHeight(true) - 5);
          scroller.style.top = topPos+'px';
        }        
      }

      function startDrag(ev){
        if(cordinate == "x"){
          rootPos = ev.pageX;
          contentPos = $(wrapperContent).scrollLeft();          
        }else{
          rootPos = ev.pageY;
          contentPos = $(wrapperContent).scrollTop();          
        }
        beginDrag = true;
      }
      
      function scrollBar(ev){        
        if(beginDrag){
          if(cordinate == "x"){
            let mouseDifferential = ev.pageX - rootPos;
            let scrollEquivalent = mouseDifferential * ($(wrapperContent).prop("scrollWidth") / scrollContent.outerWidth(true));
            $(wrapperContent).scrollLeft(contentPos + scrollEquivalent);            
          }else{
            let mouseDifferential = ev.pageY - rootPos;
            let scrollEquivalent = mouseDifferential * ($(wrapperContent).prop("scrollHeight") / scrollContent.outerHeight(true));
            $(wrapperContent).scrollTop(contentPos + scrollEquivalent);
          }                    
        }
      }

      function stopDrag(ev){
        beginDrag = false;
      }

      function createScroll(){      
        scroller = document.createElement("div");
        scroller.className = "fvnScroller";
        scrollerCordinate = calcScrollCordinate();                              
        if(scrollerCordinate / (cordinate == "x" ? scrollContent.outerWidth(true) : scrollContent.outerHeight(true)) < 1){                              
          if(cordinate == "x"){            
            $(scroller).css({"width":scrollerCordinate+"px","height":"15px","bottom":3+"px","left":0});
            scrollContent.addClass('fvnShowX');            
          }else{            
            $(scroller).css({"width":15+"px","height":scrollerCordinate+"px","top":0,"right":2+"px"});
            scrollContent.addClass('fvnShowY');
          }          
          scrollContent.append(scroller);      
          scroller.addEventListener('mousedown',startDrag);
          if(fvnBoxFeature.detectDevice()){
            scrollContent.addClass('fvnHideCord');
          }
          window.addEventListener('mouseup',stopDrag);
          window.addEventListener('mousemove',scrollBar);
        }
      }
      createScroll();
      wrapperContent.addEventListener('scroll',moveScroller);
    },
    setSizePercent: function(w,h) {      
      var winW = $(window).outerWidth(false),
        winH = $(window).outerHeight(true);
      wWidth = winW < winH ? winW * w / 100 : winW <= 640 ? winW * (w >= 50 && w <= 79? w:w-20) / 100 : winW * (w <= 90 && w >= 80? w:w+5) / 100;
      wHeight = winW < winH ? winH * h / 100 : winW <= 640 ? winH * (h >= 50 && h <= 79? h:h-20) / 100 : winH * (h <= 90 && h >= 80? h:h+5) / 100;
    },
    setListImg:function(curObj,opt){
      let listImg = $(curObj).find("img[data-except='false']"); // declare list of images in current new class (khai báo danh sách hình thuộc từng component riêng biệt)                               
      $.each(listImg, function(id, data) {
        $(data).attr("data-index", id);
      });
      setupFVNBox["init"](curObj, opt, listImg); // main brain to controll and resovle the main feature of fvnBox animation.                  
    },
    except:function(item,curObj,opt){                  
      const exceptItem = $(curObj).find(item),
        scrollItem = $(curObj).find(opt.scroll),
        fboxFeature = this;
      const maxLength = Math.max(exceptItem.length,scrollItem.length);           
      if(maxLength > 0){
        for(let i = 0;i<maxLength;i++){
          if(exceptItem[i] !== undefined){
            $(exceptItem[i]).attr("src") !== undefined ? $(exceptItem[i]).attr("data-except",true) : $($(exceptItem[i]).find("img")).attr("data-except",true);
          }
          if(scrollItem[i] !== undefined){
            $(scrollItem[i]).attr("src") !== undefined ? $(scrollItem[i]).attr("data-fvnScroll",true) : $($(scrollItem).find("img")).attr("data-fvnScroll",true);
          }
          if(i == maxLength - 1){
            fboxFeature.setListImg(curObj,opt);
          }
        }
      }else{
        fboxFeature.setListImg(curObj,opt);          
      }      
      // if(exceptItem.length != 0){
      //   $.each(exceptItem,function(id,data){          
      //     if($(data).attr("src") === undefined){
      //       $($(data).find("img")).length >= 1 ? $($(data).find("img")).attr("data-except",true):"";
      //     }else{
      //       $(data).attr("data-except",true);
      //     }
      //     if(id == exceptItem.length-1){
      //       fboxFeature.setListImg(curObj,opt);              
      //     }
      //   });
      // }else{            
      //   fboxFeature.setListImg(curObj,opt);          
      // }
    },
    slick:function(obj,slick_opt){
      $(obj).slick(slick_opt);
    },
    detectDevice: function() {
      var isMobile = false; //initiate as false
      // device detection
      if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) isMobile = true;
      return isMobile;
    },
    setResizeImg: function(fn_Opt) {      
      if (this.detectDevice() && !$(".fullImg").hasClass("fvnNavBox")) {
        $(".navBox").removeClass("fvnNavBox");
        $(".fullImg").addClass("fvnNavBox");
      } else if (!this.detectDevice() && $(".fullImg").hasClass("fvnNavBox")) {
        $(".navBox").addClass("fvnNavBox");
        $(".fullImg").removeClass("fvnNavBox");
      }
      this.setSizePercent(fn_Opt.width===undefined?80:fn_Opt.width>90?90:fn_Opt.width<50?50:fn_Opt.width,fn_Opt.height===undefined?80:fn_Opt.height>90?90:fn_Opt.height<50?50:fn_Opt.height);      
      if (!$(".fullImg").hasClass("hidden")) {
        const isExist = $(".fullImg").find(".fvnScrollBox.appearOpa");
        console.log(isExist);
        var isScroll = false;
        if(isExist.length == 1){
          isScroll = true;
          if(this.detectDevice()){
            $(".fvnScrollBox").addClass("fvnHideCord");
            if($(isExist).find(".fvnScroller").length == 1){
              $(isExist.find(".fvnScroller")).remove();
            }
          }else{
            $(".fvnScrollBox").removeClass("fvnHideCord");
            console.log($(isExist).find(".fvnScrollContent"));                        
            fvnBoxFeature.setCustomScroll($(isExist),$(isExist).find(".fvnScrollContent")[0],$(isExist).hasClass("fvnShowX") === true ? "x" : "y");            
          }
        }
        var itemSize;
        itemSize = fvnBoxController.calcActualSize(isScroll,$(".fullImg").find("img.appearOpa"));        
        console.log(itemSize);
        var scrollBox,scrollContent,imgBox,navBox,fvnInforBox,commonSize;
        scrollBox = itemSize.scrollBox;
        scrollContent = itemSize.scrollContent;
        imgBox = itemSize.imgBox;
        navBox = itemSize.navBox;
        fvnInforBox = itemSize.fvnInforBox;
        commonSize = itemSize.commonSize;
        $("body").find(".fullImg img").css({ "width": parseInt(trueW), "height": parseInt(trueH) });
        $("body").find(".fvnScrollBox").css(scrollBox !== undefined ? scrollBox : commonSize);
        $("body").find(".fvnScrollContent").css(scrollContent !== undefined ? scrollContent : {});      
        $("body").find(".imgBox").css(imgBox !== undefined ? imgBox : commonSize);                    
        $("body").find(".navBox").css(navBox !== undefined ? navBox : commonSize);          
        $("body").find(".fvnInforBox").css(fvnInforBox !== undefined ? fvnInforBox : commonSize);
        // var trueW = fvnBoxController.detectImageSize($("body").find(".fullImg img.appearOpa").prop("naturalWidth"), $("body").find(".fullImg img.appearOpa").prop("naturalHeight")).trueWidth;
        // var trueH = fvnBoxController.detectImageSize($("body").find(".fullImg img.appearOpa").prop("naturalWidth"), $("body").find(".fullImg img.appearOpa").prop("naturalHeight")).trueHeight;
        // $("body").find(".fullImg img").css({ "width": trueW, "height": trueH }).addClass("fastAnimate");
        // $("body").find(".imgBox").css({ "width": trueW + 10, "height": trueH + 10 }).addClass("fastAnimate");
        // $("body").find(".navBox").css({ "width": trueW + 10, "height": trueH + 10 }).addClass("fastAnimate");
        // $("body").find(".fvnInforBox").css({ "width": trueW + 10, "height": trueH + 10 }).addClass("fastAnimate");
      }
    },
    settingRemoveFunc: function() {
      if (!('remove' in Element.prototype)) {
        Element.prototype.remove = function() {
          if (this.parentNode) {
            this.parentNode.removeChild(this);
          }
        };
      }
    }
  };
});