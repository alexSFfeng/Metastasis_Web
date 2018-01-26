module.exports = {
    signup: function (req, res) {
      var targetUserEmail = req.body.useremail;
      var targetPassword = req.body.pw;

      console.log("get user's email: " + targetUserEmail);
      console.log("get user's pw: " + targetPassword);
      res.success();
    }
}
