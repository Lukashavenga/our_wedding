(function($) {

    // smooth anchor
    $(document).on('click', 'a[href^="#"]', function(event) {
        event.preventDefault();

        $('html, body').animate({
            scrollTop: $($.attr(this, 'href')).offset().top
        }, 500);
    });

    var store = {
        current_user: '',
        current_code: null,
        rsvp_status: null,
        plus_one: false,
        linked_code: null,
        linked_user_name: '',
        linked_submit: false,
        bringing_plusone: false
    };

    // Dev
    // var config = {
    //  url: 'http://localhost:3000'
    // };

    // Prod
    var config = {
        url: 'https://lukashavenga.com'
    };

    var toggleSection = function(newSection) {
        // default
        $('#resubmit_rsvp').fadeOut('fast').promise().done(function() {
            $('.rsvp_section').fadeOut('fast').promise().done(function() {
                newSection.fadeIn('fast');
            });
        });
    };

    var loadCodeSection = function(msg) {
        if (msg) {
            $('#rsvp_code_label').html(msg);
        } else {
            $('#rsvp_code_label').html('Sleutel asb in jou 3 syfer RSVP kode');
        }

        toggleSection($('#code_section'));
    };

    var loadPartnerSection = function() {
        $('#partner_link_label').html('Jy gaan saam <b>' + store.linked_user_name + '</b>, will jy vir hulle ook RSVP? ');

        $('#partner_rsvp h4').html('En sien ons vir <b>' + store.linked_user_name + '</b> daar?');
        $('#partner_link_choice').val('Ja').off().on('click', function() {
            if ($(this).val() === 'Ja') {
                $(this).val('Nee');
                store.linked_submit = true;
                $('#partner_rsvp').fadeIn();
            } else {
                $(this).val('Ja');
                store.linked_submit = false;
                $('#partner_rsvp').fadeOut();
            }
        });
        $('#partner_link').fadeIn();
    };

    var loadPlusOneSection = function() {
        $('#partner_link_label').html('Jy het die opsie van \'n metgesel! Beplan u om iemand saam te bring?');
        $('#partner_link_choice').val('Ja').off().on('click', function() {
            if ($(this).val() === 'Ja') {
                $(this).val('Nee');
                store.bringing_plusone = true;
                $('#plusone_rsvp').fadeIn();
            } else {
                $(this).val('Ja');
                store.bringing_plusone = false;
                $('#plusone_rsvp').fadeOut();
            }
        });
        $('#partner_link').fadeIn();
    };

    var loadNoPlusOne = function() {
        $('#no_partner_link').html('Een plek is vir u gereserveer by ons bruilof').fadeIn();
    };

    var loadRSVPSection = function(msg) {
        // Defaults for RSVP section
        $('#partner_rsvp').hide();
        $('#partner_link').hide();
        $('#no_partner_link').hide();
        $('#plusone_rsvp').hide();

        if ($('body').find('[name=attend]:checked')[0]) {
            $('body').find('[name=attend]:checked')[0].checked = false;
        }

        if ($('body').find('[name=partner_attend]:checked')[0]) {
            $('body').find('[name=partner_attend]:checked')[0].checked = false;
        }

        if (msg) {
            $('.rsvp_attend.user h4').html(msg);
        } else {
            $('.rsvp_attend.user h4').html('*Sien ons jou daar?');
        }

        if (store.current_code) {
            if (store.current_user && store.current_user !== '') {
                $('#rsvp_heading').html('Hi <b>' + store.current_user + '</b>!');
            }

            if (store.linked_user_name && store.linked_user_name !== '') {
                loadPartnerSection();
            } else {
                if (store.plus_one && store.plus_one !== '') {
                    loadPlusOneSection();
                } else {
                    loadNoPlusOne();
                }
            }

            toggleSection($('#rsvp_section'));
        }
    };

    var loadMessage = function(msg) {
        if (msg) {
            $('#rsvp_status_message').html(msg);
        }

        toggleSection($('#message_section'));
    };

    var submitCode = function(code, callback) {
        if (code) {
            // ajax call
            $.ajax({
                method: "GET",
                url: config.url + '/guests/' + code,
            }).done(function(response) {
                if (response && response.length) {
                    store.current_code = response[0].rsvp_code || null;
                    store.current_user = response[0].guest_name || '';
                    store.rsvp_status = response[0].rsvp_status || null;
                    store.plus_one = response[0].plus_one || false;
                    store.linked_code = response[0].linked_to || null;
                    store.linked_user_name = null;
                    store.linked_submit = null;
                    store.bringing_plusone = null;

                    // IF user has a linked account - give option to RSVP for both
                    if (response[0].linked_to && response[0].linked_to !== '') {
                        $.ajax({
                            method: "GET",
                            url: config.url + '/guests/' + response[0].linked_to,
                        }).done(function(partner) {
                            if (partner && partner.length) {
                                store.linked_user_name = partner[0].guest_name;
                            }
                        }).complete(function() {
                            // IF user has already submitted a response, give option to change
                            if (response[0].rsvp_status && response[0].rsvp_status != null && response[0].rsvp_status !== '') {
                                var status = 'gaan';
                                if (response[0].rsvp_status === 'going') {
                                    status = 'gaan';
                                } else {
                                    status = 'gaan nie';
                                }
                                var msg = 'Volgens ons uhm.. boeke, het jy gese jy <b>' + status + '</b>';
                                loadMessage(msg);
                                $('#resubmit_rsvp').fadeIn();
                            } else {
                                callback();
                            }
                        });
                    } else {
                        // IF user has already submitted a response, give option to change
                        if (response[0].rsvp_status && response[0].rsvp_status != null && response[0].rsvp_status !== '') {
                            var status = 'gaan';
                            if (response[0].rsvp_status === 'going') {
                                status = 'gaan';
                            } else {
                                status = 'gaan nie';
                            }
                            var msg = 'Volgens ons uhm.. boeke, het jy gese jy <b>' + status + '</b>';
                            loadMessage(msg);
                            $('#resubmit_rsvp').fadeIn();
                        } else {
                            callback();
                        }
                    }
                }
            });
        } else {
            loadCodeSection("<span class='validation'>Kort daai 3 syfer kode asseblief ;) </span>");
        }
    };

    var submitRSVP = function(code, rsvps, callback) {
        var rsvpData = {};
        $.ajax({
            method: "POST",
            url: config.url + '/guests/' + code,
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({ rsvps: rsvps })
        }).done(function(response) {
            callback('Perfek! Baie dankie vir die laat weet - ons het dit so aangeteken!');
            $('#the_line').hide();
            $('#rsvp_by').hide();
            $('#no_kids').hide();
            $('#contact_me').hide();
            $('html, body').animate({
                scrollTop: $('#rsvp').offset().top - 50
            }, 500);
            if (response) {
                console.log(response);
                if (response.errno) {
                    callback('Hmmm... lyk my iets het verkeerd gegaan - <a class="rsvp_link" href="mailto:lukas.havenga@hotmail.com">laat weet my maar direk!</a>');
                }
            }

        }).fail(function(error) {
            console.log(error);
            callback('Hmmm... lyk my iets het verkeerd gegaan - <a class="rsvp_link" href="mailto:lukas.havenga@hotmail.com">laat weet my maar direk!</a>');
        });
    };

    $('#code_section_submit').submit(function(event) {
        event.preventDefault();
        code = $(this).find('input').val();
        submitCode(code, loadRSVPSection);
    });

    $('#rsvp_section_submit').submit(function(event) {
        event.preventDefault();
        var code = store.current_code;
        var status = $(this).find('[name=attend]:checked').val();
        var notes = $(this).find('[name=message]').val();
        var plusone = $(this).find('[name=plusone_name]').val();
        var rsvps = [{ 'status': status, 'code': code, 'notes': notes, 'plusone': plusone }];

        // Ensure RSVP is set for current user
        if (status) {

            // If bringing a plus one, require name
            if (!store.bringing_plusone || (store.bringing_plusone && plusone)) {
                if (store.linked_submit) {
                    var partner_code = store.linked_code;
                    var partner_status = $(this).find('[name=partner_attend]:checked').val();
                    // There's no partner notes

                    rsvps.push({ 'status': partner_status, 'code': partner_code, 'notes': notes, 'plusone': plusone });
                }

                submitRSVP(code, rsvps, loadMessage);
            } else {
                loadRSVPSection();
                $('#plusone_rsvp').show();
                $('#plusone_rsvp h4').html("<span class='validation'>Jou metgesel se Naam en Van?</span>");
            }
        } else {
            loadRSVPSection("<span class='validation'>Kies asseblief 'n opsie</span>");
        }
    });

    $('#backRSVP').on('click', function() {
        loadCodeSection();
    });

    $('#resubmit_rsvp').on('click', function() {
        loadRSVPSection();
    });

    // Default
    loadCodeSection();
})(jQuery);



var toggleMenu = function(){
    $('.gla_main_menu').next('.gla_main_menu_content').toggleClass('active');
    $('.gla_main_menu').next().next('.gla_main_menu_content_menu').toggleClass('active');
    $('.gla_main_menu').toggleClass('active');
};