# Fly / Carrom

An intentionally opinionated visualization of a connectome-constrained fly playing carrom. The board is rendered as a small 3D perspective scene in the browser; the fly is a modeled body silhouette with animated wings, beside the board it is controlling.

Run locally:

```bash
python -m venv .venv
.venv/bin/pip install fastapi uvicorn
.venv/bin/python -m uvicorn app:app --reload --port 8787
```

Open http://127.0.0.1:8787/.
