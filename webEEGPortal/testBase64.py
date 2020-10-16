data = base64.b64encode(open(new_nii, 'rb').read()).decode('utf-8')
f = open("myfile", "rb")
try:
    byte = f.read(1)
    while byte != "":
        # Do stuff with byte.
        byte = f.read(1)
finally:
    f.close()
