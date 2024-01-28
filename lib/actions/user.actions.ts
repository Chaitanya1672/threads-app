'use server'

import { revalidatePath } from "next/cache"
import User from "../models/user.model"
import { connectToDB } from "../mongoose"

type UserParams = {
  userId: string,
  username: string,
  name: string,
  bio: string,
  image:string,
  path:string,
}

export const updateUser = async({
  userId,
  username,
  name,
  bio,
  image,
  path,
}:UserParams ):Promise<void> => {
  connectToDB()
  try {
    username = username.toLowerCase()
    await User.findOneAndUpdate(
      {id: userId},
      {username: username, name, bio, image, path, onboarded: true},
      {upsert: true}
    )
    if(path === '/profile/edit'){
      revalidatePath('/profile/edit')
    }
  } catch (error:any) {
    throw new Error(`Failed to update/create user: ${error.message}`)
  }   
}

export const fetchUser = async(userId:string) =>{
  connectToDB()
  try {
    const user = await User
      .findOne({id: userId})
      // .populate({
      //   path: "communities",
      //   model: 'Community'
      // })
    console.log('user',user)
    return user
  } catch (error:any) {
    throw new Error(`Failed to fetch user: ${error.message}`)
  }
}