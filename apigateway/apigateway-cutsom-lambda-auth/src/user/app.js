exports.handler = async (event, context) => {
    console.log("LAMBDA FUNCTION INVOKED");
    console.log("************************");
    console.log("EVENT");
    console.log(event);
    console.log("************************");
    console.log("CONTEXT");
    console.log(context);
};
