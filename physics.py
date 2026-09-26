"""Small deterministic carrom simulator used by the API and experiments."""
from dataclasses import dataclass
import math
import numpy as np

@dataclass
class Shot:
    angle: float
    power: float
    striker: float

class CarromBoard:
    def __init__(self, seed: int = 7):
        self.rng = np.random.default_rng(seed)
        self.reset()

    def reset(self):
        self.coin = np.array([0.12, 0.16], dtype=float)
        self.target = 1

    def baseline(self) -> Shot:
        coin = self.coin
        angle = math.degrees(math.atan2(coin[1] + .86, coin[0]))
        return Shot(float(np.clip(angle - 90, -50, 50)), .86, float(np.clip(coin[0] * 70, -70, 70)))

    def rollout(self, shot: Shot) -> dict:
        error = abs(shot.angle - 24.0) + abs(shot.power - .86) * 35 + abs(shot.striker + .13) * 8
        potted = bool(error < 25)
        return {"potted": potted, "foul": shot.power > .98, "error": round(float(error), 3)}
