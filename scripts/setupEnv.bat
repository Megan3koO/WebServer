REM installing python dependencies
pushd ..
pip install -r requirements.txt
popd

REM setting up credentials for backtrace
python setupCredentials.py

REM install npm dependencies
npm install