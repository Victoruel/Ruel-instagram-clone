import { useSelector } from "react-redux";
import styles from "./Contacts.module.css";
import { selectUser } from "../features/userSlice";
import { IconButton, Tooltip } from "@mui/material";
import { DriveFileRenameOutlineOutlined } from "@mui/icons-material";
import { selectAccount } from "../features/accountSlice";
import Contact from "./Contact";

const Contacts = () => {
	const accounts = useSelector(selectAccount);

	const { displayName, uid } = useSelector(selectUser);
	const otherAccounts = accounts.filter((account) => account.user.uid !== uid);

	return (
		<div className={styles.contacts}>
			{/* header */}
			<div className={styles.contacts__header}>
				<div className={styles.contacts__header_top}>
					<h2>{displayName.split(" ")[0]}</h2>
					<Tooltip title="New message">
						<IconButton>
							<DriveFileRenameOutlineOutlined />
						</IconButton>
					</Tooltip>
				</div>
				<div className={styles.contacts__header_bottom}>
					<h4>Message</h4>
					<p>Requests</p>
				</div>
			</div>
			<div className={styles.contacts__body}>
				{otherAccounts.length > 0 ? (
					otherAccounts.map((account) => (
						<Contact
							key={account.id}
							displayName={account.user.displayName}
							photoURL={account.user.photoURL}
							uid={account.user.uid}
						/>
					))
				) : (
					<h3>Loading chats...</h3>
				)}
			</div>
		</div>
	);
};

export default Contacts;
