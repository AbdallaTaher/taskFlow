/**
 * Cross-Site Scripting (XSS) Sanitization Middleware
 * Defense-in-depth: strips dangerous HTML tags and script injections from request payloads
 * Explicitly preserves password fields to ensure user credential entropy is never corrupted.
 */

const EXCLUDED_FIELDS = ["password", "passwordConfirm", "passwordCurrent"];

function cleanValue(val, keyName = "") {
  if (EXCLUDED_FIELDS.includes(keyName)) {
    return val;
  }

  if (typeof val === "string") {
    return val
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:[^\s]*/gi, "")
      .replace(/<[^>]*>/g, "")
      .trim();
  }

  if (val && typeof val === "object" && !Array.isArray(val)) {
    const sanitizedObj = {};
    for (const [k, v] of Object.entries(val)) {
      sanitizedObj[k] = cleanValue(v, k);
    }
    return sanitizedObj;
  }

  if (Array.isArray(val)) {
    return val.map((item) => cleanValue(item, keyName));
  }

  return val;
}

function sanitizeXSS(req, res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = cleanValue(req.body);
  }
  next();
}

module.exports = sanitizeXSS;
