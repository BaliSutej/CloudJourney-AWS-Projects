const {
    RDSDataClient,
    ExecuteStatementCommand,
    BeginTransactionCommand,
    CommitTransactionCommand,
    RollbackTransactionCommand
} = require("@aws-sdk/client-rds-data");

/**
 * This function is used to interact with Aurora Serverless DB, uses DataAPI's internally
 * @param {string} region - region of database
 * @param {object} params - Params object containing secretArn, database, resourceArn, sql, parameters
 */
const queryDatabase = async (region, params) => {
    try {
        const client = new RDSDataClient({ region: region });
        const command = new ExecuteStatementCommand(params);
        const data = await client.send(command);
        return data;
    } catch (error) {
        console.info("Error Occurred");
        console.error(error);
        throw new Error("Internal Error Occurred");
    }
};

/**
 * Function to begin transaction with Database
 * @param {string} region 
 * @param {object} params 
 * response 
 * {
 *      success: boolean,
 *      transactionId: number
 * }
 */
const beginTransaction = async (region, resourceArn, secretArn, database) => {
    try {
        const client = new RDSDataClient({ region: region });

        const command = new BeginTransactionCommand({
            resourceArn: resourceArn,
            secretArn: secretArn,
            database: database,
        });
        let response = await client.send(command);
        if (response.$metadata.httpStatusCode === 200) {
            return {
                success: true,
                transactionId: response.transactionId
            }
        } else {
            return {
                success: false
            }
        }

    } catch (error) {
        console.info("Error Occurred");
        console.error(error);
        throw new Error("Internal Error Occurred");
    }
};

/**
 * Function to commit transaction with database
 * @param {string} region 
 * @param {object} params 
 * @returns "{ transactionStatus: "STRING_VALUE"}"
 */
const commitTransaction = async (region, resourceArn, secretArn, transactionId) => {
    try {
        const client = new RDSDataClient({ region: region });

        const command = new CommitTransactionCommand({
            resourceArn: resourceArn,
            secretArn: secretArn,
            transactionId: transactionId
        });
        let response = await client.send(command);
        if (response.$metadata.httpStatusCode === 200) {
            return {
                success: true
            }
        } else {
            return {
                success: false
            }
        }
    } catch (error) {
        console.info("Error Occurred");
        console.error(error);
        throw new Error("Internal Error Occurred");
    }
}

/**
 * Function to rollback transaction with database
 * @param {string} region 
 * @param {object} params 
 * @returns "{ transactionStatus: "STRING_VALUE"}"
 */
const rollbackTransaction = async (region, resourceArn, secretArn, transactionId) => {
    try {
        const client = new RDSDataClient({ region: region });

        const command = new RollbackTransactionCommand({
            resourceArn: resourceArn,
            secretArn: secretArn,
            transactionId: transactionId
        });
        let response = await client.send(command);
        if (response.$metadata.httpStatusCode === 200) {
            return {
                success: true
            }
        } else {
            return {
                success: false
            }
        }
    } catch (error) {
        console.info("Error Occurred");
        console.error(error);
        throw new Error("Internal Error Occurred");
    }
}


module.exports = {
    queryDatabase,
    beginTransaction,
    commitTransaction,
    rollbackTransaction
};
