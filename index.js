const { authenticate } = require("@google-cloud/local-auth");
const fs = require("fs").promises;
const { google } = require("googleapis");
const path = require("path");
const { log } = require("console");

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthsOfYear = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

//Authentication Scopes
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.labels",
  "https://mail.google.com/",
];

// when the code runs for first time, it stores auth token and refresh tokens in token.json file.
const TOKEN_PATH = path.join(process.cwd(), "token.json");

// oAuth credentials for project of Google Cloud Platform.
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

// getting the vacation message details.
const VACATION_PATH = path.join(process.cwd(), "vacations.json");

// When user logging in for first time, we will store his auth token in token.json
// starting of save_credentials function................................................................
save_credentials = async (client) => {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
};
// ending of save_credentials function................................................................

// starting of load_saved_credentials_if_exists function................................................................
// it basically loads the auth token from token.json (if it already exists)
load_saved_credentials_if_exists = async () => {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
};
// ending of load_saved_credentials_if_exists function...................................................................

// starting of load_vacation_details function................................................................
// it basically loads the vacation_details
load_vacation_details = async () => {
  try {
    const content = await fs.readFile(VACATION_PATH);
    const vacation_details = JSON.parse(content);
    return vacation_details.metadata;
  } catch (err) {
    return null;
  }
};
// ending of load_vacation_details function................................................................

// stating of authorize function................................................................
authorize = async () => {
  // if user is already authenticated.
  let client = await load_saved_credentials_if_exists();
  if (client) {
    return client;
  }

  // if the user is logging in for 1st time
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });

  if (client.credentials) {
    await save_credentials(client);
  }

  return client;
};
// ending of authorize function...................................................................

// starting of get_unreplied_messages function................................................................
get_unreplied_messages = async (gmail) => {
  const res = await gmail.users.messages.list({
    userId: "me",
    q: "-in:chats -from:me -has:userlabels",
  });
  return res.data.messages || [];
};
// end of get_unreplied_messages function................................................................

// starting of send_reply function..................................................................
send_reply = async (message, gmail, recipient_email, vacation_message) => {
  const res = await gmail.users.messages.get({
    userId: "me",
    id: message.id,
    format: "full",
  });

  const headers = res.data.payload.headers;
  // console.log(
  //   Buffer.from(res.data.payload["parts"][0].body.data, "base64").toString(
  //     "utf-8"
  //   )
  // );

  let subject;
  let to;
  let reference;
  let in_reply_to;
  let message_time;
  headers.forEach((element) => {
    if (element.name.toLowerCase() === "subject") {
      subject = element.value;
    }
    if (element.name.toLowerCase() === "from") {
      to = element.value;
    }
    if (element.name.toLowerCase() === "message-id") {
      reference = element.value;
      in_reply_to = element.value;
    }

    if (element.name.toLowerCase() === "date") {
      const date = new Date(element.value);
      const dayOfWeek = daysOfWeek[date.getDay()];
      const dayOfMonth = date.getDate();
      const monthOfYear = monthsOfYear[date.getMonth()];
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      message_time = `On ${dayOfWeek}, ${dayOfMonth} ${monthOfYear} ${year} at ${hours}:${minutes
        .toString()
        .padStart(2, "0")}`;
    }
  });
  var str = [
    'Content-Type: text/plain; charset="UTF-8"\n',
    "MIME-Version: 1.0\n",
    "Content-Transfer-Encoding: 7bit\n",
    "References:",
    reference,
    "\n" + "In-Reply-To: ",
    in_reply_to,
    "\n" + "to: ",
    to,
    "\n",
    "from: ",
    recipient_email,
    "\n",
    "subject: ",
    subject,
    "\n\n",
    vacation_message,
    "\n\n",
    ...message_time,
    ", ",
    ...to,
    "wrote:",
    ...Buffer.from(res.data.payload["parts"][0].body.data, "base64").toString(
      "utf-8"
    ),
  ].join("");

  var encodedMailMessage = Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encodedMailMessage, threadId: res.data.threadId },
  });
};
// ending of send_reply function....................................................................

// Starting of create_label function................................................................
create_label = async (gmail, label_name) => {
  try {
    // if label is not already created, then create it
    const res = await gmail.users.labels.create({
      userId: "me",
      requestBody: {
        name: label_name,
        labelListVisibility: "labelShow",
        messageListVisibility: "show",
      },
    });
    log(`Your label ${label_name} has been created`);
    return res.data.id;
  } catch (error) {
    if (error.code === 409) {
      // Label already exists, then return it.
      const res = await gmail.users.labels.list({
        userId: "me",
      });
      const label = res.data.labels.find((label) => label.name === label_name);
      log(`Your label ${label_name} already exists`);
      return label.id;
    } else {
      throw error;
    }
  }
};
// ending of create_label function................................................................

// Starting of add_label function................................................................
add_label = async (message, labelId, gmail) => {
  await gmail.users.messages.modify({
    userId: "me",
    id: message.id,
    requestBody: {
      addLabelIds: [labelId],
      removeLabelIds: ["INBOX"],
    },
  });
};
// ending the add_label function................................................................

//Main function
main = async (auth) => {
  const gmail = google.gmail({ version: "v1", auth });

  // loading the vacation details.
  const { recipient_email, vacation_message, label_name } =
    await load_vacation_details();

  // Creating the label for the messages:
  const labelId = await create_label(gmail, label_name);

  // Repeat the following steps in random intervals between the 45 - 120 seconds.
  setInterval(async () => {
    // Get all that messages that have no prior replies
    const messages = await get_unreplied_messages(gmail);
    log(`Total ${messages.length} new messages have been received.`);

    // Itreating the messages
    for (const message of messages) {
      // Send reply to the message
      await send_reply(message, gmail, recipient_email, vacation_message);
      log(
        `Your vacation messages is replying to this message id ${message.id}.`
      );

      // Adding the label to the messages;
      await add_label(message, labelId, gmail);
      log(`Your message ${message.id} id has gone inside ${label_name} label.`);
    }
  }, Math.floor(Math.random() * 1 + 45) * 1000);
};

// end main method;

// starting the app
authorize().then(main).catch(console.error);