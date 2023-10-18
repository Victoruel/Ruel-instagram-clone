import { Avatar, IconButton, Tooltip } from "@mui/material";
import styles from "./Sidebar.module.css";
import { Link, useLocation } from "react-router-dom";
import {
	AddBoxOutlined,
	ExploreOutlined,
	FavoriteBorderOutlined,
	HomeRounded,
	OndemandVideoOutlined,
	SearchOutlined,
	SendOutlined,
} from "@mui/icons-material";
import { useState } from "react";
import CustomModal from "./Modal";
import { useForm } from "react-hook-form";
import {
	addDoc,
	collection,
	doc,
	serverTimestamp,
	updateDoc,
} from "firebase/firestore";
import { firestoreDb, storage } from "../config/firebase";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 } from "uuid";
import { selectAccount } from "../features/accountSlice";

const Sidebar = () => {
	const [modalOpen, setModalOpen] = useState(false);
	const {
		register,
		formState: { errors },
		handleSubmit,
		reset,
	} = useForm();

	const openModalHandler = () => {
		setModalOpen(true);
	};

	const user = useSelector(selectUser);
	const accounts = useSelector(selectAccount);

	const userAccount = accounts.find((account) => account.user.uid === user.uid);

	// Form submit handlers
	const validSubmitHandler = (data) => {
		setModalOpen(false);

		const postsCollectionRef = collection(firestoreDb, "posts");
		const postImages = ref(
			storage,
			`postImages/${data.postImg[0].name + v4()}`
		);

		uploadBytes(postImages, data.postImg[0]).then((snapshot) => {
			getDownloadURL(snapshot.ref).then((url) => {
				// Add post to db
				addDoc(postsCollectionRef, {
					location: data.location,
					caption: data.caption,
					imageUrl: url,
					likes: 0,
					author: {
						displayName: user.displayName,
						uid: user.uid,
						photoURL: user.photoURL,
					},
					timestamp: serverTimestamp(),
				}).then(() => {
					reset({ ...data });
				});

				// Update post count on account
				const accountRef = doc(firestoreDb, "accounts", userAccount.id);
				updateDoc(accountRef, { posts: userAccount.posts + 1 }); // update test
			});
		});
	};
	const inValidSubmitHandler = (err) => {
		console.log(err);
	};

	const pathname = useLocation().pathname;

	const sidebarControl = () => {
		switch (true) {
			case pathname === "/explore":
			case pathname === "/":
				return true;
			case pathname.startsWith("/direct"):
				return false;
			default:
				return true;
		}
	};

	const sidebarOption = (Icon, title, path, onClickAction) => {
		return (
			<Link
				to={path}
				className={styles.sidebar__option}
				onClick={onClickAction}
			>
				<Tooltip title={title}>
					<IconButton>
						<Icon sx={{ width: 30, height: 30 }} />
					</IconButton>
				</Tooltip>
				{sidebarControl() && <span>{title}</span>}
			</Link>
		);
	};

	return (
		<div className={sidebarControl() ? styles.sidebar : styles.sidebar__mini}>
			<Link to="/">
				{sidebarControl() ? (
					<img
						className={styles.sidebar__logo}
						src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEdwcSBVv9WuDbaP65gdw9ifwapkxK-b2G_Q&usqp=CAU"
						alt="logo"
					/>
				) : (
					<img
						className={styles.sidebar__logo}
						src="https://i.pinimg.com/originals/f8/19/26/f81926e22e7c522c9eb15eaebcf3eb3d.png"
						alt="logo"
					/>
				)}
			</Link>
			<div className={styles.sidebar__options}>
				{sidebarOption(HomeRounded, "Home", "/", null)}
				{sidebarOption(SearchOutlined, "Search", "/search", null)}
				{sidebarOption(ExploreOutlined, "Explore", "/explore", null)}
				{sidebarOption(OndemandVideoOutlined, "Shorts", "/", null)}
				{sidebarOption(SendOutlined, "Messages", "/direct", null)}
				{sidebarOption(FavoriteBorderOutlined, "Notifications", "/", null)}
				{sidebarOption(AddBoxOutlined, "Create", null, openModalHandler)}

				{/* Custom Create Modal */}
				<CustomModal modalOpen={modalOpen} setModalOpen={setModalOpen}>
					<div className={styles.createModal}>
						<h3 className={styles.createModal__header}>Create New Post</h3>
						<form
							onSubmit={handleSubmit(validSubmitHandler, inValidSubmitHandler)}
						>
							<input type="file" {...register("postImg", { required: true })} />
							{errors.postImg && (
								<span className={styles.createModal__error}>
									Please select a valid image!
								</span>
							)}
							<input
								type="text"
								placeholder="Location..."
								{...register("location", { required: true })}
							/>
							{errors.location && (
								<span className={styles.createModal__error}>
									Please write a valid location!
								</span>
							)}
							<textarea
								cols="30"
								rows="10"
								placeholder="Add a caption..."
								{...register("caption", { required: true })}
							></textarea>
							{errors.caption && (
								<span className={styles.createModal__error}>
									Please write a valid caption!
								</span>
							)}
							<button type="submit">Post</button>
						</form>
					</div>
				</CustomModal>
			</div>

			{/* Avatar */}
			<div className={styles.sidebar__profile}>
				<Link
					to={`/profile/${user?.displayName.split(" ")[0]}`}
					state={user?.uid}
				>
					<Tooltip title={`Profile.${user?.displayName}`}>
						<IconButton>
							<Avatar src={user?.photoURL}>{user?.displayName[0]}</Avatar>
						</IconButton>
					</Tooltip>
				</Link>
			</div>
		</div>
	);
};

export default Sidebar;
