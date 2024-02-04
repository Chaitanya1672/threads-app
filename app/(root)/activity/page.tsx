import { fetchUser, fetchUsers, getActivity } from '@/lib/actions/user.actions'
import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import UserCard from '@/components/cards/UserCard'
import Link from 'next/link'
import Image from 'next/image'

const ActivityPage = async() => {
  const user = await currentUser()
  if (!user) return null
  
  const userInfo = await fetchUser(user?.id)
  if(!userInfo?.onboarded) redirect('/onboarding')
  
  const activity = await getActivity(userInfo._id)
  
  return (
    <section>
      <h1 className='head-text mb-10'>Activity</h1>
      <section className='mt-10 flex flex-col gap-5'>
        {
          activity.length > 0 ?
            <>
              {activity.map((activity)=>(
                <Link href={`/thread/${activity.parentId}`} key={activity._id}>
                  <article className='activity-card'>
                    <Image 
                      src={activity.author.image}
                      alt='Profile image'
                      width={20}
                      height={20}
                      className='rounded-full object-cover'
                    />
                  </article>                  
                </Link>
              ))}
            </>
          : <p className='!text-base-regular text-light-3'>No activity yet</p>
        }
      </section>
    </section>
  )
}

export default ActivityPage