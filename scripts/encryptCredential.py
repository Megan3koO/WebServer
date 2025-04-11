from CredentialManager import Encrypt
import getpass


username = str(input("Please enter username: "))
#password = str(input("Please enter password: \n"))
password = getpass.getpass("Please enter password:")
encrypted_password = Encrypt(password)

with open('credentials.txt', 'w') as f:
    f.write(f"{username}\n")
    f.write(encrypted_password)
    f.close()