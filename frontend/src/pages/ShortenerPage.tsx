import { Alert, Box, Button, Card, CardContent, Grid, Link, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import UrlRow from "../components/UrlRow";
import { createShortUrl } from "../api/client";
import { Log } from "@app/logging-middleware";

type Row = { url: string; validity?: string; shortcode?: string };
type RowErrors = Partial<Record<keyof Row, string>>;

const MAX_ROWS = 5;

function isValidURL(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidShort(code: string): boolean {
  return /^[a-zA-Z0-9]{4,20}$/.test(code);
}

export default function ShortenerPage() {
  const [rows, setRows] = useState<Row[]>([{ url: "" }]);
  const [errors, setErrors] = useState<RowErrors[]>([]);
  const [results, setResults] = useState<{ url: string; shortLink: string; expiry: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const canAdd = rows.length < MAX_ROWS;

  useEffect(() => {
    Log("frontend", "info", "page", "shortener page open");
  }, []);

  const validate = (): boolean => {
    const errs: RowErrors[] = rows.map(() => ({}));
    rows.forEach((r, i) => {
      if (!r.url || !isValidURL(r.url)) errs[i].url = "Enter a valid http(s) URL";
      if (r.validity) {
        if (!/^\d+$/.test(r.validity)) errs[i].validity = "Validity must be an integer";
      }
      if (r.shortcode) {
        if (!isValidShort(r.shortcode)) errs[i].shortcode = "Use 4-20 alphanumeric";
      }
    });
    setErrors(errs);
    return errs.every((e) => Object.keys(e).length === 0);
  };

  const submitDisabled = useMemo(() => submitting || rows.length === 0, [submitting, rows.length]);

  const onSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    await Log("frontend", "info", "component", `submit ${rows.length} urls`);
    const nextResults: { url: string; shortLink: string; expiry: string }[] = [];
    for (const r of rows) {
      try {
        const payload: any = { url: r.url };
        if (r.validity) payload.validity = parseInt(r.validity, 10);
        if (r.shortcode) payload.shortcode = r.shortcode;
        const resp = await createShortUrl(payload);
        nextResults.push({ url: r.url, shortLink: resp.shortLink, expiry: resp.expiry });
      } catch (e: any) {
        nextResults.push({ url: r.url, shortLink: `Error: ${e.message}`, expiry: "-" });
      }
    }
    setResults(nextResults);
    // persist codes for stats page
    const codes = nextResults
      .map((r) => {
        const m = r.shortLink.match(/\/(\w+)$/);
        return m?.[1];
      })
      .filter(Boolean) as string[];
    const stored = JSON.parse(localStorage.getItem("shortcodes") || "[]");
    const merged = Array.from(new Set<string>([...stored, ...codes]));
    localStorage.setItem("shortcodes", JSON.stringify(merged));
    setSubmitting(false);
  };

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Shorten up to 5 URLs
          </Typography>
          {rows.map((row, i) => (
            <UrlRow
              key={i}
              index={i}
              value={row}
              errors={errors[i]}
              onChange={(val) => setRows((prev) => prev.map((p, idx) => (idx === i ? val : p)))}
            />
          ))}
          <Grid container spacing={2} mt={1}>
            <Grid item>
              <Button variant="contained" disabled={!canAdd} onClick={() => setRows((r) => [...r, { url: "" }])}>
                Add URL
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" color="success" disabled={submitDisabled} onClick={onSubmit}>
                Shorten
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" onClick={() => setRows([{ url: "" }])}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Results
            </Typography>
            <Stack spacing={1}>
              {results.map((r, i) => (
                <Box key={i}>
                  <Typography variant="body2">Original: {r.url}</Typography>
                  {r.shortLink.startsWith("Error:") ? (
                    <Alert severity="error">{r.shortLink}</Alert>
                  ) : (
                    <Typography>
                      Short: <Link href={r.shortLink}>{r.shortLink}</Link> — Expires: {new Date(r.expiry).toLocaleString()}
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}

