import { useSelector } from "react-redux";
import Post from "./Post";
import styles from "./PostList.module.css";
import { selectPost } from "../features/postSlice";
import { selectUser } from "../features/userSlice";


const PostList = () => {
    const user = useSelector(selectUser);
	const posts = useSelector(selectPost);

	return (
		<div className={styles.postList}>
			{posts.length > 0 ? (
				posts.map((post) => (
					<Post
						key={post.id}
						id={post.id}
						caption={post.caption}
						likes={post.likes}
						location={post.location}
						imageUrl={post.imageUrl}
                        author={post.author}
					/>
				))
			) : (
				<h1>Loading Posts....</h1>
			)}
			<Post
				author={{ displayName: "Ruel Victor" }}
				caption="Cool Caption over here! your should definitely check it out."
				likes={5}
				location="Nairobi Kenya"
				imageUrl="https://pictures-kenya.jijistatic.com/50479709_NjIwLTQ2NS1jNDVhNTM2ZDVm.webp"
			/>
		</div>
	);
};

export default PostList;
