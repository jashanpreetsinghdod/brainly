import express,{Request,Response} from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import z from "zod";
import { UserModel,ContentModel, LinkModel } from "./models/users";
import { userMiddleware } from "./middleware";
import { random } from "./utils";
const bcrypt=require("bcrypt");
dotenv.config();

const MONGO_URL=process.env.MONGO_URL as string;
const JWT_SECRET=process.env.JWT_SECRET as string;

mongoose.connect(MONGO_URL);

const app=express();
app.use(express.json());

const UserValidationSchema = z.object({
    username: z.string().min(2),
    password: z.string().min(8)
});

type UserType=z.infer<typeof UserValidationSchema>;


app.listen(3000,()=>{
    console.log("Listening to the port");
});

app.post("/api/v1/signup",async (req,res)=>{
    
    
    
    const {username,password}=req.body;
    const result=UserValidationSchema.safeParse({username,password});

    if(!result.success){
        res.status(411).json("Error in Inputs !");
        return;
    }
    
    try{
        const existingUser=await UserModel.findOne({username});

        if(existingUser){
             res.status(403).json("User Already Exists !");
             return;
        }
        const hashedPassword=await bcrypt.hash(password,10);

        await UserModel.create({username,password:hashedPassword});
        res.json("User Created Successfully!!");
        console.log("User Created!!");
    }catch(error){
        res.status(500).json("Error in Database !");
    }
})

app.post("/api/v1/signin",async (req,res)=>{
    const {username,password}=req.body;
    const user=await UserModel.findOne({username});
    if(!user){
        res.json("User doesn't exist");
        return;
    };
    const isValid=await bcrypt.compare(password,user.password);
    if(!isValid){
        res.status(403).send("Wrong email password!!!!");
        return;
    };
    const token = jwt.sign({id:user._id},JWT_SECRET);
    res.json({token:token});
    console.log(token);
})

app.post("/api/v1/content",userMiddleware,async (req,res)=>{
    const {title,link}=req.body;
    await ContentModel.create({title,link,userId:req.userId,tags:[]});

    res.json("Content Added!!");

})

app.get("/api/v1/content",userMiddleware,async (req,res)=>{
    const userId=req.userId;

    const content=await ContentModel.findOne({
        userId:userId
    }).populate("userId","username");

    res.json({content});

})

app.delete("/api/v1/content",userMiddleware,async (req,res)=>{
    const contentId=req.body.contentId;

    try{
    await ContentModel.deleteMany({
        _id:contentId
    });

    res.json("Deleted Content");
    }catch(error){
    res.json(error)
}

})

app.post("/api/v1/brain/share",userMiddleware,async(req,res)=>{
    const share=req.body.share;
    
    if(share){
        const existingLink=await LinkModel.findOne({
            userId:req.userId
        })
        if(existingLink){
            res.json({
                hash:existingLink.hash
            })
            return ;
        }
    
        const link=await LinkModel.create({
                userId:req.userId,
                hash:random(10)
        })
        res.json({
            hash:link.hash
        })
    }
    else{
        await LinkModel.deleteOne({
            userId:req.userId
        })

        res.json("Deleted the old link!!")
    }

    

    res.json("Updated sharable link!!")
})

app.get("/api/v1/brain/:shareLink",async (req,res)=>{
    const hash=req.params.shareLink;

    const link=await LinkModel.findOne({
        hash
    })

    if(!link){
        res.status(411).json("Link not found");
        return;
    }

    const content=await ContentModel.find({
        userId:link.userId
    })

})