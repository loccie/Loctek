
var Loctek =
{
    lightbox : loctek_lightbox,
    slider : function(container, params) { return new loctek_slider(container, params); },
    validate : function(container) { return new validate(container); },
    tooltip : loctek_tooltip,
    ticker : loctek_ticker,
    form : loctek_form,
    gallery : loctek_gallery,
    element : function(container) { return new loctek_element(container); },
    multislider : function(container, params) { return new loctek_multislider(container, params); },
    fader : function(container, params) { return new loctek_fader(container); },
    transparentslider : function(container, params) { return new loctek_transparentSlider(container); }
}

Loctek.core =
{
    parseProperty : loctek_core_parseProperty,
    loadImages : loctek_core_loadimages
}

Loctek.event =
{
    borderdown : loctek_event_borderdown,
    borderover : loctek_event_borderover
}
Loctek.feedback =
{
    form :
    {
        required : false
    }
}

function loctek_transparentSlider(container)
{
    var context = this;
    var children;
    var pos = 1;

    var _height = false;
    this.height = function(val)
    {
        console.log(val)
        if (typeof val == 'undefined')
            return _height;
        else
            _height = val;
    }

    var _width = false;
    this.width = function(val)
    {
        if (typeof val == 'undefined')
            return _width;
        else
            _width = val;
    }

    this.start = function(time) {
        //init
        children = $(container).children();
        $(container).addClass('loctek-transparent-slider').height(context.height()).append('<div class="loctek-transparent-slider-container"></div>');
        var sub = $(container).find('.loctek-transparent-slider-container');
        sub.height(context.height()).append(children);
        children.css('height', context.height() + 'px');
        children.addClass('loctek-transparent-slider-item');
        sub.css('margin-left', -(context.width()+context.width()/2));


        if (children.length > 1)
         setInterval(function() {
            //sub.css('left', '-=' + (context.width()/2));
            children.eq(pos-1).animate({ 'width' : 0 }, function() {
                sub.append($(this).css('width', 'auto'));
                pos = children.length-1==pos ? 0 : pos+1;
            });
        }, time);
    }
}

function loctek_fader(container)
{
    var context = this;

    var _random = false;
    this.random = function(val)
    {
        if (typeof val == 'undefined')
            return _random;
        else
            _random = val;
    }

    this.start = function(time) {
        $(container).css('position', 'relative');
        $(container).children().css('position', 'absolute');
        if ($(container).children().length < 2) return;
        $(container).children().hide().first().show();

        setInterval(function() {
            var otherchildren = $(container).children(':hidden');
            $(container).children(':visible').fadeOut('slow');
            otherchildren.eq(Math.floor(Math.random()*otherchildren.length)).fadeIn('slow');
        }, time);
    }
}

function loctek_multislider(container, params)
{
    if (typeof params == 'undefined') params = {};
    if (typeof params.width == 'undefined') params.width = false;
    if (typeof params.height == 'undefined') params.height = false;
    if (typeof params.animationTime == 'undefined') params.animationTime = 1000;
    if (typeof params.direction == 'undefined') params.direction = 'horizontal';
    if (typeof params.stopBefore == 'undefined') params.stopBefore = 1;
    if (typeof params.startBefore == 'undefined') params.startBefore = 0;
    if (typeof params.start == 'undefined') params.start = false;

    var current = 0;
    var blockAnimation = false;
    var widths = [];
    var heights = [];
    var realThis = this;

    if (params.width) $(container).width(params.width);
    if (params.height) $(container).height(params.height);

    var subcontainer = $('<div />');
    if (params.height) $(subcontainer).height(params.height);
    $(container).addClass('loctek-multislider').append(subcontainer.append($(container).children()));
    $(subcontainer).children().each(function() {
        if (params.direction == 'horizontal') $(subcontainer).width($(subcontainer).width() + $(this).outerWidth(true))
        widths.push($(this).outerWidth(true));
        heights.push($(this).outerHeight(true));
    });
     $(subcontainer).width(widths.length*960);

    function getSize(pos, arr)
    {
        var r = 0;
        for (var i=0;i<pos;i++) r += arr[pos];
        return r;
    }

    if (params.startBefore > 0)
    {
        console.log(getSize(params.startBefore, widths))
        $(subcontainer).css({'left' : '-=' + getSize(params.startBefore, widths)})
    }

    this.goTo = function(pos) {
        blockAnimation = true;
        var animateThis = params.direction == 'horizontal' ? {'left' : '-' + getSize(pos, widths)} : {'top' : '-' + getSize(pos, heights)};
        $(subcontainer).animate(animateThis, params.animationTime, function() {
            blockAnimation = false;
        });
    }

    this.start = function(time) {
        setInterval(function() {
            if (blockAnimation) return;
            current = current >= $(subcontainer).children().length-1-params.stopBefore+1 ? params.startBefore : current+1;
            realThis.goTo(current);
        }, time);
    }

    this.nextButton = function(el) {
        if (params.stopBefore != 1 && $(subcontainer).children().length <= params.stopBefore)
            $(el).css('visibility', 'hidden');
        else
            $(el).on('click', function () {
                if (blockAnimation) return;
                current = current >= $(subcontainer).children().length-1-params.stopBefore+1 ? 0 : current+1;
                realThis.goTo(current);
            });
    }

    this.prevButton = function(el) {
        if (params.stopBefore != 1 && $(subcontainer).children().length <= params.stopBefore)
            $(el).css('visibility', 'hidden');
        else
            $(el).on('click', function () {
                if (blockAnimation) return;
                current = current <= 0 ? $(subcontainer).children().length-1-params.stopBefore+1 : current-1;
                realThis.goTo(current);
            });
    }
}

Loctek.fixIE = function()
{
    //placeholder
    var i = document.createElement('input');
    if (!('placeholder' in i))
    {
        $('input, textarea').each(function() {
            if (!this.attributes.placeholder) return true;
            var val = this.attributes.placeholder.value;
            $(this).val(val);
            $(this).on('blur', function() {
                $(this).val(val);
            });
            $(this).on('focus', function() {
                $(this).val('');
            });
        });
    }

    //background-size
    var element = document.getElementById('backgroundSize');
    //style = window.getComputedStyle(element);
    //console.log(style.getPropertyValue('background-size'));
    //for (var style in element.currentStyle) console.log(style)
    //console.log(document.styleSheets);
}

function loctek_core_parseProperty(prop)
{
    if (typeof prop == 'undefined' || prop == 'auto')
        return 0;
    else
        return parseInt(prop);
}

function loctek_event_borderover(content, func)
{
    $(content).on('mouseover', function(event) {
        $(content).on('mousemove', mmbo);
    }).on('mouseout', function() {
        $(content).off('mousemove', mmbo);
    });

    function mmbo(event)
    {
        event.preventDefault();
        var y = event.pageY - $(content).offset().top;
        var x = event.pageX - $(content).offset().left;
        var borderTop = Loctek.core.parseProperty($(content).css('border-top-width'));
        var borderLeft = Loctek.core.parseProperty($(content).css('border-left-width'));
        var borderRight = Loctek.core.parseProperty($(content).css('border-right-width'));
        var borderBottom = Loctek.core.parseProperty($(content).css('border-bottom-width'));
        var width = $(content).outerWidth();
        var height = $(content).outerHeight();
        var returnVar =
        {
            hover : {
                top : y < borderTop,
                right : x > width-borderRight,
                bottom : y > height-borderBottom,
                left : x < borderLeft
            },
            x : x,
            y : y,
            target : content,
            pageX : event.pageX,
            pageY : event.pageY
        };

        if (returnVar.hover.top || returnVar.hover.right ||returnVar.hover.bottom || returnVar.hover.left)
            func(returnVar);
    }
}

function loctek_event_borderdown(content, func)
{
    $(content).on('mousedown', function(event) {
        event.preventDefault();
        var y = event.pageY - $(content).offset().top;
        var x = event.pageX - $(content).offset().left;
        var borderTop = Loctek.core.parseProperty($(content).css('border-top-width'));
        var borderLeft = Loctek.core.parseProperty($(content).css('border-left-width'));
        var borderRight = Loctek.core.parseProperty($(content).css('border-right-width'));
        var borderBottom = Loctek.core.parseProperty($(content).css('border-bottom-width'));
        var width = $(content).outerWidth();
        var height = $(content).outerHeight();
        var returnVar =
        {
            hover : {
                top : y < borderTop,
                right : x > width-borderRight,
                bottom : y > height-borderBottom,
                left : x < borderLeft
            },
            x : x,
            y : y,
            target : content,
            pageX : event.pageX,
            pageY : event.pageY
        };

        if (returnVar.hover.top || returnVar.hover.right ||returnVar.hover.bottom || returnVar.hover.left)
            func(returnVar);
    })
}

function loctek_element(content)
{
    realThis = this;
    _resizing = false;
    this.ar = $(content).width()/$(content).height();
    this.ar2 = $(content).height()/$(content).width();

    this.draggable = function(params) {
        if (typeof params != 'object') params = {};
        if (typeof params.down == 'undefined') params.down = false;
        if (typeof params.up == 'undefined') params.up = false;
        /*var originalPos = $(content).css('position');
        var originalLeft = $(content).css('left');
        var originalTop = $(content).css('top');*/

        var startTop, startLeft = 0;
        $(content).on('mousedown', md).css(
            {'-webkit-touch-callout' : 'none',
            '-webkit-user-select' : 'none',
            '-khtml-user-select' : 'none',
            '-moz-user-select' : 'none',
            '-ms-user-select' : 'none',
            'user-select' : 'none',
            '-webkit-user-drag' : 'none',
            'user-drag' : 'none'}
        ).prop('unselectable', 'on').prop('draggable', 'false').on('dragstart', function() { return false; }).find('*').prop('draggable', 'false').prop('unselectable', 'on');

        function mu(event) {
            event.stopPropagation();
            if (params.up) params.up();
            $(document).off('mousemove', mm);
        }

        function md(event)
        {
            event.stopPropagation();
            $(content).css({position : 'absolute', cursor : 'pointer'});
            startTop = event.pageY - $(content).position().top;
            startLeft = event.pageX - $(content).position().left;
            $(document).on('mousemove', mm).on('mouseup', mu);
        }

        function mm(event)
        {
            if (realThis._resizing) return;
            if (params.down) params.down();
            event.preventDefault();
            event.stopPropagation();
            $(content).css({
                left : event.pageX-startLeft,
                top : event.pageY-startTop
            });
        }
    }

    this.resizable = function(params)
    {
        if (typeof params != 'object') params = {};
        if (typeof params.down == 'undefined') params.down = false;
        if (typeof params.up == 'undefined') params.up = false;
        if (typeof params.preserveAspectRatio == 'undefined') params.preserveAspectRatio = false;
        var prevY = false;
        $(content).css({width : $(content).width(), height : $(content).height()});

        Loctek.event.borderover(content, function(event) {
            if (event.hover.top && event.hover.left)
            {
                $(event.target).css('cursor', 'nw-resize');
            }
            else if (event.hover.top && event.hover.right)
            {
                $(event.target).css('cursor', 'ne-resize');
            }
            else if (event.hover.bottom && event.hover.right)
            {
                $(event.target).css('cursor', 'se-resize');
            }
            else if (event.hover.bottom && event.hover.left)
            {
                $(event.target).css('cursor', 'sw-resize');
            }
            else if (event.hover.top && !params.preserveAspectRatio)
            {
                $(event.target).css('cursor', 'n-resize');
            }
            else if (event.hover.right && !params.preserveAspectRatio)
            {
                $(event.target).css('cursor', 'e-resize');
            }
            else if (event.hover.bottom && !params.preserveAspectRatio)
            {
                $(event.target).css('cursor', 's-resize');
            }
            else if (event.hover.left && !params.preserveAspectRatio)
            {
                $(event.target).css('cursor', 'w-resize');
            }
        });

        Loctek.event.borderdown(content, function(event) {
            resize(event.hover);
        });

        function resize(hover)
        {
            realThis._resizing = true;
            var prevX, prevY;

            if (hover.right)
                prevX = $(content)[0].offsetLeft + $(content).outerWidth();
            else if (hover.left)
                prevX = $(content)[0].offsetLeft;

            if (hover.bottom)
                prevY = $(content)[0].offsetTop + $(content).outerHeight();
            else if (hover.top)
                prevY = $(content)[0].offsetTop;

            $(document).on('mousemove', resizeMove);

            $(document).on('mouseup', windowUp);
            function windowUp() {
                if (params.up) params.up();
                realThis._resizing = false;
                $(document).off('mousemove', resizeMove).off('mouseup', windowUp);
            }

            function resizeMove(event)
            {
                if (params.preserveAspectRatio && !(hover.left && hover.top || hover.right && hover.top || hover.left && hover.bottom || hover.right && hover.bottom)) return;

                var pageX = event.pageX - $(content).parent().offset().left;
                var pageY = event.pageY - $(content).parent().offset().top;

                var border;
                if (!params.borderFix)
                    border = 0;
                else
                    border = Loctek.core.parseProperty($(content).css('border-left-width')) + Loctek.core.parseProperty($(content).css('border-right-width'));

                if (params.down) params.down();

                event.preventDefault();
                if (hover.right)
                {
                    if (params.preserveAspectRatio && $(content).height() <= 0 && pageX-prevX+border <= 0) return;

                    $(content).width('+=' + parseInt(pageX-prevX+border));

                    if (params.preserveAspectRatio)
                    {
                        if (this.ar > 2) this.ar = 1;
                        var amount = parseInt((pageX-prevX+border)*this.ar);
                        $(content).height('+=' + amount);
                        if (hover.top) $(content).css('top', '-=' + parseInt((pageX-prevX)));
                        prevY += amount;
                    }

                    prevX = $(content)[0].offsetLeft + $(content).width();
                }
                else if (hover.left)
                {
                    if (params.preserveAspectRatio && $(content).height() <= 0 && prevX-pageX+border <= 0) return;
                    
                    $(content).width('+=' + parseInt(prevX-pageX+border)).css('left', prevX-(prevX-pageX));
                    
                    if (params.preserveAspectRatio)
                    {
                        if (this.ar2 > 2) this.ar2 = 1;
                        var amount = parseInt((prevX-pageX+border)*this.ar2);
                        $(content).height('+=' + amount);
                        if (hover.top) $(content).css('top', '-=' + parseInt(prevX-pageX));
                        prevY += amount;
                    }

                    prevX = prevX-(prevX-pageX);
                }
                
                if (hover.bottom && !params.preserveAspectRatio)
                {
                    $(content).height('+=' + parseInt(pageY-prevY+border));
                    prevY = $(content)[0].offsetTop + $(content).outerHeight();
                }
                else if (hover.top && !params.preserveAspectRatio)
                {
                    $(content).height('+=' + parseInt(prevY-pageY+border)).css('top', prevY-(prevY-pageY));
                    prevY = prevY-(prevY-pageY);
                }
            }
        }
    }
}

function loctek_gallery(content, params)
{
    if (typeof params == 'undefined') params = {};
    if (typeof params.viewCount == 'undefined') params.viewCount = 5;
    if (typeof params.viewType == 'undefined') params.viewCount = 'paging';
    if (typeof params.nextButton == 'undefined') params.nextButton = false;
    if (typeof params.prevButton == 'undefined') params.prevButton = false;
    if (typeof params.interval == 'undefined') params.interval = 5000;
    if (typeof params.permanent == 'undefined') params.permanent = '';
    if (typeof params.buttonMode == 'undefined') params.buttonMode = false;

    var children = $(content).children();
    var currentPos = 0;
    var blockAnimation = false;

    switch (params.viewType)
    {
        case 'fadingPage':
            children.hide().slice(0,params.viewCount).show();
            var max = params.viewCount-$(content).children('.permanent').length;
            
            if ($(content).children().length > params.viewCount)
            setInterval(function() {
                var rand = Math.floor(Math.random()*(max-0+1)+0);
                var group = $(content).children(':hidden').slice(rand, rand+max);
                if (group.length < max) $.merge(group, $(content).children(':hidden').slice(0, max-group.length));
                if (group.length < max) $.merge(group, $(content).children(':visible:not(.permanent)').slice(0, max-group.length));

                $(content).children(':visible:not(' + params.permanent + ')').fadeOut('fast', function() {
                    //var el = group.eq(Math.floor(Math.random()*($(content).children(':hidden').length-1-0+1)+0));
                    //el.insertAfter($(this));
                    group.fadeIn('slow');
                });

                //if ($(content).children(':visible').length < params.viewCount) $(content).children(':hidden').slice(0, params.viewCount-$(content).children(':visible').length).fadeIn('slow');
            }, params.interval);
        break;
        case 'fading':
            children.hide().slice(0,params.viewCount).show();

            setInterval(function() {
                $(content).children(':visible:not(' + params.permanent + ')').eq(Math.floor(Math.random()*($(content).children(':visible:not(' + params.permanent + ')').length-1-0+1)+0)).fadeOut('fast', function() {
                    var el = $(content).children(':hidden').eq(Math.floor(Math.random()*($(content).children(':hidden').length-1-0+1)+0));
                    el.insertAfter($(this));
                    el.fadeIn('slow');
                });
            }, params.interval);
        break;
        default:
            children.hide().slice(0,params.viewCount).show();
            $(params.prevButton).hide();

            if (params.nextButton) $(params.nextButton).on('click', function() {
                children.hide();

                if (children.length >= currentPos + params.viewCount)
                    currentPos += params.viewCount;
                
                blockAnimation = true;
                children.slice(currentPos, currentPos + params.viewCount).fadeIn('slow', function() { blockAnimation = false; });

                if (params.buttonMode == 'hidden')
                {
                    if (currentPos > 0) $(params.prevButton).show();
                    if (currentPos + params.viewCount >= children.length) $(params.nextButton).hide();
                }
            });

            if (params.prevButton) $(params.prevButton).on('click', function() {
                children.hide();
                if (currentPos >= params.viewCount)
                    currentPos -= params.viewCount;
                
                blockAnimation = true;
                children.slice(currentPos, currentPos+params.viewCount).fadeIn('slow', function() { blockAnimation = false; });

                if (params.buttonMode == 'hidden')
                {
                    if (currentPos == 0) $(params.prevButton).hide();
                    if (children.length > params.viewCount) $(params.nextButton).show();
                }
            });
        break;
    }
}

function loctek_form(content)
{
    var realThis = this;
    /*this.errors = [];
    this.elements = [];

    var _line = false;
    this.line = function(val)
    {
        if (typeof val == 'undefined')
            return _line;
        else
            _line = val;
    }

    var _feedback = false;
    this.feedback = function(val)
    {
        if (typeof val == 'undefined')
            return _feedback;
        else
            _feedback = val;
    }

    this.addError = function(el, type)
    {
        type = Loctek.feedback.form[type].replace('$name', $(el).prop('name'));
        var error = this.line() ? this.line().replace('$error', type) : type;
        this.errors.push(error);
    }
   
    this.showFeedback = function()
    {
        if (this.errors.length == 0) return true;
       
        $(realThis.feedback()).empty();
        for (var i=0;i<this.errors.length;i++) {
            $(realThis.feedback()).html((i==0?'':$(realThis.feedback()).html()) + this.errors[i]);
        }

        return false;
    }

    $(content).find('input, select, textarea').prop('formnovalidate', 'formnovalidate');
    $(content).on('submit', function() {
        realThis.errors = [];
        $(content).find('input, select, textarea').each(function() {
            if ($(this).prop('required'))
            {
                if ($(this).val().length == 0)
                    realThis.addError(this, 'required');
            }
        });
       
        if (realThis.feedback())
            if (realThis.showFeedback()) return true; else return false;
        return false;
    });*/

    var _submit = {pre : false, post : false};
    this.submit = function(val)
    {
        if (typeof val == 'undefined') return _submit;
        if (typeof val.pre != 'undefined') _submit.pre = val.pre;
        if (typeof val.post != 'undefined') _submit.post = val.post;
    }

    $(content).find('input, select, textarea').prop('formnovalidate', 'formnovalidate');
    var submit = $(content).find('input[type="submit"]').prop('type', 'button');
    $(submit).on('click', submitFunc);
    this.triggerSubmit = submitFunc;

    function submitFunc() {
        var iframe = $('<iframe name="loctek-fileuploadframe" width="0" border="0" frameborder="0" height="0"></iframe>');
        $('body').append(iframe);

        if (realThis.submit().pre) realThis.submit().pre(content);

        iframe.on('load', function() {
            var content;

            if (iframe[0].contentDocument)
                content = iframe[0].contentDocument.body.innerHTML;
            else if (iframe[0].contentWindow)
                content = iframeId.contentWindow.document.body.innerHTML;
            else if (iframe[0].document)
                content = iframe[0].document.body.innerHTML;

            if (realThis.submit().post) realThis.submit().post(content);
            iframe.remove();
        })

        $(content).prop('target', 'loctek-fileuploadframe');
        $(content).prop('enctype', 'multipart/form-data');
        $(content).prop('encoding', 'multipart/form-data');
        $(content).submit();
        return false;
    }
}

function loctek_ticker(content)
{
    var realThis = this;

    this.context = function()
    {
        return content;
    }

    var _direction = 'right';
    this.direction = function(val)
    {
        if (typeof val == 'undefined')
            return _direction;
        else if (val == 'top' || val == 'bottom' || val == 'left')
            _direction = val;
        else
            _direction = 'right';
    }

    var _random = false;
    this.random = function(val)
    {
        if (typeof val == 'undefined')
            return _random;
        else
            _random = val;
    }

    var _children = $(content).addClass('loctek-ticker').children().hide();
    var _prevEl = false;
    this.tick = function(moveTo)
    {
        $(moveTo).removeAttr('style');
        switch (this.direction())
        {
            case 'right':
                $(moveTo).show().css({left : '-' + $(moveTo).width() + 'px', opacity : 0}).animate({left : 0, opacity : 1}, 1200);
                setMiddle(moveTo);
                if (_prevEl) $(_prevEl).fadeOut(500);
            break;
            case 'left':
                $(moveTo).show().css({right : '-' + $(moveTo).first().width() + 'px', opacity : 0}).animate({right : 0, opacity : 1}, 1200);
                setMiddle(moveTo);
                if (_prevEl) $(_prevEl).fadeOut(500);
            break;
            case 'top':
                $(moveTo).show().css({bottom : '-' + $(moveTo).first().height() + 'px', opacity : 0}).animate({bottom : getMiddle(moveTo), opacity : 1}, 1200);
                if (_prevEl) $(_prevEl).fadeOut(500);
            break;
            case 'bottom':
                $(moveTo).show().css({top : '-' + $(moveTo).first().height() + 'px', opacity : 0}).animate({top : getMiddle(moveTo), opacity : 1}, 1200);
                if (_prevEl) $(_prevEl).fadeOut(500);
            break;
        }
        _prevEl = moveTo;

        function setMiddle(el)
        {
            el.css({top : '50%', marginTop : '-' + parseInt($(el).height()/2) + 'px'});
        }

        function getMiddle(el)
        {
            return $(content).height()/2 - $(el).height()/2;
        }
    }

    var _tickerInterval;
    this.startTicker = function(time)
    {
        if (_children.length == 0) return;
        if (_children.length == 1)
        {
             realThis.tick($(_children).first());
            return;
        }
        
        _tickerInterval = setInterval(tickerF, time);
        tickerF();

        function tickerF() {
            var tickEl = false;
            if (realThis.random())
            {
                function randomizeTickEvent()
                {
                    var rand = Math.floor(Math.random()*_children.length);
                    if (typeof prevEl == 'undefined' && $(_children[rand]).index() != $(_prevEl).index())
                        return _children[rand];
                    else
                        return randomizeTickEvent();
                }

                tickEl = randomizeTickEvent();
            }
            else if (_prevEl)
            {
                if($(_prevEl).next().length == 0)
                    tickEl = $(_children).first();
                else
                    tickEl = $(_prevEl).next();
            }
            else
                tickEl = $(_children).first();

            realThis.tick(tickEl);
        }
    }

    this.stopTicker = function()
    {
        clearInterval(_tickerInterval);
    }
}

function loctek_tooltip(content)
{
    var realThis = this;
   
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
   
    var _context = false;
    this.context = function(val)
    {
        if (typeof val == 'undefined')
            return _context;
        else
        {
            _context = val;
        }
    }
   
    var _width = false;
    this.width = function(val)
    {
        if (typeof val == 'undefined')
            return _width;
        else
        {
            _width = val;
           realThis.context().width(val);
        }
    }

    this.context($('<div class="loctek-tooltip">' + $(content).html() + '</div>'));
    $('body').append(this.context());
    this.width($(document).width()-this.context().width()-50);
   
    function initializeMove()
    {
        realThis.context().show();
        $(_hover).on('mousemove', moveTooltip).on('mouseout', movefunc);

        function movefunc() {
            realThis.context().removeClass('right');
            $(_hover).off('mousemove');
            realThis.context().hide();
        }
    }
  
    function moveTooltip(event)
    {
        event.preventDefault();
       
        if (Loctek.core.parseProperty(realThis.context().outerWidth())+event.pageX < Loctek.core.parseProperty($(document).outerWidth(true)))
            realThis.context().removeClass('right').css({left : parseInt(event.pageX+20) + 'px', top : parseInt(event.pageY-Loctek.core.parseProperty($(document).scrollTop())-15) + 'px'});
        else
            realThis.context().addClass('right').css({left : parseInt(event.pageX-realThis.context().width()-35) + 'px', top : parseInt(event.pageY-Loctek.core.parseProperty($(document).scrollTop())-15) + 'px'});
    }
}

function loctek_slider(container, params)
{
    if (typeof params == 'undefined') params = {};
    if (typeof params.height == 'undefined') params.height = false;
    if (typeof params.controlPosition == 'undefined') params.controlPosition = {};
    if (typeof params.inParent == 'undefined') params.inParent = false;
    if (typeof params.animationTime == 'undefined') params.animationTime = false;
   
    //fields
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

    if (params.animationTime !== false)
        animationTime(params.animationTime);

    //init
    var children = $(container).children();
    $(container).addClass('loctek-slider');
    children.hide();
    $(children[0]).show();
   
    var containerLocal = params.inParent ? $(container).parent() : $(container);
    if ($.isEmptyObject(params.controlPosition))
    {
        var controls = $('<ol class="loctek-slider-controls" style="margin-left: -' + parseInt(children.length*7) + 'px"></ol>');
        containerLocal.append(controls);
    }
    else
    {
        var controls = $('<ol class="loctek-slider-controls"></ol>');
        containerLocal.append(controls);
       
        if (typeof params.controlPosition.left == 'undefined') params.controlPosition.left = 'auto';
       
        for (prop in params.controlPosition)
            containerLocal.find('.loctek-slider-controls').css(prop, params.controlPosition[prop]);
    }
   
    var controlItems = [];
    for (var i=0;i<children.length;i++)
    {
        var item = $('<li ><a href="#" title="View ' + i + '" /></li>');
        if (i == 0) item.addClass('active');
        controlItems.push(item);
        controls.append(item);
        $(children[i]).width($(container).innerWidth() - parseInt($(container).css('padding-left')) - parseInt($(container).css('padding-left')));
        //$(children[i]).css("left", i==0 ? parseInt($(children[i]).css('margin-left')) + parseInt($(container).css('padding-left')) + parseInt($(children[i]).css('padding-left')) : $(children[i-1]).outerWidth() + 'px')
    }

    $('#stappenplan').show();
    $(container).css({width : $(container).width()});
    var h;
    if (!params.height)
        h = $(children[0]).outerHeight();
    else
        h = params.height;

    if (h > 0)
    {
        if ($(window).height() - 150 <= h)
        {
            $(container).height($(window).height()-150).css({ 'overflow-y' :  'auto', 'margin-right' : '20px' });
        }
        else
            $(container).height(h);
    }
    $('#stappenplan').hide();

    //swipe
    var _draggable = true;
    var currentX, direction, pageY, canTouch, accumulatedX;
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) )
    {
        var canTouch = false;
       
        function windowMove(jQueryEvent) {
            if (!canTouch) return;
            var e = window.event.touches[0];
            if (Math.abs(pageY - e.pageY) < 15)
            {
                   jQueryEvent.preventDefault();
                   direction = currentX > e.pageX ? 'left' : 'right';

                   if (!accumulatedX)
                       accumulatedX = e.pageX;
                else if (accumulatedX != 'block' && Math.abs(accumulatedX - e.pageX) > 30)
                   {
                       accumulatedX = 'block';
                   }

                   currentX = e.pageX;
           }
        }
       
        function windowStop(e) {
            e.preventDefault();
            pageY = canTouch = currentX = false;
            $(window).unbind('touchmove touchend');

               if (direction == 'left' && accumulatedX == 'block')
                   goTo(current()+1 >= children.length ? 0 : current()+1);
               else if (accumulatedX == 'block')
                goTo(current() <= 0 ? children.length-1 : current()-1);
        }
       
        $(container).bind('touchstart', function() {
            pageY = window.event.touches[0].pageY;
            accumulatedX = false;
            canTouch = true;
            $(window).bind('touchmove', windowMove).bind('touchend', windowStop);
        });
    }
    else
    {
        /*$(container).mousedown(function() {
            if (!_draggable) return;
            $(document).bind('mousemove' ,function (event) {
                currentX = event.pageX;
                console.log(currentX);
            }).bind('mouseup', function(event) {
                alert('up')
                $(document).unbind('mousemove mouseup');
            });
        })*/
    }
   
    //methods
    var adjustSize = function(height, width)
    {
        if (height) $(container).height($(container).find(' :first-child').height());
        if (width) $(container).width($(container).find(' :first-child').width());
    }
   
    var _blockSlider = false;
    var goTo = function(position)
    {
        if (position == 'leftEnd')
        {
            _blockSlider = true;
            $(children[current()]).animate({opacity : 0, left : $(children[current()]).width() + 'px'}, animationTime()/2);
            $(children[children.length-1]).css({left : '-' + $(container).width() + 'px', opacity : 1}).show().animate({left : Loctek.core.parseProperty($(children[children.length-1]).css('margin-left')) + Loctek.core.parseProperty($(container).css('padding-left')) + Loctek.core.parseProperty($(children[children.length-1]).css('padding-left')) + 'px'}, animationTime()/2, function() { _blockSlider = false; });
            current(children.length-1);
            return;
        }

        if (position == 'rightEnd')
        {
            _blockSlider = true;
            $(children[current()]).animate({opacity : 0, left : '-' + $(children[current()]).width() + 'px'}, animationTime()/2);
            $(children[0]).css({left : $(container).width() + 'px', opacity : 1}).show().animate({left : Loctek.core.parseProperty($(children[0]).css('margin-left')) + Loctek.core.parseProperty($(container).css('padding-left')) + Loctek.core.parseProperty($(children[0]).css('padding-left')) + 'px'}, animationTime()/2, function() { _blockSlider = false; });
            current(0);
            return;
        }
       
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
                {left : Loctek.core.parseProperty($(children[i]).css('margin-left')) + Loctek.core.parseProperty($(container).css('padding-left')) + Loctek.core.parseProperty($(children[i]).css('padding-left')) + 'px'};
           
            if(i < iMax)
                $(children[i+1]).show().css({opacity : 1, left : $(container).width()}).animate({left : Loctek.core.parseProperty($(children[i+1]).css('margin-left')) + Loctek.core.parseProperty($(container).css('padding-left')) + Loctek.core.parseProperty($(children[i+1]).css('padding-left')) + 'px'}, timePerAnimation);
           
            _blockSlider = true;
            $(children[i]).animate(animateOptions, timePerAnimation, function() {
                _blockSlider = false;
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
                $(children[i-1]).show().css({opacity : 1, left : '-' + $(children[i-1]).outerWidth() + 'px'}).animate({opacity : 1, left : Loctek.core.parseProperty($(children[i]).css('margin-left')) + Loctek.core.parseProperty($(container).css('padding-left')) + Loctek.core.parseProperty($(children[i]).css('padding-left')) + 'px'}, timePerAnimation);
           
            _blockSlider = true;
            if (i-1 >= 0)
            $(children[i]).animate({opacity : 0, left : $(container).outerWidth() + 'px'}, timePerAnimation, function() {
                _blockSlider = false;
                i--;
                iLeft++;
                if (iLeft < iMax) aniLeft(i);
                current(current()-1);
            });
        }
       
        if (goLeft) aniLeft(i); else aniRight(i);
    }
    var l = containerLocal.find('.loctek-slider-controls li');
    l.bind('click', function() { if (_blockSlider) return; goTo(l.index(this)); });
    //goTo(2);
   
    var _interval = false;
    this.start = function(time)
    {
        interval = setInterval(function () {
            if (_blockSlider) return;
            if (children.length < 2) return;
            goTo(current()+1 >= children.length ? 'rightEnd' : current()+1);
        }, time);
    }

    this.nextButton = function(el)
    {
        if (children.length < 2) { $(el).hide(); return; }
        $(el).on('click', function() {
            if (_blockSlider) return;
            goTo(current()+1 >= children.length ? 'rightEnd' : current()+1);
        });
    }

    this.prevButton = function(el)
    {
        if (children.length < 2) { $(el).hide(); return; }
        $(el).on('click', function() {
            if (_blockSlider) return;
            goTo(current() <= 0 ? 'leftEnd' : current()-1);
        });
    }
}

function loctek_core_loadimages(container, callback)
{
     var imgs = $(container).find('img');
        //imgs.hide();
        var imgcurrent = 0;
        $.each(imgs, function() { 
            $("<img/>").attr("src", $(this).attr("src")).load(function() {
                imgcurrent++;
                if (imgs.length <= imgcurrent) { imgs.show(); callback(); }
             }).error(function() {
                imgcurrent++;
                if (imgs.length <= imgcurrent) { imgs.show(); callback(); }
             });
        });
}

function viewport()
{
var e = window
, a = 'inner';
if ( !( 'innerWidth' in window ) )
{
a = 'client';
e = document.documentElement || document.body;
}
return { width : e[ a+'Width' ] , height : e[ a+'Height' ] }
}

function loctek_lightbox(container, params)
{
    if (typeof params == 'undefined') params = {};
    if (typeof params.hideAfter == 'undefined') params.hideAfter = true;
    if (typeof params.hideControllers == 'undefined') params.hideControllers = false;
    if (typeof params.width == 'undefined') params.width = false;
    if (typeof params.height == 'undefined') params.height = false;
    if (typeof params.start == 'undefined') params.start = false;
    if (typeof params.close == 'undefined') params.close = false;
    if (typeof params.layout == 'undefined') params.layout = false;
    if (typeof params.open == 'undefined') params.open = false;
    if (typeof params.continuous == 'undefined') params.continuous = false;
    if (typeof params.resize == 'undefined') params.resize = false;
    if (typeof params.animationTime == 'undefined') params.animationTime = 500;
    if (typeof params.next == 'undefined') params.next = false;
    if (typeof params.prev == 'undefined') params.prev = false;
    if (typeof params.preload == 'undefined') params.preload = false;

    function setSizeFunc(el, start)
    {
        if (start)
        {
            var w = params.width ? params.width : el.width();
            var h = params.height ? params.height : el.height();
        }
        else
        {
            var w = children.eq(current).width();
            var h = children.eq(current).height();
        }
        ratio =  $(el).outerWidth()/$(el).outerHeight();
        console.log( $(el).outerWidth(),$(el).outerHeight())
        if (h > viewport().height - 60)
        {
            $(el).height(viewport().height - 60);
            h = viewport().height - 60;
            w = h*ratio;
        }

        if (w > h && w > viewport().width - 40)
        {
            $(el).width(viewport().width - 40);
            w = viewport().width - 40;
            h = w/ratio;
        }
        
        $(el).hide();
        $(container).css('opacity', 0).animate({opacity : 1, width : w, height : h, marginLeft : '-' + parseInt(w/2) + 'px', marginTop : '-' + parseInt(h/2) + 'px'}, params.animationTime, function() {
            $(el).fadeIn('fast');
        });
    }

    $(container).click(function(event) { event.stopPropagation(); });
   
    var visibleChildren = $(container).children(':visible');
    $(container).hide();
    var children = $(container).children();

    if (params.layout == 'tabs')
    {
        params.hideControllers = true;
        $(container).append('<ul class="loctek-lightbox-tabs" />');
        children.each(function() {
            var title = $(this).prop('title');
            $(this).removeAttr('title');
            var li = $('<li>' + title + '</li>');
            li.on('click', function() {
                current =  $(container).find('.loctek-lightbox-tabs li').index($(this));
                children.hide();
                children.eq(current).show();
            });
            $(container).find('.loctek-lightbox-tabs').prepend(li);
        });
    }

    $(container).addClass('loctek-lightbox');
    if(!params.hideControllers) $(container).append('<div class="loctek-lightbox-left" /><div class="loctek-lightbox-right" />');
    $('body').append('<div class="loctek-lightbox-cover"></div>');
   
    var current = 0;
    var childrenCount = children.length;

    $('.loctek-lightbox-cover').css('opacity', '0').animate({opacity : '0.8'}, 300, function() {
        $(container).show().append('<img src="ajax-loader.gif" style="display:none" class="loctek-lightbox-loader" />');

        if (params.resize)
        {
            container.css({ width : 60, height : 30, marginLeft : -30, marginTop : -15 });
            $(children).hide();
            var cur = children.eq(params.start ? params.start : 0);
            var attr = cur.prop('src');

            if (typeof attr !== 'undefined' && attr !== false && attr != '')
            {
                $(children).hide();
                children.eq(current).show();
                setSizeFunc(children.eq(current));

            }
            else
            {
                $('.loctek-lightbox-loader').show();
                container.css({ width : 60, height : 30, marginLeft : -30, marginTop : -15 });
                $(children).hide();

                children.eq(current).prop('src', children.eq(current).data('src')).load(function() {
                    $('.loctek-lightbox-loader').hide();
                    $(this).show();

                    setSizeFunc(this);
                });
            }
        }
        else
        {
            $(container).css({width : w, height : h});
            $(container).css({marginLeft : '-' + parseInt($(container).width()/2) + 'px', marginTop : '-' + parseInt($(container).height()/2) + 'px'});
        }
        
        children.hide();
        
        if (params.start)
        {
            children.eq(params.start).show();
            current = params.start;
        }
        else if (!params.preload)
            children.first().show();
        
        if (params.open) params.open();
    });

    var setSize = function(w, h)
    {
        var attr = children.eq(current).prop('src');

        if (typeof attr !== 'undefined' && attr !== false && attr != '')
        {
            $(children).hide();
            children.eq(current).show();
            setSizeFunc(children.eq(current));

        }
        else
        {
            $('.loctek-lightbox-loader').show();
            container.css({ width : 60, height : 30, marginLeft : -30, marginTop : -15 });
            $(children).hide();

            children.eq(current).prop('src', children.eq(current).data('src')).load(function() {
                $('.loctek-lightbox-loader').hide();
                $(this).show();

                setSizeFunc(this);
            });
        }
    }
   
    var next = function()
    {
        if (childrenCount-1 <= current) 
        {
            if (params.continuous)
                current = -1;
            else
                return false;
        }
        current++;

        if (params.resize)
            setSize(children.eq(current).width(),children.eq(current).height());
        else
        {
            children.hide();
            children.eq(current).show();
        }
    }

    if (children.length < 2)
    {
        $('.loctek-lightbox-right').hide();
        $(params.next).hide();
    }
    else
    {
        $(params.next).on('click', next);
        if(!params.hideControllers) $('.loctek-lightbox-right').on('click', next);
    }
   
    var prev = function()
    {
        if (current <= 0)
        {
            if (params.continuous)
                current = children.length;
            else
                return false;
        }
        current--;
        if (params.resize)
            setSize(children.eq(current).width(),children.eq(current).height());
        else
        {
            children.hide();
            children.eq(current).show();
        }
    }

    if (children.length < 2)
    {
        $('.loctek-lightbox-left').hide();
        $(params.prev).hide();
    }
    else
    {
        $(params.prev).on('click', prev);
        if(!params.hideControllers) $('.loctek-lightbox-left').on('click', prev);
    }

   
    var close = function()
    {
        $(container).removeClass('loctek-lightbox').removeAttr('style');
        if (params.hideAfter) $(container).hide();
        
        if ($(container).is(':visible')) children.hide(); else  children.show();
        visibleChildren.show();

        $('.loctek-lightbox-left, .loctek-lightbox-right, .loctek-lightbox-cover, .loctek-lightbox-loader').remove();

        if (params.layout == 'tabs')
        {
            var tabs = $('.loctek-lightbox-tabs li');
            children.each(function(i) {
                var tab = tabs.eq(i);
                $(this).prop('title', tab.text());
            });
            
            $('.loctek-lightbox-tabs').remove();
        }

        $(container).children().css({ 'width' : 'initial', 'height' : 'initial' });
    }
    $('.loctek-lightbox-cover').on('click', close);
    if (params.close) $(params.close).on('click', close);
}

function validate(el)
{
    var data = $(el).find('input, select, textarea');
   
    for (var i=0; i<data.length;i++)
    {
        var validations = data[0].getAttribute('data-validate');
       
    }
}