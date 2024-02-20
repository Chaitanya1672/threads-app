'use server'

import { revalidatePath } from "next/cache"
import User from "../models/user.model"
import { connectToDB } from "../mongoose"
import Thread from "../models/thread.model"
import { FilterQuery } from "mongoose"

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
    return user
  } catch (error:any) {
    throw new Error(`Failed to fetch user: ${error.message}`)
  }
}

export const fetchUserPosts = async(userId: string) =>{
  connectToDB()
  try {
    const threads = await User.findOne({ id: userId})
      .populate({
        path: 'threads',
        model: Thread,
        populate: {
          path: 'children',
          model: Thread,
          populate: {
            path: 'author',
            model: User,
            select: 'name image id'
          }
        }
      })
      return threads
  } catch (error: any) {
    throw new Error(`Failed to fetch user posts: ${error.message}`)
  }
}

export const fetchUsers = async({
  userId,
  searchTerm = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = 'desc',

}:{
  userId: string,
  searchTerm: string,
  pageNumber?: number,
  pageSize?: number,
  sortBy?: string
}) =>{
  try {
    connectToDB()
    const skipAmount = (pageNumber - 1) * pageSize
    
    const regex = new RegExp(searchTerm, 'i')
    const query: FilterQuery<typeof User> = {
      id: {$ne: userId},
    }
    
    if(searchTerm.trim() !== ''){
      query.$or = [
        {username: {$regex: regex}},
        {name: {$regex: regex}},
      ]
    }
    
    const sortOptions:any = { createdAt: sortBy }
    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize)
      
    const users = await usersQuery.exec()
    const totalUsersCount = await User.countDocuments(query)
    const isNext = totalUsersCount > skipAmount + users.length
    return {users, isNext}
  } catch (error:any) {
    throw new Error(`Failed to fetch users: ${error.message}`)
  }
} 

export const getActivity  = async(userId: string) =>{
  try {
    connectToDB()
    const user = await User.findOne({ id: userId})
    
    const userThreads = await Thread.find({author: userId})
    const childThreads = userThreads.reduce((acc, userThread)=>{
      return acc.concat(userThread.children)
    }, [])
    
    const replies = await Thread.find({
      _id: {$in: childThreads},
      author: {$ne: userId}
    }).populate({
      path: 'author',
      model: User,
      select: 'name image id'
    })
    
    return replies
  } catch (error:any) {
    throw new Error(`Failed to fetch activity: ${error.message}`)
  }
} 