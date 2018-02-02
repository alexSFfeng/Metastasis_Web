$( document ).ready(function() {
  $( "#signUpForm" ).submit(function( event ) {
    alert( "Handler for .submit() called." );
    event.preventDefault();
  });
});

function submitSignup(e) {
  event.preventDefault();
  console.log("clicked signup submission button");
  var email = $("#userEmail").val().trim();
  var password = $("#userPass").val().trim();
  var passwordVer = $("#confirmedPass").val().trim();

  if (password != passwordVer) {
    alert("Please enter the same password");
    return;
  }

  $.ajax({
    type: "POST",
    url: "/ajax/reg?action=signup",
    data: {
      useremail: email,
      pw: password
    },
    success: function() {
      alert("successfully sent signup info");
    }
  });

}
