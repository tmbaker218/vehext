/*
Copyright 2020, 2021 Tom Baker

This file is part of the VEHEXT Health Questionnaire

The VEHEXT Health Questionnaire is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The VEHEXT Health Questionnaire is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with the VEHEXT Health Questionnaire.  If not, see <https://www.gnu.org/licenses/>.
*/

// Send google form data to a list of emails with the data in the form
//ignore the runtime error in line 9 about range type; it will not occur when activated with function trigger (i.e. after form submit)

function sendResponse(e) {
  //set up the spreadsheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  //get the range from OnFormSubmit
  var range = e.range;
  Logger.log("DEBUG: the range is "+range.getA1Notation());//DEBUG
  Logger.log(range);
 
  // get the data for the range
  var response = range.getValues();

  //0 is the timestamp
  //1 is the name
  //2 is the email
  //3: are you feeling sick?
  //4: contact with sick person?
  //5 used to be temp, now removed
  //5: Exposed to someone with COVID or a PUI
  //6: Live with someone who meets #6
  
  //Next, get the email  list
  var email=e.values[2];
  var emailList = ["vehext@rescue1.org", email];
  
  //Set email fields for all submissions
  var timeStamp = e.values[0];
  var name = e.values[1];
  //[2] for email was set above
  var q1= e.values[3];
  var q2 =e.values[4];
  //var temp=e.values[5]; //changed from numeric value to Yes/No per Landon's request to make it simpler
  //6 -> 5 per Harrison's request
  var q3=e.values[5];
  var q4=e.values[6];
  
  //first strip the time from the var timeStamp
  var formattedDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MM/dd/YYYY");

  //Then use templated HTML to pass variables into the emails
  
  //if they said "yes" or are febrile: HTML version
  if (q1 == "Yes" | q2 =="Yes" | q3 == "Yes" | q4 == "Yes"){
    var html = HtmlService.createTemplateFromFile("covid");
    html.name = name;
    html.date = formattedDate;
    var htmlOutput = html.evaluate().getContent();
  }
  
  else {
    var html = HtmlService.createTemplateFromFile("noncovid");
    html.name = name;
    html.date = formattedDate;
    var htmlOutput = html.evaluate().getContent();
  }
  
  // start a loop through the email data so only 1 recipeint is visible at once; prevent reply-all mishaps 
  for (var i=0; i<emailList.length; i++){
    MailApp.sendEmail({
      to: emailList[i],
      subject: "VEHEXT Health Questionnaire for " + name + " on " + formattedDate,
      htmlBody: htmlOutput,
    });
  }
}
