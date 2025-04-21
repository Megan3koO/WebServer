from credential import CredentialManager
import getpass
import os

def main():
    cm = CredentialManager()

    username = str(input("Please enter username: "))
    #password = str(input("Please enter password: \n"))
    password = getpass.getpass("Please enter password:")

    #Generate keys
    cm.GenerateKeys('rsa')

    #Encrypt password
    encrypted_password = cm.Encrypt(password)

    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    cwd = os.getcwd()

    with open(os.path.join(cwd, 'credentials.txt'), 'w') as f:
        f.write(f"{username}\n")
        f.write(encrypted_password)
        f.close()

if __name__ == '__main__':
    main()