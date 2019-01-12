const request = require('request-promise-native');
const config = require('./config');

const baseRequest = request.defaults({json: true});
const transactions = [];
const postOptions = {
    method: 'POST',
    url: config.postTransactionUrl,
    body: { transactions }
};

async function runConverter() {
    const promiseArray = [];
    let result;

    for (let i = 0; i < config.transactionsCount; i++) {
        promiseArray.push(processTransaction());
    }

    try {
        await Promise.all(promiseArray);
        result = await baseRequest(postOptions);
    } catch (ex) {
        console.error(ex);
    }

    console.log(result);
}

async function processTransaction() {
    const transaction = await baseRequest(config.getTransactionUrl);

    const transactionDay = new Date(transaction.createdAt);

    const exchangeUrl = `${config.exchangeServiceUrl}/${transactionDay.getFullYear()}-${transactionDay.getMonth() + 1}-${transactionDay.getDate()}?base=${config.convertingBase}`;

    const exchangeResults = await baseRequest(exchangeUrl);

    const {createdAt, currency, amount, checksum} = transaction;

    const convertedAmountRaw = amount / exchangeResults.rates[transaction.currency];
    const convertedAmount = parseFloat(convertedAmountRaw.toFixed(4));

    transactions.push({createdAt, currency, amount, convertedAmount, checksum});
}

runConverter();