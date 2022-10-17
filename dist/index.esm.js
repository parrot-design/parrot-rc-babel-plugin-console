// @ts-ignore
const isArray = (arg) =>
  Object.prototype.toString.call(arg) === "[object Array]";
// @ts-ignore
const isFunction = (arg) =>
  Object.prototype.toString.call(arg) === "[object Function]";

const isProduction = process.env.NODE_ENV === "production";

// @ts-ignore
const isReserveComment = (node, commentWords) => {
  if (isFunction(commentWords)) {
    return commentWords(node.value);
  }
  return (
    ["CommentBlock", "CommentLine"].includes(node.type) &&
    (isArray(commentWords)
      ? commentWords.includes(node.value)
      : /(no[t]? remove\b)|(reserve\b)/.test(node.value))
  );
};

// @ts-ignore
const removeConsoleExpression = (path, calleePath, exclude, commentWords) => {
  // if has exclude key exclude this
  if (isArray(exclude)) {
    // @ts-ignore
    const hasTarget = exclude.some((type) => {
      return calleePath.matchesPattern("console." + type);
    });
    if (hasTarget) return;
  }

  const parentPath = path.parentPath;
  const parentNode = parentPath.node;

  let leadingReserve = false;
  let trailReserve = false;

  if (hasLeadingComments(parentNode)) {
    //traverse
    // @ts-ignore
    parentNode.leadingComments.forEach((comment) => {
      if (isReserveComment(comment, commentWords)) {
        leadingReserve = true;
      }
    });
  }

  if (hasTrailingComments(parentNode)) {
    //traverse
    // @ts-ignore
    parentNode.trailingComments.forEach((comment) => {
      if (isReserveComment(comment, commentWords)) {
        trailReserve = true;
      }
    });
  }
  console.log("===trailReserve==>",leadingReserve,trailReserve);
  if (!leadingReserve && !trailReserve) {
    path.remove();
  }
};

// @ts-ignore
// has leading comments
const hasLeadingComments = (node) => {
  const leadingComments = node.leadingComments;
  return leadingComments && leadingComments.length;
};

// @ts-ignore
// has trailing comments
const hasTrailingComments = (node) => {
  const trailingComments = node.trailingComments;
  return trailingComments && trailingComments.length;
};

const visitor = {
  // @ts-ignore
  CallExpression(path, { opts }) {
    const calleePath = path.get("callee");

    const { exclude, commentWords, env } = opts;

    if (calleePath && calleePath.matchesPattern("console", true)) {
      if (env === "production" || isProduction) {
        removeConsoleExpression(path, calleePath, exclude, commentWords);
      }
    }
  },
};

var index = () => {
  return {
    name: "@parrotjs/babel-plugin-console",
    visitor,
  };
};

export default index;
