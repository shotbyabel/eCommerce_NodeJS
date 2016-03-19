(function() {
  'use strict';

  Stripe.setPublishableKey('pk_test_rKmTS7xeRVDUEOdBdPjB9EAS');


  $(function() {
    //**1 when user types something it will run an ajax call::
    $('#search').keyup(function() {
      // //keyup is jQuery function: listens to what "we are typing"
      var search_term = $(this).val();

      $.ajax({
        method: 'POST',
        url: '/api/search', //**2 it will send a POST req through the sever to this route..
        data: {
          search_term//**3 data is the search_term variable which is the value of the input text field from product-main.ejs "name="search_term"
        },
        dataType: 'json',
        //SUCCESS HANDLER...
        success: function(json) {
          //.map func from main-route.js router.get search route function***        
          var data = json.hits.hits.map(function(hit) {
            //**4 IF sucess we take the elasticSearch obj and apply the .map fucnction so loop through data//
            return hit;
          });
          // console.log(data); // console log keyup search

          //5** 'clean up..basically a HIDE and SHOW(append new objects) of search products.. 
          $('#searchResults').empty(); //from the <div> row ID in prodict-main.ejs: basically we want to make it "empty"
          for (var i = 0; i < data.length; i++) { //for loop here to display the search results..

            var html = ""; //defined our html hold as empty string
//copy SAME html design so it looks the same.. 
            html += '<div class="col-md-4">';
            html += '<a href="/product/' + data[i]._source._id + '">';//change products to data
            html += '<div class="thumbnail">';
            html += '<img src="' + data[i]._source.image + '">';
            html += '<div class="caption">';
            html += '<h3>' + data[i]._source.name + '</h3>';
            html += '<p>' + data[i]._source.category.name + '</h3>'
            html += '<p>$' + data[i]._source.price + '</p>';
            html += '</div></div></a></div>';

            $('#searchResults').append(html); //lastly SHOW/append search results.. 
          }

        },//success handler end

        error: function(error) {
          console.log(err);
        }
      });
    });
  });
  
////ADD BUTTON
  //button target with id of plus 
  $(document).on('click', '#plus', function(e) {
    e.preventDefault(); //prevent the page to be refreshed
    // parse value of text.. to do some calculations. 
    var priceValue = parseFloat($('#priceValue').val()); //priceValue from our product.ejs 
    var quantity = parseInt($('#quantity').val()); // //quantity from our product.ejs 
    //increment priceValue and add it to original price (price will always be the same thats why this increment is hidden)
    priceValue += parseFloat($('#priceHidden').val());
    //INCREMENT quantity    
    quantity += 1;
    //REPLACE previous html values with the NEW ones created with the Increments
    $('#quantity').val(quantity); //the hidden input 
    $('#priceValue').val(priceValue.toFixed(2));
    $('#total').html(quantity); //show user what's the current quanity amount.
  });
  ////SUBTRACT BUTTON
  //button target with id of minus now 
  $(document).on('click', '#minus', function(e) {
    e.preventDefault(); //prevent the page to be refreshed
    // parse value of text.. to do some calculations. 
    var priceValue = parseFloat($('#priceValue').val()); //priceValue from our product.ejs 
    var quantity = parseInt($('#quantity').val()); // //quantity from our product.ejs   
//PREVENT subtracting items/product past `1`
    if (quantity == 1) {
      priceValue = $('#priceHidden').val(); //value will always be original 1
      quantity = 1;
    } else {
      priceValue -= parseFloat($('#priceHidden').val());
      quantity -= 1; //minimumy you can subtract is 1
    }
    //REPLACE previous html values with the NEW ones created with the Increments
    $('#quantity').val(quantity); //the hidden input 
    // $('#priceValue').val(priceValue.toFixed(2));
    $('#total').html(quantity); //show user what's the current quanity amount.  

  });

////////////////////////////
 ////S T R I P E  FORM
// we take all the inputs from this form by attacking it to an id and a var
  function stripeResponseHandler(status, response) {
    var $form = $('#payment-form');//form id from cart.ejs

    if (response.error) {
      // Show the errors on the form
      $form.find('.payment-errors').text(response.error.message);//this class is on the form in cart.ejs
      $form.find('button').prop('disabled', false);
    } else {
      // response contains id and card, which contains additional card details
      var token = response.id;
      // Insert the token into the form so it gets submitted to the server
      $form.append($('<input type="hidden" name="stripeToken" />').val(token));//from main-routes var stripeToken
      // and submit
      $form.get(0).submit();
    }
  };

 //jQuery single use token **Invoke Stripe Response handler function**
 
  $('#payment-form').submit(function(event) {
    var $form = $(this);
    // Disable the submit button to prevent repeated clicks
    $form.find('button').prop('disabled', true);
    Stripe.card.createToken($form, stripeResponseHandler);
    // Prevent the form from submitting with the default action
    return false;
  });


})(); //IIFE -close