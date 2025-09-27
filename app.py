# app.py
import os
from flask import Flask, request, render_template, send_file, jsonify
from werkzeug.utils import secure_filename
from rembg import remove
from PIL import Image
import io

UPLOAD_FOLDER = "uploads"
ALLOWED_EXT = {"png", "jpg", "jpeg", "webp"}

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 25 * 1024 * 1024  # 25 MB max upload

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    ext = filename.rsplit(".", 1)[-1].lower()
    return "." in filename and ext in ALLOWED_EXT

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/remove", methods=["POST"])
def remove_bg():
    if "image" not in request.files:
        return jsonify({"error": "no file part"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "no selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "unsupported file type"}), 400

    filename = secure_filename(file.filename)
    in_bytes = file.read()
    try:
        # Use rembg to remove background; returns bytes
        out_bytes = remove(in_bytes)
        # ensure result is PNG with alpha
        out_img = Image.open(io.BytesIO(out_bytes)).convert("RGBA")
        bio = io.BytesIO()
        out_img.save(bio, format="PNG")
        bio.seek(0)
        return send_file(
            bio,
            mimetype="image/png",
            as_attachment=True,
            download_name=f"{os.path.splitext(filename)[0]}_no_bg.png"
        )
    except Exception as e:
        app.logger.exception("background removal failed")
        return jsonify({"error": "processing failed", "detail": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
