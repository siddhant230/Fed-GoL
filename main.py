from pathlib import Path
import shutil
from PIL import Image
from flask import Flask, request, jsonify, send_from_directory, render_template
import os
from rembg import remove

from syftbox.lib import Client, SyftPermission
import os
from datetime import datetime, timezone
from typing import Tuple

from img_processor import remove_background
from werkzeug.utils import secure_filename

app = Flask(__name__)

API_NAME = "game_of_life"
AGGREGATOR_DATASITE = "irina@openmined.org"
OUTPUT_PATH = ""
IMAGE_INPUT_PATH = ""

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/images/<path:filename>')
def serve_image(filename):
    return send_from_directory('static/images', filename)

@app.route('/save_data', methods=['POST'])
def save_data():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    event_file: Path = OUTPUT_PATH / "event.txt"
    try:
        image_name = data['image_name']
        sx = data['sx']
        sy = data['sy']
        with open(event_file, 'a') as f:
            f.write(f"{image_name},{sx},{sy},{datetime.now().strftime('%Y%m%d_%H%M%S')}\n")
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/upload_image', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join('static/images', filename)
        
        input_image = Image.open(file)
        output = remove(input_image)
        output.save(filepath)
        load_images("static/images", IMAGE_INPUT_PATH)

        return jsonify({'success': True, 'filename': filename})
    
    return jsonify({'error': 'File upload failed'}), 400


@app.route('/health')
def health_check():
    """Simple health check endpoint"""
    return jsonify({'status': 'healthy'}), 200


def create_restricted_public_folder(events_path: Path) -> None:
    os.makedirs(events_path, exist_ok=True)

    # Set default permissions for the created folder
    permissions = SyftPermission.datasite_default(email=client.email)
    permissions.read.append(AGGREGATOR_DATASITE)
    permissions.save(events_path)


def load_images(from_path, to_path):
    for file in os.listdir(from_path):
        src = os.path.join(from_path, file)
        shutil.copy2(src, to_path)

if __name__ == "__main__":
    client = Client.load()

    # Create input folder for the current user
    IMAGE_INPUT_PATH = client.datasite_path / "api_data" / API_NAME / "images"
    create_restricted_public_folder(IMAGE_INPUT_PATH)
    load_images("static/images", IMAGE_INPUT_PATH)

    print(IMAGE_INPUT_PATH)

    OUTPUT_PATH = client.datasite_path / "api_data" / API_NAME / "events"
    create_restricted_public_folder(OUTPUT_PATH)

    app.run(debug=False, port=8090) 
