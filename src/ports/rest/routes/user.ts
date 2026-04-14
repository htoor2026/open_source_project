import express, { NextFunction, Response, Request } from "express";
import bcrypt from "bcrypt";

const router = express.Router();

const userDb: any = []; // mock database

router.post("/create", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userName = req.body.userName;
        const userPassword = req.body.userPassword;
    
        const salt = await bcrypt.genSalt(); 
        const hashedPassword = await bcrypt.hash(userPassword, salt);
    
        const createUser = {
            userName: userName,
            userPassword: hashedPassword
        };
    
        userDb.push(createUser);

        res.status(200).json(createUser);


    } catch (error) {
        console.log(`Error in user route: ${JSON.stringify((error as Error).message)}`);
        res.status(500).json({
          message: `Error in user route: ${JSON.stringify((error as Error).message)}`
        });
      }
})

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user: any = userDb.find((savedUser: any) => {
            if(savedUser.userName === req.body.userName){
                return savedUser;
            }
            return null;
        });

        if(!user){
            throw new Error("Error logging in, unable to find username!!");
        }

        const compareResult = await bcrypt.compare(req.body.userPassword, user.userPassword);

        if(compareResult){
            res.status(200).json({
                message: "User logged in successfully!",
                user: user
            });
        }else{
            throw new Error("Error logging in, invalid password!");
        }

    } catch (error) {
        console.log(`Error in user route: ${JSON.stringify((error as Error).message)}`);
        res.status(500).json({
          message: `Error in user route: ${JSON.stringify((error as Error).message)}`
        });
      }
})

export = router;
