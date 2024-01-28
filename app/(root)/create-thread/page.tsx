import PostThread from '@/components/forms/PostThread'
import { fetchUser } from '@/lib/actions/user.actions'
import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import React from 'react'

const CreateThread = async () => {
  const user = await currentUser()
  
  if(!user) return null
  
  const userInfo = await fetchUser(user.id)
  console.log("userInfo",userInfo)
  
  if(!userInfo?.onboarded) redirect('/onboarding')
  
  return (
    <>
      <h1 className='head-text'>Create thread</h1>
      <PostThread userId={userInfo._id.toString()}/>
    </>
  )
}

export default CreateThread