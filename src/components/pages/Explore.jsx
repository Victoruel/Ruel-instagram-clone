import { useSelector } from 'react-redux';
import styles from './Explore.module.css'
import { UserPost } from './Profile';
import { selectPost } from '../../features/postSlice';

const Explore = () => {
  const allPosts = useSelector(selectPost);

  return (
    <div className={styles.explore} ><div className={styles.profile__body}>
    {allPosts?.length > 0 ? (
      allPosts.map((post) => <UserPost key={post.id} post={post} />)
    ) : (
      <h1>You have no Posts</h1>
    )}
  </div></div>
  )
}

export default Explore