import { Card, CardContent, Chip, Grid, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getStats, StatsResp } from "../api/client";
import { Log } from "@app/logging-middleware";

export default function StatsPage() {
  const [codes, setCodes] = useState<string[]>([]);
  const [stats, setStats] = useState<Record<string, { data?: StatsResp; error?: string }>>({});

  useEffect(() => {
    Log("frontend", "info", "page", "stats page open");
    const stored = JSON.parse(localStorage.getItem("shortcodes") || "[]");
    setCodes(stored);
  }, []);

  useEffect(() => {
    async function run() {
      for (const code of codes) {
        try {
          const data = await getStats(code);
          setStats((s) => ({ ...s, [code]: { data } }));
        } catch (e: any) {
          setStats((s) => ({ ...s, [code]: { error: e.message } }));
        }
      }
    }
    if (codes.length) run();
  }, [codes]);

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Short URLs Statistics</Typography>
      {codes.length === 0 && <Typography variant="body1">No short URLs yet. Create some in the Shorten tab.</Typography>}
      {codes.map((code) => {
        const entry = stats[code];
        const s = entry?.data;
        return (
          <Card key={code}>
            <CardContent>
              <Typography variant="h6">/{code}</Typography>
              {entry?.error && <Typography color="error">{entry.error}</Typography>}
              {s && (
                <Stack spacing={1}>
                  <Typography variant="body2">Original: {s.url}</Typography>
                  <Typography variant="body2">Created: {new Date(s.createdAt).toLocaleString()}</Typography>
                  <Typography variant="body2">Expires: {new Date(s.expiresAt).toLocaleString()}</Typography>
                  <Typography variant="body2">Total Clicks: <Chip label={s.totalClicks} color="primary" size="small" /></Typography>
                  <Typography variant="subtitle1">Click Details</Typography>
                  <Grid container spacing={1}>
                    {s.clicks.map((c, idx) => (
                      <Grid item xs={12} md={6} key={idx}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="body2">Time: {new Date(c.timestamp).toLocaleString()}</Typography>
                            <Typography variant="body2">Source: {c.source}</Typography>
                            <Typography variant="body2">Location: {c.location}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              )}
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}

