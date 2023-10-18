import { Box } from "@mui/material";
import Modal from "@mui/material/Modal";
import { useState } from "react";

const CustomModal = ({ modalOpen, setModalOpen, children }) => {
	// const [modalOpen, setModalOpen] = useState(false);

	const style = {
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",
		width: "auto",
		backgroundColor: "white",
		border: "2px solid #dbdbdb",
		borderRadius: "10px",
		boxShadow: 24,
		p: 4,
	};

	return (
		<Modal open={modalOpen} onClose={() => setModalOpen(false)}>
			<Box style={style}>{children}</Box>
		</Modal>
	);
};

export default CustomModal;
