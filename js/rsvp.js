(function($) {

    // smooth anchor
    $(document).on('click', 'a[href^="#"]', function (event) {
        event.preventDefault();

        $('html, body').animate({
            scrollTop: $($.attr(this, 'href')).offset().top
        }, 500);
    });

    let store = {
        current_user: '',
        current_code: null,
        rsvp_status: null,
        plus_one: false,
        linked_code: null,
        linked_user_name: '',
        linked_submit: false
    };

    // Dev
    let config = {
      url: 'http://localhost',
      port: '3000'
    };

    // Prod
    // let config = {
    //     url: 'http://localhost',
    //     port: ':3000'
    // };

    let toggleSection = function(newSection){
        // default
        $('#resubmit_rsvp').fadeOut();

        $('.rsvp_section').fadeOut('fast',function () {
            newSection.fadeIn('fast');
        });
    };

    let loadCodeSection = function(msg = false){
        if(msg)
            $('#rsvp_code_label').html(msg);
        else
            $('#rsvp_code_label').html('Sleutel asb in jou 3 syfer RSVP kode');

        toggleSection($('#code_section'));
    };

    let loadPartnerSection = function(){
        if(store.current_code){
            if(store.linked_user_name){
                $('#partner_link_label').html('Ons sien jy gaan saam <b>'+store.linked_user_name+'</b>, will jy vir hulle ook RSVP? ');

                $('#partner_rsvp label').html('En sien ons vir <b>'+store.linked_user_name+'</b> daar?');
                $('#partner_link_choice').html('Ja').on('click',function () {
                    if($(this).html() === 'Ja'){
                        $(this).html('Nee');
                        store.linked_submit = true;
                        $('#partner_rsvp').fadeIn();
                    }else{
                        $(this).html('Ja');
                        store.linked_submit = false;
                        $('#partner_rsvp').fadeOut();
                    }
                });
                $('#partner_link').fadeIn();
            }
        }
    };

    let loadRSVPSection = function(msg){
        $('#partner_rsvp').hide();
        $('#partner_link').hide();

        if(msg){
            $('.rsvp_attend label').html(msg);
        }else{
            $('.rsvp_attend label').html('Sien ons jou daar?');
        }

        if(store.current_code){
            if(store.current_user && store.current_user !== '')
                $('#rsvp_heading').html('Hi <b>'+store.current_user+'</b>!');

            if(store.linked_user_name && store.linked_user_name !== '')
                loadPartnerSection();

            toggleSection($('#rsvp_section'));
        }
    };

    let loadMessage = function(msg){
        if(msg)
            $('#rsvp_status_message').html(msg);

        toggleSection($('#message_section'));
    };

    let submitCode = function(code,callback){
        if(code) {
            // ajax call
            $.ajax({
                method: "GET",
                url: `${config.url}:${config.port}/guests/${code}`,
                // data: { name: "John", location: "Boston" }
            }).done(function (response) {
                if (response && response.length) {
                    store.current_code = response[0].rsvp_code;
                    store.current_user = response[0].guest_name;
                    store.rsvp_status = response[0].rsvp_status;
                    store.plus_one = response[0].plus_one;
                    store.linked_code = response[0].linked_to;

                    // IF user has a linked account - give option to RSVP for both
                    if (response[0].linked_to && response[0].linked_to !== ''){
                        $.ajax({
                            method: "GET",
                            url: `${config.url}:${config.port}/guests/${response[0].linked_to}`,
                        }).done(function (partner) {
                            if (partner && partner.length)
                                store.linked_user_name = partner[0].guest_name;
                        }).complete(function(){
                            // IF user has already submitted a response, give option to change
                            if (response[0].rsvp_status && response[0].rsvp_status != null && response[0].rsvp_status !== ''){
                                let status = response[0].rsvp_status === 'going' ? 'gaan' : 'gaan nie';
                                let msg = 'Volgens ons uhm.. boeke, het jy gese jy <b>'+status+'</b>';
                                loadMessage(msg);
                                $('#resubmit_rsvp').fadeIn();
                            }
                            else{
                                callback();
                            }
                        });
                    }else{
                        callback();
                    }
                }
            });
        }else{
            loadCodeSection('Kort daai 3 syfer kode asseblief ;)');
        }
    };

    let submitRSVP = function(code,rsvps,callback){
        $.ajax({
            method: "POST",
            url:`${config.url}:${config.port}/guests/${code}`,
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({rsvps})
        }).done(function(response) {
            callback('Perfek! baie dankie vir die laat weet - ons het dit so aangeteken :D');
            if(response)
                console.log(response)

        }).fail(function(error){
            console.log(error);
            callback('Hmmm... lyk my iets het verkeerd gegaan - laat weet my maar <a href="mailto:lukas.havenga@hotmail.com">direk!</a>');
        });
    };

    $('#code_section_submit').submit(function( event ) {
        event.preventDefault();
        code = $(this).find('input').val();
        submitCode(code,loadRSVPSection);
    });

    $('#rsvp_section_submit').submit(function( event ) {
        event.preventDefault();
        let code = store.current_code;
        let status = $(this).find('[name=attend]:checked').val();
        let notes = $(this).find('[name=message]').val();
        let rsvps = [{'status':status,'code':code,'notes':notes}];

        // Ensure RSVP is set for current user
        if(status){
            if(store.linked_submit){
                let partner_code = store.linked_code;
                let partner_status = $(this).find('[name=partner_attend]:checked').val();
                // There's no partner notes

                rsvps.push({'status':partner_status,'code':partner_code,'notes':notes});
            }

            submitRSVP(code,rsvps,loadMessage);
        }else{
            loadRSVPSection("Laat weet ons asseblief of jy sal kan bywoon");
        }
    });

    $('#backRSVP').on('click',function(){
       loadCodeSection();
    });

    $('#resubmit_rsvp').on('click',function(){
       loadRSVPSection();
    });

    // Default
    loadCodeSection();
})(jQuery);