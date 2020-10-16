from __future__ import absolute_import
import numpy as np
from PIL import Image
import datetime
import base64
import os, sys, traceback
from eegPortalApp.models import *

def updateUsers():

    try:

        users = User.objects.all()
        for user in users:
            if user.username.lower().find("imij") != -1:
                imijUsers = ImijUser.objects.filter(user = user)
                if len(imijUsers) == 0:

                    imijUser = ImijUser()

                    imijUser.user = user
                    imijUser.addressLine1 = "addressLine1 test"
                    imijUser.addressLine2 = "addressLine2 test"
                    imijUser.city = "city test"
                    imijUser.state = "NY"
                    imijUser.zipCode = "1234566"
                    imijUser.phoneNumber = "99988877789"

                    imijUser.save()

    except:
        traceback.print_exc(file=sys.stdout)
    return

updateUsers()
