/**
 * Advanced Google Apps Script for RSVP Form
 * Features:
 * - Stores form submissions in Google Sheets
 * - Validates incoming data
 * - Sends email notification for each submission
 * - Logs errors for troubleshooting
 */

// Configuration
const CONFIG = {
  // Set to your email to receive notifications
  NOTIFICATION_EMAIL: "your-email@example.com",
  
  // Column order in the spreadsheet
  COLUMNS: {
    TIMESTAMP: 0,
    WHOS_COMING: 1,
    CONTACT: 2,
    MESSAGE: 3
  }
};

/**
 * Handles POST requests from the website form
 */
function doPost(e) {
  try {
    // Parse the JSON data from the request
    const data = JSON.parse(e.postData.contents);
    
    // Validate required fields
    if (!data.whosComing || !data.contact) {
      return createResponse("error", "Missing required fields");
    }
    
    // Save to spreadsheet
    const result = saveToSheet(data);
    
    // Send email notification
    sendEmailNotification(data);
    
    // Return success response
    return createResponse("success", "RSVP received");
    
  } catch (error) {
    // Log the error for troubleshooting
    console.error("Error processing RSVP: " + error.toString());
    
    // Return error response
    return createResponse("error", "Failed to process RSVP");
  }
}

/**
 * Saves the form data to the spreadsheet
 */
function saveToSheet(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Format timestamp for better readability
  const timestamp = new Date(data.timestamp).toLocaleString();
  
  // Add a new row with the form data
  sheet.appendRow([
    timestamp,
    data.whosComing,
    data.contact,
    data.message || ""  // Handle empty message field
  ]);
  
  return true;
}

/**
 * Sends an email notification about the new RSVP
 */
function sendEmailNotification(data) {
  // Skip if no notification email is configured
  if (!CONFIG.NOTIFICATION_EMAIL) {
    return;
  }
  
  const subject = "New RSVP from " + data.whosComing;
  
  let body = "You received a new RSVP for your event!\n\n";
  body += "Who's Coming: " + data.whosComing + "\n";
  body += "Contact: " + data.contact + "\n";
  
  if (data.message) {
    body += "Message: " + data.message + "\n";
  }
  
  body += "\nTimestamp: " + new Date(data.timestamp).toLocaleString() + "\n";
  body += "\nThis email was sent automatically from your Google Apps Script.";
  
  // Send the email
  MailApp.sendEmail({
    to: CONFIG.NOTIFICATION_EMAIL,
    subject: subject,
    body: body
  });
}

/**
 * Creates a standardized response object
 */
function createResponse(status, message) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: status,
      message: message
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function that can be run manually from the Apps Script editor
 * to verify the script is working correctly
 */
function testScript() {
  const testData = {
    whosComing: "Test Person",
    contact: "test@example.com",
    message: "This is a test submission",
    timestamp: new Date().toISOString()
  };
  
  try {
    saveToSheet(testData);
    Logger.log("Test data saved to sheet successfully");
    
    sendEmailNotification(testData);
    Logger.log("Test email sent successfully");
    
    return "Test completed successfully";
  } catch (error) {
    Logger.log("Test failed: " + error.toString());
    return "Test failed: " + error.toString();
  }
} 