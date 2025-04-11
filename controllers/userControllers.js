const User = require('../models/User');
const Note = require('../models/Note');

const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

//get all users
//get request
//private route
const getAllUsers = asyncHandler(async (req,res) => {
  const users = await User.find().select('-password').lean();
  if(!users?.length){
    return res.status(400).json({message: 'No users found'});
  }
  res.json(users);
});

//create new users
//post request
//private route
const createUsers = asyncHandler(async (req,res) => {
    const {username, password, roles} = req.body;

    //check username,password,roles are present
    if(!username || !password || !Array.isArray(roles) || !roles.length){
      return res.status(400).json({message: 'All fields are required'});
    }
    
    //check for duplicate username
    const duplicate = await User.findOne({username}).lean().exec();
    if(duplicate){
      return res.status(409).json({message: 'Duplicate username'});
    }

    //create hash password using bcrypt
    const hashedPwd = await bcrypt.hash(password, 10);

    //saving the user in database
    const userObject = {username, "password": hashedPwd, roles};
    const user = await User.create(userObject);

    if(user) {
      return res.status(201).json({message: `New user ${username} created`});
    }
    else{
        res.status(400).json({message: 'Invalid user data received'});
    }

});

//update users
//put request
//private route
const updateUsers = asyncHandler(async (req,res) => {
 const {username,password,id,active,roles} = req.body;
 
 //check for all fields
 if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean'){
  return res.status(400).json({message: 'All fields are required'});
 }

 //find the user
 const user = await User.findById(id).exec();

 //return error if user not found
 if(!user){
  return res.status(400).json({message: 'User not found'});
 }

 //check for duplicate username
 const duplicate = await User.findOne({username}).lean().exec();
 if(duplicate && duplicate?._id.toString() !== id){
  return res.status(409).json({message: 'Duplicate username'});
 }

 user.username = username;
 user.roles = roles;
 user.isActive = active;

 //hashing the password
 if(password){
  user.password = await bcrypt.hash(password,10);
 }

 const updatedUser = await user.save();
 if(updatedUser) {
  return res.status(201).json({message: `User ${username} updated`});
 }  

});

//delete users
//delete request
//private route
const deleteUsers = asyncHandler(async (req,res) => {
    const {id} = req.body;

   if(!id) {
    return res.status(400).json({message: 'User ID required'});
    }

    //find for notes related to user
    const notes = Note.find({user: id}).lean().exec();
    if(notes?.length){
        return res.status(400).json({message: 'User has assigned notes'});
    }
    
    //finding user with id
    const user = await User.findById(id).exec();
    if(!user) {
        return res.status(400).json({message: 'user not found'})
    }

    //delete user from database
    const result = await user.deleteOne();

    if(!result) {
        return res.status(400).json({message: 'user not found'})
    }
    res.status(201).json({message: `Username with ID ${id} deleted`})
});

module.exports = {
    getAllUsers,
    createUsers,
    updateUsers,
    deleteUsers
}