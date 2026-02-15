import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { 
    findUserByEmail ,
    createAdminUser,
    
} from "../models/userModel";

