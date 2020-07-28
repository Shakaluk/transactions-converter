const request = require('request');
const config = require('./config');

const baseRequest = request.defaults({json: true});
const transactions = [];
const postOptions = {
    method: 'POST',
    url: config.postTransactionUrl,
    body: { transactions }
};

function processTransaction(transactionError, transactionResponse, transactionBody) {
    const transactionDay = new Date(transactionBody.createdAt);
    const exchangeUrl = `${config.exchangeServiceUrl}/${transactionDay.getFullYear()}-${transactionDay.getMonth() + 1}-${transactionDay.getDate()}?base=${config.convertingBase}`;

    baseRequest(exchangeUrl, (exchangeError, exchangeResponse, exchangeBody) => {
        let {createdAt, currency, amount, checksum} = transactionBody;
        let convertedAmountRaw = amount / exchangeBody.rates[transactionBody.currency];
        let convertedAmount = parseFloat(convertedAmountRaw.toFixed(4));

        transactions.push({createdAt, currency, amount, convertedAmount, checksum});

        transactions.length === config.transactionsCount && postTransactions();
    });
}

function postTransactions() {
    baseRequest(postOptions, (error, response, body) => {
        console.log(body);
    });
}

for (let i = 0; i < config.transactionsCount; i++) {
    baseRequest(config.getTransactionUrl, processTransaction);
}

// Some comment here