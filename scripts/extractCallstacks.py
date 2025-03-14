import argparse
import subprocess
import re
import os, shutil

FINGERPRINT_SUBSTR_LENGTH = 7
PROJECT = "PROJECT_NAME"

def ExtractUniqueFingerprints(matches):
    visited = set()
    visited_matches = []
    for fp, cs in matches:
        if not fp in visited:
            visited.add(fp)
            visited_matches.append((fp,cs))
    
    return visited_matches

def ReorderFingerprintAndCallstack(origin : list, target : list):
    result = []
    if (len(origin) == 1):
        return origin
    for fingerprint in target:
        for item in origin:
            if fingerprint == item[0][:FINGERPRINT_SUBSTR_LENGTH]:
                result.append(item)
                origin.remove(item)
                break

    return result

def main():
    parser = argparse.ArgumentParser(description='Query for callstacks and store it to disk')

    parser.add_argument('version', type=str, help='app version')
    parser.add_argument('platform', type=str, help='platform')
    parser.add_argument('fingerprints', type=str, help='fingerprints')
    parser.add_argument('path_to_callstacks', type=str, help='path to callstack files')
    args = parser.parse_args()

    cmd = f'morgue list {PROJECT}  --filter=fingerprint,regular-expression,"{'|'.join(args.fingerprints.split('_'))}" --filter=app.buildType,regular-expression,"{args.platform}" --filter=app.version,regular-expression,"{args.version}" --select=fingerprint --select=callstack'
    result = subprocess.check_output(cmd, shell=True).decode('utf-8', 'ignore')
    #print(result)
    pattern = r"fingerprint:\s([a-f0-9]+)\s*callstack:\s([\s\S]+?)(?=\n#|\Z)"
    matches = re.findall(pattern, result)
    matches = ExtractUniqueFingerprints(matches)
    matches = ReorderFingerprintAndCallstack(matches, args.fingerprints.split('_'))

    print(args.fingerprints.split('|'))
    #path_to_callstack = f'{os.getcwd()}\\backtrace_callstacks'

    if os.path.exists(args.path_to_callstacks):
        shutil.rmtree(path=args.path_to_callstacks)
    os.makedirs(args.path_to_callstacks, exist_ok=True)

    for item in matches:
        with open(f'{args.path_to_callstacks}/{item[0][:FINGERPRINT_SUBSTR_LENGTH]}.txt', 'w', encoding='utf-8') as f:
            print(f"Processing fingerprint {item[0][:FINGERPRINT_SUBSTR_LENGTH]}")
            f.write(item[1])
            f.close()

if __name__ == '__main__':
    main()
