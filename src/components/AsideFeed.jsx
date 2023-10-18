import { Avatar, Button } from "@mui/material";
import styles from "./AsideFeed.module.css";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { firestoreDb } from "../config/firebase";
import { collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { selectAccount } from "../features/accountSlice";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Link } from "react-router-dom";

const AccountSummary = ({
	acccountPhotoURL,
	accountDisplayName,
	accountId,
	accountUserId,
}) => {
	const { displayName, photoURL, uid } = useSelector(selectUser);
	const [isFollowing, setIsFollowing] = useState(false);

	const accounts = useSelector(selectAccount);

	const userAccount = accounts.filter((account) => account.user.uid == uid);

	const qFollowers = collection(firestoreDb, `accounts/${accountId}/followers`);
	const [followers] = useCollectionData(qFollowers);

	useEffect(() => {
		// Check if user is following account.

		const follower = followers?.find((f) => f.uid === uid);
		follower ? setIsFollowing(true) : setIsFollowing(false);
	}, [followers]);

	const followHandler = async () => {
		// Add follower to PersonB / another userAccount in db
		const followDocRef = doc(
			firestoreDb,
			`accounts/${accountId}/followers`,
			uid
		);

		await setDoc(followDocRef, {
			uid,
			displayName,
			photoURL,
		});

		// Add following to personA / User  in db

		const followingDocRef = doc(
			firestoreDb,
			`accounts/${userAccount.id}/following`,
			accountUserId
		);
		setDoc(followingDocRef, {
			uid: accountUserId,
			photoURL: acccountPhotoURL,
			displayName: accountDisplayName,
		})
			.then(() => {
				console.log("following 👍");
			})
			.catch((err) => {
				console.error(err);
			});
	};

	const unFollowHandler = async () => {
		// Delete account from my Following
		const followingDocRef = doc(
			firestoreDb,
			`accounts/${userAccount.id}/following`,
			accountUserId
		);

		try {
			await deleteDoc(followingDocRef);
		} catch (error) {
			console.error(error);
		}

		// Delete my useAccount from his follower
		const followDocRef = doc(
			firestoreDb,
			`accounts/${accountId}/followers`,
			uid
		);
		deleteDoc(followDocRef)
			.then(() => {
				setIsFollowing(false);
				console.log("Unfollowing 👍");
			})
			.catch((err) => {
				console.error(err);
			});
	};

	return (
		<Link className={styles.accountSummary} state={accountUserId} to={`/profile/${accountDisplayName.split(" ")[0]}`}  >
			<div className={styles.accountSummary__user}>
				<Avatar src={acccountPhotoURL}>{accountDisplayName[0]}</Avatar>
				<div>
					<p>{accountDisplayName.split(" ")[0]}</p>
					<p>{accountDisplayName}</p>
				</div>
			</div>

			{isFollowing ? (
				<Button variant="outlined" onClick={unFollowHandler}>
					Unfollow
				</Button>
			) : (
				<Button variant="contained" onClick={followHandler}>
					Follow
				</Button>
			)}
		</Link>
	);
};

const AsideFeed = () => {
	const { displayName, photoURL, uid } = useSelector(selectUser);

	const accounts = useSelector(selectAccount);

	const otherAccounts = accounts.filter((account) => account.user.uid !== uid);

	return (
		<div className={styles.asideFeed}>
			<div className={styles.asideFeed__header}>
				<Avatar src={photoURL}>{displayName[0]}</Avatar>
				<div>
					<p>
						<Link to={`/profile/${displayName.split(" ")[0]}`} state={uid} >{displayName.split(" ")[0]}</Link>
					</p>
					<p>{displayName}</p>
				</div>
			</div>
			{/* Suggested section */}
			<div className={styles.asideFeed__suggestions}>
				<h3>Suggested for you.</h3>

				{otherAccounts.length > 0 &&
					otherAccounts.map((account, i) => (
						<AccountSummary
							key={i}
							acccountPhotoURL={account.user.photoURL}
							accountDisplayName={account.user.displayName}
							accountUserId={account.user.uid}
							accountId={account.id}
						/>
					))}
			</div>
		</div>
	);
};

export default AsideFeed;
