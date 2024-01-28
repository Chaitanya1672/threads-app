'use server'

import { revalidatePath } from "next/cache"
import Thread from "../models/thread.model"
import User from "../models/user.model"
import { connectToDB } from "../mongoose"

interface CreateThreadProps {
  text: string,
  author: string,
  communityId: string,
  path: string
}

export const createThread = async({text,  author,  communityId,  path}: CreateThreadProps) =>{
  try {
    connectToDB()
  
    const createThread = await Thread.create({
      text, 
      author,
      community: null 
    })
    
    await User.findByIdAndUpdate( author,{
      $push: { threads: createThread._id}
    })
    
    revalidatePath(path)
  } catch (error:any) {
    throw new Error(`Failed to create thread: ${error.message}`)
  }
  connectToDB()
}

export const fetchPosts = async(pageNumber = 1, pageSize = 20) =>{
  try {
    connectToDB()
    
    const skipAmount = (pageNumber - 1) * pageSize;
    const postQuery = Thread.find({parentId: {$in: [null, undefined]}})
      .sort({createdAt: 'desc'})
      .skip(skipAmount)
      .limit(pageSize)
      .populate({path: 'author', model: User})
      .populate({
        path: 'children',
        populate:{
          path: 'author',
          model: User,
          select: "_id name parentId image"
        }
      })
    
    const totalPostCount = await Thread.countDocuments({parentId: {$in : [null, undefined]}})
    const posts = await postQuery.exec()
    const isNext = totalPostCount > skipAmount + posts.length
    
    return {posts, isNext}
  } catch (error:any) {
    throw new Error(`Failed to fetch posts: ${error.message}`)
  }
}

export const fetchThreadById = async (threadId:string) =>{
  connectToDB()
  try {
    const thread = await Thread.findById(threadId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      }) // Populate the author field with _id and username
      // .populate({
      //   path: "community",
      //   model: Community,
      //   select: "_id id name image",
      // }) // Populate the community field with _id and name
      .populate({
        path: "children", // Populate the children field
        populate: [
          {
            path: "author", // Populate the author field within children
            model: User,
            select: "_id id name parentId image", // Select only _id and username fields of the author
          },
          {
            path: "children", // Populate the children field within children
            model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
            populate: {
              path: "author", // Populate the author field within nested children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (err) {
    console.error("Error while fetching thread:", err);
    throw new Error("Unable to fetch thread");
  }
} 

export const addCommentToThread = async({
  threadId,
  commentText,
  userId,
  path
}:
{ threadId:string,
  commentText:string,
  userId: string,
  path: string
}) =>{
  connectToDB()
  try {
    const originalThread = await Thread.findById(threadId)
    if(!originalThread){
      throw new Error('Thread not found')
    }
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId
    })
    
    const savedCommentThread = await commentThread.save()
    
    originalThread.children.push(savedCommentThread._id)
    
    await originalThread.save()
    revalidatePath(path)
  } catch (error:any) {
    throw new Error(`Failed to add comment: ${error.message}`)
  }
}