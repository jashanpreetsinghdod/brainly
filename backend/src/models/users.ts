import mongoose from "mongoose";
import {string, z} from "zod";

const {Schema,model} = mongoose;


const UserSchema= new Schema({
    username: {type:String,unique:true,},
    password: {type:String}
})

const ContentSchema= new Schema({
    title:String,
    link:String,
    tags:[{type:mongoose.Types.ObjectId,ref:'Tag'}],
    userId:{type:mongoose.Types.ObjectId,ref:'User',required:true}
})

const LinkSchema=new Schema({
    hash:String,
    userId:{type:mongoose.Types.ObjectId,ref:'User',unique:true},
})


export const LinkModel=model("Link",LinkSchema);
export const UserModel= model("User",UserSchema);
export const ContentModel= model("Content",ContentSchema);