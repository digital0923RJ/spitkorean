from quart import jsonify

def api_response(data=None, message="", status="success", code=200, meta=None):
    """표준화된 API 응답 생성"""
    response = {
        "status": status,
        "message": message,
    }
    
    if data is not None:
        response["data"] = data
        
    if meta is not None:
        response["meta"] = meta
        
    return jsonify(response), code
    
def error_response(message, code=400, error_type=None):
    """표준화된 오류 응답"""
    response = {
        "status": "error",
        "message": message,
    }
    
    if error_type:
        response["error_type"] = error_type
        
    return jsonify(response), code