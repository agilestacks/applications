import hashlib

def sha1(s, salt=''):
    """returns sha1 encoded string. optionally supports salt
    """
    return hashlib.md5(f"{s}:{salt}".encode()).hexdigest()
