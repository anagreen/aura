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