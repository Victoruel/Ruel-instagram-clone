import { Avatar, IconButton, Tooltip } from "@mui/material";
import styles from "./Post.module.css";
import {
	BookmarkBorder,
	FavoriteBorderOutlined,
	MapsUgcOutlined,
	MoreHorizOutlined,
	SendOutlined,
} from "@mui/icons-material";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCollectionData } from "react-firebase-hooks/firestore";
import {
	collection,
	doc,
	orderBy,
	query,
	serverTimestamp,
	setDoc,
	updateDoc,
} from "firebase/firestore";
import { firestoreDb } from "../config/firebase";
import { v4 } from "uuid";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import CustomModal from "./Modal";

// Post comment Component
export const PostComment = ({ photoURL, displayName, body }) => (
	<div className={styles.post__comment}>
		<Avatar src={photoURL}>{displayName[0]}</Avatar>
		<div className={styles.post__comment_body}>
			<p>
				<strong>{displayName}</strong> <span>{body}</span>
			</p>
		</div>
	</div>
);

const Post = ({ author, caption, location, likes, imageUrl, id }) => {
	const [comment, setComment] = useState("");
	const [isLiked, setIsLiked] = useState(false);
	const { displayName, uid, photoURL } = useSelector(selectUser);
	const [modalOpen, setModalOpen] = useState(false);

	const docRef = doc(firestoreDb, `posts/${id}/comments`, v4());
	const commentRef = collection(firestoreDb, `posts/${id}/comments`);
	const q = query(commentRef, orderBy("timestamp", "desc"));

	const [comments] = useCollectionData(q);

	const submitHandler = (e) => {
		e.preventDefault();

		setDoc(docRef, {
			body: comment,
			author: { displayName, uid, photoURL },
			timestamp: serverTimestamp(),
		})
			.then(() => setComment(""))
			.catch((err) => console.error(err));
	};

	const likeHandler = () => {
		const postRef = doc(firestoreDb, "posts", id);

		if (isLiked) {
			updateDoc(postRef, { likes: likes - 1 });
			setIsLiked(false);
		} else {
			updateDoc(postRef, { likes: likes + 1 });
			setIsLiked(true);
		}
	};

	return (
		<div className={styles.post}>
			<div className={styles.post__header}>
				<div className={styles.post__author}>
					<Avatar src={author?.photoURL}>{author?.displayName[0]}</Avatar>
					<div>
						<Link
							to={`profile/${author?.displayName.split(" ")[0]}`}
							state={author?.uid}
						>
							{author?.displayName}
						</Link>
						<p>{location}</p>
					</div>
				</div>
				<IconButton>
					<MoreHorizOutlined />
				</IconButton>
			</div>

			<div className={styles.post__body}>
				<img
					src={imageUrl}
					alt="post Image"
					className={styles.post__img}
					onDoubleClick={likeHandler}
				/>
				<div className={styles.post__actions}>
					<div>
						<Tooltip title="Like">
							<IconButton onClick={likeHandler}>
								<FavoriteBorderOutlined />
							</IconButton>
						</Tooltip>
						<Tooltip title="Comment">
							<IconButton onClick={() => setModalOpen(true)}>
								<MapsUgcOutlined />
							</IconButton>
						</Tooltip>
						<Tooltip title="Share">
							<IconButton>
								<SendOutlined />
							</IconButton>
						</Tooltip>
					</div>

					<Tooltip title="Save post">
						<IconButton>
							<BookmarkBorder />
						</IconButton>
					</Tooltip>
				</div>
				<p>{likes} Likes</p>
				<div className={styles.post__caption}>
					<p>
						<strong>{author?.displayName + " "}</strong>
						{caption}
					</p>
				</div>
				<p
					className={styles.post__viewComments}
					onClick={() => setModalOpen(true)}
				>
					View all {comments?.length} comments
				</p>

				<form className={styles.post__form} onSubmit={submitHandler}>
					<input
						type="text"
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						placeholder="Add a comment..."
					/>
					<button type="submit">Submit</button>
				</form>
			</div>

			{/* Post Modal */}

			<CustomModal setModalOpen={setModalOpen} modalOpen={modalOpen}>
				<div className={styles.modalPost}>
					<img
						src={imageUrl}
						alt="modalPost Image"
						className={styles.modalPost__img}
						onDoubleClick={likeHandler}
					/>

					<div className={styles.modalPost__body}>
						<div className={styles.modalPost__header}>
							<div className={styles.modalPost__author}>
								<Avatar src={author?.photoURL}>{author?.displayName[0]}</Avatar>
								<div>
									<Link
										to={`profile/${author?.displayName.split(" ")[0]}`}
										state={author?.uid}
									>
										{author?.displayName}
									</Link>
									<p>{location}</p>
								</div>
							</div>
							<IconButton>
								<MoreHorizOutlined />
							</IconButton>
						</div>

						<div className={styles.modalPost__comments}>
							<p>
								<strong>{author?.displayName + " "}</strong>
								{caption}
							</p>

							{comments?.length > 0 ? (
								comments?.map((comm) => (
									<PostComment
										key={comm.id}
										body={comm.body}
										displayName={comm.author.displayName}
										photoURL={comm.author.photoURL}
									/>
								))
							) : (
								<h3>Loading comments...</h3>
							)}
						</div>

						<div className={styles.modalPost__actions}>
							<div>
								<Tooltip title="Like">
									<IconButton onClick={likeHandler}>
										<FavoriteBorderOutlined />
									</IconButton>
								</Tooltip>

								<Tooltip title="Share">
									<IconButton>
										<SendOutlined />
									</IconButton>
								</Tooltip>
							</div>

							<Tooltip title="Save Post">
								<IconButton>
									<BookmarkBorder />
								</IconButton>
							</Tooltip>
						</div>

						<p className={styles.modalPost__likes}>{likes} Likes</p>

						<form className={styles.modalPost__form} onSubmit={submitHandler}>
							<input
								type="text"
								value={comment}
								onChange={(e) => setComment(e.target.value)}
								placeholder="Add a comment..."
							/>
							<button type="submit">Submit</button>
						</form>
					</div>
				</div>
			</CustomModal>
		</div>
	);
};

export default Post;
