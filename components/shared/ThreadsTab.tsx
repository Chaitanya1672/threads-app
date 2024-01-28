import { fetchUserPosts } from '@/lib/actions/user.actions'
import { redirect } from 'next/navigation'
import React from 'react'

interface ThreadTabProps {
  currentUserId: string,
  accountId: string,
  accountType: string
}
const ThreadsTab = async({
  currentUserId,
  accountId,
  accountType
}:ThreadTabProps) => {
  let result = await fetchUserPosts(accountId)
  
  if(!result) redirect('/')
  
  
  return (
    <section className=''>
      
    </section>
  )
}

export default ThreadsTab