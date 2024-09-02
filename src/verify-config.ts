function Error_INVALID_RADLEPUBLISH(gradlePublish: Boolean) {
  return {
    message: "Invalid `gradlePublish` option.",
    details: `The gradlePublish option, if defined, must be a \`Boolean\`.

Your configuration for the \`gradlePublish\` option is \`${gradlePublish}\`.`,
  };
}

export default async function verifyConfig(gradlePublish: Boolean) {
  if (!gradlePublish !== null && gradlePublish instanceof Boolean) {
    return null;
  } else {
    return Error_INVALID_RADLEPUBLISH(gradlePublish);
  }
}
