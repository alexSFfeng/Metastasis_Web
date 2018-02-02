/* sign up function */
function submitSignup(e) {
  event.preventDefault();
  console.log("clicked signup submission button");
  var email = $("#userEmail").val().trim();
  var password = $("#userPass").val().trim();
  var passwordVer = $("#confirmedPass").val().trim();

  /* password validation */
  if (password != passwordVer) {
    alert("Please enter the same password");
    return;
  }

  /* call to server to import data */
  $.ajax({
    url: "/signup",
    method : "post",
    data: {
      useremail: email,
      pw: password
    },
    success: function(res) {
      console.log("success sign up");
      window.location.href=res;
    }
  });

}

/* login function */
function submitLogin(e){
  event.preventDefault();
  console.log("clicked login button");
  var email = $('#userEmail').val().trim();
  var password = $('#userPass').val().trim();

  /* call to server to match with user database info */
  $.ajax({
    url: "/login",
    method : "post",
    data : {
      useremail : email,
      userpw : password
    },
    success: function(res){
      console.log("success login");
      window.location.href=res;
    }
  });

}
