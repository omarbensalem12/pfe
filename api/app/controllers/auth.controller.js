const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
const crypto = require("crypto");
const nodemailer = require("nodemailer");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const sendVerificationEmail = async (email, verificationToken) => {
  //create a nodemailer transporter

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "rahmeniborhen7@gmail.com",
      pass: "roawnkrojkxppxwm",
    },
  });

  //compose the email message
  const mailOptions = {
    from: "threads.com",
    to: email,
    subject: "Email Verification",
    text: `please click the following link to verify your email http://localhost:8080/verify/${verificationToken}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("error sending email", error);
  }
};

exports.signup = (req, res) => {
  let photo
  let user
  try {
    photo = req.file.filename;
    user = new User({
      username: req.body.username,
      email: req.body.email,
      avatar: photo,
      password: bcrypt.hashSync(req.body.password, 8),
      verificationToken: crypto.randomBytes(20).toString("hex"),
    });
  } catch (error) {
    user = new User({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      verificationToken: crypto.randomBytes(20).toString("hex")
    });
  }


  try {
    sendVerificationEmail(user.email, user.verificationToken);
  } catch (error) {
    console.log(error.message);
  }

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles },
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          user.roles = roles.map((role) => role._id);
          user.save((err) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            res.send({ message: "User was registered successfully!" });
          });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.roles = [role._id];
        user.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({ message: "User was registered successfully!" });
        });
      });
    }
  });
};

exports.createDriver = (req, res) => {
  console.log(req.body)
  let photo
  let user
  try {
    photo = req.file.filename;
    user = new User({
      username: req.body.username,
      email: req.body.email,
      avatar: photo,
      password: bcrypt.hashSync(req.body.password, 8),
      address: {
        country: req.body["address.country"],
        state: req.body["address.state"],
        city: req.body["address.city"],
        street: req.body["address.street"],
        areaCode: req.body["address.areaCode"]
      },
      phone: req.body.phone,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      gender: req.body.gender

    });
  } catch (error) {
    user = new User({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      address: {
        country: req.body["address.country"],
        state: req.body["address.state"],
        city: req.body["address.city"],
        street: req.body["address.street"],
        areaCode: req.body["address.areaCode"]
      },
      phone: req.body.phone,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      gender: req.body.gender
    });
  }


  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles },
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          user.roles = roles.map((role) => role._id);
          user.save((err) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            res.send({ message: "User was registered successfully!" });
          });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.roles = [role._id];
        user.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({ message: "User was registered successfully!" });
        });
      });
    }
  });
};

exports.signin = (req, res) => {
  User.findOne({
    email: req.body.email,
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({ message: "Invalid Password!" });
      }

      const token = jwt.sign({ id: user.id },
        config.secret,
        {
          algorithm: 'HS256',
          allowInsecureKeySizes: true,
          expiresIn: 86400, // 24 hours
        });

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push(user.roles[i].name);
      }

      req.session.token = token;

      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: authorities,
        avatar: user.avatar,
        token
      });
    });
};

exports.signout = async (req, res) => {
  try {
    req.session = null;
    return res.status(200).send({ message: "You've been signed out!" });
  } catch (err) {
    this.next(err);
  }
};


exports.updateProfile = async (req, res) => {
  console.log(req.body)
  try {
    const userId = req.body.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    try {
      photo = req.file.filename;
      user.avatar = photo
    } catch (error) {
      console.log("no avatar update")
    }

    user.username = req.body.username
    user.email = req.body.email

    user.address = {
      country: req.body["address.country"],
      state: req.body["address.state"],
      city: req.body["address.city"],
      street: req.body["address.street"],
      areaCode: req.body["address.areaCode"],
    }
    user.phone = req.body.phone
    user.firstName = req.body.firstName
    user.lastName = req.body.lastName
    user.gender = req.body.gender

    await user.save()

    return res.status(201).json(user);

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error while getting the profile" });
  }

}


exports.search = async (req, res) => {
  const pageSize = req.query.pageSize || 10;
  const pageNumber = req.query.pageNumber || 1;

  const search = req.query.search || "";
  const regex = new RegExp(search, 'i');
  const query = {
    $or: [
      { 'email': { $regex: regex } },
      { 'username': { $regex: regex } }
    ],
  };

  // Count total number of documents
  User.countDocuments(query, (err, totalElements) => {
    if (err) {
      return res.status(500).send(err);
    }

    // Calculate total number of pages
    const totalPages = Math.ceil(totalElements / pageSize);

    // Fetch documents for the current page
    User.find(query)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec((err, results) => {
        if (err) {
          return res.status(500).send(err);
        }

        res.send({
          totalElements: totalElements,
          totalPages: totalPages,
          results: results
        });
      });
  });

}
