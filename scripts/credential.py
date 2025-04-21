#pip install cryptography
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
import os
import base64

class CredentialManager:
    ErrorCode = {"SUCCESS" : 0, "FAILED_TO_GENERATE_KEY" : -1, "UNSUPPORTED_ENCRYTION_METHOD" : -2}

    def __init__(self):
        # Set up file path
        script_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(script_dir)
        self.cwd = os.getcwd()

    def Encrypt(self, message: str):
        encrypt = ""
        try:
            with open(os.path.join(self.cwd, "public_key.pem"), "rb") as f:
                public_key = serialization.load_pem_public_key(f.read())

            #message = b"{s}".format(s=i_message)
            encrypted = public_key.encrypt(
                        message.encode(),
                        padding.OAEP(
                            mgf=padding.MGF1(algorithm=hashes.SHA256()),
                            algorithm=hashes.SHA256(),
                            label=None))
            encrypted = base64.b64encode(encrypted).decode('utf-8')
        except Exception as e:
            print(f"Error when trying to encrypt: {e}")
        return encrypted
        
    def Decrypt(self, message: str):
        decrypted = b""
        try:
            with open(os.path.join(self.cwd, "private_key.pem"), "rb") as f:
                private_key = serialization.load_pem_private_key(f.read(), password=None)

            encrypted_bytes = base64.b64decode(message)
            decrypted = private_key.decrypt(
                            encrypted_bytes,
                            padding.OAEP(
                                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                                algorithm=hashes.SHA256(),
                                label=None,
                            )
            )
        except Exception as e:
            print(f"Error when trying to decrypt: {e}")
        return decrypted.decode()

    def _GenerateRSAKey(self):
        # Generate RSA key pair
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )

        # Get public key
        public_key = private_key.public_key()

        # Save private key to PEM file
        with open(os.path.join(self.cwd, "private_key.pem"), "wb") as f:
            f.write(private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption(),
            ))

        # Save public key to PEM file
        with open(os.path.join(self.cwd, "public_key.pem"), "wb") as f:
            f.write(public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo,
            ))

        return self.ErrorCode["SUCCESS"]

    def GenerateKeys(self, type : str):
        error = 0
        if type == 'rsa':
            error = self._GenerateRSAKey()
        else: #no valid encryption method
            error = self.ErrorCode["UNSUPPORTED_ENCRYTION_METHOD"]
        return error
            