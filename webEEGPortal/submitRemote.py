from conf import *
import asyncio, asyncssh, sys, os, traceback

async def run_client():
    print (" before ")
    async with asyncssh.connect(REMOTE_IP, username=REMOTE_USER, password=REMOTE_PASS) as conn:
        print (" after ")
        print (REMOTE_COMMAND + ' ' + REMOTE_PROGRAM)
        result = await conn.run(REMOTE_COMMAND + ' ' + REMOTE_PROGRAM, check=True)
        print(result.stdout, end='')

try:
    asyncio.get_event_loop().run_until_complete(run_client())
except (OSError, asyncssh.Error) as exc:
    traceback.print_exc(file=sys.stdout)
    sys.exit('SSH connection failed: ' + str(exc))
