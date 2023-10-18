import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Home from "./components/pages/Home";
import Present from "./components/pages/Present";
import Direct from "./components/pages/Direct";
import Explore from "./components/pages/Explore";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firestoreDb } from "./config/firebase";
import { useDispatch } from "react-redux";
import { login, logout } from "./features/userSlice";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { setPosts } from "./features/postSlice";
import Messages from "./components/Messages";
import Profile from "./components/pages/Profile";

function App() {
	const dispatch = useDispatch();

	useEffect(() => {
		onAuthStateChanged(auth, (user) => {
			if (user) {
				dispatch(login(user));
			} else {
				dispatch(logout());
			}
		});

		// Fetch posts
		const postsCollectionRef = collection(firestoreDb, "posts");
		const q = query(postsCollectionRef, orderBy("timestamp", "desc"));

		const unsub = onSnapshot(q, (snapshotQuery) => {
			const posts = snapshotQuery.docs.map((doc) => ({
				...doc.data(),
				id: doc.id,
			}));
			dispatch(setPosts(posts));
		});

		return unsub;
	}, []);

	return (
		<Routes>
			<Route element={<AppLayout />}>
				<Route path="/" element={<Home />} />
				<Route path="/explore" element={<Explore />} />
				<Route path="/present" element={<Present />} />
				<Route path="/profile/:userName" element={<Profile />} />

				{/* Direct routes */}
				<Route path="/direct" element={<Direct />}>
					<Route path="t/:chatId" element={<Messages />} />
				</Route>
			</Route>
		</Routes>
	);
}

export default App;
