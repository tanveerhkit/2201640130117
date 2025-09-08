import { Box, Grid, TextField } from "@mui/material";
import { useEffect } from "react";

export interface UrlRowProps {
  index: number;
  value: { url: string; validity?: string; shortcode?: string };
  onChange: (val: UrlRowProps["value"]) => void;
  errors?: Partial<Record<keyof UrlRowProps["value"], string>>;
}

export default function UrlRow({ index, value, onChange, errors }: UrlRowProps) {
  useEffect(() => {
    // Auto-trim
  }, [value]);
  return (
    <Box sx={{ my: 1 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <TextField
            label={`Long URL #${index + 1}`}
            fullWidth
            value={value.url}
            onChange={(e) => onChange({ ...value, url: e.target.value })}
            error={!!errors?.url}
            helperText={errors?.url}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <TextField
            label="Validity (minutes)"
            fullWidth
            value={value.validity ?? ""}
            onChange={(e) => onChange({ ...value, validity: e.target.value })}
            error={!!errors?.validity}
            helperText={errors?.validity}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <TextField
            label="Preferred Shortcode"
            fullWidth
            value={value.shortcode ?? ""}
            onChange={(e) => onChange({ ...value, shortcode: e.target.value })}
            error={!!errors?.shortcode}
            helperText={errors?.shortcode}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

