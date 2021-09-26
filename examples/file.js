import { S3 } from "aws-sdk";
import { v4 } from "uuid";

// your bucket name
const bucketName = "tomasz-example-s3-bucket";

// creating instance of AWS S3 management object
const s3 = new S3();

// HTTP error class for an error response
class HTTPError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// getUser function for /user GET endpoint
export const getUser = async (event) => {
  try {
    // retrieves uuid from request path
    const uuid = getUUID(event);

    // it throws an Error if user doesn't exist
    await validateUserExists(uuid);

    // getting the object with aws-sdk, ".promise()" is required to use async-await
    const output = await s3
      .getObject({
        Bucket: bucketName,
        // Key is file name in AWS terminology
        Key: getUserFileName(uuid),
      })
      .promise();

    // output.Body contains the content of the S3 JSON file
    // we expect the file to not be empty, script doesn't fail if it is empty though
    const user = output.Body?.toString() || "";

    // return successfull response with the user
    return {
      statusCode: 200,
      body: user,
    };
  } catch (e) {
    // handles error response
    return getErrorResult(e);
  }
};

// extracts uuid from request path parameters
const getUUID = (event) => {
  const uuid = event.pathParameters["uuid"];

  // if uuid is non-existent throws HTTP error - bad request
  if (!uuid) {
    throw new HTTPError("Missing UUID", 400);
  }

  return uuid;
};

// gets file info from S3 and if the call is successful the return value is void
const validateUserExists = async (uuid) => {
  try {
    await s3
      .headObject({ Bucket: bucketName, Key: getUserFileName(uuid) })
      .promise();
  } catch (e) {
    // if head object fails we check for the error code
    if (e.code === "NotFound" || e.code === "NoSuchKey") {
      // in case code is "NotFoud" error is re-thrown as 404 HTTP error
      throw new HTTPError("user not found", 404);
    }

    // if we got unexpected error code we re-throw orignal error
    throw e;
  }
};

// returns user file name with "<uuid>.json" format
const getUserFileName = (uuid) => `${uuid}.json`;

// converts HTTPError or Error to APIGatewayProxyResult format (statusCode and message)
const getErrorResult = (e) => {
  // handle HTTPError
  if (e instanceof HTTPError) {
    return {
      statusCode: e.statusCode,
      body: JSON.stringify({ error: e.message }),
    };
  }

  // handle unknown error
  return {
    statusCode: 500,
    body: JSON.stringify(e),
  };
};

// postUser function for /user POST endpoint
export const postUser = async () => {
  try {
    // generate random uuid
    const uuid = v4();

    // create new JSON file with HTTP request body (new user)
    const user = await upsertUser(uuid, event.body);

    // respond with 201 created and newly created user
    return {
      statusCode: 201,
      body: JSON.stringify(user),
    };
  } catch (e) {
    // handle errorr
    return getErrorResult(e);
  }
};

// create or update user (S3 JSON file)
const upsertUser = async (uuid, body) => {
  // prepare user object from HTTP request body parsed to JSON and given uuid
  const user = {
    ...JSON.parse(body || "{}"),
    uuid,
  };

  // uploads a file to S3
  await s3
    .putObject({
      Bucket: bucketName,
      // <uuid>.json
      Key: getUserFileName(uuid),
      // contents of a file (stringified user object)
      Body: JSON.stringify(user),
    })
    .promise();

  return user;
};

// postUser function for /user PUT endpoint
export const putUser = async (event) => {
  try {
    // retrieve uuid from request path parameters
    const uuid = getUUID(event);

    // validate if user (JSON file) exists
    await validateUserExists(uuid);

    // update user (JSON file)
    const user = await upsertUser(uuid, event.body);

    // return successful response
    return {
      statusCode: 200,
      body: JSON.stringify(user),
    };
  } catch (e) {
    // handle error response
    return getErrorResult(e);
  }
};
