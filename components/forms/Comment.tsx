'use client'

import React from 'react'
import * as z from "zod"
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {zodResolver} from '@hookform/resolvers/zod'
import { usePathname, useRouter } from "next/navigation";
// import { currentUser } from "@clerk/nextjs";
import { useState } from "react";
import { CommentValidation } from '@/lib/validations/thread';
import Image from 'next/image';
import { addCommentToThread } from '@/lib/actions/thread.actions';

interface CommentProps {
  threadId:string 
  currentUserImage:string
  currentUserId:string
}
const Comment = ({threadId, currentUserId, currentUserImage}:CommentProps) => {
  const pathName = usePathname()
  const router = useRouter()

  // const user:any = currentUser()
  const form  = useForm({
    resolver: zodResolver(CommentValidation),
    defaultValues: {
      thread: '',
    },
  })
  
  const onSubmit = async (values: z.infer<typeof CommentValidation>) =>{
    addCommentToThread({
      threadId,
      commentText: values.thread,
      userId: currentUserId,
      path: pathName
    })
    form.reset()
    // router.push('/')
  }
  
  return (
    <Form {...form}>
    <form 
      onSubmit={form.handleSubmit(onSubmit)} 
      className="comment-form"
    >
      <FormField
        control={form.control}
        name="thread"
        render={({ field }) => (
          <FormItem className="flex w-full items-center gap-3">
            <FormLabel>
              <Image
                src={currentUserImage}
                alt='Profile Image'
                width={48}
                height={48}
                className='rounded-full object-cover'
              />
            </FormLabel>
            <FormControl className="border-none bg-transparent text-light-2">
              <Input 
                type='text'
                placeholder='Comment...'
                className="no-focus text-light-1 outline-none"
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <Button type="submit" className="comment-form_btn">Reply</Button>
    </form>
  </Form>
  )
}

export default Comment