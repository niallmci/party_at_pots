# Google Sheets Integration for RSVP Form

This guide explains how to connect your website's RSVP form to Google Sheets using Google Apps Script.

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name the spreadsheet "Wedding RSVP Responses"
3. In the first row, add these column headers:
   - Timestamp
   - Who's Coming
   - Contact
   - Message

## Step 2: Create a Google Apps Script

1. In your Google Sheet, click on **Extensions** > **Apps Script**
2. This will open the Apps Script editor in a new tab
3. Replace the default code with the following:

```javascript
function doPost(e) {
  // Parse the JSON data from the request
  const data = JSON.parse(e.postData.contents);
  
  // Get the active sheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Add a new row with the form data
  sheet.appendRow([
    data.timestamp,
    data.whosComing,
    data.contact,
    data.message
  ]);
  
  // Return a success response
  return ContentService
    .createTextOutput(JSON.stringify({ 'result': 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Save the project by clicking on the disk icon or pressing Ctrl+S (Cmd+S on Mac)
5. Name your project "RSVP Form Handler" and click OK

## Step 3: Deploy the Web App

1. Click on **Deploy** > **New deployment**
2. Click the gear icon next to "Select type" and choose **Web app**
3. Configure the deployment:
   - Description: "RSVP Form Handler"
   - Execute as: "Me"
   - Who has access: "Anyone"
4. Click **Deploy**
5. Authorize the app when prompted
6. Copy the Web app URL that appears after deployment

## Step 4: Update Your Website Code

1. Open your `script.js` file
2. Find the line `fetch('YOUR_GOOGLE_SCRIPT_URL_HERE', {`
3. Replace `YOUR_GOOGLE_SCRIPT_URL_HERE` with the URL you copied in Step 3

For example:
```javascript
fetch('https://script.google.com/macros/s/AKfycbzJx7S4Ew_example_url/exec', {
```

## Important Notes

- The Google Apps Script will execute using your Google account
- The script will have access to modify the Google Sheet
- The form on your website can be submitted by anyone who visits your site
- The `no-cors` mode in the fetch request means you won't receive detailed error responses from the server
- To test if submissions are working, check your Google Sheet for new entries

## Troubleshooting

If submissions aren't appearing in your Google Sheet:

1. Check the browser console for any JavaScript errors
2. Verify that the Google Script URL is correct
3. Make sure your Google Sheet has the correct column headers
4. Check that your Google Apps Script is deployed as a web app with "Anyone" access
5. Try redeploying your Google Apps Script with a new version number 