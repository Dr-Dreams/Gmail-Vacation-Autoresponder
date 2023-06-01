# Gmail Vacation Autoresponder

This is a Node.js script that automates the process of setting up a vacation autoresponder for Gmail using the Gmail API from Google Cloud Platform. The script periodically checks for new incoming messages and sends an automated reply with a predefined vacation message. It also applies a label to the replied messages.

## Prerequisites

Before running the script, make sure you have the following:

1. Node.js installed on your machine.
2. A Gmail account.
3. Enabled Gmail API and obtained the credentials JSON file from the Google Cloud Platform.

## Setup

1. Clone the repository.
   ```bash
   git clone https://github.com/Dr-Dreams/Gmail-Vacation-Autoresponder.git
   ```
2. Navigate to the project directory.
   ```bash
   cd Gmail-Vacation-Autoresponder
   ```
3. Install the dependencies by running the following command in the project directory:
   ```bash
   npm install
   ```
4. Place the credentials JSON file obtained from the Google Cloud Platform in the project directory and name it `credentials.json`.
5. Create a vacations.json file in the project directory to store the vacation message details. The file should have the following format:
   ```json
   {
     "metadata": {
       "recipient_email": "your_email@example.com",
       "vacation_message": "I'm currently on vacation and will not be able to respond...",
       "label_name": "Vacation Autoresponse"
     }
   }
   ```
   Replace `your_email@example.com` with your own email address and customize the `vacation_message` and `label_name` according to your needs.
6. Run the script using the following command:
   ```bash
   node index.js
   ```
7. The script will prompt you to authorize the application by visiting a URL. Follow the instructions to authorize the script to access your Gmail account.
8. Once authorized, the script will start running and periodically check for new messages, send automated replies, and apply the specified label.

### Additional Configuration

You can modify the script behavior by adjusting the following variables:

- `SCOPES`: The authentication scopes required for accessing Gmail API. Modify this array if you need additional permissions.
- `TOKEN_PATH`: The path to the file where the authentication token will be stored after authorization. Change this if you want to use a different file name or location.
- `CREDENTIALS_PATH`: The path to the credentials JSON file obtained from the Google Cloud Platform. Update this if you named the file differently or placed it in a different location.

### Enabling Gmail API and Obtaining Credentials JSON File

1. Go to the Google Cloud Console
   - Visit the [Google Cloud Console](https://console.cloud.google.com/) website.
2. Create a New Project
   - Click on the project dropdown menu at the top of the page and select "New Project".
   - Enter a name for your project and click "Create".
3. Select the Project
   - Ensure that your newly created project is selected in the project dropdown menu.
4. Navigate to the API Library
   - In the left navigation menu, click on "APIs & Services" and then select "Library".
5. Search for Gmail API
   - In the API Library, use the search bar to find the "Gmail API" and click on it.
6. Enable the Gmail API
   - On the Gmail API page, click the "Enable" button to enable the API for your project.
7. Go to OAuth Consent Screen
   - Return to the left navigation menu and click on "OAuth Consent Screen".
8. Configure OAuth Consent Screen
   - Select the user type as "Internal".
   - Click on the "Create" button.
   - Enter the name of your app.
   - Enter the user_support_email Id.
   - Enter the Developer contact information email ID.
   - Skip the Scopes section by clicking on "Save and Continue".
   - Under "Test users" section, add at least one user.
   - Click on "Save and Continue" again.
   - Click back to go back to the dashboard.
9. Go to Credentials
   - Return to the left navigation menu and click on "Credentials".
10. Create OAuth Client ID
    - On the Credentials page, click the "Create credentials" button and select "OAuth client ID".
    - Select "Web application" as the application type.
    - In the "Authorised JavaScript origins" section, add "https://localhost:8080" as a javascript_origins.
    - In the "Authorized redirect URIs" section, add "http://localhost:8080/oauth2callback" as a redirect URI.
    - Click on Create.
11. Download Credentials JSON File
    - A dialog will appear displaying your newly created OAuth client ID. Click the "Download JSON" button to download the credentials JSON file.
    - Save the downloaded file in the project directory of your Gmail Vacation Autoresponder script and name it credentials.json.
12. Secure Your Credentials
    - Ensure that you keep the credentials JSON file secure and do not share it with anyone, as it contains sensitive information that grants access to your Gmail account.

Once you have completed these steps, you can proceed with the remaining setup process for your Gmail Vacation Autoresponder script as mentioned in the README.

### Conclusion

By following the setup instructions and customizing the vacation message and label details, you can use this script to automatically send vacation autoresponses for your Gmail account. Feel free to modify and extend the script according to your requirements.
