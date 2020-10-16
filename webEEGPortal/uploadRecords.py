from __future__ import absolute_import
import numpy as np
from PIL import Image
import datetime
import base64
import os, sys, traceback
from imijPortalApp.models import *

def uploadRecords():

    try:
        dirlist = [x for x in os.listdir("/data/Synology_Scans/Processing/Ants/") ]
        print (dirlist)
        for index, username in enumerate(dirlist):
            print (username)
# '/data/Synology_Scans/Processing/Ants/IMIJ_000025/39f713694f0bd89403d96e029122fab8
            if username.find('Imij_000061') == -1:
 		             continue
            print (" found user " + username)
            users = User.objects.filter(username = username)
            if len(users) > 0:
                user = users[0]
            else:
                user = User.objects.create_user(username=username, email='a@a.com', password='imij')
                imijUser = ImijUser()

                imijUser.user = user
                imijUser.addressLine1 = "addressLine1 " + str(user.id)
                imijUser.addressLine2 = "addressLine2 " + str(user.id)
                imijUser.city = "city " + str(user.id)
                imijUser.state = "NY"
                imijUser.zipCode = "1234566"
                imijUser.phoneNumber = "99988877789"

                imijUser.save()
            print (" after user ")
            fileNames = [x for x in os.listdir("/data/Synology_Scans/Processing/Ants/" + username) ]
            print (" filenames " + username)

            for fileName in fileNames:
                print (fileName)
                uploadFolder = UploadFolder(name="test_" + str(index), description=str(fileName), chksum=fileName, uploadedDate = datetime.datetime.now(), user= user, status = "Analysis Completed")
                uploadFolder.save()
    except:
        traceback.print_exc(file=sys.stdout)
    return

uploadRecords()
