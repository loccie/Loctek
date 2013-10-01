var Loctek =
{
	lightbox : loctek_lightbox,
	slider : function(container, params) { return new loctek_slider(container, params); },
	validate : function(container) { return new validate(container); },
	tooltip : loctek_tooltip
}

function loctek_tooltip(content)
{
	var _hover = false;
	this.hover = function(val)
	{
		if (typeof val == 'undefined')
			return _hover;
		else
		{
			_hover = val;
			$(_hover).on('mouseover', initializeMove);
		}
	}

	$('body').append('<div class="loctek-tooltip">' + $(content).html() + '</div>');
	
	function initializeMove()
	{
		$('.loctek-tooltip').show();
		$(_hover).on('mousemove', moveTooltip).on('mouseout', function() {
			$(_hover).off('mousemove');
			$('.loctek-tooltip').hide();
		});
	}
	
	function moveTooltip(event)
	{
		event.preventDefault();
		$('.loctek-tooltip').css({left : parseInt(event.pageX+20) + 'px', top : parseInt(event.pageY-15) + 'px'})
	}
}

function loctek_slider(container, params)
{
	var _current = 0;
	var current = function(val)
	{
		if (typeof val == 'undefined') 
			return _current;
		else
		{
			$(controlItems[_current]).removeClass('active');
			_current = val;
			$(controlItems[_current]).addClass('active');
		}
	}
	
	var _animationTime = 1500;
	var animationTime = function(val)
	{
		if (typeof val == 'undefined')
			return _animationTime;
		else
			_animationTime = val;
	}
	
	var children = $(container).children();
	$(container).css({width : $(container).width(), height : $(children[0]).height()});
	$(container).addClass('loctek-slider');
	children.hide();
	$(children[0]).show();
	
	var controls = $('<ol class="loctek-slider-controls" style="margin-left: -' + parseInt(children.length*7) + 'px"></ol>');
	var controlItems = [];
	$(container).append(controls);
	for (var i=0;i<children.length;i++)
	{
		var item = $('<li ><a href="#" title="View ' + i + '" /></li>');
		if (i == 0) item.addClass('active');
		controlItems.push(item);
		controls.append(item);
		$(children[i]).width($(container).innerWidth() - parseInt($(container).css('padding-left')) - parseInt($(container).css('padding-left')));
		//$(children[i]).css("left", i==0 ? parseInt($(children[i]).css('margin-left')) + parseInt($(container).css('padding-left')) + parseInt($(children[i]).css('padding-left')) : $(children[i-1]).outerWidth() + 'px')
	}
	
	var adjustSize = function(height, width)
	{
		if (height) $(container).height($(container).find(' :first-child').height());
		if (width) $(container).width($(container).find(' :first-child').width());
	}
	
	var goTo = function(position)
	{
		if (position == current()) return;
		var goLeft = position < current();
		var iLeft = 0;
		var iMax = goLeft ? (current()-position) : current() + (position-current());
		var i = current();
		
		$(children).css({left : ''});
		
		function aniRight(i)
		{
			var timePerAnimation = animationTime()/(iMax+1);
			$(children[i]).show();
			var animateOptions = (i < iMax) ?
				{opacity : 0, left : '-' + $(children[i]).width() + 'px'}
			:
				{left : parseInt($(children[i]).css('margin-left')) + parseInt($(container).css('padding-left')) + parseInt($(children[i]).css('padding-left')) + 'px'};
			
			if(i < iMax)
				$(children[i+1]).show().css({opacity : 1, left : $(container).width()}).animate({left : parseInt($(children[i+1]).css('margin-left')) + parseInt($(container).css('padding-left')) + parseInt($(children[i+1]).css('padding-left')) + 'px'}, timePerAnimation);
			
			$(children[i]).animate(animateOptions, timePerAnimation, function() {
				i++;
				if (i < iMax) aniRight(i);
				current(current()+1);
			});
		}
		
		function aniLeft(i)
		{
			var timePerAnimation = animationTime()/(iMax+1);
			$(children[i]).show();
			
			if (i-1 >= 0)
				$(children[i-1]).css({opacity : 1, left : '-' + $(children[i-1]).outerWidth() + 'px'}).animate({opacity : 1, left : parseInt($(children[i]).css('margin-left')) + parseInt($(container).css('padding-left')) + parseInt($(children[i]).css('padding-left')) + 'px'}, timePerAnimation);
			
			if (i-1 >= 0)
			$(children[i]).animate({opacity : 0, left : $(container).outerWidth() + 'px'}, timePerAnimation, function() {
				i--;
				iLeft++;
				if (iLeft < iMax) aniLeft(i);
				current(current()-1);
			});
		}
		
		if (goLeft) aniLeft(i); else aniRight(i);
	}
	var l = $(container).find('.loctek-slider-controls li');
	l.bind('click', function() { goTo(l.index(this)); });
	
	var _interval = false;
	this.start = function(time)
	{
		interval = setInterval(function () {
			goTo(current()+1 >= children.length ? 0 : current()+1);
		}, time);
	}
}

function loctek_lightbox(container, params)
{
	if (typeof params == 'undefined') params = {};
	if (typeof params.hideAfter == 'undefined') params.hideAfter = true;
	if (typeof params.hideControllers == 'undefined') params.hideControllers = false;
	if (typeof params.width == 'undefined') params.width = false;
	if (typeof params.height == 'undefined') params.height = false;
	
	$(container).hide();
	var children = $(container).children();
	$(container).addClass('loctek-lightbox')
	if(!params.hideControllers) $(container).append('<div class="loctek-lightbox-left" /><div class="loctek-lightbox-right" />');
	$('body').append('<div class="loctek-lightbox-cover"></div>');
	
	var current = 0;
	var childrenCount = children.length;
	
	$('.loctek-lightbox-cover').css('opacity', '0').animate({opacity : '0.8'}, 300, function() {
		$(container).show();
		
		var w = params.width ? params.width : $(container).find(' :first-child').width();
		var h = params.height ? params.height : $(container).find(' :first-child').height();
		$(container).css({width : w, height : h});
		$(container).css({marginLeft : '-' + parseInt($(container).width()/2) + 'px', marginTop : '-' + parseInt($(container).height()/2) + 'px'});
		children.hide();
		$(container).find(' :first-child').show();		
	});
	
	var next = function()
	{
		if (childrenCount-1 <= current) return false;
		current++;
		children.hide();
		$(container).find(' :eq(' + current + ')').show();
	}
	if(!params.hideControllers) $('.loctek-lightbox-right').on('click', next);
	
	var prev = function()
	{
		if (current <= 0) return false;
		current--;
		children.hide();
		$(container).find(' :eq(' + current + ')').show();
	}
	if(!params.hideControllers) $('.loctek-lightbox-left').on('click', prev);
	
	var close = function()
	{
		$(container).removeClass('loctek-lightbox').attr('style', '');
		if (params.hideAfter) $(container).hide();
		$('.loctek-lightbox-left, .loctek-lightbox-right').remove();
		$('.loctek-lightbox-cover').remove();
	}
	$('.loctek-lightbox-cover').on('click', close);
}

function validate(el)
{
	var data = $(el).find('input, select, textarea');
	
	for (var i=0; i<data.length;i++)
	{
		var validations = data[0].getAttribute('data-validate');
		
	}
}
