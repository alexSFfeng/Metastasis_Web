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
})
