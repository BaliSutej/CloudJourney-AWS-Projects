

exports.handler = async (event, context) => {

    // let token = event.authorizationToken;
    const userId = event.headers.Auth;
    // console.log("******TOKEN********");
    // console.log(token);

    console.log(event);

    // const accessToken = token.replace("Bearer ", "");

    // Fix for Authorizer 403 Error - https://aws.amazon.com/premiumsupport/knowledge-center/api-gateway-lambda-authorization-errors/
    // TODO Change the variable naming if this fixes
    const tmp = event.methodArn.split(":");
    const apiGatewayArnTmp = tmp[5].split("/");

    // Create wildcard resource
    const resource =
        tmp[0] +
        ":" +
        tmp[1] +
        ":" +
        tmp[2] +
        ":" +
        tmp[3] +
        ":" +
        tmp[4] +
        ":" +
        apiGatewayArnTmp[0] +
        "/*/*";

    let payload;
    try {

        if (userId > 10) {
            return generatePolicy("user", "Deny", resource);
        }

    } catch (e) {
        // API Gateway wants this *exact* error message, otherwise it returns 500 instead of 401:
        console.log(e);
        throw new Error("Unauthorized");
    }

    return generatePolicy("user", "Allow", resource, userId);
};

// Help function to generate an IAM policy
var generatePolicy = function (principalId, effect, resource, userId) {
    var authResponse = {};

    authResponse.principalId = principalId;
    if (effect && resource) {
        const policyDocument = {};
        policyDocument.Version = "2012-10-17";
        policyDocument.Statement = [];
        const statementOne = {};
        statementOne.Action = "execute-api:Invoke";
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }

    // Optional output with custom properties of the String, Number or Boolean type.
    authResponse.context = {
        userId: userId
    };
    return authResponse;
};
