/* sign up function */
function submitSignup(e) {
  event.preventDefault();
  console.log("clicked signup submission button");
  var email = $("#userEmail").val().trim();
  var password = $("#userPass").val().trim();
  var passwordVer = $("#confirmedPass").val().trim();

  if(email == "" || password == "" || passwordVer == ""){
    alert("Please fill out all fields");
    return;
  }

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
      console.log(res);
    }
  });

}

/* login function */
function submitLogin(e){
  event.preventDefault();
  console.log("clicked login button");
  var email = $('#userEmail').val().trim();
  var password = $('#userPass').val().trim();

  if(email == "" || password == ""){
    alert("Please fill out all fields");
    return;
  }

  /* call to server to match with user database info */
  $.ajax({
    url: "/login",
    method : "post",
    data : {
      useremail : email,
      userpw : password
    },
    success : function(res){
      alert("success login");
      console.log(res);
      window.location.href=res;
    },
    error : function(res){
      alert("Incorrect Password");
      $('#userPass').val("");
      console.log($('#userPass').val());
    }
  });

}
