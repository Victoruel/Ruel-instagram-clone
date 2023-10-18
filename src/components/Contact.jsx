import { Avatar, Button } from "@mui/material";
import styles from "./Contact.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { firestoreDb } from "../config/firebase";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { useEffect, useState } from "react";
import { selectChat } from "../features/chatSlice";

const Contact = ({ photoURL, displayName, uid }) => {
	const { uid: userA } = useSelector(selectUser);
	const [userChat, setUserChat] = useState("");

	const chats = useSelector(selectChat);

	useEffect(() => {
		const userChats = chats.filter(
			(chat) => chat.personA == userA || chat.personB == userA
		);

		const pairChat = userChats.find(
			(chat) => chat.personA == uid || chat.personB == uid
		);

		setUserChat(pairChat);

		// console.log(`UserChats:>`, userChats);
		// console.log(`pairChat (${displayName}):>`, pairChat);
	}, [chats]);


	const navigate = useNavigate();
	const pathname = useLocation().pathname;

	const createChatHandler = async () => {
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
			console.log("userChat (new):>", userChat);
			pathname !== `/direct/t/${userChat.id}` &&
				navigate(`/direct/t/${userChat.id}`, {
					state: { photoURL, displayName, uid, userChat },
				});
		}
	};

	return (
		<div
			className={styles.contact}
			onClick={userChat ? createChatHandler : undefined}
		>
			<Avatar src={photoURL} sx={{ width: 55, height: 55 }}>
				{displayName[0]}
			</Avatar>
			<div className={styles.contact__details}>
				<p>{displayName.split(" ")[0]}</p>
				<p>Previous message</p>
			</div>
			{!userChat && (
				<Button variant="contained" size="small" onClick={createChatHandler}>
					Start Chat
				</Button>
			)}
		</div>
	);
};

export default Contact;
