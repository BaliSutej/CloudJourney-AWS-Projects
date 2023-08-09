exports.handler = async (event, context) => {
    console.log("LAMBDA FUNCTION INVOKED");
    console.log("************************");
    console.log("EVENT");
    console.log(event);
    console.log("************************");
    console.log("CONTEXT");
    console.log(context);

    return buildResponse(200, { message: "Product Lambda Successfully Invoked" })
};


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
