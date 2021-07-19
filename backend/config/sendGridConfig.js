const api_key_array = [];

// The generator function
function* getApiKeys(limit) {
  let num = 0;

  while (true) {
    if (num === limit) num = 0;
    yield api_key_array[num++];
  }
}

const limit = api_key_array.length;
let apiKeys = getApiKeys(limit);

const configSendGrid = () => {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(api_key_array[2]);
  return sgMail;
};

module.exports = { configSendGrid, apiKeys };
