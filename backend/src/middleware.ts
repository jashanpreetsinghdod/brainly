import express, { NextFunction, Request,Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET=process.env.JWT_SECRET as string;

export function userMiddleware(req:Request,res:Response,next:NextFunction){
    const header=req.headers["authorization"];

    const decoded=jwt.verify(header as string,JWT_SECRET) as {id:string};

    if(decoded){
        req.userId=decoded.id;
        next();
    }
    else{
        res.status(403).json({message:"Unauthorized"});
    }
}