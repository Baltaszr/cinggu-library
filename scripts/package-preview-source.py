"""Build the corresponding-source download for the local matching-UX preview."""
from pathlib import Path
import tarfile
root = Path(__file__).resolve().parents[1]
excluded = {"node_modules", ".git", "dist", ".vercel", ".DS_Store", "coverage"}
def source_only(info):
    if info.name.endswith("/matching-preview.png"):
        return None
    parts = Path(info.name).parts
    if any(part in excluded or (part.startswith(".env") and part != ".env.example") or part.endswith((".tar.gz", ".tgz")) for part in parts):
        return None
    return info
with tarfile.open(root / "public/cinggu-avatar-source.tar.gz", "w:gz") as archive:
    archive.add(root, arcname="cinggu-library", filter=source_only)
print("Local preview source archive prepared.")
