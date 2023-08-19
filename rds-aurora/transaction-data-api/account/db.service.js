const { queryDatabase, generateParams } = require("./utils")

const updateAccountBalanceById = async (processEnv, accountId, newBalance) => {
    let { secretsArn, databaseName, clusterArn, AWS_REGION } = processEnv;
    let sql = `update account
      set 
      balance = :newBalance,
      updated_at = now() 
      where account_id = :accountId`;

    let params = [
        {
            name: "newBalance",
            value: {
                doubleValue: newBalance
            }
        },
        {
            name: "accountId",
            value: {
                longValue: accountId
            }
        }
    ];

    let response = await queryDatabase(
        AWS_REGION,
        generateParamsWithSqlParams(
            sql,
            secretsArn,
            databaseName,
            clusterArn,
            params
        )
    );

    console.info("Update Account Balance DataAPI response");
    console.info(JSON.stringify(response));

    if (response.numberOfRecordsUpdated > 0) {
        return {
            success: true,
            message: "Updated Account Balance Successfully"
        };
    } else {
        return {
            success: false,
            message: "Could Not Update Account Balance"
        };
    }
};


module.exports = { getAccounts };