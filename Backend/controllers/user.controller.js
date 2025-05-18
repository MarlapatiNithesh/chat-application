import uploadCloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Current user error: ${error.message}` });
  }
};

export const editProfile = async (req, res) => {
  try {
    const { name } = req.body;
    let imageUrl;

    if (req.file) {
      const uploadResult = await uploadCloudinary(req.file.path);
      imageUrl = uploadResult.url;
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (imageUrl) updateData.image = imageUrl;

    const user = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Edit profile error: ${error.message}` });
  }
};

export const getOtherUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.userId },
    }).select("-password");
    return res.status(200).json(users);
  } catch (errors) {
    return res.status(500).json({
      message: `Error getting other users: ${errors.message}
      `,
    });
  }
};

export const search = async (req, res) => {
  try{
    let {query} = req.query
    if(!query){
      return res.status(400).json({
        message: "Please provide a name to search"
      })
    }
    const users = await User.find({
      $or:[
        {name:{$regex:query,$options:"i"}},
        {userName:{$regex:query,$options:"i"}}
      ]
    }).select("-password")
    if(users.length === 0){
      return res.status(404).json({
        message: "No users found"
      })
    }
    return res.status(200).json(users)
  }catch(error){
    return res.status(500).json({
      message: `Error searching users: ${error.message}
      `,
    });
  }
}