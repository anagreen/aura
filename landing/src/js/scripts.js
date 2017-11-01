$(function() {
    //click on menu button
    $('#js-menuBtn').on('click', function() {
        $(this).toggleClass('button-close--active');
        $('#js-mainNavigation').toggleClass('nav--open');
    });

    //click on navigation items
    $('#js-mainNavigation').on('click', '.nav__item:not(.nav__item--button)', handleClickToScroll);

    //init countdown
    initCounter();
});

function handleClickToScroll(e) {
    e.preventDefault();

    var docFragment = $(this).attr('href');
    var docFragmentOffset = $(docFragment).offset().top || 0;

    $('#js-mainNavigation').removeClass('nav--open');
    $('.button-close').removeClass('button-close--active');
    $('html,body').animate({scrollTop: docFragmentOffset}, 1000);
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
        complete: function() {
            $form.hide();
            afterSubmitText
                .html('Please, check your email to confirm subscription')
                .show();
        }
    });
}
