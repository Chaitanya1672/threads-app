import { fetchUser, fetchUsers } from '@/lib/actions/user.actions'
import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import UserCard from '@/components/cards/UserCard'
import { fetchCommunities } from '@/lib/actions/community.actions'
import CommunityCard from '@/components/cards/CommunityCard'

const CommunityPage = async() => {
  const user = await currentUser()
  if (!user) return null
  
  const userInfo = await fetchUser(user?.id)
  if(!userInfo?.onboarded) redirect('/onboarding')
  
  const result = await fetchCommunities({
    searchString: '',
    pageNumber: 1,
    pageSize: 20,
    sortBy: 'desc',
  })
    
  return (
    <section>
      {/* <h1 className='head-text mb-10'>Search</h1>
      Search Bar */}
      <div className='mt-14 flex flex-col gap-9'>
        {
          result.communities.length === 0 ? (
            <p className=''>No communities found</p>
          ) : (
            <>
              {result.communities.map((community:any)=>(
                <CommunityCard
                  key={community.id}
                  id={community.id}
                  name={community.name}
                  username={community.username}
                  imgUrl={community.image}
                  bio={community.bio}
                  members={community.members} 
                />
              ))}
            </>
            
          )
        }
      </div>
    </section>
  )
}

export default CommunityPage