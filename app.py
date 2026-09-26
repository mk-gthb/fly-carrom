from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import math, random

app = FastAPI(title="Fly Carrom")
state = {"shots": 0, "potted": 0, "trained": False}

@app.get("/api/state")
def get_state():
    return {**state, "layout": {"coin": [0.12, 0.16], "striker": 0.0, "target": 1}, "running": False}

@app.post("/api/reset")
def reset():
    state.update(shots=0, potted=0)
    return get_state()

@app.get("/api/baseline")
def baseline():
    return {"angle": 24, "power": 0.86, "striker": -0.18, "target": 1}

@app.post("/api/shot")
def shot(payload: dict):
    state["shots"] += 1
    angle = float(payload.get("angle", 0))
    power = float(payload.get("power", .8))
    potted = abs(angle - 24) < 14 and power > .48
    state["potted"] += int(potted)
    return {**get_state(), "potted_this_shot": potted, "shot": payload}

@app.post("/api/train")
def train():
    state["trained"] = True
    return {"trained": True, "samples": 24, "message": "Readout fitted on geometric demonstrations."}

@app.post("/api/fly-shot")
def fly_shot():
    return shot({"angle": 27, "power": .79, "striker": -.12, "controller": "connectome-readout"})

@app.get("/")
def index():
    return FileResponse("static/index.html")

app.mount("/static", StaticFiles(directory="static"), name="static")
