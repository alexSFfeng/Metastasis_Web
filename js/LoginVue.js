var loginSignUp = new Vue({
  el : "#userForm",
  data : {
    isSignup : true
  },
  methods : {
    sign : function(event){
      this.isSignup = true;
      event.target.classList.add('active');
      document.getElementById('logId').classList.remove('active');
      console.log(this.isSignup);
    },
    log : function(event){
      this.isSignup = false;
      event.target.classList.add('active');
      document.getElementById('signId').classList.remove('active');
      console.log(this.isSignup);
    }
  }
})
