var loginSignUp = new Vue({
  el : "#userForm",
  data : {
    isSignup : true
    /*clickedS : {
      backgroundColor : 'white'
    },
    clickedL : {
      backgroundColor : '#e6e7e8'
    }*/
  },/*
  watch:{
    isSignup : function(){
      if(isSignup){
        clickedS.backgroundColor = "white";
        clickedL.backgroundColor = "#e6e7e8";
      }
      else{
        clickedL.backgroundColor = "white";
        clickedS.backgroundColor = "#e6e7e8";
      }
    }
  },*/
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
