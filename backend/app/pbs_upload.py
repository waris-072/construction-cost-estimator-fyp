import os
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename

pbs_upload_bp = Blueprint('pbs_upload', __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'pbs_data')
ALLOWED_EXTENSIONS = {'xlsx', 'xls'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@pbs_upload_bp.route('/admin/upload-pbs', methods=['POST'])
def upload_pbs_file():
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        filename = secure_filename('pbs_latest.xlsx')
        file.save(os.path.join(UPLOAD_FOLDER, filename))
        return jsonify({'success': True, 'message': 'PBS file uploaded successfully'}), 200
    return jsonify({'success': False, 'error': 'Invalid file type'}), 400
