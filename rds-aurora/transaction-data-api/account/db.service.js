const { queryDatabase } = require("./utils")

const debitAmountFromAccount = async (AWS_REGION, clusterArn, secretArn, databaseName, accountId, amount, transactionId) => {
    let sql = `update account
      set 
      balance = balance - :amount
      where 
      account_id = :accountId
      and 
      balance >= :amount
      `;

    let params = [
        {
            name: "accountId",
            value: {
                longValue: accountId
            }
        },
        {
            name: "amount",
            value: {
                longValue: amount
            }
        }
    ];

    let response = await queryDatabase(
        AWS_REGION,
        {
            secretArn: secretArn,
            database: databaseName,
            resourceArn: clusterArn,
            sql: sql,
            parameters: params,
            transactionId: transactionId
        }
    );

    console.info("Deduct Amount From Account DataAPI response");
    console.info(JSON.stringify(response));

    if (response.$metadata.httpStatusCode === 200) {
        return {
            success: true,
            numberOfRecordsUpdated: response.numberOfRecordsUpdated
        }
    } else {
        return {
            success: false,
            message: "Some Error Occurred"
        }
    }
};

const creditAmountToAccount = async (AWS_REGION, clusterArn, secretArn, databaseName, accountId, amount, transactionId) => {
    let sql = `update account
      set 
      balance = balance + :amount
      where 
      account_id = :accountId`;

    let params = [
        {
            name: "accountId",
            value: {
                longValue: accountId
            }
        },
        {
            name: "amount",
            value: {
                longValue: amount
            }
        }
    ];

    let response = await queryDatabase(
        AWS_REGION,
        {
            secretArn: secretArn,
            database: databaseName,
            resourceArn: clusterArn,
            sql: sql,
            parameters: params,
            transactionId: transactionId
        }
    );

    console.info("Credit Amount From Account DataAPI response");
    console.info(JSON.stringify(response));

    if (response.$metadata.httpStatusCode === 200) {
        return {
            success: true,
            numberOfRecordsUpdated: response.numberOfRecordsUpdated
        }
    } else {
        return {
            success: false,
            message: "Some Error Occurred"
        }
    }
};

const getAccountBalance = async (AWS_REGION, clusterArn, secretArn, databaseName, accountId) => {
    let sql = `select balance 
        from account
        where account_id = '${accountId}'`;
    let response = await queryDatabase(
        AWS_REGION,
        {
            secretArn: secretArn,
            database: databaseName,
            resourceArn: clusterArn,
            sql: sql,
            formatRecordsAs: "JSON"
        }
    );
    console.info("Get Account Balance");
    console.info(JSON.stringify(response));
    if (response.$metadata.httpStatusCode === 200) {
        return {
            success: true,
            data: JSON.parse(response.formattedRecords)[0]
        }
    } else {
        return {
            success: false,
            message: "Some Error Occurred"
        }
    }

};

const creditAmountToAccountFail = async (AWS_REGION, clusterArn, secretArn, databaseName, accountId, amount, transactionId) => {
    // purposely sending success as false 
    return {
        success: false,
        message: "Some Error Occurred"
    }
};


module.exports = { debitAmountFromAccount, creditAmountToAccount, getAccountBalance, creditAmountToAccountFail };