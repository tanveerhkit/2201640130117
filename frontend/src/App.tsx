import { AppBar, Box, Container, Toolbar, Typography, Tabs, Tab } from "@mui/material";
import { useLocation, useNavigate, Routes, Route } from "react-router-dom";
import ShortenerPage from "./pages/ShortenerPage";
import StatsPage from "./pages/StatsPage";

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    "aria-controls": `tabpanel-${index}`,
  } as const;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const current = location.pathname.startsWith("/stats") ? 1 : 0;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            URL Shortener
          </Typography>
          <Tabs
            value={current}
            onChange={(_e, v) => navigate(v === 0 ? "/" : "/stats")}
            textColor="inherit"
            indicatorColor="secondary"
          >
            <Tab label="Shorten" {...a11yProps(0)} />
            <Tab label="Statistics" {...a11yProps(1)} />
          </Tabs>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 4 }}>
        <Routes>
          <Route path="/" element={<ShortenerPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </Container>
    </Box>
  );
}

