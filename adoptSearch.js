var fileType;
var cageListIsbn = [];
var cageListAuthors = [];
var cageListTitles = [];
var cageListQuantities = [];
var listFull = [];
var netsuiteList = [];

function handleFiles(files, whichList) 
{
  // Check for the various File API support.
  if (window.FileReader) 
    {//whichList has a value associated with the fileType
    //0 for adoptions
    //1 for cagelist
    //2 for backorders.
      fileType = whichList;
      getAsText(files[0]);
    } 
    else {alert('FileReader are not supported in this browser.');}
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
  if(event.target.error.name == "NotReadableError")
  {
    alert("Can't read file !");
  }
}

function processData(csv) {
  var allTextLines = csv.split(/\r\n|\n/);
  var lines = [];
  for (var i=0; i<allTextLines.length; i++) 
  {
    var data = allTextLines[i].split(';');
    var tarr = [];
    for (var j=0; j<data.length; j++) 
    {
      tarr.push(data[j]);
    }
    lines.push(tarr);
  }
  var listOfIsbn = [];
  var whereTheIsbnIs;
  if (fileType === 0) {whereTheIsbnIs = 3;}
  else {
    whereTheIsbnIs = 2; 
    listFull = lines;
  }
  for (var i = 0; i <lines.length; i++)
  {
    var str = lines[i] + '';
    var tempArray = str.split(',',5);
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
    listOfIsbn.push(tempArray[whereTheIsbnIs]);
    if (fileType === 1)
      {
        cageListAuthors.push(tempArray[0] + "," + tempArray[1]);
        cageListTitles.push(tempArray[whereTheIsbnIs + 1]);
        console.log ("There are " + tempArray[whereTheIsbnIs + 2] + " copies of " + tempArray[0] + tempArray[1]);
        cageListQuantities.push(tempArray[whereTheIsbnIs + 2]);
      }
    }
    else 
    {
      //console.log("line " + i + " doesn't end in a number.")
      listOfIsbn.push(tempArray[whereTheIsbnIs - 1]);
      if (fileType === 1)
      {
        cageListAuthors.push(tempArray[0]);
        cageListTitles.push(tempArray[whereTheIsbnIs]);
        console.log ("There are " + tempArray[whereTheIsbnIs + 1] + " copies of " + tempArray[0]);
        cageListQuantities.push(tempArray[whereTheIsbnIs + 1]);
      }
    }
  }
  
  //this would be better implemented through an AVL tree
  
  if (fileType === 1) {cageListIsbn=listOfIsbn;}
  else {netsuiteList=listOfIsbn;}
  //console.log(listOfIsbn);
}

function compareLists()
{
  var somethingFound = false;
  var results = "<h4 style='text-align:center'>Go get these books out of the cage!\t<i class='fas fa-print printIcon' onclick='javascript:window.print()'></i></h4>";
  results += "<table class='table table-striped table-hover'><tr><th scope='col'>Author</th>" +
                "<th scope='col'>ISBN</th><th scope='col'>Title</th><th scope='col'>Quantity</th></tr>"
  for (var i = 0; i < netsuiteList.length; i++)
  {
    for (var j = 1; j < cageListIsbn.length; j++)
    {
      if (netsuiteList[i] === cageListIsbn[j])
      {
        somethingFound = true;
        //console.log("I found something!");        
        //console.log(cageListIsbn[j]);
        //results += "<br>" + listFull[j];
        results += "<tr><td>" + cageListAuthors[j] + "</td><td>" + cageListIsbn[j] + 
          "</td><td>" + cageListTitles[j] + "</td><td>" + cageListQuantities[j] + "</td></tr>";
        
      }
    }
  }
  results += "</table><br><i style='color:red'>remember to remove these books from the cage list!<i>";
  if (!somethingFound) {results = "No results found.";}
  document.getElementById("results").innerHTML = results;
}

function searchISBN()
{
  var ISBN = document.getElementById("ISBNsearch").value;
  var somethingFound = false;
  var results = ISBN + " was found!";
  for (var i = 0; i < netsuiteList.length; i++)
  {
    if (netsuiteList[i] == ISBN)
    {
      somethingFound = true;
      results += "<br>" + listFull[i];
    }
  }
  var noResultsResponses = ["No results found", "yup, i've got nothing", "sorry chief, it's coming up empty", "nothing to see here", 
                            "it has not been backordered", "i promise, there's nothing", "go ahead and put it on the shelf", 
                            "there are about as many backorders for this book as i have friends, which is to say zero", 
                            "this book must suck because no one ordered it", "go ahead, scan the next one, nothing to see here", 
                            "nope no orders mam", "don't be mad, but i found nothing", "aaaaand no results",
                            "would you be shocked if I told you there are no orders on this book? you don't care? ok",
                            "i promise i checked thoroughly, but i found nothing", "mooooooom i can't find any orders for this boooook!!!",
                            "umm so like theres no results", "there's about as many orders here as there are lies in the book of mormon",
                            "the orders here are about as present as my father"];
  if (!somethingFound) {results = noResultsResponses[Math.floor(Math.random() * noResultsResponses.length)];} 
  document.getElementById("results").innerHTML = results;
}

var instructClicked = false;
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
