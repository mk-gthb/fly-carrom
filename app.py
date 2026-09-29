from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import math, random
import numpy as np
from physics import CarromBoard, Shot
from brain import FlyReadout

app = FastAPI(title="Fly Carrom")
board = CarromBoard()
fly = FlyReadout()
state = {"shots": 0, "potted": 0, "trained": False}

@app.get("/api/state")
def get_state():
    return {**state, "layout": {"coin": board.coin.tolist(), "striker": 0.0, "target": board.target}, "running": False, "graph": fly.graph_status}

@app.post("/api/reset")
def reset():
    board.reset()
    state.update(shots=0, potted=0)
    return get_state()

@app.get("/api/baseline")
def baseline():
    s = board.baseline()
    return {"angle": s.angle, "power": s.power, "striker": s.striker, "target": board.target}

@app.post("/api/shot")
def shot(payload: dict):
    state["shots"] += 1
    angle = float(payload.get("angle", 0))
    power = float(payload.get("power", .8))
    result = board.rollout(Shot(angle, power, float(payload.get("striker", 0))))
    potted = result["potted"]
    state["potted"] += int(potted)
    return {**get_state(), "potted_this_shot": potted, "physics": result, "shot": payload}

@app.post("/api/train")
def train():
    examples = []
    for coin_x in np.linspace(-.35, .35, 6):
        for coin_y in np.linspace(-.25, .3, 4):
            layout = {"coin": [float(coin_x), float(coin_y)], "striker": 0.0, "target": 1}
            examples.append((layout, np.array([24.0 + coin_x * 20, .78 + abs(coin_y) * .1, coin_x * .7])))
    fly.fit(examples)
    state["trained"] = True
    return {"trained": True, "samples": fly.samples, "message": "Readout fitted on geometric demonstrations.", "graph": fly.graph_status}

@app.post("/api/fly-shot")
def fly_shot():
    action = fly.act(get_state()["layout"])
    action["controller"] = "connectome-readout"
    return shot(action)

@app.get("/")
def index():
    return FileResponse("static/index.html")

@app.get("/style.css")
def style():
    return FileResponse("static/style.css", media_type="text/css")

@app.get("/app.js")
def javascript():
    return FileResponse("static/app.js", media_type="text/javascript")

@app.get("/controls-fallback.js")
def controls_fallback():
    return FileResponse("static/controls-fallback.js", media_type="text/javascript")

app.mount("/static", StaticFiles(directory="static"), name="static")
