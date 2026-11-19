import { Component } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

export default class ErrorBoundary extends Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    handleRetry = () => {
        this.setState({ hasError: false });
    };

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{ 
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        p: 20
                    }}
                >
                    <Typography sx={{ fontSize: 30, fontWeight: 'bold' }}>Something went wrong...</Typography>
                    <IconButton aria-label="Try again" onClick={this.handleRetry}>
                        <RestartAltIcon />
                    </IconButton>
                </Box>
            );
        }

        return this.props.children;
    }
}