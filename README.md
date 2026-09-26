# Fly / Carrom

An intentionally opinionated visualization of a connectome-constrained fly playing carrom. The browser scene is real WebGL via Three.js: a perspective camera, lit board, coin, striker, trajectory, and a procedural fly body built from meshes (head, thorax, abdomen, eyes, wings, and legs).

Run locally:

```bash
python -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python -m uvicorn app:app --reload --port 8787
```

Open http://127.0.0.1:8787/.

The Python side is inspectable: `physics.py` contains the deterministic board rollout, `brain.py` defines the fixed-reservoir/readout boundary, and `download_connectome.py` verifies official MaleCNS v1.0 tables by SHA-256 before use. The UI is a view over those APIs.
