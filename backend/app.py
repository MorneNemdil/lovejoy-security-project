# SQLAlchemy ACTS AS SQL INJECTION PROTECTION
#   => it automatically sanitises db inputs and protects from sql injection attacks right out the box

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy # <============= SQL INJECTION PROTECTION
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import get_jwt, create_access_token, jwt_required, get_jwt_identity, JWTManager
from dotenv import load_dotenv
import os
import re
import secrets
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
import uuid
import functools

load_dotenv()

app = Flask(__name__)

CORS(app, supports_credentials=True)

#  TASK 6 - db configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

app.config['UPLOAD_FOLDER'] = os.path.join(basedir, 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 # 16 MB max file size
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

class User (db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    reset_token = db.Column(db.String(100), unique=True, nullable=True)
    reset_token_expiry = db.Column(db.DateTime, nullable=True)
    
    is_admin = db.Column(db.Boolean, default=False)
    
    def __init__(self, name, email, phone, password, is_admin=False):
        self.name = name
        self.email = email
        self.phone = phone
        # hashing the password on creation
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')
        self.is_admin = is_admin
        
# TASK 6: db design (evaluation request table)
class EvaluationRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    details = db.Column(db.Text, nullable=False)
    contact_method = db.Column(db.String(50), nullable=False)
    photo_filename = db.Column(db.String(255), nullable=True)
    
    # foreign key to link to the user
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('requests', lazy=True))

    def __init__(self, details, contact_method, user_id, photo_filename=None):
        self.details = details
        self.contact_method = contact_method
        self.user_id = user_id
        self.photo_filename = photo_filename
        
def admin_required():
    def wrapper(fn):
        @functools.wraps(fn)
        @jwt_required() # check a user is logged in
        def decorator(*args, **kwargs):
            # get the admin claim from jwt
            claims = get_jwt()
            if claims.get('is_admin'):
                # if they are an admin, run the original function
                return fn(*args, **kwargs)
            else:
                # if not, return error
                return jsonify({"error": "Admins only!"}), 403
        return decorator
    return wrapper
        
def is_password_strong(password):
    """
    Checks if a password meets the strength criteria:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain an uppercase letter."
    if not re.search(r"[a-z]", password):
        return False, "Password must contain a lowercase letter."
    if not re.search(r"[0-9]", password):
        return False, "Password must contain a number."
    if not re.search(r"[^A-Za-z0-9]", password):
        return False, "Password must contain a special character (e.g., !@#$)."

    return True, "Password is strong."
      
# -- API ENDPOINTS --
  
# test endpoint to make sure api is running
@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"message": "Hello from your Flask API!"})

# TASK 1 - secure registration endpoint
@app.route('/api/register', methods=['POST'])
def register():
    # get data from frontend
    data = request.get_json()
    
    # check if all required fields are present
    if not data or not data.get('email') or not data.get('password') or not data.get('name') or not data.get('phone'):
        return jsonify({"error": "Missing required fields"}), 400
    
    is_strong, message = is_password_strong(data.get('password'))
    if not is_strong:
        return jsonify({"error": message}), 400

    # check if user already exists
    existing_user = User.query.filter_by(email=data.get('email')).first()
    if existing_user:
        return jsonify({"error": "Email already in use"}), 409

    # create new user
    # the password is going to be hashed by the __init__ method in the User class
    try:
        is_admin_flag = False
        if data.get('email') == 'admin@lovejoy.com': # admin role applied only for this user
            is_admin_flag = True
        
        new_user = User(
            name=data.get('name'),
            email=data.get('email'),
            phone=data.get('phone'),
            password=data.get('password'),
            is_admin=is_admin_flag,
        )
        
        # add usr to db
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({"message": "User registered successfully"}), 201
    
    except Exception as e:
        db.session.rollback() # revert changes if an error occurs
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# TASK 2 - secure login endpoint
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Missing required fields"}), 400

    user = User.query.filter_by(email=data.get('email')).first()

    # SECURITY: check if user exists
    # SECURITY: check password hash
    if user and bcrypt.check_password_hash(user.password, data.get('password')):
        # create a JWT token
        additional_claims = {'is_admin': user.is_admin}
        access_token = create_access_token(identity=str(user.id), additional_claims=additional_claims)
        return jsonify(access_token=access_token), 200
    else:
        # SECURITY: generic error message to prevent account enumeration
        return jsonify({"error": "Invalid credentials"}), 401
    
# TASK 3 - password recovery 
@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    if not data or not data.get('email'):
        return jsonify({"error": "Email is required"}), 400

    user = User.query.filter_by(email=data.get('email')).first()

    # SECURITY: dont reveal if the user exists or not
    if user:
        # generate a token
        token = secrets.token_urlsafe(32)
        
        # setting an expiry time (I chose 1 hour from now)
        expiry = datetime.utcnow() + timedelta(hours=1)
        
        # store the token and expiry in the database
        user.reset_token = token
        user.reset_token_expiry = expiry
        db.session.commit()
        
        # simulating email sending:
        # this is where you would email the link.
        # for this project, I'll just print it to the console
        reset_link = f"http://localhost:5173/reset-password/{token}"
        print("----------------------------------------------------")
        print(f"PASSWORD RESET LINK FOR: {user.email}")
        print(reset_link)
        print("----------------------------------------------------")

    return jsonify({"message": "If your email is registered, you will receive a password reset link."}), 200

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')

    if not token or not new_password:
        return jsonify({"error": "Token and new password are required"}), 400

    # find the user by the token
    user = User.query.filter_by(reset_token=token).first()

    # check if token is valid and not expired
    if not user:
        return jsonify({"error": "Invalid token"}), 400
    
    if user.reset_token_expiry < datetime.utcnow():
        # Invalidate the expired token
        user.reset_token = None
        user.reset_token_expiry = None
        db.session.commit()
        return jsonify({"error": "Token has expired"}), 400

    # check new password strength (REUSING YOUR FUNCTION)
    is_strong, message = is_password_strong(new_password)
    if not is_strong:
        return jsonify({"error": message}), 400

    # all checks passed: Update the password
    user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    
    # SECURITY: Invalidate the token immediately after use
    user.reset_token = None
    user.reset_token_expiry = None
    db.session.commit()

    return jsonify({"message": "Password has been reset successfully"}), 200
    
# TEST ROUTE FOR CHECKING LOGIN STATUS
# this is a protected route that cant be accessed without a valid JWT.
@app.route('/api/profile', methods=['GET'])
@jwt_required() # this protects the route
def profile():
    # get the user fromt the db using the token
    current_user_id = get_jwt_identity() 
    user = User.query.get(current_user_id) 
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify(logged_in_as={'id': user.id, 'email': user.email, 'name': user.name}), 200

# TASK 4 - 'request evaluation' endpoint (protected)
@app.route('/api/request-evaluation', methods=['POST'])
@jwt_required() # <-- This decorator protects the route
def request_evaluation():
    # get identity of logged in user
    user_id = get_jwt_identity()
    
    # check for form data
    if 'details' not in request.form or 'contact_method' not in request.form:
        return jsonify({"error": "Missing required form fields"}), 400

    details = request.form.get('details')
    contact_method = request.form.get('contact_method')
    photo_filename = None

    # UPLOADING THE FILES SECURELY:
    if 'photo' in request.files:
        file = request.files['photo']
        
        if file.filename == '':
            pass # name is optional so continue even fi file name blank

        if file and allowed_file(file.filename):
            # SECURITY: sanitize filename
            original_filename = secure_filename(file.filename)
            # SECURITY: create a unique, random filename
            # this prevents guessing filenames and overwriting files
            file_ext = original_filename.rsplit('.', 1)[1].lower()
            photo_filename = f"{uuid.uuid4().hex}.{file_ext}"
            
            # save the file
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], photo_filename))
        elif file and not allowed_file(file.filename):
            return jsonify({"error": "File type not allowed"}), 400

    # save the request to the database
    try:
        new_request = EvaluationRequest(
            details=details,
            contact_method=contact_method,
            user_id=user_id,
            photo_filename=photo_filename
        )
        db.session.add(new_request)
        db.session.commit()
        return jsonify({"message": "Evaluation request submitted successfully"}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/api/admin/requests', methods=['GET'])
@admin_required()
def get_all_requests():
    try:
        requests = EvaluationRequest.query.all()
        
        # formatting the requests
        output = []
        for req in requests:
            output.append({
                'id': req.id,
                'details': req.details,
                'contact_method': req.contact_method,
                'photo_filename': req.photo_filename,
                'user_id': req.user_id,
                'user_email': req.user.email
            })
            
        return jsonify(requests=output), 200
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@jwt.invalid_token_loader
def invalid_token_callback(reason):
    print("INVALID TOKEN: ", reason)
    return jsonify({"error": f"Invalid token: {reason}"}), 422

# running the app
if __name__ == '__main__':
    # this block is only for local development
    # it creates the database file if it doesn't exist
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)