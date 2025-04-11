from subprocess import * 
from CredentialManager import Decrypt
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)
cwd = os.getcwd()

with open(os.path.join(cwd, 'credentials.txt'), 'r') as f:
    data = f.readlines()
    f.close()

username = data[0].strip()
password = data[1].strip()

#should decrypt the credentials
decrypted_password = Decrypt(password)

filePath = os.path.join(cwd, 'loginBacktrace.bat')
p = Popen([filePath, username, decrypted_password], stdin=PIPE, stdout=PIPE, stderr=PIPE, text=True)
out, err = p.communicate()
print(out)
if err:
    print(err)

p = Popen([os.path.join(cwd, 'removeEnvironmentVars.bat')], shell=True)
p.communicate()

