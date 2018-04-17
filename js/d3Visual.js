var boxesChecked = 0;
function incChecked (event){

  if(event.checked){
    boxesChecked ++;
  }
  else{
    boxesChecked --;
  }
  console.log(boxesChecked);
  if(boxesChecked == 2){
    $("input[type='checkbox']:not(:checked)").attr('disabled', true)

    d3.select("#graphBttn").style("display","table-row");
  }
  else{
    $("input[type='checkbox']").attr('disabled',false);
    d3.select("#graphBttn").style("display","none");
  }
}
