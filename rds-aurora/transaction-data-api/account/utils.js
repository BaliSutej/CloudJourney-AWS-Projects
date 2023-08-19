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
    transactionId: "STRING_VALUE",
    };
 */
const beginTransaction = async (region, params) => {
    try {
        const client = new RDSDataClient({ region: region });

        const command = new BeginTransactionCommand(params);
        return await client.send(command);

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
const commitTransaction = async (region, params) => {
    try {
        const client = new RDSDataClient({ region: region });

        const command = new CommitTransactionCommand(input);
        return await client.send(command);
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
const rollbackTransaction = async (region, params) => {
    try {
        const client = new RDSDataClient({ region: region });

        const command = new RollbackTransactionCommand(params);
        return await client.send(command);

    } catch (error) {
        console.info("Error Occurred");
        console.error(error);
        throw new Error("Internal Error Occurred");
    }
}

/**
 * gives parameter object used to query
 * @param {string} sql
 * @param {string} secretArn
 * @param {string} database
 * @param {string} resourceArn
 * @returns {Object} params object
 */
function generateParams(sql, secretArn, database, resourceArn, paramSet) {
    let param;
    if (paramSet) {
        param = {
            secretArn: secretArn,
            database: database,
            resourceArn: resourceArn,
            sql: sql,
            parameterSets: paramSet
        };
    } else {
        param = {
            secretArn: secretArn,
            database: database,
            resourceArn: resourceArn,
            sql: sql,
            formatRecordsAs: "JSON"
        };
    }
    return param;
}

module.exports = {
    queryDatabase,
    beginTransaction,
    commitTransaction,
    rollbackTransaction,
    generateParams
};
