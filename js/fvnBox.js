$(function($) {
    var targetEl = "",
        turnOn = false,
        imgID; // global varieties
    var fvnImgObj = {}, // global object for suffixImg (object toàn cục, dùng để lưu trữ các file có suffix nếu suffix được khai báo)
        wWidth, wHeight;
    $.fn.fvnBox = function(opt, id) { // fvnBox plugin (khởi chạy fvnBox plugin)
        if ($(this).length > 1) { //cause we maybe use same class for multiple components in a page, so this will help us to break them.
            // chúng ta có thể sử dụng chỉ 1 class cho nhiều components và dùng class đó để khởi chạy 1 plugin, tính năng này giúp plugin có thể phân chia tác vụ riêng biệt cho từng components.
            $(this).each(function(id, data) {
                $(data).fvnBox({ suffixImg: opt.suffixImg }, id);
            });
            return;
        }
        if ($("body").find(".fullImg").length == 0) { // add new popup for fvnBox. (thêm mới cửa sổ bật hình ảnh cho fvnBox)
            $("body").append('<div class="fullImg hidden"><div class="imgBox"></div></div><div class="navBox hidden"><span class="prevBtn">&nbsp;</span><span class="close-lightBox"></span><span class="nextBtn">&nbsp;</span></div>');            
            // set percent value of window size.            
            fvnBoxFeature["init"]({ opt: "setSizePercent" });

            // modify the resize function() for image in other screen size

            $(window).resize(function() {
                fvnBoxFeature.setResizeImg();
            })

            if(document.ontouchstart === null){
            	$(".navBox").addClass("navHidden");
            }
        }
        if (id === undefined) { id = "1"; }
        var curObj = "fvnBox" + (id < 10 ? "0" + id : id); // add new class for components to difference orther (thêm mới class để phân biệt chúng với nhau)
        while ($($("body").find("." + curObj)).length != 0) {
            id++;
            curObj = "fvnBox" + (id < 10 ? "0" + id : id);
        }
        $(this).addClass(curObj);
        curObj = "." + curObj; // declare new class, to instead old class. (khai báo class mới được th6m, thay cho class trước đó)

        var listImg = $($(curObj).find("img")); // declare list of images in current new class (khai báo danh sách hình thuộc từng component riêng biệt)

        if (opt === undefined) { // if current coponent have "opt" then must add list of images (nếu component hiện tại có opt thì mới thêm danh sách hình ảnh tương ứng với suffix đó)
            opt = { "suffixImg": undefined };
        } else {
            setTimeout(function() {
                fvnBoxFeature["init"]({ opt: "setSuffix", suffix: opt.suffixImg }); // add new list images with suffix before. (thêm mới danh sách images được định nghĩa trước bởi suffix)        
            }, 0);
        }

        setupFVNBox["init"](curObj, opt, listImg); // main brain to controll and resovle the main feature of fvnBox animation.
    };

    var setupFVNBox = {
        init: function(curObj, opt, imgs) {
            this.setup(curObj, opt, imgs);
        },
        setup: function(curObj, opt, imgs) {

            var currentPercent,prevPoint,distance; // declare available for mainbrain

            var target = ($(curObj).find("a").length != 0 ? "a" : $(curObj).find("li").length != 0 ? "li" : $(curObj).find("div").length != 0 ? "div" : $(curObj).find("dd").length != 0 ? "dd" : "img");
            var event = document.ontouchstart;
            fvnBoxController.detectEvent({ obj: curObj, tg: target, ev: event });

            $(curObj).find("img").on("touchstart click", function(e) {
                targetEl = curObj;
                $(".navBox").addClass(curObj.split(".")[1]);
                if (document.ontouchstart !== null) {
                    imgID = fvnBoxAnimation.mainAnimate({ item: $(this), imgs: imgs, suffixImg: opt.suffixImg });                    
                    if (!turnOn) {
	                    setTimeout(function() {                    	
	                        navClickEvent();
	                        navTouchEvent();
	                    }, 0);
	                    turnOn = true;
	                }
                    return false;
                } else {
                	var drag = false,item = $(this);
                	$(document).on("touchmove",function(){
                		drag = true;
                	});
                	$(this).on("touchend",function(){
                		if(!drag){
                			imgID = fvnBoxAnimation.mainAnimate({ item: $(this), imgs: imgs, suffixImg: opt.suffixImg });
                		}else{
                			drag = false;
                		}             
                		if (!turnOn) {
		                    setTimeout(function() {                    	
		                        navClickEvent();
		                        navTouchEvent();
		                    }, 0);
		                    turnOn = true;
		                }   		
                		return false;
                	});
                }                                
            });     
            function navTouchEvent(){
            	$(".navBox"+ targetEl).on("touchstart",function(e){
            		prevPoint = e.originalEvent.touches[0].pageX;
            		distance = 0;
            		$($(".fullImg").find("img")).removeClass("returnAnimate").addClass("noneAnimate");
            		$($(".fullImg").find(".imgBox")).removeClass("returnAnimate").addClass("noneAnimate");
            	}).on("touchmove",function(e){
            		var dragVariables = fvnBoxAnimation.dragAnimate({event:e,prevPoint:prevPoint,distance:distance,outImg:false});
            		prevPoint = dragVariables.prevPoint;
            		distance = dragVariables.distance;
            	}).on("touchend",function(){
            		var dragVariables = fvnBoxAnimation.dragAnimate({prevPoint:prevPoint,distance:distance,outImg:true,imgs:imgs,suffix:opt.suffixImg});
            	})
            }
            function navClickEvent() {
                $(".navBox" + targetEl).on("click", ".prevBtn, .nextBtn, .close-lightBox", function() {
                    if ($(this)[0].className != "close-lightBox") {
                        var src = fvnBoxController.detectContinueImg(targetEl, imgID, $(this));
                        if (src !== undefined) {
                            imgID = fvnBoxAnimation.mainAnimate({ item: $(src), imgs: imgs, suffixImg: opt.suffixImg });
                        }
                    } else {
                        targetEl = fvnBoxController.settingClose(targetEl, $(this));                        
                    }
                });
            };            
        }
    };

    var fvnBoxAnimation = {
        mainAnimate: function(storage) {
            if (storage.type === undefined) {
                var animate = 50;
                var src, imgID;
                // check if have suffix                                
                if (storage.suffixImg !== undefined) {
                    if (storage.item.attr("data-src") === undefined) {
                        storage.item.attr("data-src", fvnBoxController.detectSuffixImage(storage.item, storage.suffixImg));
                    }
                    $("body").find(".fullImg").append("<img src=" + storage.item.attr("data-src") + ">").removeClass("hidden");
                    src = storage.item.attr("data-src");
                    animate = 0;
                } else {
                    $("body").find(".fullImg").append(storage.item[0].outerHTML);
                    src = storage.item.attr("src");
                }
                if ($($(".fullImg").find("img")).length == 3) {
                    $(".fullImg").find("img")[0].remove();
                }
                fvnBoxController.settingTimer(src, animate);
                storage.imgs.each(function(id) {
                    if (storage.item.attr("src") == $(this).attr("src")) {
                        imgID = id;
                    }
                });
                return imgID;
            }
        },
        dragAnimate: function(storage){
        	if(storage.type===undefined){
        		if(!storage.outImg){
        			var leftImgPos = $(".fullImg img").offset().left,leftImgBox = $(".fullImg .imgBox").offset().left;        		        		        		
	        		var curPoint = storage.event.originalEvent.touches[0].pageX;        		
	        		var left;
	        		if(curPoint > storage.prevPoint){
	        			leftImgPos = leftImgPos+1;
	        			leftImgBox = leftImgBox+1;
	        			storage.distance = storage.distance + 1;
	        		}else{
	        			leftImgPos = leftImgPos-1;
	        			leftImgBox = leftImgBox-1;        			
	        			storage.distance = storage.distance - 1;
	        		}
	        		$(".fullImg img").offset({left:leftImgPos});
	        		$(".fullImg .imgBox").offset({left:leftImgBox});
	        		$(".navBox").offset({left:leftImgBox});
        			return {prevPoint:storage.event.originalEvent.touches[0].pageX,distance:storage.distance};
        		}else{
        			var remove = false;
	            	$(".fullImg img").removeClass("noneAnimate");
	            	$(".fullImg .imgBox").removeClass("noneAnimate");
	            	if(storage.distance>=7){            		
	            		$(".fullImg img").addClass("outAnimate").css("left",$(window).outerWidth());
	            		$(".fullImg .imgBox").addClass("outAnimate").css("left",$(window).outerWidth());
	            		remove = true;
	            	}else if(storage.distance<=-7){
	            		$(".fullImg img").addClass("outAnimate").css("left",0);
	            		$(".fullImg .imgBox").addClass("outAnimate").css("left",0); 
	            		remove = true;
	            	}else{
	            		$(".fullImg img").addClass("returnAnimate").css("left","");
	            		$(".fullImg .imgBox").addClass("returnAnimate").css("left","");            		
	            	}
	            	if(remove){
	            		var img = $(".fullImg img"); imgBox = $(".fullImg .imgBox");
	            		$(".fullImg").append("<div class='imgBox'></div>");
	            		setTimeout(function(){
	            			var src = fvnBoxController.detectContinueImg(targetEl,imgID,storage.distance>=7?[{className:"nextBtn"}]:[{className:"prevBtn"}]);
	            			imgID = fvnBoxAnimation.mainAnimate({ item: $(src), imgs: storage.imgs, suffixImg: storage.suffix});
	            		},50)	            		
	            		setTimeout(function(){
	            			img.height(img.height()/2).width(img.width()/2);	            		
	            			imgBox.css({height:imgBox[0].clientHeight/2,width:imgBox[0].clientWidth/2});	
	            		},70);	            			            		
	            		setTimeout(function(){
	            			$(".fullImg .outAnimate").remove();            			
	            		},800);	            		
	            	}
	            	$(".navBox").css("left","");
        		}        		
        	}
        }
    };

    var fvnBoxController = {
        detectEvent: function(event) {
            event.ev === null ? event.ev = "touchstart" : event.ev = "click";
            if (event.tg != "img" && event.ev == "click") {
                $(event.obj).find(event.tg).click(function(e) {
                    e.preventDefault();
                    $(this).find("img").click();
                });
            }
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
        detectImageSize: function(curW, curH) {       	
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
                arguments.callee(curW, curH);
            } else {
                return { "trueWidth": curW, "trueHeight": curH };
            }
        },
        detectContinueImg: function(targetEl, imgID, nav) {
            if (targetEl != "") {
                if (nav[0].className == "prevBtn") {
                    if (imgID > 0) {
                        imgID--;
                    } else {
                        imgID = $(targetEl).find("img").length - 1;
                    }
                } else if (nav[0].className == "nextBtn") {
                    if (imgID < $(targetEl).find("img").length - 1) {
                        imgID++;
                    } else {
                        imgID = 0;
                    }
                }
                var getImgByID = $(targetEl).find("img")[imgID];
                return getImgByID;
            }
        },
        settingTimer: function(item, animate) {
            $(".fullImg").find("img[src*='" + item + "']").load(function() {
                // get width and height in fact of that image acording to % width and height of window                        
                trueW = fvnBoxController.detectImageSize($(this).prop("naturalWidth"), $(this).prop("naturalHeight")).trueWidth;
                trueH = fvnBoxController.detectImageSize($(this).prop("naturalWidth"), $(this).prop("naturalHeight")).trueHeight;

                // animte for fancybox

                $("body").find(".fullImg").removeClass("hidden");
                $("body").find(".navBox").removeClass("hidden");
                $("body").find(".fullImg img").attr({ "width": trueW, "height": trueH });
                setTimeout(function() {
                    var id = 0;
                    if ($($(".fullImg").find("img")).length == 2) {
                        $($(".fullImg").find("img")[0]).removeClass("appearOpa").addClass("disappearOpa");
                        id = 1;
                    }
                    $($(".fullImg").find("img")[id]).addClass("appearOpa");
                }, 200);
                setTimeout(function() {
                    $("body").find(".imgBox").css({ "width": trueW + 20, "height": trueH + 20 });
                    $("body").find(".navBox").css({ "width": trueW + 20, "height": trueH + 20 });
                }, animate);
            });
        },
        settingClose: function(targetEl, nav) {
            if (targetEl != "" && targetEl !== undefined) {
                $(".navBox").removeClass(targetEl.split(".")[1]);
                $(".fullImg").addClass("hidden").find("img").remove();
                $(".fullImg").find(".imgBox").css({ "width": "", "height": "" });
                nav.parent().addClass("hidden");
                targetEl = "";
                return targetEl;
            }
        }
    };

    var fvnBoxFeature = {
        init: function(fn_Opt) {
            if (fn_Opt.opt == "setSuffix") {
                this.setListSuffix(fn_Opt.suffix);
            } else if (fn_Opt.opt == "setSizePercent") {
                this.setSizePercent();
            }
        },
        setListSuffix: function(suffix) {
            if (fvnImgObj[suffix] === undefined) {
                fvnImgObj[suffix] = {};
                var imgSrc = $("body img").attr("src");
                var imgName = imgSrc.split("/")[$(this).length];
                imgSrc = imgSrc.split(imgName)[0];
                $.get(imgSrc, function(data) {
                	console.log(data);
                    $(data).find("a[href*=" + suffix + "]").each(function(id, data) {
                        var rootImgSrc = $(data).attr("href").split("-" + suffix)[0];
                        fvnImgObj[suffix][id] = rootImgSrc;
                    });
                });
            }
            console.log(fvnImgObj);
        },
        setSizePercent: function() {
        	var winW = $(window).outerWidth(false),winH = $(window).outerHeight(true);
            wWidth = winW < winH ? winW * 80 / 100 : winW <= 640 ? winW * 60 / 100 : winW * 85 / 100 ;
            wHeight = winW < winH ? winH * 80 / 100 : winW <= 640 ? winH * 60 / 100 : winH * 85 / 100 ;
        },
        setResizeImg: function() {  
        	this.setSizePercent();
            if (!$(".fullImg").hasClass("hidden")) {
                var trueW = fvnBoxController.detectImageSize($("body").find(".fullImg .appearOpa").prop("naturalWidth"), $("body").find(".fullImg .appearOpa").prop("naturalHeight")).trueWidth;
            	var trueH = fvnBoxController.detectImageSize($("body").find(".fullImg .appearOpa").prop("naturalWidth"), $("body").find(".fullImg .appearOpa").prop("naturalHeight")).trueHeight;
                $("body").find(".fullImg img").attr({ "width": trueW, "height": trueH }).addClass("fastAnimate");
                $("body").find(".imgBox").css({ "width": trueW + 20, "height": trueH + 20 }).addClass("fastAnimate");
                $("body").find(".navBox").css({ "width": trueW + 20, "height": trueH + 20 }).addClass("fastAnimate");
            }      
        }
    }
})