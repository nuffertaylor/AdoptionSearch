var fileType;
var cageList = [];
var listFull = [];
var netsuiteList = [];
var semStickers = [{semester:"181", html:'<span class="fa-stack fa-1x"> <i class="fa fa-circle fa-stack-2x" style="color:#0d009c"></i> <span class="fa fa-stack-1x" style="color:white;"> <span style="font-size:15px; margin-top:-1px; display:block;"> 181 </span> </span> </span>'},
                      {semester:"183", html:'<span class="fa-stack fa-1x"> <i class="fa fa-circle fa-stack-2x" style="color:#007822"></i> <span class="fa fa-stack-1x" style="color:white;"> <span style="font-size:15px; margin-top:-1px; display:block;"> 183 </span> </span> </span>'},
                      {semester:"184", html:'<span class="fa-stack fa-1x"> <i class="fa fa-circle fa-stack-2x" style="color:#007822"></i> <span class="fa fa-stack-1x" style="color:white;"> <span style="font-size:15px; margin-top:-1px; display:block;"> 184 </span> </span> </span>'},
                      {semester:"185", html:'<span class="fa-stack fa-1x"> <i class="fa fa-circle fa-stack-2x" style="color:#f5b922"></i> <span class="fa fa-stack-1x" style="color:white;"> <span style="font-size:15px; margin-top:-1px; display:block;"> 185 </span> </span> </span>'},
                      {semester:"191", html:'<span class="fa-stack fa-1x"> <i class="fa fa-circle fa-stack-2x" style="color:#6288f0"></i> <span class="fa fa-stack-1x" style="color:white;"> <span style="font-size:15px; margin-top:-1px; display:block;"> 191 </span> </span> </span>'},
                      {semester:"193", html:'<span class="fa-stack fa-1x"> <i class="fa fa-circle fa-stack-2x" style="color:#66ff00"></i> <span class="fa fa-stack-1x" style="color:white;"> <span style="font-size:15px; margin-top:-1px; display:block;"> 193 </span> </span> </span>'},
                      {semester:"195", html:'<span class="fa-stack fa-1x"> <i class="fa fa-circle fa-stack-2x" style="color:#d96c1e"></i> <span class="fa fa-stack-1x" style="color:white;"> <span style="font-size:15px; margin-top:-1px; display:block;"> 195 </span> </span> </span>'}];

function handleFiles(files, whichList)
{
  // Check for the various File API support.
  if (window.FileReader)
  { //whichList has a value associated with the fileType
    //0 for adoptions
    //1 for cagelist
    //2 for backorders.
    fileType = whichList;
    getAsText(files[0]);
  }
  else { alert('FileReader are not supported in this browser.'); }
}

function getAsText(fileToRead)
{
  var reader = new FileReader();
  // Read file into memory as UTF-8      
  reader.readAsText(fileToRead);
  // Handle errors load
  reader.onload = loadHandler;
  reader.onerror = errorHandler;
}

function loadHandler(event)
{
  var csv = event.target.result;
  processData(csv);
}

function errorHandler(event)
{
  if (event.target.error.name == "NotReadableError")
  {
    alert("Can't read file !");
  }
}

function processData(csv)
{
  var allTextLines = csv.split(/\r\n|\n/);
  var lines = [];
  for (var i = 0; i < allTextLines.length; i++)
  {
    var data = allTextLines[i].split(';');
    var tarr = [];
    for (var j = 0; j < data.length; j++)
    {
      tarr.push(data[j]);
    }
    lines.push(tarr);
  }
  var listOfIsbn = [];
  var whereTheIsbnIs;
  if (fileType === 0) { whereTheIsbnIs = 3; }
  else
  {
    whereTheIsbnIs = 2;
    listFull = lines;
  }
  for (var i = 0; i < lines.length; i++)
  {
    var str = lines[i] + '';
    var tempArray = str.split(',', 6);
    var tempStr = tempArray[whereTheIsbnIs] + '';
    /*usually the 4th element in the array is the ISBN, as str.split finds 3 commas before the ISBN.
    the thing is, the third comma is within the author's name, ie "Smith, J". (case 1) But some authors aren't saved this way, instead saved like "Hitt + Dyer" (case 2)
    If this is the case, the ISBN is the 3rd element in the array instead of the 4th. 
    So this code checks if the last char of the string is a number or not, if it isn't, its the second case.*/
    var tempStrEnd = tempStr[tempStr.length - 1];
    //to double check this really is the ISBN, we'll check if the first char is a 9. The first num of an isbn should always be a 9 on the cage list
    tempStr = tempStr[0];
    if ('0123456789'.includes(tempStrEnd) && tempStr === "9")
    {
      // Is a number
      let listObj = {};
      listObj.isbn = tempArray[whereTheIsbnIs];
      listOfIsbn.push(tempArray[whereTheIsbnIs]);
      if (fileType === 1)
      {
        let str = tempArray[0] + "," + tempArray[1];
        listObj.author = str.slice(1, str.length - 1);
        // NOW I need to account for if there are any commas in the title
        listObj.title = tempArray[whereTheIsbnIs + 1];
        listObj.quantities = tempArray[whereTheIsbnIs + 2];
        listObj.semester = tempArray[whereTheIsbnIs + 3];
        cageList.push(listObj);
      }
    }
    else
    {
      //console.log("line " + i + " doesn't end in a number.")
      let listObj = {};
      listObj.isbn = tempArray[whereTheIsbnIs - 1];
      listOfIsbn.push(tempArray[whereTheIsbnIs - 1]);
      if (fileType === 1)
      {
        listObj.author = tempArray[0];
        listObj.title = tempArray[whereTheIsbnIs];
        listObj.quantities = tempArray[whereTheIsbnIs + 1];
        listObj.semester = tempArray[whereTheIsbnIs + 2];
        cageList.push(listObj);
      }
    }
  }

  if (fileType === 0) { netsuiteList = listOfIsbn; }
}

function renderCageList()
{
  var results = "<h4 style='text-align:center'>THE CAGE LIST\t<i class='fas fa-print printIcon' onclick='javascript:window.print()'></i></h4>";
  results += "<table class='table table-striped table-hover'><thead><tr><th scope='col'>Author <i class='fas fa-angle-down'></i></th>" +
    "<th scope='col'>ISBN <i class='fas fa-angle-down'></i></th><th scope='col'>Title <i class='fas fa-angle-down'></i></th>" + 
    "<th scope='col'>Quantity <i class='fas fa-angle-down'></i></th><th>Semester <i class='fas fa-angle-down'></i></th></tr></thead><tbody>";
  for (var i = 1; i < cageList.length; i++)
  {
    results += "<tr><td>" + cageList[i].author + "</td><td>" + cageList[i].isbn +
          "</td><td>" + cageList[i].title + "</td><td>" + cageList[i].quantities + "</td>";
          let semListed = false;
          for (var j = 0; j < semStickers.length; j++)
          {
            if (semStickers[j].semester == cageList[i].semester)
            {
              results += "<td>" + semStickers[j].html + "</td></tr>";
              semListed = true;
              break;
            }
          }
          if(!semListed){results += '<td><span class="fa-stack fa-1x"> <i class="fa fa-question-circle fa-stack-2x" style="color:#5c5c5c"></i></td></tr>';}
  }
  results+="</tbody></table>"
  document.getElementById("table").innerHTML=results;
}

function compareLists()
{
  var somethingFound = false;
  var results = "<h4 style='text-align:center'>Go get these books out of the cage!\t<i class='fas fa-print printIcon' onclick='javascript:window.print()'></i></h4>";
  results += "<table class='table table-striped table-hover'><thead><tr><th scope='col'>Author <i class='fas fa-angle-down'></i></th>" +
    "<th scope='col'>ISBN <i class='fas fa-angle-down'></i></th><th scope='col'>Title <i class='fas fa-angle-down'></i></th>" + 
    "<th scope='col'>Quantity <i class='fas fa-angle-down'></i></th><th>Semester <i class='fas fa-angle-down'></i></th></tr></thead><tbody>";
  for (var i = 0; i < netsuiteList.length; i++)
  {
    for (var j = 1; j < cageList.length; j++)
    {
      if (netsuiteList[i] === cageList[j].isbn)
      {
        somethingFound = true;
        results += "<tr><td>" + cageList[j].author + "</td><td>" + cageList[j].isbn +
          "</td><td>" + cageList[j].title + "</td><td>" + cageList[j].quantities + "</td>";
          let semListed = false;
          for (var k = 0; k < semStickers.length; k++)
          {
            if (semStickers[k].semester == cageList[j].semester)
            {
              results += "<td>" + semStickers[k].html + "</td></tr>";
              semListed = true;
              break;
            }
          }
          if(!semListed){results += '<td><span class="fa-stack fa-1x"> <i class="fa fa-question-circle fa-stack-2x" style="color:#5c5c5c"></i></td></tr>';}
      }
    }
  }
  results += "</tbody></table><br><i style='color:red'>remember to remove these books from the cage list!<i>";
  if (!somethingFound) { results = "<h3>No results found.</h3>"; }
  document.getElementById("results").innerHTML = results;
}

window.onload=function(){
//this autoSubmits the isbn on scan for backorderSearch.html and ISBNConverter.html
var isbnTrue = document.getElementById("ISBNsearch");
if (isbnTrue)
{
  isbnTrue.addEventListener("keyup", function(event)
  {
    if (event.keyCode === 13)
    {
      event.preventDefault();
      document.getElementById("submitButton").click();
    }
  });
}
}

function searchISBN()
{
  var ISBN = document.getElementById("ISBNsearch").value;
  var altISBN = ISBNConversion(ISBN);

  var somethingFound = false;
  var results = ISBN + " was found!";
  var cardResults = '<div class="card text-center"><div class="card-body"><h5 class="card-title">';
  var numFound = 0;
  for (var i = 0; i < netsuiteList.length; i++)
  {
    if (netsuiteList[i] == ISBN || netsuiteList[i] == altISBN)
    {
      //the first time an item is found, somethingFound hasn't been set to true yet
      if(!somethingFound)
      {
        //remove first 14 digits
        let str = listFull[i] + '';
        let tempArray = str.split(',', 5);
        str = tempArray[1];
        str = str.slice(14,str.length);
        cardResults += str + '</h5>'
      }
      somethingFound = true;
      results += "<br>" + listFull[i];
      numFound++;
    }
  }
  if (numFound > 1) {cardResults += '<p class="card-text">There are ' + numFound + ' orders of this book!</p></div></div>';}
  else if (numFound == 1) {cardResults += '<p class="card-text">There is ' + numFound + ' order of this book!</p></div></div>';}
  var noResultsResponses = ["No results found", "yup, i've got nothing", "sorry chief, it's coming up empty", "nothing to see here",
    "it has not been backordered", "i promise, there's nothing", "go ahead and put it on the shelf",
    "there are about as many backorders for this book as i have friends, which is to say zero",
    "this book must suck because no one ordered it", "go ahead, scan the next one, nothing to see here",
    "nope no orders mam", "don't be mad, but i found nothing", "aaaaand no results",
    "would you be shocked if I told you there are no orders on this book? you don't care? ok",
    "i promise i checked thoroughly, but i found nothing", "mooooooom i can't find any orders for this boooook!!!",
    "umm so like theres no results", "there's about as many orders here as there are lies in the book of mormon",
    "the orders here are about as present as my father"
  ];
  if (!somethingFound) { results = noResultsResponses[Math.floor(Math.random() * noResultsResponses.length)]; }
  document.getElementById("alternateISBN").innerHTML = "Alternate ISBN: " + altISBN;
  if (somethingFound){document.getElementById("results").innerHTML = cardResults;}
  else {document.getElementById("results").innerHTML = results;}
  document.getElementById("ISBNsearch").focus();
  document.getElementById("ISBNsearch").select();
}

function ISBNConversion(ISBN)
{
  var altISBN;
  if (ISBN.length !== 13)
  {
    altISBN = "Invalid ISBN";
  }
  else if (ISBN[0] == '9')
  {
    let tempInt = parseInt(ISBN);
    if (ISBN[ISBN.length - 1] == '0') { tempInt = tempInt + 9; }
    else { tempInt--; }
    
    /* old logic
    //check if its an inpendent study book (although this rule only sometimes applies?)
    if (ISBN[2] == '9')
    {
      if (ISBN[ISBN.length - 1] == '0' || ISBN[ISBN.length - 1] == '1') { tempInt = tempInt + 8; }
      else { tempInt = tempInt - 2; }
    }
    else
    {
      if (ISBN[ISBN.length - 1] == '0') { tempInt = tempInt + 9; }
      else { tempInt--; }
    }*/
    
    tempInt = tempInt - 6880000000000;
    altISBN = tempInt.toString();
  }
  //creates the new ISBN to search for if the scanned book is used
  else if (ISBN[0] == '2')
  {
    let tempInt = parseInt(ISBN);
    
    if (ISBN[ISBN.length - 1] == '9') { tempInt = tempInt - 9; }
    else { tempInt++; }
    
    /* old logic
    //check if it's an independent study book
    if (ISBN[2] == '1')
    {
      //the only thing is some 291s convert to 978 and some to 979 and I have no clue which is when
      if (ISBN[ISBN.length - 1] == '9' || ISBN[ISBN.length - 1] == '8') { tempInt = tempInt - 8; }
      else { tempInt = tempInt + 2; }
    }
    else
    {
      if (ISBN[ISBN.length - 1] == '9') { tempInt = tempInt - 9; }
      else { tempInt++; }
    }
    */
    
    tempInt = tempInt + 6880000000000;
    altISBN = tempInt.toString();
  }
  else 
  {
    altISBN = "Invalid ISBN";
  }
  return altISBN;
}

function updateISBN()
{
  var altISBN = ISBNConversion(document.getElementById("ISBNsearch").value);
  document.getElementById("ISBNResults").value = altISBN;
  document.getElementById("ISBNResults").focus();
  document.getElementById("ISBNResults").select();
  if (document.getElementById("autoCopy").checked)
  {
    document.execCommand("copy");
  }
}

var instructClicked = false;
//makes instructions appear onclick
function showStuff()
{
  var myElement = document.getElementById("instructions");
  if (!instructClicked)
  {
    myElement.style.display = "block";
    document.getElementById("showMe").innerHTML = "okay i get it";
    instructClicked = true;
  }
  else
  {
    myElement.style.display = "none";
    document.getElementById("showMe").innerHTML = "show me";
    instructClicked = false;
  }
}
