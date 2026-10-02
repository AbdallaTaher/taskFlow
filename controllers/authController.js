const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Email = require("../utils/email");
const cache = require("../utils/cache");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.cookie("jwt", token, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role || "user",
  });

  // Send branded welcome email to the newly registered user
  const clientOrigin = req.get("origin") || `${req.protocol}://${req.get("host")}`;
  const dashboardURL = `${clientOrigin}/dashboard`;

  try {
    await new Email(newUser, dashboardURL).sendWelcome();
  } catch (err) {
    console.error("Welcome email delivery notice:", err.message);
  }

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401),
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  let currentUser = cache.get(`user_session:${decoded.id}`);

  if (!currentUser) {
    currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(
        new AppError(
          "The user belonging to this token does no longer exist.",
          401,
        ),
      );
    }

    cache.set(`user_session:${decoded.id}`, currentUser, 60);
  }

  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }

    next();
  };
};

exports.getMe = (req, res) => {
  const user = req.user;
  user.password = undefined;

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
};

exports.logout = (req, res) => {
  if (req.user?._id) {
    cache.delete(`user_session:${req.user._id}`);
  }

  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    status: "success",
  });
};

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  const { passwordCurrent, password, passwordConfirm } = req.body;

  if (!passwordCurrent || !password || !passwordConfirm) {
    return next(
      new AppError(
        "Please provide your current password, new password, and password confirmation",
        400,
      ),
    );
  }

  // 1) Get user from collection (with password)
  const user = await User.findById(req.user.id).select("+password");

  // 2) Check if current password is correct
  if (!(await user.correctPassword(passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  // 3) Check if new password is the same as the current password
  if (
    passwordCurrent === password ||
    (await user.correctPassword(password, user.password))
  ) {
    return next(
      new AppError(
        "New password cannot be the same as your current password. Please choose a different password.",
        400,
      ),
    );
  }

  // 4) Update password and save (triggers pre-save hook for bcrypt hashing)
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();
  cache.delete(`user_session:${user._id}`);

  // 4) Log user in and send new token
  createSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Please provide your email address", 400));
  }

  // 1) Find user by email
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return next(
      new AppError("There is no user registered with that email address.", 404),
    );
  }

  // 2) Generate reset token and save (without full validation)
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Create reset URL (use frontend client origin if provided via headers)
  const clientOrigin = req.get("origin") || `${req.protocol}://${req.get("host")}`;
  const resetURL = `${clientOrigin}/reset-password/${resetToken}`;

  try {
    await new Email(user, resetURL).sendPasswordReset();
  } catch (err) {
    console.error("Password reset email delivery notice:", err.message);
  }

  res.status(200).json({
    status: "success",
    message: "Password reset token generated successfully!",
    resetToken,
    resetURL,
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  if (!password || !passwordConfirm) {
    return next(
      new AppError(
        "Please provide a new password and password confirmation",
        400,
      ),
    );
  }

  // 1) Get user based on the hashed token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+password");

  // 2) If token is invalid or has expired
  if (!user) {
    return next(
      new AppError("Token is invalid or has expired. Please request a new reset link.", 400),
    );
  }

  // 3) Check if new password is the same as the current password
  if (await user.correctPassword(password, user.password)) {
    return next(
      new AppError(
        "New password cannot be the same as your current password. Please choose a different password.",
        400,
      ),
    );
  }

  // 4) Update user password and clear reset tokens
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  cache.delete(`user_session:${user._id}`);

  // 4) Log the user in with new token
  createSendToken(user, 200, res);
});


