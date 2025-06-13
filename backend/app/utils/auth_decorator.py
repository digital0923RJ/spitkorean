from functools import wraps
from quart import request, jsonify, current_app

def require_auth(f):
    """
    Decorator for authentication in Quart.
    """
    @wraps(f)
    async def decorated_function(*args, **kwargs):
        try:
            auth_header = request.headers.get('Authorization')
            
            if not auth_header:
                return jsonify({
                    "success": False,
                    "message": "Authorization token required.",
                    "error_code": "MISSING_TOKEN"
                }), 401
            
            # Extract the token (Format: "Bearer <token>")
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({
                    "success": False,
                    "message": "Invalid token format.",
                    "error_code": "INVALID_TOKEN_FORMAT"
                }), 401
            
            # Basic token validation (you can integrate with Auth0 here)
            if not token:
                return jsonify({
                    "success": False,
                    "message": "Invalid token.",
                    "error_code": "INVALID_TOKEN"
                }), 401
            
            # TODO: Implement real token verification (e.g., using Auth0)
            # user_info = await verify_auth0_token(token)
            # request.user_id = user_info['user_id']
            
            # Temporary simulated user ID
            request.user_id = "temp_user_123"
            
            return await f(*args, **kwargs)
            
        except Exception as e:
            current_app.logger.error(f"Authentication error: {str(e)}")
            return jsonify({
                "success": False,
                "message": "Authentication error.",
                "error_code": "AUTH_ERROR"
            }), 500
    
    return decorated_function

def no_auth(f):
    """
    Temporary decorator that bypasses authentication for development purposes.
    """
    @wraps(f)
    async def decorated_function(*args, **kwargs):
        # Simulate a user ID for development
        request.user_id = "dev_user_123"
        return await f(*args, **kwargs)
    
    return decorated_function
