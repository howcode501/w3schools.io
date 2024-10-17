// This is an global function file for frontend //
// include dependencies files //
import axios from 'axios';
import { API_ROOT } from './config';
import Papa from 'papaparse';
import dayjs from 'dayjs';

// validate password //
function validatePassword(password) {
  if (password == undefined) {
    return { status: false, msg: "Password can't be undefined" };
  }
  if (password.trim() == '') {
    return { status: false, msg: 'Password is required' };
  }
  if (password.length <= 8) {
    return { status: false, msg: 'Password must be at least 8 characters' };
  }

  return { status: true, msg: 'Success' };
}

// sort groups and keep all user group at top
function customAllGroupSort(value_1, value_2) {
  return value_2 === 'All Users' ? 0 : value_1 < value_2 ? -1 : 1;
}

// forgot password api call //
async function forgotPassword_API(data, user = false) {
  let response = await axios
    .request({
      url: `${API_ROOT}/auth/forgot-password`,
      method: 'POST',
      data
    })
    .then((res) => {
      if (res.status === 200) {
        var txt =
          'We’ve sent you an email with a link to finish resetting your password.';
        if (user == true) {
          txt =
            'We’ve sent you an email with a link to finish resetting your password.';
        }
        return { status: true, msg: txt, link: res.data.resetLink };
      } else {
        return { status: false, msg: res.data.message };
      }
    })
    .catch((err) => {
      return { status: false, msg: err.response.data.error.message };
    });
  return response;
}

function camelCaseToTitleCase(text) {
  const result = text.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function generateRandomCode(
  NumberOfCodes = 1,
  codeCharacters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
  codeLength = 11
) {
  let generatedCode = '';
  let length = NumberOfCodes;

  if (codeCharacters == '') {
    codeCharacters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  }
  if (codeLength == '') {
    codeLength = 11;
  }

  return Array.from({ length: length }).map((i, e) => {
    let code = '';
    var textArray = codeCharacters.split('');

    if (NumberOfCodes > 1) {
      if (codeLength - generatedCode.length < 2) {
        code = oldPrefix;
      } else {
        code = generatedCode;
      }
    } else {
      code = generatedCode;
    }

    if (generatedCode === '') {
      while (code.length < codeLength) {
        var randomNumber = Math.floor(
          Math.random(codeLength) * textArray.length
        );
        code += textArray[randomNumber];
      }
    }

    return code;
  });
}

function readCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      //header: true,
      skipEmptyLines: true,
      complete: function async(results) {
        resolve(results.data);
      },
      error(err) {
        reject(err);
      }
    });
  });
}

function replaceSpacesWithUnderscore(str) {
  return str.replace(/ /g, '_');
}

function randomString() {
  //define a variable consisting alphabets in small and capital letter
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
  //specify the length for the new string
  var lenString = 7;
  var randomstring = '';

  //loop to select a new character in each iteration
  for (var i = 0; i < lenString; i++) {
    var rnum = Math.floor(Math.random() * characters.length);
    randomstring += characters.substring(rnum, rnum + 1);
  }

  return randomstring;
}

function calculateSubscriptionExpiraryDate(interval, frequency) {
  let expire_date = '1997-07-16T19:20:30.451Z';
  let days = 1; // For DAY
  // convert to days
  if (frequency === 'WEEK') {
    days = 7;
  }
  if (frequency === 'MONTH') {
    days = 30;
  }
  if (frequency === 'YEAR') {
    days = 365;
  }

  const totalDays = interval * days;
  expire_date = dayjs().add(totalDays, 'day').format('YYYY-MM-DDTHH:mm:ssZ');
  return expire_date;
}

const genRandomHex = (size) =>
  [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');

export {
  camelCaseToTitleCase,
  validatePassword,
  forgotPassword_API,
  customAllGroupSort,
  generateRandomCode,
  readCsv,
  replaceSpacesWithUnderscore,
  randomString,
  genRandomHex,
  calculateSubscriptionExpiraryDate
};
