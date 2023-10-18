import { Avatar, IconButton, Tooltip } from "@mui/material";
import styles from "./Messages.module.css";
import { Link, useLocation, useParams } from "react-router-dom";
import {
	CallOutlined,
	FavoriteBorderOutlined,
	FiberManualRecord,
	InfoOutlined,
	MicNoneOutlined,
	PhotoOutlined,
	SentimentSatisfiedOutlined,
	VideocamOutlined,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { useCollectionData } from "react-firebase-hooks/firestore";
import {
	collection,
	doc,
	orderBy,
	query,
	serverTimestamp,
	setDoc,
} from "firebase/firestore";
import { firestoreDb } from "../config/firebase";
import { v4 } from "uuid";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { useRef } from "react";

const ChatBubble = ({ message, from }) => {
	const { uid } = useSelector(selectUser);

	const msgIsMine = (from) => {
		if (from?.uid === uid) {
			return true;
		} else {
			return false;
		}
	};

	return (
		<div
			className={msgIsMine(from) ? styles.chatBubble__mine : styles.chatBubble}
		>
			<p>{message}</p>
		</div>
	);
};

const Messages = () => {
	const {
		displayName: toDisplayName,
		uid: toUid,
		photoURL,
	} = useLocation().state;


	const {chatId} = useParams()


	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();

	const { uid: fromUid, displayName: fromDisplayName } =
		useSelector(selectUser);

	const q = query(
		collection(firestoreDb, `chats/${chatId}/messages`),
		orderBy("timestamp", "asc")
	);
	const [messages] = useCollectionData(q);

	// Form  handlers
	const formRef = useRef();

	const validSubmitHandler = (data) => {
		const docRef = doc(firestoreDb, `chats/${chatId}/messages`, v4());

		setDoc(docRef, {
			body: data.message,
			from: { uid: fromUid, displayName: fromDisplayName },
			to: { uid: toUid, displayName: toDisplayName },
			timestamp: serverTimestamp(),
		})
			.then(() => {
				formRef.current.reset();
			})
			.catch((err) => {
				console.error(err);
			});
	};

	const inValidSubmitHandler = (err) => {
		console.error(err);
	};

	return (
		<div className={styles.messages}>
			{/* Header */}
			<div className={styles.messages__header}>
				<div className={styles.messages__author}>
					<Avatar src={photoURL} sx={{ width: 55, height: 55 }}>
						{toDisplayName[0]}
					</Avatar>
					<div>
						<Link to={`/profile/${toDisplayName.split(" ")[0]}`} state={toUid}>
							{toDisplayName.split(" ")[0]}
						</Link>
						<p>
							<FiberManualRecord
								sx={{ width: 20, height: 20, color: "green" }}
							/>{" "}
							Active now
						</p>
					</div>
				</div>

				<div className={styles.messages__header_actions}>
					<Tooltip title="Call">
						<IconButton>
							<CallOutlined />
						</IconButton>
					</Tooltip>
					<Tooltip title="Video call">
						<IconButton>
							<VideocamOutlined />
						</IconButton>
					</Tooltip>
					<Tooltip title="Conversation Information">
						<IconButton>
							<InfoOutlined />
						</IconButton>
					</Tooltip>
				</div>
			</div>
			<div className={styles.messages__body}>
				{messages?.length > 0 ? (
					messages.map((msg, i) => (
						<ChatBubble key={i} message={msg.body} from={msg.from} />
					))
				) : (
					<h1>Loading Messages....</h1>
				)}
			</div>

			<form
				ref={formRef}
				className={styles.messages__form}
				onSubmit={handleSubmit(validSubmitHandler, inValidSubmitHandler)}
			>
				<Tooltip title="Emojis">
					<IconButton>
						<SentimentSatisfiedOutlined />
					</IconButton>
				</Tooltip>

				{errors.message && (
					<span className={styles.messages__error}>
						Please enter a valid message!
					</span>
				)}
				<input type="text" {...register("message", { required: true })} />
				<button type="submit">Send</button>

				<div className={styles.messages__form_actions}>
					<Tooltip title="Voice clip">
						<IconButton>
							<MicNoneOutlined />
						</IconButton>
					</Tooltip>
					<Tooltip title="Add photo">
						<IconButton>
							<PhotoOutlined />
						</IconButton>
					</Tooltip>
					<IconButton>
							<FavoriteBorderOutlined />
					</IconButton>
				</div>
			</form>
		</div>
	);
};

export default Messages;
