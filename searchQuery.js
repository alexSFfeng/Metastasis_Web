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
  /*--------------------------AGE RANGE CHECK ---------------------------*/

  $.ajax({
    url: '/search?gseID='+gse_ID+'&gender='+gender+'&race='+race+'&cancer_type='
    + cancer_type +'&agerange=' + age_start + "-"+ age_end,
    method : "get",
    data: {
      GSE_Id : gse_ID,
      Gender : gender,
      Patient_Race : race,
      Cancer_Type : cancer_type,
      Age_Start : age_start,
      Age_End : age_end
    },
    success : function(res){
      alert("success");
    },
    error : function(res){
      alert("failed");
    }
  });

}
