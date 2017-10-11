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
    var countDownDate = new Date("Nov 1, 2017 15:37:25").getTime();
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

        counterDays.html(days);
        counterHours.html(hours);
        counterMinutes.html(minutes);
        counterSeconds.html(seconds);


       /* document.getElementById("demo").innerHTML = days + "d " + hours + "h "
            + minutes + "m " + seconds + "s ";*/

        // If the count down is finished, write some text
        if (distance < 0) {
            clearInterval(x);
            document.getElementById("demo").innerHTML = "EXPIRED";
        }
    }, 1000);
}

//# sourceMappingURL=scripts.min.js.map
