import express from "express";
import Usermodel from "../models/Usermodel.js";
import bcrypt from "bcrypt"

const Authrouter = express.Router()

Authrouter.post("/register", async (req,res)=>{
    
    const test = await Usermodel.findOne({name:req.body.name})
    if(!test) {
        try {
            const salt = bcrypt.genSaltSync(10)
            const hashedPassword = bcrypt.hashSync(req.body.password,salt)
    
            const newUser = await new Usermodel({
                name:req.body.name,
                age:req.body.age,
                password:hashedPassword
            })
            await newUser.save()
            res.status(200).send("user created successfully")
        }
        catch(e){
            res.json({
                isError:true,
                error:e.message
            })
        }
    }
    else {
        res.json({
            isError:true,
            error:"User already exists"
        })
    }

})
Authrouter.post("/login",async (req,res)=>{
    try{
        const User = await Usermodel.findOne({name:req.body.name})

        if(!User) {
            return res.status(403).json({
                isError:true,
                error:"name"
            })
        }

        const passwordCheck = await bcrypt.compare(req.body.password,User.password)
        
        if(!passwordCheck){
            return res.status(403).json({
                isError:true,
                error:"password"
            })
        }

        res.status(200).json(User)
    }
    catch(e) {
        res.json({
            isError:true,
            error:e.message
        })
    }   
})




export default Authrouter
