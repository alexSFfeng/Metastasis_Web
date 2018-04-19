var boxesChecked = 0;

// increment the number of checkboxes checked
function incChecked (event){

  // keep track of the data rows checked
  if(event.checked){
    boxesChecked ++;
  }
  else{
    boxesChecked --;
  }

  /* only allow selecting two data rows at a time and only display then
     generate graph button if two rows are selected */
  if(boxesChecked == 2){
    $("input[type='checkbox']:not(:checked)").attr('disabled', true)
    d3.select("#graphBttn").style("display","table-row");
  }
  else{
    $("input[type='checkbox']").attr('disabled',false);
    d3.select("#graphBttn").style("display","none");
  }
}

function generateGraph(){
  popup.style.display="block";
}

/* popup modal box reaction */
var popup;

// read the element on load
window.onload = function(){
  popup = document.getElementById("modal");
}

// close the pop up login modal box
function closeModal(){
  popup.style.display="none";
}
