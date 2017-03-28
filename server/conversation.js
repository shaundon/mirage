// Load config.
const config = require('../config.json');

const getRandomArrayElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getExtraMessage = () => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1 = January, 12 = December.
  const currentDayOfMonth = today.getDate();

  // Look at dates from config.
  if (config.dateMessages && config.dateMessages.length > 0) {
    for (let {dates,messages} of config.dateMessages) {
      // If any of the dates are today, get a random message.
      if (dates.includes(`${currentDayOfMonth}/${currentMonth}`)) {
        return getRandomArrayElement(messages);
      }
    }
  }
  return '';
};

const getMessage = () => {
  // Message varies depending on the time of day.
  const currentHour = new Date().getHours();

  // Midnight to 4:59am
  if (currentHour >= 0 && currentHour < 5) {
    return getRandomArrayElement([
      `You're up late!`,
      'Burning the midnight oil?',
      `Can't sleep?`
    ]);
  }
  // 5am to 7am
  if (currentHour >= 5 && currentHour < 7) {
    return getRandomArrayElement([
      `You're up early!`,
      'Rise and shine',
      `Too early, go back to sleep`
    ]);
  }
  // 7am to midday
  if (currentHour >= 7 && currentHour < 12) {
    return `Good morning`;
  }
  // Midday to 6pm
  if (currentHour >= 12 && currentHour < 18) {
    return `Good afternoon`;
  }
  // 6pm to 11:59pm
  if (currentHour >= 18 && currentHour <= 23) {
    return `Good evening`;
  }
  return 'Hello';
};

const get = () => {
  return new Promise((resolve, reject) => {
    resolve({
      message: getMessage(),
      extra: getExtraMessage()
    });
  });
};

module.exports = {get};
