import AsideFeed from "../AsideFeed"
import PostList from "../PostList"
import styles from "./Home.module.css"

const Home = () => {
  return (
    <div className={styles.home} >
        <PostList />
        <AsideFeed />
    </div>
  )
}

export default Home