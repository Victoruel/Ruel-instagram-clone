import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../Sidebar";
import styles from "./AppLayout.module.css";
import { Outlet } from "react-router-dom";
import { selectUser } from "../../features/userSlice";
import Login from "../Login";
import { useEffect } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { setAccounts } from "../../features/accountSlice";
import { firestoreDb } from "../../config/firebase";
import { setChats } from "../../features/chatSlice";

const AppLayout = () => {
	const accountCollectionRef = collection(firestoreDb, "accounts");
	const dispatch = useDispatch();


	useEffect(() => {
		onSnapshot(accountCollectionRef, (snapshotQuery) => {
			const accounts = snapshotQuery.docs.map((doc) => ({
				...doc.data(),
				id: doc.id,
			}));

			dispatch(setAccounts(accounts));
		});

		const chatCollectionRef = collection(firestoreDb, "chats");
		const q = query(chatCollectionRef, orderBy("timestamp", "desc"));

		const unsub = onSnapshot(q, (snapshotQuery) => {
			const chats = snapshotQuery.docs.map((doc) => ({
				...doc.data(),
				id: doc.id,
			}));

			dispatch(setChats(chats));
		});

		return unsub
	}, []);
	const user = useSelector(selectUser);

	return (
		<div className={styles.AppLayout}>
			<div className={styles.AppLayout__body}>
				{user ? (
					<>
						<Sidebar />
						<Outlet />
					</>
				) : (
					<Login />
				)}
			</div>
		</div>
	);
};

export default AppLayout;
