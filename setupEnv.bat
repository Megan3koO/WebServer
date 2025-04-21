REM installing python dependencies
pip install -r requirements.txt

REM setting up credentials for backtrace
python scripts\\setupCredentials.py

REM install npm dependencies
npm install