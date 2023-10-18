import { Avatar, Button, IconButton, Tooltip } from "@mui/material";
import styles from "./Profile.module.css";
import { useSelector } from "react-redux";
import { selectAccount } from "../../features/accountSlice";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCollectionData } from "react-firebase-hooks/firestore";
import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	query,
	serverTimestamp,
	setDoc,
	updateDoc,
} from "firebase/firestore";
import { firestoreDb } from "../../config/firebase";
import {
	BookmarkBorder,
	ChatBubbleRounded,
	FavoriteBorderOutlined,
	FavoriteRounded,
	GridOnRounded,
	MoreHorizOutlined,
	SendOutlined,
	SendRounded,
} from "@mui/icons-material";
import { selectPost } from "../../features/postSlice";
import { selectUser } from "../../features/userSlice";
import { useEffect, useState } from "react";
import { selectChat } from "../../features/chatSlice";
import CustomModal from "../Modal";
import { PostComment } from "../Post";
import { v4 } from "uuid";

// User Post component
export const UserPost = ({ post }) => {
	const [comment, setComment] = useState("");
	const [isLiked, setIsLiked] = useState(false);
	const { displayName, uid, photoURL } = useSelector(selectUser);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const q = collection(firestoreDb, `posts/${post?.id}/comments`);
	const docRef = doc(firestoreDb, `posts/${post?.id}/comments`, v4());
	const [comments] = useCollectionData(q);

	const likeHandler = () => {
		const postRef = doc(firestoreDb, "posts", post?.id);

		if (isLiked) {
			updateDoc(postRef, { likes: post?.likes - 1 });
			setIsLiked(false);
		} else {
			updateDoc(postRef, { likes: post?.likes + 1 });
			setIsLiked(true);
		}

		console.log(isLiked);
	};

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

	return (
		<div className={styles.userPost}>
			<img
				src={post?.imageUrl}
				alt="postImage"
				onClick={() => setIsModalOpen(true)}
			/>
			<div className={styles.userPost__stats}>
				<span>
					<strong>{post?.likes}</strong> <FavoriteRounded />{" "}
				</span>
				<span>
					<strong>{comments?.length}</strong> <ChatBubbleRounded />{" "}
				</span>
			</div>

			<CustomModal setModalOpen={setIsModalOpen} modalOpen={isModalOpen}>
				<div className={styles.modalPost}>
					<img
						src={post?.imageUrl}
						alt="modalPost Image"
						className={styles.modalPost__img}
						onDoubleClick={likeHandler}
					/>

					<div className={styles.modalPost__body}>
						<div className={styles.modalPost__header}>
							<div className={styles.modalPost__author}>
								<Avatar src={post?.author?.photoURL}>
									{post?.author?.displayName[0]}
								</Avatar>
								<div>
									<Link
										to={`profile/${post?.author?.displayName.split(" ")[0]}`}
										state={post?.author?.uid}
									>
										{post?.author?.displayName}
									</Link>
									<p>{post?.location}</p>
								</div>
							</div>
							<IconButton>
								<MoreHorizOutlined />
							</IconButton>
						</div>

						<div className={styles.modalPost__comments}>
							<p>
								<strong>{post?.author?.displayName + " "}</strong>
								{post?.caption}
							</p>

							{comments?.length > 0 ? (
								comments?.map((comm, i) => (
									<PostComment
										key={i}
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

						<p className={styles.modalPost__likes}>{post?.likes} Likes</p>

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

const Profile = () => {
	const accounts = useSelector(selectAccount);
	const allPosts = useSelector(selectPost);
	const navigate = useNavigate();
	const userId = useLocation().state;
	const [isFollowing, setIsFollowing] = useState(false);

	const account = accounts.find((account) => account.user.uid === userId);

	const userPosts = allPosts.filter((post) => post.author?.uid == userId);

	const qFollowers = collection(
		firestoreDb,
		`accounts/${account?.id}/followers`
	);
	const [followers] = useCollectionData(qFollowers);

	const qFollowing = collection(
		firestoreDb,
		`accounts/${account?.id}/following`
	);
	const [following] = useCollectionData(qFollowing);

	// Create Chat Controls

	const {
		uid: userA,
		displayName: displayNameA,
		photoURL: photoURLA,
	} = useSelector(selectUser);
	const [userChat, setUserChat] = useState("");

	const chats = useSelector(selectChat);

	const userAccount = accounts.find((account) => account.user.uid === userA);

	useEffect(() => {
		const userChats = chats.filter(
			(chat) => chat.personA == userA || chat.personB == userA
		);

		const pairChat = userChats.find(
			(chat) =>
				chat.personA == account?.user.uid || chat.personB == account?.user.uid
		);

		setUserChat(pairChat);

		// Check if user is following account.

		const follower = followers?.find((f) => f.uid === userA);
		follower ? setIsFollowing(true) : setIsFollowing(false);
	}, [followers]);

	const createChatControl = () => {
		if (userChat) {
			return true;
		} else {
			return false;
		}
	};

	const createChatHandler = async () => {
		const {
			user: { uid, displayName, photoURL },
		} = account;

		if (!userChat) {
			const chatCollectionDoc = collection(firestoreDb, "chats");
			addDoc(chatCollectionDoc, {
				personA: userA,
				personB: uid,
				timestamp: serverTimestamp(),
			})
				.then((newChat) => {
					setUserChat(newChat);

					console.log("userChat (new):>", newChat);
					navigate(`/direct/t/${newChat.id}`, {
						state: { photoURL, displayName, uid, userChat },
					});
				})
				.catch((err) => console.error(err));
		} else {
			navigate(`/direct/t/${userChat.id}`, {
				state: { photoURL, displayName, uid, userChat },
			});
		}
	};

	const followHandler = async () => {
		// Add follower to PersonB / another userAccount in db
		const followDocRef = doc(
			firestoreDb,
			`accounts/${account.id}/followers`,
			userA
		);

		await setDoc(followDocRef, {
			uid: userA,
			displayName: displayNameA,
			photoURL: photoURLA,
		});

		// Add following to personA / User  in db

		const followingDocRef = doc(
			firestoreDb,
			`accounts/${userAccount.id}/following`,
			account.user.uid
		);
		setDoc(followingDocRef, {
			uid: account.user.uid,
			photoURL: account.user.photoURL,
			displayName: account.user.displayName,
		});
	};

	const unFollowHandler = async () => {
		// Delete account from my Following
		const followingDocRef = doc(
			firestoreDb,
			`accounts/${userAccount.id}/following`,
			account.user.uid
		);

		try {
			await deleteDoc(followingDocRef);
		} catch (error) {
			console.error(error);
		}

		// Delete my useAccount from his follower
		const followDocRef = doc(
			firestoreDb,
			`accounts/${account.id}/followers`,
			userA
		);
		deleteDoc(followDocRef)
			.then(() => {
				setIsFollowing(false);
			})
			.catch((err) => {
				console.error(err);
			});
	};

	return (
		<div className={styles.profile}>
			<div className={styles.profile__header}>
				<Avatar sx={{ width: 150, height: 150 }} src={account?.user.photoURL}>
					{account?.user.displayName[0]}
				</Avatar>
				<div className={styles.profile__author}>
					<h2>{account?.user.displayName}</h2>
					<div className={styles.profile__stats}>
						<p>
							<strong>{account?.posts} </strong>Posts
						</p>
						<p>
							<strong>{followers?.length} </strong>
							followers
						</p>
						<p>
							<strong>{following?.length} </strong>
							following
						</p>
					</div>

					{userId !== userA && (
						<div className={styles.profile__actions}>
							{isFollowing ? (
								<Button variant="outlined" onClick={unFollowHandler}>
									Unfollow
								</Button>
							) : (
								<Button variant="contained" onClick={followHandler}>
									Follow
								</Button>
							)}

							<Button
								startIcon={<SendRounded />}
								variant="contained"
								onClick={createChatHandler}
							>
								Message
							</Button>
						</div>
					)}
				</div>
			</div>

			<h2>
				<GridOnRounded /> Posts
			</h2>
			<div className={styles.profile__body}>
				{userPosts?.length > 0 ? (
					userPosts.map((post, i) => <UserPost key={i} post={post} />)
				) : (
					<h1>You have no Posts</h1>
				)}
			</div>
		</div>
	);
};

export default Profile;
