//
(function( $, undefined ){	

	$.fn.feedget = function( params ) {

		// Private plugin functions
				
		//
		// Decode string
		//
		var decodeEntities = (function() {
			// this prevents any overhead from creating the object each time
			var element = document.createElement('div');

			function decodeHTMLEntities (str) {
				if(str && typeof str === 'string') {
					// strip script/html tags
					str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
					str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
					element.innerHTML = str;
					
					// Small hack because IE8 doesn't support the 'textContent' property
					if (element.textContent === undefined) {
						str = element.innerText;
						element.innerText = '';
					}
					else {
						str = element.textContent;
						element.textContent = '';
					}
				}
				return str;
			}
			return decodeHTMLEntities;
		})();

		//
		// Fill an object with the feed entry date components
		//
		var getDate = function ( date, dateObj ) {
		
			var day = date.getUTCDate();
			var month = date.getMonth() + 1;
			var year = date.getFullYear();
			var hours = date.getHours();
			var minutes = date.getMinutes();
			var seconds = date.getSeconds();
			
			dateObj.year = (year.toString().length == 1 ? "0" : "") + year;		
			dateObj.month = (month.toString().length == 1 ? "0" : "") + month;
			dateObj.day = (day.toString().length == 1 ? "0" : "") + day;
			dateObj.hours = (hours.toString().length == 1 ? "0" : "") + hours;
			dateObj.minutes = (minutes.toString().length == 1 ? "0" : "") + minutes;
			dateObj.seconds = (seconds.toString().length == 1 ? "0" : "") + seconds;
		}
		
		//
		// Get image from feed content. If no image is found return an empty string
		//
		var getImage = function ( feedContent ) {
			try {
				var img = $('<div>' + feedContent + '</div>').find('img').first(); 
				if ($(img).length == 0) {
					return "";
				}
				else {
					return $(img).attr('src');
				}
			} 
			catch(e) { 
				return ""; 
			};
		}
		
		//
		// Process button click event
		//
		var buttonClick = function ( direction, containerElement, scrollLocked ) {
			
			// If scroll is locked (ie, animation is ongoing), ignore
			if (!scrollLocked) {
				
				var elementsContainer = containerElement.find('.feedget-elements-container');
				var bodyContainer = containerElement.find('.feedget-body-container');
			
				var condition = false;
				var nextId = 0;
				
				// Determine next element id based on the direction parameter
				switch (direction) {
					case 'up': 
					case 'left':
						nextId = parseInt($(elementsContainer).attr('data-current-element-id')) - 1;
						break;
					
					case 'down':
					case 'right': 
						nextId = parseInt($(elementsContainer).attr('data-current-element-id')) + 1;
						break;
				}
				
				var nextEl = containerElement.find('.feedget-element[data-element-id=' + nextId +']');				
				
				// Lock scroll to maintain consistency during animate
				scrollLocked = true;
				
				var scrollObj = {};
				
				if (direction == 'up' || direction == 'down') {
					scrollObj = { scrollTop: nextEl.position().top - parseInt(elementsContainer.css('padding-top')) }
				}
				else if (direction == 'left' || direction == 'right') {
					scrollObj  = { scrollLeft: nextEl.position().left - parseInt(elementsContainer.css('padding-left')) };
				}
				
				bodyContainer.animate(scrollObj, 300, function() {						
					detectScrollEdges(containerElement);
					
					// Release scroll lock
					scrollLocked = false;
				});
				
				elementsContainer.attr('data-current-element-id', nextId);				
			}
		}
	
		// 
		// Determine whether scroll has reached the edges of the body container and take apropriate measures (enable / disable jQuery UI buttons)
		// 
		var detectScrollEdges = function ( containerElement ) {
			
			if (containerElement !== undefined) {
			
				var containerId = containerElement.attr('id');
				var bc = containerElement.find('.feedget-body-container');
				var elContainer = bc.find('.feedget-elements-container');
			
				// Up
				var btnUp = $('#' + containerId + ' .up.arrow');
				if (!(bc.scrollTop() > 0)) {
					if (!btnUp.hasClass('ui-button-disabled.ui-state-disabled')) {
						btnUp.removeClass('ui-state-hover');
						btnUp.button({ disabled: true});
					}
				}
				else {						
					btnUp.button({ disabled: false});
				}
														
				// Down
				var btnDown = $('#' + containerId + ' .down.arrow');
				if (!(elContainer.outerHeight(true) - bc.scrollTop() > bc.outerHeight(true))) {						
					if (!btnDown.hasClass('ui-button-disabled.ui-state-disabled')) {
						btnDown.removeClass('ui-state-hover');
						btnDown.button({ disabled: true});
					}
				}
				else {
					btnDown.button({ disabled: false});
				}
				
				
				// Left
				var btnLeft = $('#' + containerId + ' .left.arrow');
				if (!(bc.scrollLeft() > 0)) {
					if (!btnLeft.hasClass('ui-button-disabled.ui-state-disabled')) {
						btnLeft.removeClass('ui-state-hover');
						btnLeft.button({ disabled: true});
					}
				}
				else {						
					btnLeft.button({ disabled: false});
				}
														
				// Right
				var btnRight = $('#' + containerId + ' .right.arrow');
				if (!(elContainer.outerWidth(true) - bc.scrollLeft() > bc.outerWidth(true))) {						
					if (!btnRight.hasClass('ui-button-disabled.ui-state-disabled')) {
						btnRight.removeClass('ui-state-hover');
						btnRight.button({ disabled: true});
					}
				}
				else {
					btnRight.button({ disabled: false});
				}
			}
		}
		
		
		// Plugin default parameters
		var defaults = {  
			direction: 'vertical',
			entries: 10,
			images: true,
			fulltext: false,
			buttons: true,
			facebook: true,
			twitter: true,
			reverse: false,
			title: '',
			description: '',
			showHeader: true
		};    
		var params = $.extend( defaults, params );	
		
		var selector = this;
		
		var scrollLocked = false;
		var jquipresent = false;
		
		// Detect if jQuery UI is present
		if (typeof jQuery.ui != 'undefined' && /[1-9]\.[7-9].[1-9]/.test($.ui.version)) {
			jquipresent = true;
		}

		// Show loader image
		selector.each(function() {
			$(this).css('text-align', 'center');
			var loaderEl = $('<img>').addClass('feedget-loading')
									.attr('src', params.loadingImg)
									.appendTo($(this));	
		});
				
		// Construct feed URL - using some random data to get real time data from the Google API
		var now = Date.parse(new Date());
		var feed = params.feed;	
		
		if (params.feed.indexOf('?') == -1) {
			feed += '?x=' + now;
		}
		else {
			feed += '&x=' + now;
		}
		
		
		var feed = params.feed;		
		var fullUrl = 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&num=' + params.entries + '&q=' + encodeURIComponent(feed);
		
		$.getJSON(fullUrl, function(data) { 
			
			// For each element in the selector create the "feedget". 
			selector.each(function(i) {
				
				var container = $(this);
				var containerId = container.attr('id');
				
				// Check if container has id and if not generate a unique one
				if (container.attr('id') === undefined) {
					var newContainerId = 'feedget' + i;
					container.attr('id', newContainerId);
				}
				var containerId = container.attr('id');
				
				// Unbind click events
				$(document).off('click', '#' + containerId + ' .arrow');
									
				container.empty();
				container.addClass('feedget-container')
						 .addClass(params.direction)
						 .addClass('ui-widget')
						 .css('overflow', 'hidden')
						 .css('position', 'relative');

				
								
				// Hide loader
				container.find('.feedget-loading').hide();
				
				// If Google API call fails, show error message
				if (data.responseData == null) {
					errorEl = $('<span>').addClass('feedget-error').text(data.responseDetails).appendTo(container); 
					return false;
				}
				
				// Create header element
				if (params.showHeader) {
					var headerContainer = $('<div>').addClass('feedget-header-container').addClass('ui-widget-header');
					container.prepend(headerContainer);
					
					// Header title
					var headerTitleEl = $('<div>').addClass('feedget-header-title');
					
					if (params.title == '') {
						$(headerTitleEl).text(decodeEntities(data.responseData.feed.title));									
					} else {
						$(headerTitleEl).text(params.title);
					}
					$(headerTitleEl).appendTo(headerContainer);
					
					// Header description
					var headerDescEl = $('<div>').addClass('feedget-header-description');
												
					if (params.description == '') {
						$(headerDescEl).text(decodeEntities(data.responseData.feed.description));
					} else {
						$(headerDescEl).text(params.description);
					}
					$(headerDescEl).appendTo(headerContainer)				  
				}
				
				// Create body container element
				var bodyContainer = $("<div>").addClass('feedget-body-container').addClass('ui-widget-content');
				
				// Elements container element
				var elementsContainer = $("<div>").addClass('feedget-elements-container').css('position', 'relative').attr('data-current-element-id', '0');
				bodyContainer.append(elementsContainer);			
				
				// Scroll bars
				if (params.direction == 'horizontal') {
					bodyContainer.css('overflow-x', 'auto');
					bodyContainer.css('overflow-y', 'hidden');
				}
				else {
					bodyContainer.css('overflow-y', 'auto');
					bodyContainer.css('overflow-x', 'hidden');
				}
				
				$.each(data.responseData.feed.entries, function (i) {				
					
					//
					// Get feed data and build element for each feed entry.
					//    All elements are composed by a feed entry title (with link), date, text and eventually an image
					//    As an option, an elements may include a facebook like button that points to the feed entry link
					//
					var title = decodeEntities(data.responseData.feed.entries[i].title);
					var link = data.responseData.feed.entries[i].link;
					var date = new Date(data.responseData.feed.entries[i].publishedDate);
					var text = decodeEntities(data.responseData.feed.entries[i].contentSnippet);
					var fullText = decodeEntities(data.responseData.feed.entries[i].content);					
					var textToShow = (params.fulltext ? fullText : text);
					
					// Get the date 
					var dateObj =  { year: '', month: '', day: '', hours: '', minutes: '', seconds: '' };
					getDate(date, dateObj);				
					
					var elementContainer;
					
					if (params.reverse) {
						elementContainer = $('<div>').prependTo(elementsContainer).addClass("feedget-element").attr('data-element-id', i);
					}
					else {				
						elementContainer = $('<div>').appendTo(elementsContainer).addClass("feedget-element").attr('data-element-id', i);
					}			
					
					// Create element
					var elementHeader = $('<div>').addClass('feedget-element-header');
					elementHeader.appendTo(elementContainer);
					
					// Construct header for current feed entry: title, link and date
					var titleEl = $('<span>').addClass('feedget-element-title');						
					var linkEl = $('<a>').attr('href', link)
										 .attr('target', '_blank')
										 .text(title)
										 .appendTo(titleEl);
					var dateEl = $('<span>').addClass('feedget-element-date')
											.text(dateObj.year + '/' + dateObj.month + '/' + dateObj.day);
					
					elementHeader.append(titleEl)
								 .append(dateEl);
					
					// Show images if parameter set to true
					if (params.images)
					{
						// Try to get image from feed
						var image = getImage(data.responseData.feed.entries[i].content);
													
						if (image != "") {
							var imgEl = $('<img>').attr('src', image).removeAttr('height').removeAttr('width').addClass('feedget-element-image').appendTo(elementContainer);
						}
					}
					
					// Feed entry text
					var textEx = $('<span>').addClass('feedget-element-text')
											.text(textToShow)
											.appendTo(elementContainer);

					var readMoreSpan = $('<div>').addClass('feedget-element-readme');

					var readMoreLink = $('<a>').attr('href', link)
										 .attr('target', '_blank')
										 .addClass('feedget-element-readme-link')
										 .text('[read more]')
										.appendTo(readMoreSpan);

					readMoreSpan.appendTo(elementContainer);

					// Show social buttons if parameter set to true
					if (params.facebook || params.twitter) {
						var socialEl = $('<div>').addClass('feedget-element-social').appendTo(elementContainer);
					
						if (params.facebook) {
							var facebookEl = $('<div>').addClass('feedget-element-facebook')
													   .html('<iframe src="//www.facebook.com/plugins/like.php?href=' + link + 
															 '&amp;send=false&amp;layout=button_count&amp;width=100&amp;show_faces=false&amp;' +
															 'action=like&amp;colorscheme=light&amp;font&amp;height=21"' + 
															 ' scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:100px; height:21px;" allowtransparency="true"></iframe>')
													   .appendTo(socialEl);	
						}
						if (params.twitter) {
							var twitterEl = $('<div>').addClass('feedget-element-twitter')
													  .html('<a href="https://twitter.com/share" class="twitter-share-button" data-width="1" data-url="' + link + '">Tweet</a>' + 
														'<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>')
													  .appendTo(socialEl);
						}
					}
				});
				
				// All the entries are done, add the body container to the overall container
				container.append(bodyContainer);
				
				// Add buttons
				if (jquipresent && params.buttons && params.showHeader) {
					if (params.direction == 'vertical') {					
						var divUp = $('<div>')
							.addClass(containerId + ' up arrow')
							.attr('data-direction', 'up')
							.button({
								disabled: true,
								text: false,
								icons: { 
									primary: "ui-icon-carat-1-n"
								}
							});
						var divDown = $('<div>')
							.addClass(containerId + ' down arrow')
							.attr('data-direction', 'down')
							.button({
								text: false,
								icons: { 
									primary: "ui-icon-carat-1-s"
								}							
							});
						headerContainer.append(divUp).append(divDown);
					}
					else {
						var divLeft = $('<div>')
							.addClass(containerId + ' left arrow')
							.attr('data-direction', 'left')
							.button({
								disabled: true,
								text: false,
								icons: { 
									primary: "ui-icon-carat-1-w"
								}
							});
						var divRight = $('<div>')
							.addClass(containerId + ' right arrow')
							.attr('data-direction', 'right')
							.button({
								text: false,
								icons: { 
									primary: "ui-icon-carat-1-e"
								}							
							});
						headerContainer.append(divLeft).append(divRight);
					}
				}			
								
				// Define inner container width and height based on "direction" parameter
				if (params.direction == 'horizontal') {

					// Get total width for all the elements
					var totalWidth = data.responseData.feed.entries.length * container.find('.feedget-element').outerWidth(true);			
					elementsContainer.width(totalWidth);
					
					var elementOverflow = container.find('.feedget-element').outerHeight(true) - container.find('.feedget-element').height();
					
					if (params.showHeader) {
						var innerContainerHeight = container.innerHeight() - headerContainer.outerHeight(true);
					} else {
						var innerContainerHeight = container.innerHeight();
					}
					
					if (totalWidth < container.width()) {
						totalWidth = container.width();
					}				

					var overflowTop = parseInt(elementsContainer.css('padding-top'));
					var overflowBottom = parseInt(elementsContainer.css('padding-top'));				
					
					bodyContainer.height(parseInt(
						innerContainerHeight - 
						(2 * parseFloat(bodyContainer.css('borderTopWidth')))));
					
					if (elementsContainer.width() > container.width()) {
						elementsContainer.height(bodyContainer[0].clientHeight - overflowTop - overflowBottom);
						container.find('.feedget-element').height(bodyContainer[0].clientHeight - overflowTop - overflowBottom - elementOverflow);
					}
					else {
						// Too few elements too fill the width of the container, disable navigation buttons
						if (params.buttons) {						
							$('#' + containerId + ' .arrow').button({ disabled: true });
						}
						
						elementsContainer.height(innerContainerHeight - overflowTop - overflowBottom);
						container.find('.feedget-element').height(innerContainerHeight - overflowTop - overflowBottom - elementOverflow);
					}					
				}
				else {				
					var innerContainerWidth = container.width();
								
					if (!(elementsContainer.height() > container.height())) {
						
						// Too few elements too fill the width of the container, disable navigation buttons
						if (params.buttons) {
							$('#' + containerId + ' .arrow').css('opacity', '0.2');
							$(document).off('click', '#' + containerId + ' .arrow');
						}				
					}
					
					if (params.showHeader) {
						bodyContainer.height(parseInt(
							container.height() - headerContainer.outerHeight(true) - 
							(2 * parseFloat(bodyContainer.css('borderTopWidth')))));
					} else {
						bodyContainer.height(parseInt(
							container.height() - 
							(2 * parseFloat(bodyContainer.css('borderTopWidth')))));
					}
				}	
			
				// Load twitter buttons
				if (params.twitter) {
					$.getScript('http://platform.twitter.com/widgets.js', function() {
						twttr.widgets.load();
					});
				}
				
				
				// Buttons click event
				$(document).on('click', '#' + containerId + ' .arrow', function(e) {
					buttonClick($(this).data('direction'), container, scrollLocked);
				});
				
				// Scroll event. We have to update the current element id based on the elements that are visible on the body container
				$('#' + containerId + ' .feedget-body-container').scroll(function(e) {
				
					if (!scrollLocked) {
						
						var bc = $(this);
						var elContainer = bc.find('.feedget-elements-container');
						
						// Determine which elements are visible on the body container
						var els = $('#' + containerId + ' .feedget-element').filter(function (index) {					
							if (params.direction == 'vertical') {
								return $(this).offset().top >= bc.offset().top && 
									   $(this).offset().top <= bc.offset().top + bc.height();
							}
							else {
								return $(this).offset().left >= bc.offset().left && 
									   $(this).offset().left <= bc.offset().left + bc.width();
							}
						});				
						
						// Get the first element that is visible in the body container
						if (els.length) {
							var firstEl = $(els).first();
							var currId = firstEl.data('element-id');						
							$('#' + containerId + ' .feedget-elements-container').attr('data-current-element-id', currId);
						}
						
						// Detect if scroll edges were reached
						detectScrollEdges(container);
					}
				});
			
			});
			
		}, "jsonp");
		
		
		// 
		// Event Binding
		//
		$(document).on('mouseenter', '.feedget-element', function(e) {		
			$(this).siblings().each(function() {
				$(this).stop();
				$(this).animate({
					opacity: 0.2
				  }, 200, function() {
					// Animation complete.
				  });
			});
		});
		
		$(document).on('mouseleave', '.feedget-element', function(e) {
			$(this).siblings().each(function() {
				$(this).stop();
				$(this).animate({
					opacity: 1
				  }, 200, function() {
					// Animation complete.
				  });
			});
		});		
				
		return this;
	};
	
})( jQuery );
