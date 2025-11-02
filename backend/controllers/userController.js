import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
// const sgMail = require('@sendgrid/mail')
import sgMail from '@sendgrid/mail'
import generateToken from '../utils/generateToken.js'
import nodemailer from 'nodemailer'
dotenv.config()
sgMail.setApiKey(process.env.SEND_GRID_API || "manna")

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  // console.log(user)

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      address: user.address,
      contact: user.contact,
      token: generateToken(user._id),
    })
  } else {
    res.status(401)
    throw new Error('Invalid email or password')
  }
})

//GET USER PROFILE
const getUserProfile = asyncHandler(async (req, res) => {
  //here req.user is coming from middleware
  const user = await User.findById(req.user._id)

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      address: user.address,
      contact: user.contact,
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

//register a new user
const verificationLink = asyncHandler(async (req, res) => {
  const { name, email, password, contact, address } = req.body
  const { phone_no } = contact
  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400)
    throw new Error('Email is already registered')
  }
  const validatename = name.length
  const validateaddress = address.length
  const validatePassword = password.length

  if (validatename < 3) {
    res.status(400)
    throw new Error('Name must be of 3 characters  or more length ')
  }

  if (validateaddress < 5) {
    res.status(400)
    throw new Error('Address must be of 5 characters  or more length ')
  }
  if (validatePassword < 6) {
    res.status(400)
    throw new Error('Password length must be greater than 5')
  }

  const validateContact = contact.phone_no.length
  if (validateContact !== 10) {
    res.status(400)
    throw new Error('Enter 10 digit mobile number')
  }

  if (!phone_no.startsWith('9')) {
    res.status(400)
    throw new Error('Mobile Number must start with 9')
  }
  const tokengenerate = jwt.sign(
    { name, email, password, contact, address },
    process.env.JWT_SECRET,
    { expiresIn: '10m' }
  )
  //send email to regitering user
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  // var transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: process.env.USER1,
  //     pass: process.env.PASSWORD,
  //   },
  // })
  // console.log('USER IS', process.env.USER1)
  // console.log(process.env.PASSWORD)
  const mailOptions = {
    from: process.env.USER1,
    to: email,
    subject: 'Verify your account',

    html: `<p>Please click on the link below to activate your account</p>
    <a href="${process.env.EMAIL_URL}/verify/${tokengenerate}">${process.env.EMAIL_URL}/verify/${tokengenerate}</a>`,
  }
  // var mailOptions = {
  //   from: 'KinBechSaman.com',
  //   to: email,
  //   subject: 'Verify your account',

  //   html: `<p>Please click on the link below to activate your account</p>
  //   <a href="${process.env.EMAIL_URL}/verify/${tokengenerate}">${process.env.EMAIL_URL}/verify/${tokengenerate}</a>`,
  // }

  sgMail.send(mailOptions, function (error, info) {
    if (error) {
      res.status(400)
      console.log('error occurred')
      throw new Error(error)
    } else {
      console.log('Email sent: ' + info.response)
      res.status(201).json({
        response:
          'A verification link has been sent to your Email. Verify it at first.',
      })
    }
  })
})
const registerUser = asyncHandler(async (req, res) => {
  // const { token } = req.body
  // const decoded = jwt.verify(token, process.env.JWT_SECRET)
  const { name, email, password, contact, address } = req.body
  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400)
    throw new Error('You have already been verified')
  } else {
    const user = await User.create({
      name,
      email,
      password,
      contact,
      address,
    })

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
        address: user.address,
        contact: user.contact,
      })
    } else {
      res.status(400)
      throw new Error('Invalid User Data')
    }
  }
  // if (token) {
  //   const decoded = jwt.verify(token, process.env.JWT_SECRET)
  //   const { name, email, password, contact, address } = decoded
  //   const userExists = await User.findOne({ email })

  //   if (userExists) {
  //     res.status(400)
  //     throw new Error('You have already been verified')
  //   } else {
  //     const user = await User.create({
  //       name,
  //       email,
  //       password,
  //       contact,
  //       address,
  //     })

  //     if (user) {
  //       res.status(201).json({
  //         _id: user._id,
  //         name: user.name,
  //         email: user.email,
  //         isAdmin: user.isAdmin,
  //         token: generateToken(user._id),
  //         address: user.address,
  //         contact: user.contact,
  //       })
  //     } else {
  //       res.status(400)
  //       throw new Error('Invalid User Data')
  //     }
  //   }
  // } else {
  //   res.status(404)
  //   throw new Error('No token found')
  // }
})

const emailSend = asyncHandler(async (req, res) => {
  const { receiver, text, name, address, productName, email, phone_no } =
    req.body
  console.log('user is', email)

  var mailOptions = {
    from: process.env.USER1,
    to: receiver,
    subject: 'You have a buyer',

    html: `<div style="background:#31686e;text-align:center;color:white">One of the KinBechSaman.com user wants
    to buy your ${productName}. </div><br/>
    <p>His/Her name is ${name} and is a resident of ${address}.His/Her
    email is: ${email} and registered contact no is: ${phone_no}.</p>

    He/She says:  ${text}`,
  }

  sgMail.send(mailOptions, function (error, info) {
    if (error) {
      res.status(400)
      throw new Error(error)
    } else {
      console.log('Email sent: ' + info.response)
      res.status(201).json({ response: 'Email Successfully Sent' })
    }
  })
})

//get all users by admin only

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
  res.json(users)
})

//delete user
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (user) {
    await user.remove()
    res.json({ message: 'User removed' })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})
//upadte user profile

const updateUserProfile = asyncHandler(async (req, res) => {
  // const user = await User.findById(req.params.id)
  const { name, email, password, address, phone_no } = req.body

  const user = await User.findById(req.params.id)

  if (user) {
    if (req.user._id.toString() === user._id.toString() || req.user.isAdmin) {
      ;(user.name = name || user.name),
        (user.email = email || user.email),
        (user.address = address || user.address),
        (user.password = password || user.password),
        (user.contact.phone_no = phone_no || user.contact.phone_no)
      const updatedUser = await user.save()
      res.status(201).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,

        address: updatedUser.address,
        contact: updatedUser.contact,
      })
    } else {
      res.status(401)
      throw new Error('You cannot perform this action')
    }
  } else {
    res.status(404)
    throw new Error('No user found')
  }
})

//get user by id

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password')

  if (
    (user && user._id.toString() === req.user._id.toString()) ||
    req.user.isAdmin
  ) {
    res.json(user)
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

export {
  authUser,
  getUserProfile,
  registerUser,
  emailSend,
  getUsers,
  deleteUser,
  updateUserProfile,
  getUserById,
  verificationLink,
}






















  // if (token) {
  //   const decoded = jwt.verify(token, process.env.JWT_SECRET)
  //   const { name, email, password, contact, address } = decoded
  //   const userExists = await User.findOne({ email })

  //   if (userExists) {
  //     res.status(400)
  //     throw new Error('You have already been verified')
  //   } else {
  //     const user = await User.create({
  //    









































// import asyncHandler from 'express-async-handler';
// import User from '../models/userModel.js';
// import dotenv from 'dotenv';
// import jwt from 'jsonwebtoken';
// import sgMail from '@sendgrid/mail';
// import generateToken from '../utils/generateToken.js';
// // Removed unused nodemailer import

// dotenv.config();

// // FIX 1: Use the correct API key variable name from .env
// sgMail.setApiKey(process.env.SENDGRID_API_KEY); 

// const authUser = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email });

//   if (user && (await user.matchPassword(password))) {
//     res.json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       isAdmin: user.isAdmin,
//       address: user.address,
//       contact: user.contact,
//       token: generateToken(user._id),
//     });
//   } else {
//     res.status(401);
//     throw new Error('Invalid email or password');
//   }
// });

// //GET USER PROFILE
// const getUserProfile = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id);

//   if (user) {
//     res.json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       isAdmin: user.isAdmin,
//       address: user.address,
//       contact: user.contact,
//     });
//   } else {
//     res.status(404);
//     throw new Error('User not found');
//   }
// });

// //register a new user - verification link step
// const verificationLink = asyncHandler(async (req, res) => { // Added async
//   const { name, email, password, contact, address } = req.body;
//   const { phone_no } = contact; // Destructure phone_no for easier access
//   const userExists = await User.findOne({ email });

//   if (userExists) {
//     res.status(400);
//     throw new Error('Email is already registered');
//   }
//   const validatename = name.length;
//   const validateaddress = address.length;
//   const validatePassword = password.length;

//   if (validatename < 3) {
//     res.status(400);
//     throw new Error('Name must be of 3 characters or more length');
//   }

//   if (validateaddress < 5) {
//     res.status(400);
//     throw new Error('Address must be of 5 characters or more length');
//   }
//   if (validatePassword < 6) {
//     res.status(400);
//     throw new Error('Password length must be greater than 5');
//   }

//   const validateContact = contact.phone_no.length; // Use contact.phone_no directly
//   if (validateContact !== 10) {
//     res.status(400);
//     throw new Error('Enter 10 digit mobile number');
//   }

//   if (!phone_no.startsWith('9')) { // Use phone_no directly
//     res.status(400);
//     throw new Error('Mobile Number must start with 9');
//   }
//   const tokengenerate = jwt.sign(
//     { name, email, password, contact, address },
//     process.env.JWT_SECRET,
//     { expiresIn: '10m' }
//   );

//   const mailOptions = {
//     // FIX 2: Use the correct sender email variable from .env
//     from: process.env.EMAIL_USER, 
//     to: email,
//     subject: 'Verify your account',
//     html: `<p>Please click on the link below to activate your account</p>
//            <a href="${process.env.CLIENT_URL}/verify/${tokengenerate}">${process.env.CLIENT_URL}/verify/${tokengenerate}</a>`, // Use CLIENT_URL for verification link
//   };

//   // FIX 3: Use try...catch with async/await for better error handling
//   try {
//     const info = await sgMail.send(mailOptions);
//     console.log('Verification email sent successfully:', info[0].statusCode, 'to:', email);
//     res.status(201).json({
//       response: 'A verification link has been sent to your Email. Verify it at first.',
//     });
//   } catch (error) {
//     console.error('Error sending verification email via SendGrid:');
//     if (error.response) {
//       console.error(JSON.stringify(error.response.body, null, 2));
//     } else {
//       console.error(error);
//     }
//     res.status(500); // Use 500 for server-side errors
//     throw new Error('Verification email could not be sent.');
//   }
// });

// // Final user registration after verification (if verification link is clicked)
// const registerUser = asyncHandler(async (req, res) => {
//   // Assuming verification happens via frontend link clicking, 
//   // this function now just creates the user.
//   // The token verification logic seems incomplete/commented out, 
//   // adjust as needed based on your flow.
//   const { name, email, password, contact, address } = req.body; // Assuming data comes from verified link handling
//   const userExists = await User.findOne({ email });

//   if (userExists) {
//     res.status(400);
//     throw new Error('User already exists/verified'); // Changed error message
//   } else {
//     const user = await User.create({
//       name,
//       email,
//       password,
//       contact,
//       address,
//     });

//     if (user) {
//       res.status(201).json({
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         isAdmin: user.isAdmin,
//         token: generateToken(user._id),
//         address: user.address,
//         contact: user.contact,
//       });
//     } else {
//       res.status(400);
//       throw new Error('Invalid User Data during creation');
//     }
//   }
// });

// // Send email (e.g., buyer contacting seller)
// const emailSend = asyncHandler(async (req, res) => { // Added async
//   const { receiver, text, name, address, productName, email, phone_no } = req.body;

//   const mailOptions = {
//     // FIX 2: Use the correct sender email variable from .env
//     from: process.env.EMAIL_USER, 
//     to: receiver, // The seller's email
//     subject: 'You have a potential buyer for your item!', // Clearer subject
//     html: `<div style="background:#31686e;text-align:center;color:white;padding:10px;">
//              Someone is interested in buying your ${productName} on SecondHandSeller!
//            </div><br/>
//            <p>Buyer's Name: ${name}</p>
//            <p>Buyer's Address: ${address}</p>
//            <p>Buyer's Email: ${email}</p>
//            <p>Buyer's Contact No: ${phone_no}</p>
//            <hr/>
//            <p>Message from buyer:</p>
//            <p>${text}</p>`,
//   };

//   // FIX 3: Use try...catch with async/await for better error handling
//   try {
//     const info = await sgMail.send(mailOptions);
//     console.log('Contact email sent successfully:', info[0].statusCode, 'to:', receiver);
//     res.status(201).json({ response: 'Email Successfully Sent to Seller' }); // More specific response
//   } catch (error) {
//     console.error('Error sending contact email via SendGrid:');
//     if (error.response) {
//       console.error(JSON.stringify(error.response.body, null, 2));
//     } else {
//       console.error(error);
//     }
//     res.status(500);
//     throw new Error('Contact email could not be sent.');
//   }
// });


// //get all users by admin only
// const getUsers = asyncHandler(async (req, res) => {
//   const users = await User.find({});
//   res.json(users);
// });

// //delete user
// const deleteUser = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.params.id);
//   if (user) {
//     await user.remove(); // Consider using deleteOne or findByIdAndDelete for newer Mongoose versions
//     res.json({ message: 'User removed' });
//   } else {
//     res.status(404);
//     throw new Error('User not found');
//   }
// });

// //update user profile
// const updateUserProfile = asyncHandler(async (req, res) => {
//   const { name, email, password, address, phone_no } = req.body;
//   const user = await User.findById(req.params.id); // Assuming ID comes from URL params

//   if (user) {
//     // Check if the user updating is themselves or an admin
//     if (req.user._id.toString() === user._id.toString() || req.user.isAdmin) {
//       user.name = name || user.name;
//       user.email = email || user.email; // Be careful allowing email changes - might need re-verification
//       user.address = address || user.address;
//       user.contact.phone_no = phone_no || user.contact.phone_no;
//       if (password) { // Only update password if provided
//         user.password = password;
//       }
      
//       const updatedUser = await user.save();
//       res.status(200).json({ // Use 200 OK for updates
//         _id: updatedUser._id,
//         name: updatedUser.name,
//         email: updatedUser.email,
//         isAdmin: updatedUser.isAdmin, // Include isAdmin status
//         address: updatedUser.address,
//         contact: updatedUser.contact,
//         token: generateToken(updatedUser._id), // Send updated token if needed
//       });
//     } else {
//       res.status(401); // Unauthorized
//       throw new Error('You cannot perform this action');
//     }
//   } else {
//     res.status(404);
//     throw new Error('No user found');
//   }
// });


// //get user by id
// const getUserById = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.params.id).select('-password');

//   // Allow admin to get any user, or user to get their own profile
//   if (user && (req.user.isAdmin || user._id.toString() === req.user._id.toString())) {
//     res.json(user);
//   } else {
//     res.status(404);
//     throw new Error('User not found or not authorized'); // More specific error
//   }
// });

// export {
//   authUser,
//   getUserProfile,
//   registerUser, // This now assumes verification happened elsewhere
//   emailSend,
//   getUsers,
//   deleteUser,
//   updateUserProfile,
//   getUserById,
//   verificationLink, // This sends the verification email
// };