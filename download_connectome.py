"""Download official MaleCNS v1.0 tables into a local, ignored data directory."""
from pathlib import Path
from urllib.request import urlretrieve
import hashlib, os

BASE = "https://storage.googleapis.com/flyem-male-cns/v1.0/connectome-data/flat-connectome/"
FILES = {
    "body-annotations-male-cns-v1.0-minconf-0.5.feather": "2177e246113e4cfbf1e7772ec37c6da1955ff22e8063d0b1f833101f99a9a3b2",
    "body-neurotransmitters-male-cns-v1.0.feather": "95c9289220663abeb3409f3ad9e5a7f8a53f8093f5139d15502cd08da8879621",
    "connectome-weights-male-cns-v1.0-minconf-0.5.feather": "e35da783d1c686b2b58b3b87cd6a403ae43bfcfba8bff28e08ef752c1a56afc1",
}
def main():
    out = Path(os.getenv("CONNECTOME_DATA_DIR", "connectome-data/malecns-v1.0")); out.mkdir(parents=True, exist_ok=True)
    for name, expected in FILES.items():
        path = out / name
        if not path.exists(): urlretrieve(BASE + name, path)
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        if digest != expected: raise RuntimeError(f"checksum mismatch for {name}: {digest}")
        print(f"verified {name}")
if __name__ == "__main__": main()
