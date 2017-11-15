$(function() {
    //click on menu button
    $('#js-menuBtn').on('click', function() {
        $(this).toggleClass('button-close--active');
        $('#js-mainNavigation').toggleClass('nav--open');
    });

    //click on navigation items
    $('#js-mainNavigation').on('click', '.nav__item:not(.nav__item--button):not(.nav__item_faq)', handleClickToScroll);

    //init countdown
    initCounter();
});

function handleClickToScroll(e) {
	var faqOuter = document.querySelector(".faq-outer");
	if(faqOuter === null){
		e.preventDefault();

		var docFragment = $(this).attr('href');
		var docFragmentOffset = $(docFragment).offset().top || 0;

		$('#js-mainNavigation').removeClass('nav--open');
		$('.button-close').removeClass('button-close--active');
		$('html,body').animate({scrollTop: docFragmentOffset}, 1000);
	}
	else{
		var docFragment = $(this).attr('href');
		docFragment = '';
		location.href = '/' + docFragment;
	}
}


function initCounter() {
    // Set the date we're counting down to
    var countDownDate = new Date('Nov 15, 2017 9:00:00').getTime();
    var counterDays = $('#counter-days');
    var counterHours = $('#counter-hours');
    var counterMinutes = $('#counter-minutes');
    var counterSeconds = $('#counter-seconds');


// Update the count down every 1 second
    var x = setInterval(function() {

        // Get todays date and time
        var now = new Date().getTime();

        // Find the distance between now an the count down date
        var distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with id="demo"

        counterDays.html(days || '00');
        counterHours.html(hours || '00');
        counterMinutes.html(minutes || '00');
        counterSeconds.html(seconds || '00');


       /* document.getElementById("demo").innerHTML = days + "d " + hours + "h "
            + minutes + "m " + seconds + "s ";*/

        // If the count down is finished, write some text
        if (distance < 0) {
            clearInterval(x);

            counterDays.html('00');
            counterHours.html('00');
            counterMinutes.html('00');
            counterSeconds.html('00');
        }
    }, 1000);
}

//mailchimp
$(function() {
    var $form = $('#js-subsForm');

    $('#js-subsForm button').on('click', function(event) {
        if(event) {
            event.preventDefault();
        }

        if(validateForm()) {
            register($form);
        }
    });

});

function validateForm() {
    var formInputs = $('.subscribe-form:not(.button)');

    formInputs.each(function(index) {
        if(validateInput($(this))) {
            $(this).removeClass('subscribe-form--error');
        }
        else {
            $(this).addClass('subscribe-form--error');
        }
    });

    return !$('.form__item--error').length;
}

function validateInput(el) {
    var type = $(el).attr('type');
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var elVal = $(el).val();

    if(type === 'text') {
        return !!elVal;
    }
    else if(type === 'email') {
        return !!elVal && re.test(elVal);
    }
}

function toggleDisableInputs(isDisable, $form) {
    isDisable = isDisable || true;

    $($form.prop('elements')).each(function(ind) {
        if(isDisable && $(this).attr('type') !== 'hidden') {
            $(this).addClass('subscribe-form__item--disabled');
        }
        else {
            $(this).removeClass('subscribe-form__item--disabled');
        }
    });

}

function register($form) {
    var afterSubmitText = $('#js-afterSubmit');
    toggleDisableInputs(true, $form); //true - disable, false - available

    $.ajax({
        type: $form.attr('method'),
        url: $form.attr('action'),
        data: $form.serialize(),
        cache: false,
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        error: function(err) {
            toggleDisableInputs(false, $form);
            afterSubmitText
                //.text('Could not connect to the registration server. Please try again later.')
                .show();
        },
        success: function(data) {
            $form.hide();
            afterSubmitText
                .html(data.msg)
                .show();

        },
        compvare: function() {
            $form.hide();
            afterSubmitText
                .html('Please, check your email to confirm subscription')
                .show();
        }
    });
}





/* Animations */
$("html, body").scrollTop(0);

var inView = function(selector, percentPosition, callback){

	var on = true,
		elements = [],
		outer = false,
		run = false,
		scrollVal = 0,
		heightVal = 0,
		percentVal = 0;

    var callbackReturn = function(){};
    var outerSelector = window;

	// init

	function init(){

        elements = document.querySelectorAll(selector);
		if(elements.length === 0){
			run = false;
			return false;
		}
		for(var i = 0; i < elements.length; i++){
			elements[i].callback = false;
			elements[i].callbackAgain = false;
		}

		if(outerSelector !== window){
			outer = document.querySelector(outerSelector);
		}
		else{
			outer = window;
		}
		
		if(outer === null){
			run = false;
			return false;
		}

		outer.addEventListener("scroll", scroll.bind(this));

		run = true;

	}

	// scroll

	function scroll(){

		if(on !== true) return false;

		scrollVal = outer === window ? outer.pageYOffset : outer.scrollTop;
		heightVal = outer === window ? document.documentElement.clientHeight : outer.clientHeight;
		percentVal = percentPosition * heightVal / 100;


		for(var i = 0; i < elements.length; i++){
			var bounding = elements[i].getBoundingClientRect();
			if( (bounding.top <= percentVal & elements[i].callbackAgain === false) || (bounding.bottom >= percentVal & elements[i].callbackAgain === true) ) {
				if(bounding.top >= elements[i].clientHeight * -1){
					if(elements[i].callback === true) continue;
					callback(elements[i]);
					elements[i].callback = true;
					elements[i].callbackAgain = false;
				}
				else{
					if(elements[i].callback === false) continue;
					callbackReturn(elements[i]);
					elements[i].callback = false;
					elements[i].callbackAgain = true;
				}
			}
		}

	}

	// turn

	function turn(data){ // on, off
		if(data === "on"){
			on = true;
		}
		else{
			on = false;
		}
	}

	init();
	if(run !== true) return;

	return {
		turn: turn
	};

};



function positionateCanvas(){
    var heroImage = document.querySelector(".page-hero__block--image"),
        mandalaCanvas = document.querySelector("#defaultCanvas");
    if(heroImage !== null & mandalaCanvas !== null){

        var heroImagePos = heroImage.getBoundingClientRect();
        
        //mandalaCanvas.style.top = heroImagePos.top + 'px';
        var topPos = heroImagePos.top + (heroImage.clientHeight / 2);
        //topPos -= mandalaCanvas.clientHeight / 2;
        //topPos -= heroImage.clientHeight / 10;
        mandalaCanvas.style.top = topPos + 'px';

        var leftPos = heroImagePos.left + (heroImage.clientWidth / 2);
        //leftPos -= mandalaCanvas.clientWidth / 2;
        mandalaCanvas.style.left = leftPos + 'px';
        
    }
}

positionateCanvas();



window.addEventListener("load", function(){
    setTimeout(function(){
        var loadAnimateElements = document.querySelectorAll(".js-animate-loaded");
        for(var i = 0; i < loadAnimateElements.length; i++){
            loadAnimateElements[i].classList.add("js-animated");
        }
    }.bind(this), 1500);
    setTimeout(function(){
        $("html, body").scrollTop(0);
        positionateCanvas();
    }.bind(this), 500);
});

window.addEventListener("resize", function(){
    setTimeout(function(){
        positionateCanvas();
    }.bind(this), 750);
}.bind(this));



jQuery(document).ready(function($) {



    inView('.js-animate-viewport', 70, function(e){
        e.classList.add("js-animated");
    }.bind(this));
    
    

    inView('.footer__text', 90, function(e){
        e.classList.add("js-animated");
    }.bind(this));
    
    
    
    inView('#features', 70, function(e){
        var children = e.querySelectorAll(".js-animate");
        for(var i = 0; i < children.length; i++){
            children[i].classList.add("js-animated");
        }
    }.bind(this));
    
    
    
    inView('.currency', 70, function(e){
        var children = e.querySelectorAll(".js-animate");
        for(var i = 0; i < children.length; i++){
            children[i].classList.add("js-animated");
        }
    }.bind(this));
    
    
    
    inView('.distribution-list', 70, function(e){
        var children = e.querySelectorAll(".js-animate");
        for(var i = 0; i < children.length; i++){
            setTimeout(function(elem){
                elem.classList.add("js-animated");
            }.bind(this, children[i]), i*100);
        }
    }.bind(this));
    
    
    
    inView('.discount-options', 70, function(e){
        var children = e.querySelectorAll(".js-animate");
        for(var i = 0; i < children.length; i++){
            children[i].classList.add("js-animated");
        }
    }.bind(this));
    
    
    
    inView('#team', 70, function(e){
        var children = e.querySelectorAll(".team-list__item");
        for(var i = 0; i < children.length; i++){
            setTimeout(function(elem){
                elem.classList.add("js-animated");
            }.bind(this, children[i]), i*200);
        }
    }.bind(this));
    
    
    
    inView('.social', 70, function(e){
        var children = e.querySelectorAll(".js-animate");
        for(var i = 0; i < children.length; i++){
            setTimeout(function(elem){
                elem.classList.add("js-animated");
            }.bind(this, children[i]), i*100);
        }
    }.bind(this));
    
    
    
    var dosTitle = document.querySelectorAll(".dos-title");
    if(document.documentElement.clientWidth >= 500){
        for(var i = 0; i < dosTitle.length; i++){
            dosTitle[i].setAttribute("data-text", dosTitle[i].innerHTML);
            dosTitle[i].innerHTML = '<span class="dos-title-cursor">&nbsp;</span>';
        }
    }

    inView('.dos-title', 80, function(e){
        var currentText = e.getAttribute("data-text");
        if(currentText !== null){
            for(var i = 0; i < currentText.length; i++){
                setTimeout(function(elem, text, num){
                    var newText = '';
                    for(var a = 0; a <= num; a++){
                        newText += text[a];
                    }
                    //if(num !== text.length-1){
                        newText += '<span class="dos-title-cursor">&nbsp;</span>';
                    //}
                    if(num == text.length-1){
                        elem.classList.add("proceeded");
                        elem.removeAttribute("data-text");
                    }
                    elem.innerHTML = newText;
                }.bind(this, e, currentText, i), i*75);
            }
        }
    }.bind(this));
	
	
	
	
	
	// faq

	var faq = function(selector, selectorItem, selectorQuestion, selectorAnswer, selectorClose, animation){

		var outer = document.querySelector(selector);
		if(outer === null){
			return {
				error: true
			};
		}
		outer.classList.add('v-faq');

		var items = outer.querySelectorAll(selectorItem),
			questions,
			closes,
			answers,
			questionArray = [],
			closeArray = [],
			answerArray = [],
			current = null;
			
		for(var i = 0; i < items.length; i++){

			questions = items[i].querySelectorAll(selectorQuestion);
			questionArray.push(questions);
			for(var a = 0; a < questions.length; a++){
				questions[a].addEventListener("click", openClose.bind(this, i, animation));
			}
			for(var a = 0; a < questions.length; a++){
				questions[a].classList.add('v-faq__question');
			}

			closes = items[i].querySelectorAll(selectorClose);
			closeArray.push(closes);
			for(var a = 0; a < closes.length; a++){
				closes[a].addEventListener("click", openClose.bind(this, i, animation));
			}
			for(var a = 0; a < closes.length; a++){
				closes[a].classList.add('v-faq__close');
			}

			answers = items[i].querySelectorAll(selectorAnswer);
			answerArray.push(answers);
			for(var a = 0; a < answers.length; a++){
				answers[a].classList.add('v-faq__answer');
			}
			
			items[i].setAttribute('data-v-faq', "true");
			items[i].classList.add('v-faq__item');
			
		}
		
		

		// open close
		
		function openClose(num, anim, e){

			if(e !== null) e.stopPropagation();

			if(num > items.length-1){
				return;
			}
			if(num < 0){
				return;
			}
			
			for(var i = 0; i < questionArray.length; i++){
				for(var a = 0; a < questionArray[i].length; a++){
					questionArray[i][a].classList.remove('v-faq__question_active');
				}
			}
			for(var i = 0; i < closeArray.length; i++){
				for(var a = 0; a < closeArray[i].length; a++){
					closeArray[i][a].classList.remove('v-faq__close_active');
				}
			}
			for(var i = 0; i < answerArray.length; i++){
				for(var a = 0; a < answerArray[i].length; a++){
					answerArray[i][a].classList.remove('v-faq__answer_active');
					$(answerArray[i][a]).stop().slideUp(anim);
				}
			}
			
			if(current !== num){

				for(var i = 0; i < questionArray[num].length; i++){
					questionArray[num][i].classList.add('v-faq__question_active');
				}
				for(var i = 0; i < closeArray[num].length; i++){
					closeArray[num][i].classList.add('v-faq__close_active');
				}
				for(var i = 0; i < answerArray[num].length; i++){
					answerArray[num][i].classList.add('v-faq__answer_active');
					$(answerArray[num][i]).slideDown(anim);
				}

				current = num;
				
			}
			else{

				current = null;
				
			}
			
		}

	};
	
	window.faq = faq('.v-faq', '.v-faq__item', '.v-faq__question', '.v-faq__answer', '.v-faq__close', 350);



});



// A Button Hover

var aButtonHoverArray = [];

function initAButtonHover(){
    var aButtonHover = document.querySelectorAll(".a-button-hover");
    for(var i = 0; i < aButtonHover.length; i++){
        if(aButtonHover[i].getAttribute("data-a-button-hover") !== null) continue;
        var spanText = aButtonHover[i].querySelector("span.text");
        if(spanText !== null){
            var newSpanText = document.createElement("div");
            newSpanText.classList.add("text");
            newSpanText.classList.add("text-1");
            newSpanText.innerHTML = '<span>' + spanText.innerHTML + '</span>';
            aButtonHover[i].appendChild(newSpanText);
            aButtonHover[i].setAttribute("data-a-button-hover", 'true');
            aButtonHoverArray.push(aButtonHover[i]);
        }
    }
}

function resizeAButtonHover(){
    for(var i = 0; i < aButtonHoverArray.length; i++){
        var text1Span = aButtonHoverArray[i].querySelector(".text-1 span");
        if(text1Span !== null){
            text1Span.style.width = Math.ceil(aButtonHoverArray[i].clientWidth+0.5) + 'px';
        }
        var line1Span = aButtonHoverArray[i].querySelector(".line-1-div span");
        if(line1Span !== null){
            line1Span.style.width = Math.ceil(aButtonHoverArray[i].clientWidth+0.5) + 'px';
        }
    }
}

initAButtonHover();
resizeAButtonHover();
window.addEventListener("load", function(){
    resizeAButtonHover();
}.bind(this));
window.addEventListener("resize", function(){
    resizeAButtonHover();
}.bind(this));





// Form

var v = {};
v.ajaxMaxTime = 1500;

// Form Event

$('form,input,select,textarea').attr("autocomplete", "off");

v.formEventForm = false;
v.formEventSubmit = false;
v.formEventInputsArray = [];

$.fn.serializeObject = function()
{
   var o = {};
   var a = this.serializeArray();
   $.each(a, function() {
       if (o[this.name]) {
           if (!o[this.name].push) {
               o[this.name] = [o[this.name]];
           }
           o[this.name].push(this.value || '');
       } else {
           o[this.name] = this.value || '';
       }
   });
   return o;
};

v.formEvent = function () {
    var _ref15 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        form: null,
        addClass: true,
        callback: function callback(form) {},
        callbackError: function callbackError(form) {},
        callbackDisabled: function callbackDisabled(disabled) {},
        scrollWrapSelector: "#wrap",
        scrollToInput: false,
        clear: true
    },
        _ref15$form = _ref15.form,
        form = _ref15$form === undefined ? null : _ref15$form,
        _ref15$addClass = _ref15.addClass,
        addClass = _ref15$addClass === undefined ? true : _ref15$addClass,
        _ref15$callback = _ref15.callback,
        callback = _ref15$callback === undefined ? function (form) {} : _ref15$callback,
        _ref15$callbackError = _ref15.callbackError,
        callbackError = _ref15$callbackError === undefined ? function (form) {} : _ref15$callbackError,
        _ref15$callbackDisabl = _ref15.callbackDisabled,
        callbackDisabled = _ref15$callbackDisabl === undefined ? function (disabled) {} : _ref15$callbackDisabl,
        _ref15$scrollWrapSele = _ref15.scrollWrapSelector,
        scrollWrapSelector = _ref15$scrollWrapSele === undefined ? "#wrap" : _ref15$scrollWrapSele,
        _ref15$scrollToInput = _ref15.scrollToInput,
        scrollToInput = _ref15$scrollToInput === undefined ? false : _ref15$scrollToInput,
        _ref15$clear = _ref15.clear,
        clear = _ref15$clear === undefined ? true : _ref15$clear;

    if (form === null) return false;
    v.formEventForm = form;
    v.formEventSubmit = form.querySelector("input[type='submit']");
    if (v.formEventSubmit === null) return false;

    v.formEventSubmit.setAttribute("disabled", 'disabled');
    callbackDisabled(v.formEventSubmit.disabled, v.formEventSubmit);

    var inputsArray = form.querySelectorAll("input:not([type='submit']):not([type='button']), textarea, select"),
        inputsObject = {},
        inputsJSON = void 0;

    for (var i = 0; i < inputsArray.length; i++) {
        var inputName = inputsArray[i].getAttribute("name");
        if (inputName === null || inputName === '') continue;
        inputsObject[inputName] = inputsArray[i].value;
    }

    // JSON

    v.formEventInputsArray = inputsArray;
    inputsJSON = $(v.formEventForm).serializeObject();

    var action = form.action;
    if (action === null || action === '') return false;

    var src = form.action;
    if (src === null || src === '') return false;

    // AJAX

    var refArguments = arguments[0];
    var currentPost = $.post(src, {
        inputs: inputsJSON
    }, afterPostFunction.bind(this, callback)).fail(function () {
        v.formEvent(refArguments);
    }.bind(this));

    setTimeout(function (p) {
        p.abort();
    }.bind(this, currentPost), v.ajaxMaxTime);

    // Callback

    function afterPostFunction(callback, data) {

        v.formEventSubmit.removeAttribute("disabled");
        callbackDisabled(v.formEventSubmit.disabled, v.formEventSubmit);

        for (var i = 0; i < v.formEventInputsArray.length; i++) {
            v.formEventInputsArray[i].classList.remove("error");
            var parent = v.formEventInputsArray[i].parentNode;
            if (parent.classList.contains("v-input")) {
                parent.classList.remove("error");
            }
        }

        if (data.substring(0, 2) !== 'ok') {

            if (data == "error") alert("error");

            if (addClass === true) {

                var dataArray = data.split(" "),
                    string = '';
                for (var _i11 = 0; _i11 < dataArray.length; _i11++) {
                    string += ", *[name='" + dataArray[_i11] + "']";
                }
                string = string.substring(2);

                var inputs = v.formEventForm.querySelectorAll(string);
                for (var _i12 = 0; _i12 < inputs.length; _i12++) {
                    inputs[_i12].classList.add("error");
                    var _parent = inputs[_i12].parentNode;
                    if (_parent.classList.contains("v-input")) {
                        _parent.classList.add("error");
                    }
                    if (scrollToInput === true) {
                        var scrollWrap = document.querySelector(scrollWrapSelector);
                        if (scrollWrap !== null) {
                            var inputOffset = $(inputs[_i12]).offset().top;
                            if (inputOffset < v.viewportHeight[1] / 2 || inputOffset > v.viewportHeight[1] * .75) {
                                $(scrollWrap).stop().animate({ scrollTop: $(scrollWrap).scrollTop() + inputOffset - v.viewportHeight[1] / 2 }, 500);
                            }
                        }
                    }
                }
            }

            callbackError.call(this, v.formEventForm, data);
        } else {

            for (var i = 0; i < v.formEventInputsArray.length; i++) {
                if (v.formEventInputsArray[i].getAttribute("type") !== 'hidden') {
                    if (clear === true) v.formEventInputsArray[i].value = '';
                }
            }

            callback.call(this, v.formEventForm, data);
        }
    }
};



var vForm = document.querySelector("#v-form"),
	vFormSuccess = document.querySelector("#v-form-success");
if(vForm !== null){
	
	vForm.onsubmit = function(e){
		e.preventDefault();
		v.formEvent({
			form: vForm,
			callback: function(){
				
				vForm.style.display = 'none';
				vFormSuccess.style.display = 'block';
				
				var formName = vForm.querySelector('input[name="name"]'),
					formSurname = vForm.querySelector('input[name="surname"]'),
					formAmount = vForm.querySelector('input[name="investment"]');
				
				ga('send', {
				  hitType: 'event',
				  eventCategory: 'Whitelist',
				  eventAction: formName + ' ' + formSurname,
				  eventLabel: formAmount
				});
				
			}.bind(this)
		});
	}.bind(this);
	
	
	var submitButton = document.querySelector("#v-form-submit-button"),
		submitA = document.querySelector("#v-form-submit");
		
	submitA.onclick = function(e){
		e.preventDefault();
		$(submitButton).click();
	}.bind(this);
	
}



/*** Events ***/

let gaEvent0 = document.querySelector("#ga-event-0"),
	gaEvent1 = document.querySelector("#ga-event-1");

gaEvent0.onclick = function(e){
	e.preventDefault();
	ga('send', {
	  hitType: 'event',
	  eventCategory: 'Whitelist',
	  eventAction: 'Click whitelist ',
	  eventLabel: 'First WL button '
	});
	setTimeout(function(){
		location.href = gaEvent0.getAttribute("href");
	}.bind(this), 500);
}.bind(this);

gaEvent1.onclick = function(e){
	e.preventDefault();
	ga('send', {
	  hitType: 'event',
	  eventCategory: 'Whitelist',
	  eventAction: 'Click whitelist ',
	  eventLabel: 'Second WL button '
	});
	setTimeout(function(){
		location.href = gaEvent1.getAttribute("href");
	}.bind(this), 500);
}.bind(this);