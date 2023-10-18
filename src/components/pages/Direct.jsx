import styles from "./Direct.module.css";
import Contacts from "../Contacts";
import { Outlet } from "react-router-dom";

const Direct = () => {
	return (
		<div className={styles.direct}>
			<Contacts />
			<Outlet />
		</div>
	);
};

export default Direct;
