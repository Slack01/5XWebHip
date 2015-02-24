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
				
		
		// Plugin default parameters
		var defaults = {  
			entries: 10,
			images: true,
			fulltext: true,
			facebook: true,
			twitter: true,
			reverse: false
		};    
		var params = $.extend( defaults, params );	
		
		var selector = this;		
				
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
				
				container.empty();
				
				// Create body container element
				var bodyContainer = $("<nav>"); //.attr('data-role', 'content');
				
				// Elements container element
				var elementsContainer = $("<ul>").attr('data-role', 'listview');
				bodyContainer.append(elementsContainer);			
				
				// Create header element					
				elementsContainer.append('<li data-role="list-divider" role="heading">' + decodeEntities(data.responseData.feed.title) + '</li>');
				
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
						elementContainer = $('<li>').prependTo(elementsContainer).attr('data-element-id', i);
					}
					else {				
						elementContainer = $('<li>').appendTo(elementsContainer).attr('data-element-id', i);
					}			
					
					var elementHeader = $('<div>');
					elementHeader.appendTo(elementContainer);
					
					var titleEl = $('<h3>');						
					var linkEl = $('<a>').attr('href', link)
									     .attr('target', '_blank')
									     .text(title)
									     .appendTo(titleEl);
					var dateEl = $('<p>').text(dateObj.year + '/' + dateObj.month + '/' + dateObj.day + ' - ' + 
											   dateObj.hours + ':' + dateObj.minutes + ':' + dateObj.seconds);
					
					elementHeader.append(titleEl)
								 .append(dateEl);
					
					// Show images if parameter set to true
					if (params.images)
					{
						// Try to get image from feed
						var image = getImage(data.responseData.feed.entries[i].content);
													
						if (image != "") {
							elementContainer.append('<img id="img' + i + '" src="' + image + '" class="photopopup" />' +
								'<div class="photopopupContainer" id="img' + i + '" data-role="popup" data-overlay-theme="a" data-theme="a" class="ui-content">' +
								  '<a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right">Close</a>' + 
								  '<p><img id="' + image + '" src="' + image + '" style="max-width:100%;" /><br />' + textToShow + '</p></div>');
						}
					}
					
					// Feed entry text
					var textEx = $('<p>').text(textToShow).appendTo(elementContainer);
					
					if (params.facebook) {
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
				container.parents('[data-role=page]').page('destroy').page(); 
			});
			
		}, "jsonp");
		

		$(document).on('click', '.photopopup', function(e) {
			var aEl = $('<a>').attr('href', $(this).attr('id'));
			$('div#' + $(this).attr('id')).popup("open");
		});
		
		$( ".photopopup" ).on({
			popupbeforeposition: function() {
				var maxHeight = $( window ).height() - 60 + "px";
				$( ".photopopup img" ).css( "max-height", maxHeight );
			}
		});
		
		return this;
	};

})( jQuery );

