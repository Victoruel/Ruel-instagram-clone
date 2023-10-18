import { signInWithPopup } from "firebase/auth";
import styles from "./Login.module.css";
import { auth, authProvider, firestoreDb } from "../config/firebase";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/userSlice";
import { addDoc, collection } from "firebase/firestore";

import { selectAccount } from '../features/accountSlice'

const Login = () => {
	const dispatch = useDispatch();
	const accounts = useSelector(selectAccount)

	const signinHandler = () => {
		signInWithPopup(auth, authProvider)
			.then((userQuery) => {
				dispatch(login(userQuery.user));
				const { photoURL, displayName, email, uid } = userQuery.user;

				const userAccount = accounts?.find((account) => account.user.uid === uid);

				// Create account only if user account does not exist
				if(!userAccount) {

					const accountCollectionRef = collection(firestoreDb, "accounts");
					addDoc(accountCollectionRef, {
						user: { photoURL, displayName, email, uid },
						posts: 0,
					});

					console.log("New Account created");
				}
			})
			.catch((err) => console.error(err));
	};

	return (
		<div className={styles.login}>
			<div className={styles.login__container}>
				<h1>🚀Ruel Instagram Clone🤯</h1>
				<img
					src="https://freepngimg.com/save/69662-instagram-media-brand-social-logo-photography/1200x627"
					alt="Instagram logo"
				/>

				<button onClick={signinHandler}>Sign in with Google</button>
			</div>
		</div>
	);
};

export default Login;
