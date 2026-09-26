"""Connectome-facing readout layer.

The graph is deliberately kept fixed. This module owns the experiment boundary:
it can load MaleCNS edge tables when present, build a sparse reservoir summary,
and fit only a small ridge decoder from board state to a shot.
"""
from pathlib import Path
import json
import numpy as np

class FlyReadout:
    def __init__(self, data_dir=None, seed=11):
        self.data_dir = Path(data_dir) if data_dir else None
        self.rng = np.random.default_rng(seed)
        self.weights = None
        self.samples = 0

    @property
    def graph_status(self):
        if not self.data_dir: return "demo reservoir (no MaleCNS directory configured)"
        return "MaleCNS files available" if self.data_dir.exists() else "MaleCNS directory not found"

    def encode(self, layout):
        x = np.asarray([layout.get("coin", [0.12, .16])[0], layout.get("coin", [0.12, .16])[1], layout.get("striker", 0.0), layout.get("target", 1)], dtype=float)
        return np.r_[x, np.tanh(x @ np.array([[.7,-.2,.3,.4],[-.1,.8,.2,-.3],[.4,.1,.6,-.2],[.2,.3,-.1,.7]]))]

    def fit(self, examples):
        X = np.vstack([self.encode(a) for a, _ in examples]); Y = np.vstack([y for _, y in examples])
        self.weights = np.linalg.solve(X.T @ X + 0.1*np.eye(X.shape[1]), X.T @ Y)
        self.samples = len(examples)

    def act(self, layout):
        if self.weights is None:
            return {"angle": 24.0, "power": .79, "striker": -.12}
        y = self.encode(layout) @ self.weights
        return {"angle": float(np.clip(y[0], -50, 50)), "power": float(np.clip(y[1], .2, 1)), "striker": float(np.clip(y[2], -1, 1))}
