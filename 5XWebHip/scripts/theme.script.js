/*

 1. GLOBAL
    1.1 DO AFTER RESIZE
    1.2 DO AFTER WINDOW LOAD
    1.3 SCROLL CONTROL
 2. PRELOADER
 3. PAGINATION NAVI
    3.1 SET PAGINATION NAVI
 4. MAIN NAVIGATION
    4.1 MOBILE NAVIGATION
    4.2 SCROLL TO
 5. SCROLL FUNCTIONS
 6. SET BANNER
 7. LOAD AJAX CONTENT
 8. WORK
    8.1 MIXITUP
    8.2 WORK GRID SIZE
    8.3 LOAD WORK DETAILS
    8.4 LOAD MORE ITEMS
 9. SHOP
    9.1 MIXITUP
    9.2 LOAD PRODUCT DETAILS
    9.3 LOAD MORE ITEMS
 10. NEWS
    10.1 LOAD NEWS DETAILS
    10.2 LOAD MORE ITEMS
 11. GOOGLE MAP
 12. DROP DOWN (SHORTCODES)
 13. ACCORDION AND TOGGLE (SHORTCODE)
 14. TAB BOX (SHORTCODES)
 15. ALERT BOXES (SHORTCODES)
 16. QUANTITY COUNTER (SHOP)




*/

(function ($) {

    'use strict';

    /* --------------------------------------------------------------------- */
    /* 1. GLOBAL
    /* --------------------------------------------------------------------- */

    var windowHeight    = $(window).height(),
        windowWidth     = $(window).width(),
        resizeTimeout;

    $(window).resize(function(){
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function(){
            doafterresize();
        },300);
    });


    /* ==== 1.1 DO AFTER RESIZE ==== */

    function doafterresize()
    {
        windowHeight    = $(window).height();
        windowWidth     = $(window).width();
        scrollOffset    = windowHeight - 100;
        setBanner();
        sizeWorkGrid();
    }


    /* ==== 1.2 DO AFTER WINDOW LOAD ==== */

    $(window).load(function(){
        setNaviPager();
        setBanner();
        sizeWorkGrid();
        setnewsGrid();
        scrollFunction($(document));
        scrollControl();
        removePreloader();
    });


    /* ==== 1.3 SCROLL CONTROL ==== */

    function scrollControl()
    {
        var $root = $('html, body');
        var ancloc = window.location.hash;

        if(ancloc.length)
        {
            event.preventDefault();
            $root.animate({
                scrollTop: $(ancloc).offset().top
            }, 0);
            return false;
        }
    }



    /* --------------------------------------------------------------------- */
    /* 2. PRELOADER
    /* --------------------------------------------------------------------- */

    var preLoader           = $("#page-preloader"),
        perLoaderContent    = preLoader.find(".preloader-content");

    function removePreloader()
    {
        perLoaderContent.fadeOut();
        preLoader.clearQueue().animate({
            left: '50%',
            width: '0'
        }, 800, 'easeInOutQuart');
    }

    function startPreloader()
    {
        preLoader.clearQueue().animate({
            left: '0',
            width: '100%'
        }, 800, 'easeInOutQuart',function(){
            perLoaderContent.fadeIn();
        });
    }




    /* --------------------------------------------------------------------- */
    /* 3. PAGINATION NAVI
    /* --------------------------------------------------------------------- */

    /* ==== 3.1 SET PAGINATION NAVI ==== */

    var paginationNavi  = true,
        switchLogo      = true,
        topoffset       = 0,
        mainNavigation  = $("#main-navigation"),
        checkHeader     = 0,
        scrollOffset    = windowHeight - 100,
        pageLogo        = $("#logo"),
        mobileBars      = $("#mobile-bars"),
        pageHeader      = $("#page-header"),
        mobileClose     = $("#mobile-close"),
        noPagination    = $(".no-pagination");

    function setNaviPager()
    {
        if(paginationNavi == true && noPagination.length == 0)
        {
            var ulHtml = '<ul id="pagination-navi"></ul>';
            $("body").append(ulHtml);
            var parentUl    = $("#pagination-navi");

            mainNavigation.find("li").each(function(){

                var linkChild   = $(this).children("a"),
                    linkName    = linkChild.html(),
                    linkHref    = linkChild.attr("href");

                var addLink = '<li><a href="' + linkHref + '"><span class="dot"></span><span class="name">' + linkName + '</span></a></li>';

                parentUl.append(addLink);
            });

            var getHalfHeight = parentUl.height() / 2;
            parentUl.css({
                marginTop: '-' + getHalfHeight + 'px'
            });

            parentUl.find("a").click(function(){
                $('html, body').clearQueue().animate({
                    scrollTop: $( $.attr(this, 'href') ).offset().top - topoffset
                }, 2200, 'easeInOutQuart');
                return false;
            });
        }
    }




    /* --------------------------------------------------------------------- */
    /* 4. MAIN NAVIGATION
    /* --------------------------------------------------------------------- */

    mainNavigation.find("a").click(function(){
        $('html, body').clearQueue().animate({
            scrollTop: $( $.attr(this, 'href') ).offset().top - topoffset
        }, 2200, 'easeInOutQuart');

        if(windowWidth < 900)
        {
            pageHeader.fadeOut(300);
        }

        return false;
    });


    var mainItems = mainNavigation.find("a[href^=#]"),
        scrollTo = mainItems.map(function(){

            var item = $( $( this ).attr( "href" ) );
            if (item.length) { return item; }

        });

    $( window ).scroll( function () {

        var offsetTop = $( this ).scrollTop() + 200;

        var current = scrollTo.map( function() {
            if( $( this ).offset().top < offsetTop )
                return this;
        } );

        if( current.length ) {
            current = current[ current.length -1 ];
            var id = current.attr( "id" );

        } else {
            var id = "";
        }

        mainNavigation.find("a")
            .removeClass( "active" )
            .filter( "[href=#"+id+"]" )
            .addClass( "active" );

        $("#pagination-navi").find("a")
            .removeClass( "active" )
            .filter( "[href=#"+id+"]" )
            .addClass( "active" );
    });



    /* ==== 4.1 MOBILE NAVIGATION ==== */

    mobileBars.click(function(){
        if(pageHeader.is(":hidden"))
        {
            pageHeader.fadeIn(300);
        }
    });

    mobileClose.click(function(){
        pageHeader.fadeOut(300);
    });



    /* ==== 4.2 SCROLL TO ==== */

    $(".scrollto").click(function(){
        $('html, body').clearQueue().animate({
            scrollTop: $( $.attr(this, 'href') ).offset().top - topoffset
        }, 2200, 'easeInOutQuart');
        return false;
    });




    /* --------------------------------------------------------------------- */
    /* 5. SCROLL FUNCTIONS
    /* --------------------------------------------------------------------- */

    function scrollFunction(documentVar)
    {
        if(documentVar.scrollTop() > scrollOffset)
        {
            if(checkHeader == 0)
            {
                checkHeader = 1;

                if(paginationNavi == true)
                {
                    if($("#pagination-navi").length)
                    {
                        $("#pagination-navi").fadeIn(400);
                    }
                }

                if(switchLogo == true)
                {
                    pageLogo.children(".light").hide();
                    pageLogo.children(".dark").show();
                }

                mainNavigation.removeClass("banner");
                mobileBars.removeClass("banner");
            }
        } else {
            if(checkHeader == 1)
            {
                checkHeader = 0;

                if(paginationNavi == true)
                {
                    if($("#pagination-navi").length)
                    {
                        $("#pagination-navi").fadeOut(400);
                    }
                }

                if(switchLogo == true)
                {
                    pageLogo.children(".dark").hide();
                    pageLogo.children(".light").show();
                }

                mainNavigation.addClass("banner");
                mobileBars.addClass("banner");
            }
        }
    }

    $(document).scroll(function(){
        scrollFunction($(this));
    });




    /* --------------------------------------------------------------------- */
    /* 6. SET BANNER
    /* --------------------------------------------------------------------- */

    var bannerSection   = $(".banner"),
        bannerCarousel  = $(".banner-carousel");

    function setBanner()
    {
        if(bannerSection.length)
        {
            bannerSection.css({
                minHeight: windowHeight + 'px'
            });
        }

        if(bannerCarousel.length)
        {
            bannerCarousel.find(".item").css({
                minHeight: windowHeight + 'px'
            });
        }
    }




    /* --------------------------------------------------------------------- */
    /* 7. LOAD AJAX CONTENT
    /* --------------------------------------------------------------------- */

    var ajaxContainer       = $("#ajax-content"),
        ajaxLoadContainer   = $("#ajax-load-container"),
        pageWrapper         = $("#page-wrapper"),
        closeButton         = $("#ajax-closer"),
        ajaxTopOffset       = 0;

    function loadAjaxContent(folder, url)
    {
        /* ==== START PRELOADER ==== */
        startPreloader();

        ajaxTopOffset = $(document).scrollTop();

        setTimeout(function(){
            if($("#pagination-navi").length)
            {
                $("#pagination-navi").children("li").hide();
            }

            ajaxContainer.show();
            ajaxLoadContainer.load(folder+url, function(){

                /* ==== DO AFTER LOAD ==== */
                pageWrapper.hide();
                $("html, body").animate({ scrollTop: 0 }, 0);

                /* ==== START PARALLAX EFFECTS ==== */
                var parallaxSections = $('.parallax');
                if(parallaxSections.length) // CHECK IF ELEMENT EXIST
                {
                    parallaxSections.parallax({
                        speed :	0.5
                    });
                }

                /* ==== SET TAB BOXES ==== */
                setTabBoxes();

                /* ==== START QUANTITY COUNTER ==== */
                startQuantityCounter();

                /* ==== RESIZE VIDEO ==== */
                var video   = $("iframe");
                if(video.length)
                {
                    ajaxContainer.fitVids();
                }

                removePreloader();
            });
        }, 1000);
    }


    closeButton.click(function(){

        /* ==== START PRELOADER ==== */
        startPreloader();

        setTimeout(function(){
            if($("#pagination-navi").length)
            {
                $("#pagination-navi").children("li").show();
            }

            ajaxContainer.hide();
            ajaxLoadContainer.html('');

            pageWrapper.show();
            $("html, body").animate({ scrollTop: ajaxTopOffset + 'px' }, 0);

            removePreloader();
        }, 1000);
    });




    /* --------------------------------------------------------------------- */
    /* 8. WORK
    /* --------------------------------------------------------------------- */

    /* ==== 8.1 MIXITUP ==== */

    var pfPreview   = $( '#work-grid' );
    var pfTabs      = $( '#work-filter' );
    var pfMixed     = 0;

    function startmixitup()
    {
        if ( pfTabs.length ) {
            var active = pfTabs.find( 'li.active' ).data( 'filter' );

            if ( pfPreview.length > 0 ) {
                if( pfMixed == 0) {
                    pfMixed = 1;
                    pfPreview.mixItUp( {
                        selectors: {
                            target: '.work-mix',
                            filter: '.work-filter'
                        }
                    } );
                } else {
                    pfPreview.mixItUp( 'multiMix', { filter: active } );
                }
            }
        }
    }

    startmixitup();



    /* ==== 8.2 WORK GRID SIZE ==== */

    var workMinHeight   = 0;

    function sizeWorkGrid()
    {
        var i           = 0;

        if(windowWidth > 580)
        {
            pfPreview.children("li").each(function(){
                var imgHeight = $(this).find("img").height();

                if(i == 0)
                {
                    workMinHeight = imgHeight - 1;
                    i = i + 1;
                } else {
                    if(imgHeight < workMinHeight)
                    {
                        workMinHeight = imgHeight - 1;
                    }
                }

                if(workMinHeight > 0)
                {
                    pfPreview.children("li").css({
                        height: workMinHeight + 'px'
                    });
                }
            });
        } else {
            pfPreview.children("li").css({
                height: 'auto'
            });
        }
    }



    /* ==== 8.3 LOAD WORK DETAILS ==== */

    $(document).on('click', '#work-grid li a', function(){

        var folder      = 'work/',
            hash        = $(this).attr('data-work-link'),
            url         = hash.replace(/[#\#]/g, '');

        loadAjaxContent(folder, url);
    });



    /* ==== 8.4 LOAD MORE ITEMS ==== */

    function pad (str, max) {
        str = str.toString();
        return str.length < max ? pad("0" + str, max) : str;
    }

    var loadMoreWork = 1;

    $( "#load-more-work" ).click( function( e ) {
        e.preventDefault();

        var load = pad( loadMoreWork, 2 );

        var protocol = $(location).attr('protocol');
        if( protocol == 'file:') {
            alert('"The Buttons "Load More" not working if you open the index.html by double click and have a URL like file://../../index.html\n\nRun it on your localhost or online server and it will work.\n\nReason:\nBrowsers implement strong security measures to prevent downloaded web pages from accessing arbitrary files on the file system.');
        }

        $.get('work/load-more-' + load + '.html', function(data){
            $(data).appendTo("#work-grid");

            startmixitup();

            if(workMinHeight > 0)
            {
                pfPreview.children("li").css({
                    height: workMinHeight + 'px'
                });
            }
        });

        loadMoreWork = loadMoreWork + 1;
        load = pad( loadMoreWork, 2 );

        $.get( 'work/load-more-' + load + '.html' ).fail(function() {
            $( "#load-more-work" ).hide();
        });
    } );




    /* --------------------------------------------------------------------- */
    /* 9. SHOP
    /* --------------------------------------------------------------------- */

    /* ==== 9.1 MIXITUP ==== */

    var psPreview   = $( '#shop-grid' );
    var psTabs      = $( '#shop-filter' );
    var psMixed     = 0;

    function startshopmixitup()
    {
        if ( psTabs.length ) {
            var active = psTabs.find( 'li.active' ).data( 'filter' );

            if ( psPreview.length > 0 ) {
                if( psMixed == 0) {
                    psMixed = 1;
                    psPreview.mixItUp( {
                        selectors: {
                            target: '.shop-mix',
                            filter: '.shop-filter',
                            sort: '.shop-sort'
                        }
                    } );
                } else {
                    psPreview.mixItUp( 'multiMix', { filter: active } );
                }
            }
        }
    }

    startshopmixitup();



    /* ==== 9.2 LOAD PRODUCT DETAILS ==== */

    $(document).on('click', '#shop-grid li a', function(){

        var folder      = 'shop/',
            hash        = $(this).attr('data-shop-link'),
            url         = hash.replace(/[#\#]/g, '');

        loadAjaxContent(folder, url);
    });



    /* ==== 9.3 LOAD MORE ITEMS ==== */

    var loadMoreShop = 1;

    $( "#load-more-shop" ).click( function( e ) {
        e.preventDefault();

        var load = pad( loadMoreShop, 2 );

        var protocol = $(location).attr('protocol');
        if( protocol == 'file:') {
            alert('"The Buttons "Load More" not working if you open the index.html by double click and have a URL like file://../../index.html\n\nRun it on your localhost or online server and it will work.\n\nReason:\nBrowsers implement strong security measures to prevent downloaded web pages from accessing arbitrary files on the file system.');
        }

        $.get('shop/load-more-' + load + '.html', function(data){
            $(data).appendTo("#shop-grid");

            startshopmixitup();
        });

        loadMoreShop = loadMoreShop + 1;
        load = pad( loadMoreShop, 2 );

        $.get( 'shop/load-more-' + load + '.html' ).fail(function() {
            $( "#load-more-shop" ).hide();
        });
    } );




    /* --------------------------------------------------------------------- */
    /* 10. NEWS
    /* --------------------------------------------------------------------- */

    var newsGrid    = $("#news-grid");

    function setnewsGrid()
    {
        if(newsGrid.length) // CHECK IF ELEMENT EXIST
        {
            newsGrid.gridalicious({
                selector: 'li',
                width: 340,
                gutter: 40
            });
        }
    }



    /* ==== 10.1 LOAD NEWS DETAILS ==== */

    $(document).on('click', '#news-grid li a', function(){

        var folder      = 'news/',
            hash        = $(this).attr('data-news-link'),
            url         = hash.replace(/[#\#]/g, '');

        loadAjaxContent(folder, url);
    });



    /* ==== 10.2 LOAD MORE ITEMS ==== */

    var loadMoreNews = 1;

    $( "#load-more-news" ).click( function( e ) {
        e.preventDefault();

        var load = pad( loadMoreNews, 2 );

        var protocol = $(location).attr('protocol');
        if( protocol == 'file:') {
            alert('"The Buttons "Load More" not working if you open the index.html by double click and have a URL like file://../../index.html\n\nRun it on your localhost or online server and it will work.\n\nReason:\nBrowsers implement strong security measures to prevent downloaded web pages from accessing arbitrary files on the file system.');
        }

        $.get('news/load-more-' + load + '.html', function(data){
            $(data).appendTo("#news-grid");

            var newsGrid = $("#news-grid");

            newsGrid.gridalicious('append', newsGrid.children("li"));
        });

        loadMoreNews = loadMoreNews + 1;
        load = pad( loadMoreNews, 2 );

        $.get( 'news/load-more-' + load + '.html' ).fail(function() {
            $( "#load-more-news" ).hide();
        });
    } );




    /* --------------------------------------------------------------------- */
    /* 11. GOOGLE MAP
    /* --------------------------------------------------------------------- */

    var googleMap       = $("#googlemap"),
        mapButton       = $("#map-button"),
        largerText      = mapButton.find(".larger"),
        smallerText     = mapButton.find(".smaller");

    mapButton.click(function(){

        var newSize = 550,
            currCenter = map.getCenter();

        if(googleMap.height() < 251)
        {
            if(windowHeight < newSize)
            {
                newSize = windowHeight;
            }

            largerText.hide();
            smallerText.show();

            googleMap.animate({
                height: newSize + 'px'
            }, 600, 'easeInOutQuart', function(){

                google.maps.event.trigger(map, 'resize');
                map.setCenter(currCenter);

            });

        } else {

            smallerText.hide();
            largerText.show();

            googleMap.clearQueue().animate({
                height: '250px'
            }, 600, 'easeInOutQuart', function(){

                google.maps.event.trigger(map, 'resize');
                map.setCenter(currCenter);

            });

        }
    });




    /* --------------------------------------------------------------------- */
    /* 12. DROP DOWN (SHORTCODES)
    /* --------------------------------------------------------------------- */

    var dropDown =  $(".dropdown");

    dropDown.mouseenter(function(){
        $(this).children("ul").stop(true,true).fadeIn(300);
    }).mouseleave(function(){
        $(this).children("ul").stop(true,true).fadeOut(300);
    });



    /* --------------------------------------------------------------------- */
    /* 13. ACCORDION AND TOGGLE (SHORTCODE)
    /* --------------------------------------------------------------------- */

    function setToggles()
    {
        $(".accordion .title").click(function(){
            var eachtitle   = $(this).parent(".accordion").children(".title"),
                title       = $(this);

            eachtitle.children(".fa-minus").css("display","none");
            eachtitle.children(".fa-plus").css("display","block");
            eachtitle.removeClass("active");

            $(this).parent(".accordion").children(".content").slideUp(250);

            if($(this).next(".content").is(":hidden"))
            {
                $(this).children(".fa-plus").css("display","none");
                $(this).children(".fa-minus").css("display","block");

                title.addClass("active");
                $(this).next(".content").slideDown(250);
            }
        });

        $(".toggle .title").click(function(){
            var content = $(this).next(".content"),
                title   = $(this);
            if(content.is(":hidden"))
            {
                title.addClass("active");
                content.slideDown(250);
            } else {
                content.slideUp(250);
                title.removeClass("active");
            }
        });
    }

    setToggles();




    /* --------------------------------------------------------------------- */
    /* 14. TAB BOX (SHORTCODES)
    /* --------------------------------------------------------------------- */

    function setTabBoxes()
    {
        $(".tab-navi").each(function(){
            var firstchild = $(this).children("li:first-child").children("a");
            firstchild.addClass("active");

            var openContent = firstchild.attr("data-content");
            $('#'+openContent).css("display","block");
        });

        $(".tab-navi li a").click(function(){

            var parent = $(this).parent("li").parent(".tab-navi");
            parent.children("li").children("a").each(function(){
                var displayNone = $(this).attr("data-content");
                $("#"+displayNone).css("display","none");
            });

            parent.find(".active").removeClass("active");
            $(this).addClass("active");
            var openContent = $(this).attr("data-content");
            $('#'+openContent).css("display","block");

        });
    }

    setTabBoxes();




    /* --------------------------------------------------------------------- */
    /* 15. ALERT BOXES (SHORTCODES)
    /* --------------------------------------------------------------------- */

    $(".alert-box .close").click(function(){
        $(this).parent(".alert-box").fadeOut(350);
    });




    /* --------------------------------------------------------------------- */
    /* 16. QUANTITY COUNTER (SHORTCODES)
    /* --------------------------------------------------------------------- */

    function startQuantityCounter()
    {
        var quantityCounter = $(".quantity-counter");

        quantityCounter.find("a.more").click(function(){
            var input           = $(this).parent("div").find("#counter"),
                counterValue    = parseInt(input.val()),
                newValue;

            if(counterValue < 9999)
            {
                newValue = parseInt(counterValue + 1);
                input.val(newValue);
            }
        });

        quantityCounter.find("a.less").click(function(){
            var input           = $(this).parent("div").find("#counter"),
                counterValue    = parseInt(input.val()),
                newValue;

            if(counterValue > 1)
            {
                newValue = parseInt(counterValue - 1);
                input.val(newValue);
            }
        });
    }

    startQuantityCounter();




})(jQuery);