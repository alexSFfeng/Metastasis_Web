var displayData;
var currentShown;
const geneShownLimit = 10;
/* ------ search query : make ajax call to provide query conditions -------- */
function sendQuery(e){

  // info grabbing
  var gse_ID = $('#searchID').val().trim();
  var gender = $('#gender').val();
  var race = $('#race').val();
  var cancer_type = $('#cancer_type').val();
  var age_start = $('#Age_Start').val();
  var age_end = $('#Age_End').val();

  console.log("gse_id = " + gse_ID);
  console.log("gender = " + gender);
  console.log("race = " + race);
  console.log("cancer_type = " + cancer_type);
  console.log("age_start = " + age_start);
  console.log("age_end = " + age_end);

  /*--------------------------AGE RANGE CHECK ---------------------------*/
  if(age_start < 0 || age_end < 0){
    alert("Age must be in valid range");
    return;
  }

  // age requirements
  if(age_start == ""){age_start = 0;}
  if(age_end == ""){age_end = 999;}

  if(age_end < age_start){
    alert("Age end range must be greater or equal to aget start range");
    return;
  }

  // Data array url building
  var dataArr = [];

  if(gse_ID != undefined && gse_ID.length > 0){dataArr.push("gse_id="+gse_ID);}
  if(gender != undefined && gender != -1){dataArr.push("gender="+gender);}
  if(race != undefined && race.length > 0){dataArr.push("race="+race);}
  if(cancer_type != undefined && cancer_type != 0){dataArr.push("cancer_type="+cancer_type);}
  if(age_start != undefined){dataArr.push("age_start="+age_start);}
  if(age_end != undefined){dataArr.push("age_end="+age_end);}

  // building the target query url
  var targetURL = "/search";
  if (dataArr.length > 0) {
    targetURL += "?";
    var i = 0;
    while(i < dataArr.length){
      targetURL += dataArr[i];
      if (i < dataArr.length - 1) targetURL += "&";
      i++;
    }
  }
  console.log(targetURL);

  /*--------------------------AGE RANGE CHECK ---------------------------*/
  $.ajax({
    url: targetURL,
    method : "get",
    success : function(res){
      displayData = res;
      generateTable(displayData);
      alert("table generated");
    },
    error : function(res){
      alert("failed");
    }
  });

}

// generate the first table.
function generateTable(dataArr){

  // it is a new search so first empty previous tbody before populating new data.
  $('#dataTable > tbody').empty();

  if(dataArr.length == 0){
    alert("No results matched");
  }
  for( currentShown = 0; currentShown < dataArr.length &&
       currentShown < geneShownLimit; currentShown ++){
    $('#dataTable > tbody').append(
      '<tr> \
       <td><input type="checkbox" onclick="incChecked(this)" id=' + currentShown + '></input></td> \
       <td>' + dataArr[currentShown].gene + '</td> \
       <td>' + dataArr[currentShown].SD + '</td> \
       </tr>'
    );
  }
}

// show more data in the data array
function showMore(){
  var oldShown = currentShown;
  if(displayData != undefined){
    console.log(currentShown);

    // show more 10 more data entries
    for( ; currentShown < oldShown+geneShownLimit &&
         currentShown < displayData.length; currentShown ++){
      $('#dataTable > tbody').append(
        '<tr> \
         <td><input type="checkbox" onclick="incChecked(this)" id=' + currentShown + '></input></td> \
         <td>' + displayData[currentShown].gene + '</td> \
         <td>' + displayData[currentShown].SD + '</td> \
         </tr>'
      );
    }
  }
}

function insert_data() {
  $.ajax({
    url: "/insertdata",
    method: "post",
    success: function(rest) {
      console.log("inserted data");
      alert(res);
    }
  });
}
function delete_data() {
  $.ajax({
    url: "/deletedata",
    method: "post",
    success: function(rest) {
      console.log("deleted data");
      alert(res);
    }
  })
}
