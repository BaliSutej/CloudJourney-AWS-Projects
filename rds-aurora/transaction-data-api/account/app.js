
const { beginTransaction, commitTransaction, rollbackTransaction } = require('./utils');
const { debitAmountFromAccount, creditAmountToAccount, getAccountBalance, creditAmountToAccountFail } = require('./db.service')

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {
    try {

        switch (event.transactionType) {
            case "success":
                return await successfulTransaction(event);
            case "failed":
                return await failedTransaction(event);
            default:
                return await successfulTransaction(event);
        }
    } catch (err) {
        console.log(err);
        return err;
    }
};


const successfulTransaction = async (event) => {

    const { secretsArn, databaseName, clusterArn, AWS_REGION } = process.env;

    // Check Account Balance Before Transaction

    let debitAccountDataResponse = await getAccountBalance(AWS_REGION, clusterArn, secretsArn, databaseName, event.data.debitAccountId);
    console.log("Debitor Account Balance - " + debitAccountDataResponse.data.balance);

    let creditAccountDataResponse = await getAccountBalance(AWS_REGION, clusterArn, secretsArn, databaseName, event.data.creditAccountId);
    console.log("Creditor Account Balance - " + creditAccountDataResponse.data.balance);

    // begin transaction 
    const transactionResponse = await beginTransaction(AWS_REGION, clusterArn, secretsArn, databaseName);
    if (!transactionResponse.success) {
        return buildResponse(502, { message: "Internal Error While Accessing Database" })
    }
    console.log("Begin Transaction");

    // debit amount 
    const deductAmountResponse = await debitAmountFromAccount(AWS_REGION, clusterArn, secretsArn, databaseName, event?.data?.debitAccountId, event?.data?.amount, transactionResponse.transactionId);
    if (!deductAmountResponse.success) {
        let rollbackTransactionResponse = await rollbackTransaction(AWS_REGION, clusterArn, secretsArn, transactionResponse.transactionId);
        if (!rollbackTransactionResponse.success) {
            return buildResponse(502, {
                message: "Internal Error While Accessing Database - RollBack Failed"
            })
        }

        return buildResponse(502, { message: "Internal Error While Accessing Database" })
    }

    // credit amount
    const creditAmountResponse = await creditAmountToAccount(AWS_REGION, clusterArn, secretsArn, databaseName, event?.data?.creditAccountId, event?.data?.amount, transactionResponse.transactionId);
    if (!creditAmountResponse.success) {
        let rollbackTransactionResponse = await rollbackTransaction(AWS_REGION, clusterArn, secretsArn, transactionResponse.transactionId);
        if (!rollbackTransactionResponse.success) {
            return buildResponse(502, {
                message: "Internal Error While Accessing Database - RollBack Failed"
            })
        }
        return buildResponse(502, { message: "Internal Error While Accessing Database" })
    }

    // commit transaction
    const commitTransactionResponse = await commitTransaction(AWS_REGION, clusterArn, secretsArn, transactionResponse.transactionId);
    if (!commitTransactionResponse.success) {
        let rollbackTransactionResponse = await rollbackTransaction(AWS_REGION, clusterArn, secretsArn, transactionResponse.transactionId);
        if (!rollbackTransactionResponse.success) {
            return buildResponse(502, {
                message: "Internal Error While Accessing Database - RollBack Failed"
            })
        }
        return buildResponse(502, { message: "Internal Error While Accessing Database" })
    }

    // Check Account Balance After Transaction

    debitAccountDataResponse = await getAccountBalance(AWS_REGION, clusterArn, secretsArn, databaseName, event.data.debitAccountId);
    console.log("Debitor Account Balance - " + debitAccountDataResponse.data.balance);

    creditAccountDataResponse = await getAccountBalance(AWS_REGION, clusterArn, secretsArn, databaseName, event.data.creditAccountId);
    console.log("Creditor Account Balance - " + creditAccountDataResponse.data.balance);

    return buildResponse(200, {
        message: "Transaction Successful",
    })
}

const failedTransaction = async (event) => {
    const { secretsArn, databaseName, clusterArn, AWS_REGION } = process.env;

    // Check Account Balance Before Transaction

    let debitAccountDataResponse = await getAccountBalance(AWS_REGION, clusterArn, secretsArn, databaseName, event.data.debitAccountId);
    console.log("Debitor Account Balance - " + debitAccountDataResponse.data.balance);

    let creditAccountDataResponse = await getAccountBalance(AWS_REGION, clusterArn, secretsArn, databaseName, event.data.creditAccountId);
    console.log("Creditor Account Balance - " + creditAccountDataResponse.data.balance);

    // begin transaction 
    const transactionResponse = await beginTransaction(AWS_REGION, clusterArn, secretsArn, databaseName);
    if (!transactionResponse.success) {
        return buildResponse(502, { message: "Internal Error While Accessing Database" })
    }
    console.log("Begin Transaction");

    // debit amount 
    const deductAmountResponse = await debitAmountFromAccount(AWS_REGION, clusterArn, secretsArn, databaseName, event?.data?.debitAccountId, event?.data?.amount, transactionResponse.transactionId);
    if (!deductAmountResponse.success) {
        let rollbackTransactionResponse = await rollbackTransaction(AWS_REGION, clusterArn, secretsArn, transactionResponse.transactionId);
        if (!rollbackTransactionResponse.success) {
            return buildResponse(502, {
                message: "Internal Error While Accessing Database - RollBack Failed"
            })
        }

        return buildResponse(502, { message: "Internal Error While Accessing Database" })
    }

    // credit amount
    const creditAmountResponse = await creditAmountToAccountFail(AWS_REGION, clusterArn, secretsArn, databaseName, event?.data?.creditAccountId, event?.data?.amount, transactionResponse.transactionId);
    if (!creditAmountResponse.success) {
        let rollbackTransactionResponse = await rollbackTransaction(AWS_REGION, clusterArn, secretsArn, transactionResponse.transactionId);
        if (!rollbackTransactionResponse.success) {
            return buildResponse(502, {
                message: "Internal Error While Accessing Database - RollBack Failed"
            })
        }

        // Check Account Balance After Rollback

        debitAccountDataResponse = await getAccountBalance(AWS_REGION, clusterArn, secretsArn, databaseName, event.data.debitAccountId);
        console.log("Debitor Account Balance - " + debitAccountDataResponse.data.balance);

        creditAccountDataResponse = await getAccountBalance(AWS_REGION, clusterArn, secretsArn, databaseName, event.data.creditAccountId);
        console.log("Creditor Account Balance - " + creditAccountDataResponse.data.balance);

        return buildResponse(502, { message: "Internal Error While Accessing Database" })
    }

    // commit transaction
    const commitTransactionResponse = await commitTransaction(AWS_REGION, clusterArn, secretsArn, transactionResponse.transactionId);
    if (!commitTransactionResponse.success) {
        let rollbackTransactionResponse = await rollbackTransaction(AWS_REGION, clusterArn, secretsArn, transactionResponse.transactionId);
        if (!rollbackTransactionResponse.success) {
            return buildResponse(502, {
                message: "Internal Error While Accessing Database - RollBack Failed"
            })
        }
        return buildResponse(502, { message: "Internal Error While Accessing Database" })
    }


    return buildResponse(200, {
        message: "Transaction Successful",
    })
}

function buildResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify(body)
    };
}
