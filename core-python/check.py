""" Authentication check decorator """
from sap import xssec

from functools import wraps
from flask import request
from flask import Response
from flask import g

def validatejwt(encodedJwtToken):
    uaa_credentials = g._uaa_credentials
    xs_sec = xssec.create_security_context(encodedJwtToken, uaa_credentials)
    if xs_sec.get_grant_type == None:
        return False
    return True

def checktoken():
    authHeader = request.headers.get('Authorization')
    if authHeader == None:
        return False

    encodedJwtToken = authHeader.replace('Bearer ', '').strip()
    if encodedJwtToken == '':
        return False

    return validatejwt(encodedJwtToken)

def sendauth():
    """Sends a 403 response"""
    return Response('Unauthorized', 403)

def authenticated(func):
    """ JWT token check decorator """
    @wraps(func)
    def decorated(*args, **kwargs):
        if not checktoken():
            return sendauth()

        return func(*args, **kwargs)

    return decorated
