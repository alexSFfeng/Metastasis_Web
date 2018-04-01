var searchBox = new Vue({
  el: "#advanceSearch",
  data: {
    drop : false
  },
  methods: {
    toggle : function(event){
      this.drop = !this.drop;
    }
  }
});

var dataTable = new Vue({
  el: "#dataTable",
  data: {
    rows : [
      {
        name : "alex",
        age : 19
      },
      {
        name : "tina",
        age: 19
      },
      {
        name : "wenyi",
        age: 19
      }
    ]
  }
});
