from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.template import RequestContext
from django.shortcuts import render_to_response
from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.shortcuts import render
from django.conf import settings
from rest_framework.authentication import get_authorization_header, BaseAuthentication, TokenAuthentication, SessionAuthentication, BasicAuthentication
from rest_framework_jwt.authentication import JSONWebTokenAuthentication
from django.core.mail import send_mail
from joblib import Parallel, delayed
from operator import itemgetter
import hashlib
import pandas as pd
import shutil
import io
import os
import sys
import json
import traceback
import numpy as np
import seaborn as sns
import gzip
import nibabel as nib
import subprocess
from django import forms
from PIL import Image
import datetime
import base64
from glob import glob
import jwt
import datetime
from rest_framework.authentication import get_authorization_header
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework.status import HTTP_401_UNAUTHORIZED
from rest_framework.authtoken.models import Token
from rest_framework import permissions
from rest_framework.permissions import IsAuthenticated
import json
import glob
import matplotlib.pyplot as plt
from eegPortalApp.models import *
from eegPortalApp.eegPortalAppObjs import *
from eegPortalApp.eegPortalAppConstants import *
from django.contrib.auth import authenticate
import time
import paramiko
import pyedflib
import conf
from conf import *
import asyncio, asyncssh, sys
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils import six
from utils import *
from scipy.io import loadmat, savemat
class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return (
            six.text_type(user.pk) + six.text_type(timestamp) +
            six.text_type(user.profile.email_confirmed)
        )

statusColorMap =  { 'Uploaded': '#EDF59A',  'Score Calculated': '#32FFC8', 'Analysis Submitted': '#CBF022',   'Analysis Completed':'#36CBEC'}

regionMap = {
             "17":{"name":"LH","color":"#DCD814","rgbcolor":[220,216,20], "rgbacolor":'rgba(220,216,20,1)', "rgba02color":'rgba(220,216,20,0.2)', "rgba08color":'rgba(220,216,20,0.8)'},
             "27":{"name":"LSN","color":"#00FF14","rgbcolor":[0,255,127], "rgbacolor":'rgba(0,255,127,1)', "rgba02color":'rgba(0,255,127,0.2)', "rgba08color":'rgba(0,255,127,0.8)'},
             "53":{"name":"RH","color":"#DCD814","rgbcolor":[220,216,20], "rgbacolor":'rgba(220,216,20,1)', "rgba02color":'rgba(220,216,20,0.2)', "rgba08color":'rgba(220,216,20,0.8)'},
             "59":{"name":"RSN","color":"#00FF14","rgbcolor":[0,255,127], "rgbacolor":'rgba(0,255,127,1)', "rgba02color":'rgba(0,255,127,0.2)', "rgba08color":'rgba(0,255,127,0.8)'},
             "1006":{"name":"LEC","color":"#DCD87F","rgbcolor":[220,20,10], "rgbacolor":'rgba(0,255,127,1)', "rgba02color":'rgba(0,255,127,0.2)', "rgba08color":'rgba(0,255,127,0.8)'},
             "2006":{"name":"REC","color":"#DCD87F","rgbcolor":[220,20,10], "rgbacolor":'rgba(0,255,127,1)', "rgba02color":'rgba(0,255,127,0.2)', "rgba08color":'rgba(0,255,127,0.8)'},
             }

class UploadFileForm(forms.Form):
    title = forms.CharField(max_length=50)
    file = forms.FileField()

def monitorJobs(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        userName = data["userName"]
        users = User.objects.filter(username = userName)
        if len(users) > 0:
            user = users[0]
            uploadFolders = uploadFolder.objects.filter(user = user)
            uploadFolders = [x for x in uploadFolders if x.status != 'Uploaded' and s.status != 'Analysis Completed']
            uploadFolderJSON = [{'name':x.name,'chksum':x.chksum,'user':str(x.user),
            'description':x.description, 'id':x.id,'status':x.status,
            'fileName':x.fileName,'uploadedDate':x.uploadedDate.strftime('%Y-%m-%d'),
            'analysisProtocol':x.analysisProtocol,
            'fileType':uploadFolder.fileType,
            'analysisSubmittedDate':x.analysisSubmittedDate.strftime('%Y-%m-%d') if x.analysisSubmittedDate else '',
            'rowColor':statusColorMap[x.status], "resultsAvailable":"no"} for x in uploadFolders]
    except:
        traceback.print_exc(file=sys.stdout)
        return HttpResponse(json.dumps({"message":"Failed"}), content_type="application/json")
    return HttpResponse(json.dumps(uploadFolderJSON), content_type="application/json")

def getUserProfile(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        username = data["username"]
        users = User.objects.filter (username = username)
        if len(users) > 0:
            user = users[0]
            imijUser = ImijUser.objects.filter(user = user)[0]
            userJSON = {"username":imijUser.user.username, "addressLine1":imijUser.addressLine1, "addressLine2":imijUser.addressLine2, "city":imijUser.city, "state":imijUser.state, "zipCode":imijUser.zipCode, "phoneNumber":imijUser.phoneNumber, "email":imijUser.user.email}
    except:
        traceback.print_exc(file=sys.stdout)
        return HttpResponse(json.dumps({"message":"Failed"}), content_type="application/json")
    return HttpResponse(json.dumps(userJSON), content_type="application/json")

def updateUser(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        username = data["username"]
        users = User.objects.filter (username = username)
        if len(users) > 0:
            user = users[0]
            imijUser = ImijUser.objects.filter(user = user)[0]

            imijUser.addressLine1 = data["addressLine1"]
            imijUser.addressLine2 = data["addressLine1"]
            imijUser.city = data["city"]
            imijUser.state = data["state"]
            imijUser.zipCode = data["zipCode"]
            imijUser.phoneNumber = data["phoneNumber"]

            imijUser.save()

            userJSON = {"username":imijUser.user.username, "addressLine1":imijUser.addressLine1, "addressLine2":imijUser.addressLine2, "city":imijUser.city, "state":imijUser.state, "zipCode":imijUser.zipCode, "phoneNumber":imijUser.phoneNumber, "email":imijUser.user.email}
    except:
        traceback.print_exc(file=sys.stdout)
        return HttpResponse(json.dumps({"message":"Failed to update profile.", "user":{} } ), content_type="application/json")
    return HttpResponse(json.dumps({"message":"User profile updated.", "user":userJSON}), content_type="application/json")

def signupUser(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        username = data["username"]
        password = data["password"]
        email = data["email"]

        addressLine1 = data["addressLine1"]
        addressLine2 = data["addressLine2"]
        city = data["city"]
        state = data["state"]
        zipCode = data["zipCode"]
        phoneNumber = data["phoneNumber"]
        print(" username " + username + " password " + password + " email " + email)
        users = User.objects.filter(username = username)
        if len(users) > 0:
            return HttpResponse(json.dumps({"message":"Exists"}), content_type="application/json")
        else:
            user = User.objects.create_user(username, email, password)

            imijUser = ImijUser ()
            imijUser.user = user
            imijUser.addressLine1 = addressLine1
            imijUser.addressLine2 = addressLine2
            imijUser.city = city
            imijUser.state = state
            imijUser.zipCode = zipCode
            imijUser.phoneNumber = phoneNumber

            imijUser.save()
    except:
        traceback.print_exc(file=sys.stdout)
        return HttpResponse(json.dumps({"message":"Failed"}), content_type="application/json")
    return HttpResponse(json.dumps({"message":"Success"}), content_type="application/json")

def checkUser(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        username = data["username"]
        users = User.objects.filter(username = username)
        if len(users) > 0:
            return HttpResponse(json.dumps({"message":"Exists"}), content_type="application/json")
    except:
        traceback.print_exc(file=sys.stdout)
        return HttpResponse(json.dumps({"message":"Failed"}), content_type="application/json")
    return HttpResponse(json.dumps({"message":"Success"}), content_type="application/json")

def emailPasswordLink(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        email = data["email"]
        print ( " email = " + email )
        account_activation_token = AccountActivationTokenGenerator()
        users = User.objects.filter(email = email)
        if len(users) > 0:
            send_mail(
                'Reset password ' + str(account_activation_token),
                'Please enter password',
                'mitra.siddhartha@gmail.com',
                [email],
                fail_silently=False,
            )
    except:
        traceback.print_exc(file=sys.stdout)
        return HttpResponse(json.dumps({"message":"An error occured."}), content_type="application/json")
    return HttpResponse(json.dumps({"message":"Password resert link emailed."}), content_type="application/json")

def resetPassword(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        username = data["username"]
        password = data["password"]

        users = User.objects.filter(username = username)
        if len(users) > 0:
            user = users[0]
            user.set_password(password)
            user.save()
    except:
        traceback.print_exc(file=sys.stdout)
        return HttpResponse(json.dumps({"message":"An error occured."}), content_type="application/json")
    return HttpResponse(json.dumps({"message":"Password resert link emailed."}), content_type="application/json")

def checkEmail(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        email = data["email"]
        users = User.objects.filter(email = email)
        if len(users) > 0:
            return HttpResponse(json.dumps({"message":"Exists"}), content_type="application/json")
    except:
        traceback.print_exc(file=sys.stdout)
        return HttpResponse(json.dumps({"message":"Failed"}), content_type="application/json")
    return HttpResponse(json.dumps({"message":"Success"}), content_type="application/json")

def checkLogin(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        username = data["username"]
        password = data["password"]
        print('username='+str(username)+" password="+str(password))
        userString =""
        user = authenticate(request, username=username, password=password)
        if user is None:
            return HttpResponse(json.dumps({"message":"Invalid"}), content_type="application/json")
    except:
        traceback.print_exc(file=sys.stdout)
        return HttpResponse(json.dumps({"message":"Invalid"}), content_type="application/json")
    return HttpResponse(json.dumps({"message":"Valid"}), content_type="application/json")

def logoutUser(request):
    try:

        username = request.POST.get("logoutUser","")
        print('username='+str(username))

        logout(request, user)
        userString=json.dumps({"id":"0","firstName":"","lastName":"","email":""})
        print ( "userString =  " + str(userString))

    except:
        traceback.print_exc(file=sys.stdout)
    return HttpResponse(json.dumps(userString), content_type="application/json")

# @api_view([ "GET", "POST"])
# @permission_classes((IsAuthenticated, ))
def submitUploadFile(request):
    try:
        print("begin upload")
        auth = get_authorization_header(request).split()
        tokendata = auth[1].decode("utf-8")
        print(tokendata)
        tokendata = jwt.decode(auth[1].decode("utf-8"),settings.SECRET_KEY, algorithms=['HS256'])
        user_id = int(tokendata['user_id'])
        #jwt.decode(encoded_jwt
        print(auth)
        md5 = hashlib.md5()
        print ( " items = " + str([(k,f) for k, f in request.FILES.items()]))
        # f = request.FILES["name"]
        f = request.FILES['file']

        print(" start upload " + str(f) )

        with open(settings.UPLOAD_FOLDER + str(f.name) , 'wb+') as destination:
                for chunk in f.chunks():
                    destination.write(chunk)
                    md5.update(chunk)

        print(" end upload ")

        chksum = md5.hexdigest()
        print (chksum)

        # if f.name.find("nii.gz") != -1:
        #     shutil.move(settings.UPLOAD_FOLDER + str(f.name), settings.UPLOAD_FOLDER + str(chksum) + ".nii.gz")
        # elif f.name.find("tar.gz") != -1:
        #     shutil.move(settings.UPLOAD_FOLDER + str(f.name), settings.UPLOAD_FOLDER + str(chksum) + ".tar.gz")
        # elif f.name.find("zip") != -1:
        #     shutil.move(settings.UPLOAD_FOLDER + str(f.name), settings.UPLOAD_FOLDER + str(chksum) + ".zip")
        # else:
        shutil.move(settings.UPLOAD_FOLDER + str(f.name), settings.UPLOAD_FOLDER + str(chksum) )

        print(" moved file ")

        adminUser = User.objects.get(id=user_id)
        uploadFolder = UploadFolder(name=str(f.name), description = str(f.name), chksum=chksum, user= adminUser, status = "Uploaded", uploadedDate=datetime.datetime.now())
        uploadFolder.save()
        outf = open(settings.UPLOAD_FOLDER + str(chksum) + ".user", "w")
        outf.write(adminUser.username)
        outf.close()

        print(" created user file ")

        uploadFolderJson = {'id':uploadFolder.id, 'name':uploadFolder.name,'chksum':uploadFolder.chksum,'user':str(uploadFolder.user),'description':uploadFolder.description,
        'status':uploadFolder.status,
        'fileName':uploadFolder.fileName,'uploadedDate':uploadFolder.uploadedDate.strftime('%Y-%m-%d'),
        'analysisProtocol':uploadFolder.analysisProtocol,
        'fileType':uploadFolder.fileType,
        'analysisSubmittedDate':uploadFolder.analysisSubmittedDate.strftime('%Y-%m-%d') if uploadFolder.analysisSubmittedDate else '',
        'rowColor':statusColorMap[uploadFolder.status]}

    except:
        traceback.print_exc(file=sys.stdout)
        return HttpResponse(json.dumps({ }), content_type="application/json")
    return HttpResponse(json.dumps(uploadFolderJson), content_type="application/json")

def updateDatafileName(request):
    try:
        print("update data file name")
        data = json.loads(request.body.decode('utf-8'))

        datafileName = data["datafileName"]
        uploadFolderId = int(data["uploadFolderId"])

        uploadFolder = UploadFolder.objects.get(pk = uploadFolderId)
        uploadFolder.fileName = datafileName
        uploadFolder.save()

    except:
        traceback.print_exc(file=sys.stdout)
        return HttpResponse(json.dumps({"message":"Failed"}), content_type="application/json")
    return HttpResponse(json.dumps({"message":"Success"}), content_type="application/json")

# @api_view([ "GET", "POST"])
# @permission_classes((IsAuthenticated, ))
def searchUploadedFolders(request):
    try:
        searchString = request.GET.get("searchString","0")
        print(searchString)
        auth = get_authorization_header(request).split()
        tokendata = auth[1].decode("utf-8")
        print(tokendata)
        tokendata = jwt.decode(auth[1].decode("utf-8"),settings.SECRET_KEY, algorithms=['HS256'])
        userId = int(tokendata['user_id'])
        print(userId)
        user = User.objects.get(pk = userId)
        fileList = UploadFolder.objects.filter(user = user)
        print(" search = " + searchString)
        if searchString != '':
            fileList = [{'name':x.name,'chksum':x.chksum,'user':str(x.user),'description':x.description, 'id':x.id,'status':x.status, 'rowColor':statusColorMap[x.status]} for x in fileList if x.name.find(searchString) != -1]
        else:
            fileList = [{'name':x.name,'chksum':x.chksum,'user':str(x.user),'description':x.description, 'id':x.id,'status':x.status, 'rowColor':statusColorMap[x.status]} for x in fileList]

        print(fileList)
    except:
        traceback.print_exc(file=sys.stdout)
    return HttpResponse(json.dumps(fileList), content_type="application/json")

# @api_view([ "GET", "POST"])
# @permission_classes((IsAuthenticated, ))
def listUploadedFiles(request):
    try:
        auth = get_authorization_header(request).split()
        tokendata = auth[1].decode("utf-8")
        print(tokendata)
        tokendata = jwt.decode(auth[1].decode("utf-8"),settings.SECRET_KEY, algorithms=['HS256'])
        userId = int(tokendata['user_id'])
        print(userId)
        user = User.objects.get(pk = userId)
        fileList = UploadFolder.objects.filter(user = user)
        fileObjList = fileList
        fileList = [{'name':x.name,'chksum':x.chksum,'user':str(x.user),'description':x.description, 'id':x.id,'status':x.status, 'rowColor':statusColorMap[x.status], "resultsAvailable":"no"} for x in fileList]
        for index, fileObj in enumerate(fileList):
            # if os.path.exists("/data/Synology_Scans/Processing/Ants/" + user.username + "/" + fileObj['chksum'] + "/T1/Completed/Brain_Extraction.completed") and os.path.exists("/data/Synology_Scans/Processing/Ants/" + user.username + "/" + fileObj['chksum'] + "/T1/Completed/Prediction.completed"):
              fileObj["resultsAvailable"] = "yes"
              # fileObj["rowColor"] = statusColorMap["Score Calculated"]
              # fileObjList[index].status = "Score Calculated"
              # if os.path.exists("/data/Synology_Scans/Processing/Ants/" + user.username + "/" + fileObj['chksum'] + "/T1/Completed/ROI.completed"):
              fileObj["rowColor"] = statusColorMap["Analysis Completed"]
              fileObjList[index].status = "Analysis Completed"
              fileObjList[index].save()
    except:
        traceback.print_exc(file=sys.stdout)
    return HttpResponse(json.dumps(fileList), content_type="application/json")

# @api_view([ "GET", "POST"])
# @permission_classes((IsAuthenticated, ))
def getRunningJobs(request):
    try:
        auth = get_authorization_header(request).split()
        tokendata = auth[1].decode("utf-8")
        print(tokendata)
        tokendata = jwt.decode(auth[1].decode("utf-8"),settings.SECRET_KEY, algorithms=['HS256'])
        userId = int(tokendata['user_id'])
        print(userId)
        user = User.objects.get(pk = userId)
        fileList = UploadFolder.objects.filter(user = user, status__in = ["Analysis Submitted", "Score Calculated"] )
        fileObjList = fileList
        fileList = [{'name':x.name,'chksum':x.chksum,'user':str(x.user),'description':x.description, 'id':x.id,'status':x.status, 'rowColor':statusColorMap[x.status], "resultsAvailable":"no"} for x in fileList]
        for index, fileObj in enumerate(fileList):
            if os.path.exists("/data/Synology_Scans/Processing/Ants/" + user.username + "/" + fileObj['chksum'] + "/T1/Completed/Brain_Extraction.completed") and os.path.exists("/data/Synology_Scans/Processing/Ants/" + user.username + "/" + fileObj['chksum'] + "/T1/Completed/Prediction.completed"):
              fileObj["resultsAvailable"] = "yes"
              fileObj["rowColor"] = statusColorMap["Score Calculated"]
              fileObjList[index].status = "Score Calculated"
              if os.path.exists("/data/Synology_Scans/Processing/Ants/" + user.username + "/" + fileObj['chksum'] + "/T1/Completed/ROI.completed"):
                fileObj["rowColor"] = statusColorMap["Analysis Completed"]
                fileObjList[index].status = "Analysis Completed"
              fileObjList[index].save()
    except:
        traceback.print_exc(file=sys.stdout)
    return HttpResponse(json.dumps(fileList), content_type="application/json")


# @api_view([ "GET", "POST"])
# @permission_classes((IsAuthenticated, ))
def deleteDatafile(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        datafileId = data["datafileId"]
        print(" datafileId " + datafileId)
        uploadFolder = UploadFolder.objects.get(pk = int(datafileId) )
        if os.path.exists("/data/Synology_Scans/Processing/Ants/" + uploadFolder.user.username + "/" + uploadFolder.chksum ):
            shutil.rmtree("/data/Synology_Scans/Processing/Ants/" + uploadFolder.user.username + "/" + uploadFolder.chksum)
        uploadFolder.delete()
    except:
        traceback.print_exc(file=sys.stdout)
        return JsonResponse({"message":"File delete failed."})

    return JsonResponse({"message":"File deleted."})

# @api_view([ "GET", "POST"])
# @permission_classes((IsAuthenticated, ))
def getDatafile(request):
    try:
        auth = get_authorization_header(request).split()
        tokendata = auth[1].decode("utf-8")
        print(tokendata)
        tokendata = jwt.decode(auth[1].decode("utf-8"),settings.SECRET_KEY, algorithms=['HS256'])
        user_id = int(tokendata['user_id'])

        submitUser = User.objects.get(id=user_id)

        data = json.loads(request.body.decode('utf-8'))
        datafileId = data["datafileId"]

        print(datafileId)

        # SELECTED_CHANNELS = ['F7','T5', 'F3','P3', 'F4','P4', 'F8','T6', 'Fp1','O1', 'Fp2','O2']

        uploadFolder = UploadFolder.objects.get(pk = int(datafileId) )

        print ( " file path " + str(settings.UPLOAD_FOLDER + uploadFolder.chksum))

        beginTime = 0
        endTime = 0

        # artifact data for mat file
        artDataList = []

        if uploadFolder.name.find('edf') != -1:

            edfFile = pyedflib.EdfReader(settings.UPLOAD_FOLDER + uploadFolder.chksum)

            try:
                numChannels = edfFile.signals_in_file
                channels = edfFile.getSignalLabels()
                samplingFrequency = edfFile.getSampleFrequencies()[0]
                fileDuration = edfFile.file_duration
                beginTime = 0
                endTime = int(fileDuration)
                print ( " 1 numSignals = " + str(fileDuration))

            except:
                edfFile._close()
                del edfFile

                edfFile = pyedflib.EdfReader(settings.UPLOAD_FOLDER + uploadFolder.chksum)
                numChannels = edfFile.signals_in_file
                channels = edfFile.getSignalLabels()

                samplingFrequency = edfFile.getSampleFrequencies()[0]
                fileDuration = edfFile.file_duration
                print ( " 2 numSignals = " + str(fileDuration))
                beginTime = 0
                endTime = int(fileDuration)

            edfFile._close()

        elif uploadFolder.name.find('mat') != -1:

            eegmat = loadmat(settings.UPLOAD_FOLDER + uploadFolder.chksum)

            channels = [str(x[0]) for x in eegmat["channelLabels"][0] ]

            samplingFrequency = int(eegmat["eegFS"])

            numChannels = len(channels)

            fileDuration = round(len(eegmat["eegData"][0])/samplingFrequency)
            beginTime = 0
            endTime = int(fileDuration)

            eegArtFileName = uploadFolder.name[:uploadFolder.name.index(".")] + "_art.mat"

            if UploadFolder.objects.filter(name = eegArtFileName).exists():

                eegArtFile = UploadFolder.objects.filter(name= eegArtFileName)[0]
                eegArtMat = loadmat(settings.UPLOAD_FOLDER + eegArtFile.chksum)

                artData = eegArtMat["signalOK"][0]
                artDataList = [x[0] for x in artData]

        channelObjs = [{"channelLabel":channel, "isSelected":True} for channel in channels]
        channelQAObjs = [{"channelLabel":channel, "isSelected":False} for channel in channels]

        epochs = Epoch.objects.filter(uploadFolder = uploadFolder)
        epochList = [{"id":str(epoch.id), "startTime":str(epoch.startTime), "endTime":str(epoch.endTime)} for epoch in epochs]

        montages = Montage.objects.all()

        montageList = [{"id":str(montage.id), "name":str(montage.name)} for montage in montages]

        uploadFolderJSON = { 'id':uploadFolder.id,'name':uploadFolder.name,'chksum':uploadFolder.chksum,
                             'user':str(uploadFolder.user),'description':uploadFolder.description,
                             'fileName':uploadFolder.fileName,'uploadedDate':uploadFolder.uploadedDate.strftime('%Y-%m-%d'),
                             'fileType':uploadFolder.fileType,
                             'numChannels':numChannels,'channelObjs':channelObjs,'channelQAObjs':channelQAObjs,
                             "samplingFrequency":int(samplingFrequency),
                             "beginTime":beginTime,
                             "endTime":endTime,
                             'status':uploadFolder.status, 'rowColor':statusColorMap[uploadFolder.status], "epochList":epochList, "montageList":montageList}
        processObjList = []
        for logFileType in LOG_FILE_TYPES:
            logFilePath = settings.ANAT_IMG_FOLDER + uploadFolder.user.username + "/" + uploadFolder.chksum + "/T1/Logs/" + logFileType + ".log"
            #print (logFilePath)
            if os.path.isfile(logFilePath):
                with open(logFilePath) as f:
                    data = f.readlines()
                    log = ''
                    if len(data) > 10:
                        lastLines = data[-10:]
                        #print (lastLines)
                        log = ("\n").join(lastLines)
                    else:
                        log = ("\n").join(data)
                    processObjList.append({"processName":logFileType, "logValue":log})

        uploadFolderJSON['logs'] = processObjList
        rawData = list(np.loadtxt("data/outrawdata.txt"))
        psdData = list(np.loadtxt("data/outpsd.txt"))

        spectrogramString = ''
        # with open("data/spectrogram.png", "rb") as image_file:
        #     spectrogramString = base64.b64encode(image_file.read()).decode('utf-8')
        #
        # rawData = rawData[1000:2000]
        #
        # rawDataLabels = list(range(len(rawData) ) )
        # psdDataLabels = list(range(len(psdData) ) )
        #
        # pacData =  {"fGamma":list(np.loadtxt("data/outpac_fGamma.txt")), "MIs":list(np.loadtxt("data/outpac_MIs.txt")) }
        # plvData =  {"fGamma":list(np.loadtxt("data/outplv_fGamma.txt")), "MIs":list(np.loadtxt("data/outplv_MIs.txt")) }

        # channelObjs = [{"channelLabel":x} for x in SELECTED_CHANNELS]

        # uploadFolderJSON["analysisResult"] = {"rawData":rawData, "channelObjs": channelObjs, "rawDataLabels": rawDataLabels, "psdData":psdData[:50], "psdDataLabels": psdDataLabels[:50], "spectrogramString":spectrogramString, "pacData": pacData, "plvData": plvData}

        uploadFolderJSON["analysisResult"] = {"rawData":rawData, "channelObjs": channelObjs}


        # print (" psdData " + str(psdData) )
        # print (" psdDataLabels " + str(psdDataLabels) )

    except:
        traceback.print_exc(file=sys.stdout)
    return JsonResponse(uploadFolderJSON)

def detect_outlier(data_1):
    outliers = []
    threshold=3
    mean_1 = np.mean(data_1)
    std_1 =np.std(data_1)


    for i,y in enumerate(data_1):
        z_score= (y - mean_1)/std_1
        if np.abs(z_score) > threshold:
            outliers.append(i)
    return outliers

def detect_icq_outlier(data):

    q25, q75 = np.percentile(data, 25), np.percentile(data, 75)
    iqr = q75 - q25
    # calculate the outlier cutoff
    cut_off = iqr * 1.5
    lower, upper = q25 - cut_off, q75 + cut_off
    # identify outliers
    outliers = [i for i,x in enumerate(data) if x < lower or x > upper]
    return outliers

def reloadDatafile(request):
    try:
        auth = get_authorization_header(request).split()
        tokendata = auth[1].decode("utf-8")
        print(tokendata)
        tokendata = jwt.decode(auth[1].decode("utf-8"),settings.SECRET_KEY, algorithms=['HS256'])
        user_id = int(tokendata['user_id'])

        submitUser = User.objects.get(id=user_id)

        data = json.loads(request.body.decode('utf-8'))
        datafileId = data["datafileId"]
        selectedChannelQAIds = data["selectedChannelQAIds"]
        upperQATimeLimit = data["upperQATimeLimit"]
        lowerQATimeLimit = data["lowerQATimeLimit"]

        print(datafileId)

        print(" selectedChannelQAIds " + str(selectedChannelQAIds))
        print(" upperQATimeLimit " + str(upperQATimeLimit))
        print(" lowerQATimeLimit " + str(lowerQATimeLimit))

        # SELECTED_CHANNELS = ['F7','T5', 'F3','P3', 'F4','P4', 'F8','T6', 'Fp1','O1', 'Fp2','O2']

        uploadFolder = UploadFolder.objects.get(pk = int(datafileId) )

        print ( " file path " + str(settings.UPLOAD_FOLDER + uploadFolder.chksum))

        beginTime = 0
        endTime = 0

        if uploadFolder.name.find('edf') != -1:

            edfFile = pyedflib.EdfReader(settings.UPLOAD_FOLDER + uploadFolder.chksum)

            try:
                numChannels = edfFile.signals_in_file
                channels = edfFile.getSignalLabels()
                samplingFrequency = edfFile.getSampleFrequencies()[0]
                fileDuration = edfFile.file_duration
                numSignals = edfFile.signals_in_file
                beginTime = 0
                endTime = int(fileDuration)
                print ( " 1 numSignals = " + str(fileDuration))

                data = np.zeros((numSignals, edfFile.getNSamples()[0]))
                for i in np.arange(numSignals):
                    data[i, :] = edfFile.readSignal(i)

            except:
                edfFile._close()
                del edfFile

                edfFile = pyedflib.EdfReader(settings.UPLOAD_FOLDER + uploadFolder.chksum)
                numChannels = edfFile.signals_in_file
                channels = edfFile.getSignalLabels()
                numSignals = edfFile.signals_in_file

                samplingFrequency = edfFile.getSampleFrequencies()[0]
                fileDuration = edfFile.file_duration
                print ( " 2 numSignals = " + str(fileDuration))
                beginTime = 0
                endTime = int(fileDuration)

                data = np.zeros((numSignals, edfFile.getNSamples()[0]))
                for i in np.arange(numSignals):
                    data[i, :] = edfFile.readSignal(i)

            edfFile._close()

        elif uploadFolder.name.find('mat') != -1:
            eegmat = loadmat(settings.UPLOAD_FOLDER + uploadFolder.chksum)

            channels = [str(x[0]) for x in eegmat["channelLabels"][0] ]

            samplingFrequency = int(eegmat["eegFS"])

            numChannels = len(channels)

            fileDuration = round(len(eegmat["eegData"][0])/samplingFrequency)
            beginTime = 0
            endTime = int(fileDuration)
            data = eegmat["eegData"]

            eegArtFileName = uploadFolder.name[:uploadFolder.name.index(".")] + "_art.mat"

            if UploadFolder.objects.filter(name = eegArtFileName).exists():

                eegArtFile = UploadFolder.objects.filter(name= eegArtFileName)[0]
                eegArtMat = loadmat(settings.UPLOAD_FOLDER + eegArtFile.chksum)

                artData = eegArtMat["signalOK"][0]
                artDataList = [x[0] for x in artData]

        uploadFolder = UploadFolder.objects.get(pk = int(datafileId) )

        channelQAObjs = []

        artData = []
        varValues = []
        meanValues = []

        zValueOutlierRegions = []
        icqOutlierRegions = []
        plotDataString = []

        timeStep = 1
        numSteps = math.floor(fileDuration/timeStep)

        artDataSet = set()

        allChannelData = {}

        meanOutliersSet = set()

        for index, selectedChannelQAId in enumerate(selectedChannelQAIds):
            channelIndex = channels.index(selectedChannelQAId)

            print(" channelIndex " + str(channelIndex) )

            rawData = data[channelIndex]
            rawData = [float(x) for x in rawData]

            upper = upperQATimeLimit
            lower = lowerQATimeLimit

            rawData = rawData[lower:upper]
            rawData = [x+index*50 for x in rawData]

            rawDataLabels = list(range(len(rawData) ) )

            allChannelData[channelIndex] = {"mean":[], "var":[], "skewness":[], "kurtosis":[]}

            for step in range(numSteps):
                # print (" window num = " + str(index))
                winData = rawData[timeStep*step:(step+1)*(timeStep)]
                # print(winData)

                mean = np.mean(winData)
                var = np.var(winData)
                # skewness=skew(winData)
                # kurtosis=kurtosis(winData)
                allChannelData[channelIndex]["mean"].append(mean)
                allChannelData[channelIndex]["var"].append(var)

            plotData = allChannelData[channelIndex]

            mean_outliersZScoreList = detect_outlier(plotData["mean"])
            var_outliersZScoreList = detect_outlier(plotData["var"])

            mean_outliersZScores = []

            for mean_outliersZScore in mean_outliersZScoreList:

                mean_outliersZScores.extend([int(x) for x in np.arange(mean_outliersZScore, (mean_outliersZScore+timeStep))])

            if index == 0:
                meanOutliersSet = set(mean_outliersZScores)
            else:
                meanOutliersSet = meanOutliersSet.intersection(mean_outliersZScores)

            var_outliersZScores = []

            for var_outliersZScore in var_outliersZScoreList:

                var_outliersZScores.extend([int(x) for x in np.arange(var_outliersZScore, (var_outliersZScore+timeStep))])

            # mean_outliers2 = detect_icq_outlier(plotData["mean"])
            # var_outliersTimePoints = detect_icq_outlier(plotData["var"])
            # mean_outliers = []
            #
            # var_outliers2 = []
            # var_outliers = var_outliersTimePoints

            # print (" var_outliersTimePoints " + str(var_outliersTimePoints))

            # for var_outliersTimePoint in var_outliersTimePoints:
            #     var_outliers2.extend(np.arange(var_outliersTimePoint, var_outliersTimePoint+timeStep*samplingFrequency))

            artData = np.array(artDataList[index])
            mean_outliers = []
            var_outliers = list(np.where(artData == 0)[0])
            var_outliers = [int(x) for x in var_outliers]

            if index == 0:
                artDataSet = set(var_outliers)
            else:
                artDataSet = artDataSet.intersection(var_outliers)

            # print (" var outliers " + str(len(var_outliers)) )
            print(" artifacts " + str(var_outliers[:20]) )
            print(" len artifacts " + str( len (var_outliers)) )

            channelQAObj = {"channelLabel":selectedChannelQAId,"rawData":rawData, "rawDataLabels":rawDataLabels, "artData":[], "meanValues":meanValues, "varValues":varValues,
            "zValueOutlierRegions":zValueOutlierRegions, "icqOutlierRegions":icqOutlierRegions, "plotDataString":plotDataString,
                            "meanOutliers":mean_outliers, "varOutliers":var_outliers, "meanOutliersZScores":mean_outliersZScores, "varOutliersZScores":var_outliersZScores}

            channelQAObjs.append(channelQAObj)

        artDataList = list(artDataSet)

        meanOutliersList = list(meanOutliersSet)

        print(artDataList[:20])

        epochs = Epoch.objects.filter(uploadFolder = uploadFolder)
        epochTimePoints = []

        for epoch in epochs:
            # print ( " start = " + str(epoch.startTime) + " end = " + str(epoch.endTime) + " np.arange(epoch.startTime, epoch.endTime) " + str(np.arange(epoch.startTime, epoch.endTime)))
            epochTimePoints.extend([int(x) for x in np.arange(epoch.startTime, epoch.endTime)])
            # epochTimePoints.extend([int(x) for x in np.arange(epoch.startTime*int(samplingFrequency), epoch.endTime*int(samplingFrequency))])

            # print ( " epochTimePoints = " + str(epochTimePoints))

        # epochTimePoints = [x+3500 for x in epochTimePoints]

        print(" epochTimePoints " + str( epochTimePoints[:20]) )

        uploadFolderJSON = { 'id':uploadFolder.id,'name':uploadFolder.name,'chksum':uploadFolder.chksum,
                             'user':str(uploadFolder.user),'description':uploadFolder.description,
                             'status':uploadFolder.status, 'uploadedDate':uploadFolder.uploadedDate.strftime('%Y-%m-%d'),
                             'fileName':uploadFolder.name,
                             'fileType':uploadFolder.fileType,
                             'rowColor':statusColorMap[uploadFolder.status], "channelQAObjs":channelQAObjs,
                             "epochTimePoints":epochTimePoints,"meanOutliersList":meanOutliersList,
                             "artDataList":artDataList}

    except:
        traceback.print_exc(file=sys.stdout)
    return JsonResponse(uploadFolderJSON)

# @api_view([ "GET", "POST"])
# @permission_classes((IsAuthenticated, ))
def addEpoch(request):
    epochList = []
    try:
        print (" in add epoch ")

        data = json.loads(request.body.decode('utf-8'))

        datafileId = data["datafileId"]

        print(datafileId)

        uploadFolder = UploadFolder.objects.get(pk = int(datafileId) )

        startTime = data["startTime"]
        endTime = data["endTime"]

        epoch = Epoch(uploadFolder = uploadFolder, startTime = startTime, endTime = endTime)
        epoch.save()

        epochList = Epoch.objects.filter(uploadFolder = uploadFolder)

        epochs = [{"id":str(epoch.id), "startTime":str(epoch.startTime), "endTime":str(epoch.endTime)} for epoch in epochList]
        print(epochs)
    except Exception as e:

        traceback.print_exc(file=sys.stdout)

    return JsonResponse({"epochs":epochs})

def removeEpoch(request):
    epochList = []
    try:
        print (" in remove epoch ")

        # auth = get_authorization_header(request).split()
        # tokendata = auth[1].decode("utf-8")
        # # print(tokendata)
        # tokendata = jwt.decode(auth[1].decode("utf-8"),settings.SECRET_KEY, algorithms=['HS256'])
        # user_id = int(tokendata['user_id'])
        #
        # submitUser = User.objects.get(id=user_id)

        data = json.loads(request.body.decode('utf-8'))

        datafileId = data["datafileId"]

        epochId = data["epochId"]

        print(epochId)

        uploadFolder = UploadFolder.objects.get(pk = int(datafileId) )

        Epoch.objects.filter(id=epochId).delete()

        epochList = Epoch.objects.filter(uploadFolder = uploadFolder)

        epochs = [{"id":str(epoch.id), "startTime":str(epoch.startTime), "endTime":str(epoch.endTime)} for epoch in epochList]
        # print(epochs)
        epochTimePoints = []

        for epoch in epochList:
            # print ( " start = " + str(epoch.startTime) + " end = " + str(epoch.endTime) + " np.arange(epoch.startTime, epoch.endTime) " + str(np.arange(epoch.startTime, epoch.endTime)))
            epochTimePoints.extend([int(x) for x in np.arange(epoch.startTime, epoch.endTime)])

        epochResultObj = {"epochs":epochs, "epochTimePoints":epochTimePoints}

    except Exception as e:

        traceback.print_exc(file=sys.stdout)

    return JsonResponse(epochResultObj)

def getMontage(request):
    montage = {}
    try:
        print (" in get montage ")

        data = json.loads(request.body.decode('utf-8'))

        selectedMontageId = int(data["selectedMontageId"])

        montage = Montage.objects.get(pk = selectedMontageId)

        montageChannelList = MontageChannel.objects.filter(montage = montage)
        montageChannels = [{"id":str(montageChannel.id), "channel1":str(montageChannel.channel1),
                            "channel2":str(montageChannel.channel2),"resultChannel":str(montageChannel.resultChannel)}
                            for montageChannel in montageChannelList]

        print(montageChannels)
        montage = {"id":str(montage.id),"name":str(montage.name),"montageChannels":montageChannels}

    except Exception as e:

        traceback.print_exc(file=sys.stdout)

    return HttpResponse(json.dumps(montage), content_type="application/json")


def addMontage(request):
    montageList = []
    try:
        print (" in add montage ")

        data = json.loads(request.body.decode('utf-8'))

        montageName = data["montageName"]
        # uploadFolder = UploadFolder.objects.get(pk = int(datafileId) )

        montage = Montage(name = montageName)
        montage.save()

        montages = Montage.objects.all()

        montageList = []

        for montage in montages:

            montageChannels = MontageChannel.objects.filter(montage = montage)
            montageChannels = [{"id":str(montage.id), "name":str(montage.name)} for montage in montages]

            montageList.append({"id":str(montage.id), "name":str(montage.name), "montageChannels":montageChannels} )

        print(montageList)
    except Exception as e:

        traceback.print_exc(file=sys.stdout)

    return JsonResponse({"montageList":montageList})

# @api_view([ "GET", "POST"])
# @permission_classes((IsAuthenticated, ))
def addMontageChannel(request):
    montageChannels = {}
    try:
        print (" in add montage ")

        data = json.loads(request.body.decode('utf-8'))

        montageId = int(data["montageId"])
        montageChannel1 = data["montageChannel1"]
        montageChannel2 = data["montageChannel2"]
        resultChannel = data["resultChannel"]

        montage = Montage.objects.get(pk = montageId)

        montageChannel = MontageChannel(channel1 = montageChannel1,channel2 = montageChannel2,resultChannel = resultChannel, montage = montage)
        montageChannel.save()

        montageChannelList = MontageChannel.objects.filter(montage = montage)
        montageChannels = [{"id":str(montageChannel.id), "channel1":str(montageChannel.channel1),
                            "channel2":str(montageChannel.channel2),"resultChannel":str(montageChannel.resultChannel)}
                            for montageChannel in montageChannelList]

        print(montageChannels)
        montage = {"id":str(montage.id),"name":str(montage.name),"montageChannels":montageChannels}

    except Exception as e:

        traceback.print_exc(file=sys.stdout)

    return HttpResponse(json.dumps(montage), content_type="application/json")

def removeMontageChannel(request):
    montageChannels = []
    try:
        print (" in remove montage channel ")

        data = json.loads(request.body.decode('utf-8'))

        montageChannelId = data["montageChannelId"]
        print(montageChannelId)

        montageChannel = MontageChannel.objects.get(pk=montageChannelId)
        montage = montageChannel.montage

        montageChannel.delete()

        montageChannelList = MontageChannel.objects.filter(montage = montage)
        montageChannels = [{"id":str(montageChannel.id), "channel1":str(montageChannel.channel1),"channel2":str(montageChannel.channel2),"resultChannel":str(montageChannel.resultChannel)} for montageChannel in montageChannelList]

        print(montageChannels)

        montage = {"id":str(montage.id),"name":str(montage.name),"montageChannels":montageChannels}

    except Exception as e:

        traceback.print_exc(file=sys.stdout)

    return HttpResponse(json.dumps(montage), content_type="application/json")

def removeMontage(request):
    montageList = []
    try:
        print (" in remove montage ")

        # auth = get_authorization_header(request).split()
        # tokendata = auth[1].decode("utf-8")
        # # print(tokendata)
        # tokendata = jwt.decode(auth[1].decode("utf-8"),settings.SECRET_KEY, algorithms=['HS256'])
        # user_id = int(tokendata['user_id'])
        #
        # submitUser = User.objects.get(id=user_id)

        data = json.loads(request.body.decode('utf-8'))

        montageId = data["montageId"]

        print(montageId)

        Montage.objects.filter(id=montageId).delete()

        montages = Montage.objects.all()

        montageList = [{"id":str(montage.id), "name":str(montage.name)} for montage in montages]

        print(montageList)

    except Exception as e:

        traceback.print_exc(file=sys.stdout)

    return JsonResponse({"montageList":montageList})

def submitICA(request):
    icaPlotObjs = []
    try:

        data = json.loads(request.body.decode('utf-8'))
        datafileId = data["datafileId"]
        lowPassFilterFlag = data["lowPassFilterFlag"]
        lowPassFilterFrequency = data["lowPassFilterFrequency"]
        highPassFilterFlag = data["highPassFilterFlag"]
        highPassFilterFrequency = data["highPassFilterFrequency"]

        uploadFolder = UploadFolder.objects.get(pk = int(datafileId) )

        if uploadFolder.name.find('edf') != -1:

            edfFile = pyedflib.EdfReader(settings.UPLOAD_FOLDER + uploadFolder.chksum)

            try:
                numChannels = edfFile.signals_in_file
                channels = edfFile.getSignalLabels()
                samplingFrequency = edfFile.getSampleFrequencies()[0]
                fileDuration = edfFile.file_duration
                beginTime = 0
                endTime = int(fileDuration)
                print ( " 1 numSignals = " + str(fileDuration))

            except:
                edfFile._close()
                del edfFile

                edfFile = pyedflib.EdfReader(settings.UPLOAD_FOLDER + uploadFolder.chksum)
                numChannels = edfFile.signals_in_file
                channels = edfFile.getSignalLabels()

                samplingFrequency = edfFile.getSampleFrequencies()[0]
                fileDuration = edfFile.file_duration
                print ( " 2 numSignals = " + str(fileDuration))
                beginTime = 0
                endTime = int(fileDuration)

            edfFile._close()

        elif uploadFolder.name.find('mat') != -1:

            eegmat = loadmat(settings.UPLOAD_FOLDER + uploadFolder.chksum)

            channels = [str(x[0]) for x in eegmat["channelLabels"][0] ]

            samplingFrequency = int(eegmat["eegFS"])

            numChannels = len(channels)

            fileDuration = round(len(eegmat["eegData"][0])/samplingFrequency)
            beginTime = 0
            endTime = int(fileDuration)

            eegArtFileName = uploadFolder.name[:uploadFolder.name.index(".")] + "_art.mat"

            if UploadFolder.objects.filter(name = eegArtFileName).exists():

                eegArtFile = UploadFolder.objects.filter(name= eegArtFileName)[0]
                eegArtMat = loadmat(settings.UPLOAD_FOLDER + eegArtFile.chksum)

                artData = eegArtMat["signalOK"][0]
                artDataList = [x[0] for x in artData]

        channelObjs = [{"channelLabel":channel, "isSelected":True} for channel in channels]
        channelQAObjs = [{"channelLabel":channel, "isSelected":False} for channel in channels]

    except Exception as e:

        traceback.print_exc(file=sys.stdout)

    return JsonResponse({"montageList":montageList})

# @api_view([ "GET", "POST"])
# @permission_classes((IsAuthenticated, ))
def getAnalysisDetail(request):
    analysisDetailJSON = {}
    outf = open('/www/projects/EEG_Portal/webEEGPortal/outerror.txt','w')
    try:
        print (" analysisDetail 1")

        auth = get_authorization_header(request).split()
        tokendata = auth[1].decode("utf-8")
        print(tokendata)
        tokendata = jwt.decode(auth[1].decode("utf-8"),settings.SECRET_KEY, algorithms=['HS256'])
        user_id = int(tokendata['user_id'])

        submitUser = User.objects.get(id=user_id)

        data = json.loads(request.body.decode('utf-8'))
        datafileId = data["datafileId"]

        print(datafileId)
        print (" analysisDetail 2")

        uploadFolder = UploadFolder.objects.get(pk = int(datafileId) )

        analysisDetails = AnalysisDetail.objects.filter(uploadFolder = uploadFolder)

        if len(analysisDetails) == 0:
            return JsonResponse(analysisDetailJSON)

        analysisDetail = list(analysisDetails)[-1]

        pacParams = ''
        plvParams = ''

        plvParamsList = PlvParams.objects.filter(analysisDetail = analysisDetail)
        pacParamsList = PacParams.objects.filter(analysisDetail = analysisDetail)

        if len(pacParamsList) > 0:
            pacParams = pacParamsList[0]

        if len(plvParamsList) > 0:
            plvParams = plvParamsList[0]

        print (" analysisDetail " + str(analysisDetail))

        channelObjs = []

        uploadFolderJSON = {}


        edfFile = ''

        if uploadFolder.name.find('edf') != -1:

            try:
                edfFile = pyedflib.EdfReader(settings.UPLOAD_FOLDER + uploadFolder.chksum)
                numSignals = edfFile.signals_in_file

                data = np.zeros((numSignals, edfFile.getNSamples()[0]))
                channels = edfFile.getSignalLabels()
                for i in np.arange(numSignals):
                    data[i, :] = edfFile.readSignal(i)
                fileDuration = edfFile.file_duration

                channelObjs = [{"channelLabel":channel, "isSelected":True} for channel in channels]

            except:
                try:
                    edfFile._close()
                    del edfFile
                except:
                    traceback.print_exc(file=sys.stdout)
                edfFile = pyedflib.EdfReader(settings.UPLOAD_FOLDER + uploadFolder.chksum)
                numSignals = edfFile.signals_in_file
                data = np.zeros((numSignals, edfFile.getNSamples()[0]))
                channels = edfFile.getSignalLabels()
                for i in np.arange(numSignals):
                    data[i, :] = edfFile.readSignal(i)
                fileDuration = edfFile.file_duration
                edfFile._close()

                channelObjs = [{"channelLabel":channel, "isSelected":True} for channel in channels]

        elif uploadFolder.name.find('mat') != -1:
            eegmat = loadmat(settings.UPLOAD_FOLDER + uploadFolder.chksum)

            channels = [str(x[0]) for x in eegmat["channelLabels"][0] ]

            samplingFrequency = int(eegmat["eegFS"])

            numChannels = len(channels)

            fileDuration = round(len(eegmat["eegData"][0])/samplingFrequency)
            beginTime = 0
            endTime = int(fileDuration)
            data = eegmat["eegData"]

        beginTime = 0
        endTime = int(fileDuration)

        uploadFolderJSON = { 'id':uploadFolder.id,'name':uploadFolder.name,'chksum':uploadFolder.chksum,
                             'user':str(uploadFolder.user),'description':uploadFolder.description,
                             'fileName':uploadFolder.fileName,'uploadedDate':uploadFolder.uploadedDate.strftime('%Y-%m-%d'),
                             'fileType':uploadFolder.fileType,'channelObjs':channelObjs,
                             "beginTime":beginTime,
                             "endTime":endTime,
                             'status':uploadFolder.status, 'rowColor':statusColorMap[uploadFolder.status]}

        analysisDetailJSON = {
            "samplingFrequency": analysisDetail.samplingFrequency,
            "lowerFrequency": analysisDetail.lowerFrequency,
            "timeBandWidth": analysisDetail.timeBandWidth,
            "timeWindow": analysisDetail.timeWindow,
            "stepSize": analysisDetail.stepSize,
            "numTapers": analysisDetail.numTapers,
            "upperFrequency": analysisDetail.upperFrequency,
            "uploadFolder":uploadFolderJSON,
            "submittedOn": analysisDetail.submittedOn.strftime('%Y-%m-%d'),
            "computeCrossCorrelationFlag": analysisDetail.computeCrossCorrelationFlag,
            "computePACFlag":analysisDetail.computePACFlag,
            "computePLVFlag":analysisDetail.computePLVFlag,
            "channel1":analysisDetail.channel1,
            "channel2":analysisDetail.channel2,
        }

        pacParamsJSON = {
            "lcut":9,
            "hcut":13,
            "rippleDB":40,
            "bandWidth": 20,
            "attenHz": 4
        }

        if pacParams != '':

            pacParamsJSON = {
                "lcut":pacParams.lcut if pacParams.lcut else 9,
                "hcut":pacParams.hcut if pacParams.hcut else 13,
                "rippleDB":pacParams.rippleDB if pacParams.rippleDB else 40,
                "bandWidth":pacParams.bandWidth if pacParams.bandWidth else 20,
                "attenHz":pacParams.attenHz if pacParams.attenHz else 4
            }

        analysisDetailJSON["pacParams"] = pacParamsJSON

        plvParamsJSON = {
            "lcut":9,
            "hcut":13,
            "rippleDB":40,
            "bandWidth": 20,
            "attenHz": 4
        }

        if plvParams != '':

            plvParamsJSON = {
                "lcut":plvParams.lcut if plvParams.lcut else 9,
                "hcut":plvParams.hcut if plvParams.lcut else 13,
                "rippleDB":plvParams.rippleDB if plvParams.lcut else 40,
                "bandWidth":plvParams.bandWidth if plvParams.lcut else 20,
                "attenHz":plvParams.attenHz if plvParams.lcut else 4
            }

        analysisDetailJSON["plvParams"] = plvParamsJSON

        analysisDetailChannels = AnalysisDetailChannel.objects.filter(analysisDetail = analysisDetail)

        analysisResultList = []
        analysisDetailChannelNames = [x.channelName for x in analysisDetailChannels]

        channelObjs = []

        for edfChannel in channels:
            channelObj = {"channelLabel":edfChannel, "isSelected":False}
            if edfChannel in analysisDetailChannelNames:
                channelObj ["isSelected"] = True
            channelObjs.append(channelObj)

        numChannels = len(analysisDetailChannels)

        for index, analysisDetailChannel in enumerate(analysisDetailChannels):
            channelIndex = channels.index(analysisDetailChannel.channelName)

            rawData = data[channelIndex]
            rawData = [float(x) for x in rawData]

            spectrogramData = []
            if os.path.exists("/home/siddhartha/self/andre/outplots/spectrogram_"+ str(channelIndex) + ".txt"):
                loadData = np.loadtxt("/home/siddhartha/self/andre/outplots/spectrogram_"+ str(channelIndex) + ".txt")

                print (" loadData shape " + str(loadData.shape))

                spectrogramData = []

                print( " loadData = " + str(loadData))

                for i, row in enumerate(loadData):
                    # if i > 1 :
                    #     break
                    dataMap = {"name":str(i), "series":[]}
                    print( " row = " + str(row))
                    # if type(row) is list:
                    try:
                        for j, col in enumerate(row):
                            if j > 99:
                                break
                            # spectrogramData.append([i, j, loadData[i,j]*10000 ] )
                            dataMap["series"].append(
                                        {
                                         "name": str(j),
                                         "value": np.round(loadData[i,j]*10000)
                                         }
                                       )
                            # if j < 5000:
                            #     break
                        spectrogramData.append(dataMap)
                    except:
                        print (" error getting spectrogramData ")
            # print (spectrogramData)

            spectrogramString = ''
            if os.path.exists("/home/siddhartha/self/andre/outplots/spectrogram_"+ str(channelIndex) + ".txt"):
                with open("/home/siddhartha/self/andre/outplots/spectrogram_"+ str(channelIndex) + ".png", "rb") as image_file:
                    spectrogramString = base64.b64encode(image_file.read()).decode('utf-8')

            pacFgamma = []
            if os.path.exists("/home/siddhartha/self/andre/outplots/outpac_fGamma_"+ str(channelIndex) + ".txt"):
                pacFgamma = list(np.loadtxt("/home/siddhartha/self/andre/outplots/outpac_fGamma_"+ str(channelIndex) + ".txt"))

            pacMI = []
            if os.path.exists("/home/siddhartha/self/andre/outplots/outpac_MIs_"+ str(channelIndex) + ".txt"):
                pacMI = list(np.loadtxt("/home/siddhartha/self/andre/outplots/outpac_MIs_"+ str(channelIndex) + ".txt"))

            psdData = ''
            sumDelta = 0
            sumTheta = 0
            sumAlpha = 0
            sumBeta  =  0

            psdData = []

            if os.path.exists("/home/siddhartha/self/andre/outplots/psd_"+ str(channelIndex) + ".txt"):
                psdData = list(np.loadtxt("/home/siddhartha/self/andre/outplots/psd_"+ str(channelIndex) + ".txt"))

                sumDelta = sum(psdData[1:4])
                sumTheta = sum(psdData[4:8])
                sumAlpha = sum(psdData[8:14])
                sumBeta =  sum(psdData[15:30])

            bandData = [sumDelta, sumTheta, sumAlpha, sumBeta ]
            bandLabels = ["Delta", "Theta", "Alpha", "Beta" ]

            upper = analysisDetail.upperTimeLimit * analysisDetail.samplingFrequency
            lower = analysisDetail.lowerTimeLimit * analysisDetail.samplingFrequency
            # above 10 seconds show only upto 10 seconds
            dynamicSpectrogramPlot = True
            if ( upper - lower )  > 10* analysisDetail.samplingFrequency:
                upper = lower+ 10* analysisDetail.samplingFrequency
                dynamicSpectrogramPlot = False

            print (" upper " + str(upper) + " lower " + str(lower) )

            rawData = rawData[lower:upper]
            rawData = [x+index*50 for x in rawData]

            rawDataLabels = list(range(len(rawData) ) )
            psdDataLabels = list(range(len(psdData) ) )

            dynamicSpectrogramPlot = False
            analysisResult = {"rawData":rawData, "rawDataLabels":rawDataLabels,"psdData": psdData, "bandData":bandData, "bandLabels":bandLabels, "psdDataLabels":psdDataLabels, "spectrogramData":spectrogramData, "pacFgamma":pacFgamma, "pacMI":pacMI,
            "spectrogramString":spectrogramString, "dynamicSpectrogramPlot":dynamicSpectrogramPlot, "channelLabel":analysisDetailChannel.channelName}

            print ("bandData " + str(bandData))
            # print (analysisResult)

            analysisResultList.append(analysisResult)

        # pacData =  {"fGamma":list(np.loadtxt("data/outpac_fGamma.txt")), "MIs":list(np.loadtxt("data/outpac_MIs.txt")) }
        # plvData =  {"fGamma":list(np.loadtxt("data/outplv_fGamma.txt")), "MIs":list(np.loadtxt("data/outplv_MIs.txt")) }

        # channelObjs = [{"channelLabel":x} for x in SELECTED_CHANNELS]

        crossSpectrogramData = []
        channel1Index = channels.index(analysisDetail.channel1)
        channel2Index = channels.index(analysisDetail.channel2)

        # print (" cross path " + "/home/siddhartha/self/andre/outplots/crossspectrogram_"+ str(channel2Index) + "_"+ str(channel1Index) + ".txt")
        #
        # if os.path.exists("/home/siddhartha/self/andre/outplots/crossspectrogram_"+ str(channel2Index) + "_"+ str(channel1Index) + ".txt"):
        #     loadData = np.loadtxt("/home/siddhartha/self/andre/outplots/crossspectrogram_"+ str(channel2Index) + "_"+ str(channel1Index) +".txt")
        #
        # if os.path.exists("/home/siddhartha/self/andre/outplots/outplv_fGamma_"+ str(channel2Index) + "_"+ str(channel1Index) + ".txt"):
        #     plvFgamma = np.loadtxt("/home/siddhartha/self/andre/outplots/outplv_fGamma_"+ str(channel2Index) + "_"+ str(channel1Index) +".txt")
        #
        # if os.path.exists("/home/siddhartha/self/andre/outplots/outplv_PLV_"+ str(channel2Index) + "_"+ str(channel1Index) + ".txt"):
        #     plvPlv = np.loadtxt("/home/siddhartha/self/andre/outplots/outplv_PLV_"+ str(channel2Index) + "_"+ str(channel1Index) +".txt")

        # print (" cross path " + "/home/siddhartha/self/andre/outplots/crossspectrogram_"+ str(channel1Index) + "_"+ str(channel2Index) + ".txt")

        plvFgamma = []
        if os.path.exists("/home/siddhartha/self/andre/outplots/outplv_fGamma_"+ str(channel1Index) + "_"+ str(channel2Index) + ".txt"):
            plvFgamma = list ( np.loadtxt("/home/siddhartha/self/andre/outplots/outplv_fGamma_"+ str(channel1Index) + "_"+ str(channel2Index) +".txt") )

        plvPlv = []

        if os.path.exists("/home/siddhartha/self/andre/outplots/outplv_PLV_"+ str(channel1Index) + "_"+ str(channel2Index) + ".txt"):
            plvPlv = list ( np.loadtxt("/home/siddhartha/self/andre/outplots/outplv_PLV_"+ str(channel1Index) + "_"+ str(channel2Index) +".txt") )

        crossSpectrogramData = []

        if os.path.exists("/home/siddhartha/self/andre/outplots/crossspectrogram_"+ str(channel1Index) + "_"+ str(channel2Index) + ".txt"):
            loadData = list(np.loadtxt("/home/siddhartha/self/andre/outplots/crossspectrogram_"+ str(channel1Index) + "_"+ str(channel2Index) +".txt") )

        # print (" loadData shape " + str(loadData.shape))

            for i, row in enumerate(loadData):
                # if i > 1 :
                #     break
                dataMap = {"name":str(i), "series":[]}
                for j, col in enumerate(row):
                    if j > 99:
                        break
                    # spectrogramData.append([i, j, loadData[i,j]*10000 ] )
                    dataMap["series"].append(
                                {
                                 "name": str(j),
                                 "value": np.round(loadData[i][j])
                                 }
                               )
                    # if j < 5000:
                    #     break
                crossSpectrogramData.append(dataMap)


        analysisDetailJSON["analysisResultList"] = analysisResultList
        analysisDetailJSON["channelObjs"] = channelObjs
        analysisDetailJSON["uploadFolder"] = uploadFolderJSON
        analysisDetailJSON["numChannels"] = numChannels
        analysisDetailJSON["crossSpectrogramData"] = crossSpectrogramData

        analysisDetailJSON["plvFgamma"] = plvFgamma
        analysisDetailJSON["plvPlv"] = plvPlv

        # print (" crossSpectrogramData " + str(crossSpectrogramData) )
        #
        # print (uploadFolderJSON)

        # print (" psdData " + str(psdData) )
        # print (" psdDataLabels " + str(psdDataLabels) )

    except Exception as e:

        traceback.print_exc(file=sys.stdout)
        outf.write(str(e))

    return JsonResponse(analysisDetailJSON)

# @api_view([ "GET", "POST"])
# @permission_classes((IsAuthenticated, ))
def fetchAllComments(request):
    try:

        print(" ******* in fetch comments ")
        auth = get_authorization_header(request).split()
        tokendata = auth[1].decode("utf-8")
        print(tokendata)
        tokendata = jwt.decode(auth[1].decode("utf-8"),settings.SECRET_KEY, algorithms=['HS256'])
        user_id = int(tokendata['user_id'])

        submitUser = User.objects.get(id=user_id)

        data = json.loads(request.body.decode('utf-8'))

        uploadFolderId = data["uploadFolderId"]
        uploadFolder = UploadFolder.objects.get(pk = int(uploadFolderId) )

        comments = Comment.objects.filter(uploadFolder= uploadFolder)

        commentsJSON = [{"commentId":x.id, "commentText":x.commentText, "uploadFolderId": x.uploadFolder.id, "commentDate":x.commentDate.strftime("%m/%d/%Y %H:%M:%S"),
                         "xPosition":x.xPosition, "yPosition":x.yPosition, "zPosition":x.zPosition, "userOrAlgorithm":str(int(x.commentType.userOrAlgorithm)), "algorithmUsed":x.commentType.algorithmUsed,
                          "showHideFlag":"0" , "styleClass":"list-group-item list-group-item-primary" if int(x.commentType.userOrAlgorithm) == 1 else "list-group-item list-group-item-success"} for x in comments]
    except:
        traceback.print_exc(file=sys.stdout)
        return JsonResponse({"message":"Error in fetching comment."})

    return JsonResponse(commentsJSON, safe=False)

# @api_view([ "GET", "POST"])
# @permission_classes((IsAuthenticated, ))
# fetch all comments
def fetchCommentsByLocation(request):
    try:

        print(" ******* in fetch comments ")
        auth = get_authorization_header(request).split()
        tokendata = auth[1].decode("utf-8")
        print(tokendata)
        tokendata = jwt.decode(auth[1].decode("utf-8"),settings.SECRET_KEY, algorithms=['HS256'])
        user_id = int(tokendata['user_id'])

        submitUser = User.objects.get(id=user_id)

        data = json.loads(request.body.decode('utf-8'))

        uploadFolderId = data["uploadFolderId"]
        uploadFolder = UploadFolder.objects.get(pk = int(uploadFolderId) )
        imageClass = data["imageClass"]
        selectedView = data["selectedView"]
        xPosition = data["xPosition"]
        yPosition = data["yPosition"]
        depth = data["depth"]

        # comments = Comment.objects.filter(uploadFolder= uploadFolder, imageClass=imageClass, selectedView=selectedView, xPosition = xPosition, yPosition = yPosition, depth=depth)
        comments = Comment.objects.filter(uploadFolder= uploadFolder, selectedView=selectedView, xPosition = xPosition, yPosition = yPosition, depth=depth)

        commentsJSON = [{"commentId": x.id, "commentText":x.commentText, "uploadFolderId": x.uploadFolder.id, "commentDate":x.commentDate.strftime("%m/%d/%Y %H:%M:%S"),
                         "xPosition":x.xPosition, "yPosition":x.yPosition, "zPosition":x.zPosition, "userOrAlgorithm":str(int(x.commentType.userOrAlgorithm)), "algorithmUsed":x.commentType.algorithmUsed,
                         "showHideFlag":"0", "styleClass":"list-group-item list-group-item-primary" if int(x.commentType.userOrAlgorithm) == 1 else "list-group-item list-group-item-success" } for x in comments]

    except:
        traceback.print_exc(file=sys.stdout)
        return JsonResponse({"message":"Error in fetching comment."})

    return JsonResponse(commentsJSON)

# @api_view([ "GET", "POST"])
# @permission_classes((IsAuthenticated, ))
def saveComment(request):
    try:

        print(" ******* in save comment ")
        auth = get_authorization_header(request).split()
        tokendata = auth[1].decode("utf-8")
        print(tokendata)
        tokendata = jwt.decode(auth[1].decode("utf-8"),settings.SECRET_KEY, algorithms=['HS256'])
        user_id = int(tokendata['user_id'])

        submitUser = User.objects.get(id=user_id)

        data = json.loads(request.body.decode('utf-8'))

        uploadFolderId = data["uploadFolderId"]
        uploadFolder = UploadFolder.objects.get(pk = int(uploadFolderId) )

        imageClass = data["imageClass"]
        commentText = data["commentText"]
        xPosition = data["xPosition"]
        yPosition = data["yPosition"]
        zPosition = data["zPosition"]

        comment = Comment()
        comment.user = submitUser
        comment.uploadFolder = uploadFolder

        comment.commentText = commentText
        comment.commentDate = datetime.datetime.now()

        comment.imageClass = int(imageClass)
        comment.commentText = commentText
        comment.xPosition = int(xPosition)
        comment.yPosition = int(yPosition)
        comment.zPosition = int(zPosition)

        commentType = CommentType.objects.filter(userOrAlgorithm = False)[0]

        comment.commentType = commentType
        comment.save()

    except:
        traceback.print_exc(file=sys.stdout)
        return JsonResponse({"message":"Error in saving comment."})

    return JsonResponse({"message":"Comment saved."})

def terminateJob(request):
    try:

        print(" ******* in submit analysis 0000000000000000 ")
        print("begin upload")
        auth = get_authorization_header(request).split()
        tokendata = auth[1].decode("utf-8")
        print(tokendata)
        tokendata = jwt.decode(auth[1].decode("utf-8"),settings.SECRET_KEY, algorithms=['HS256'])
        user_id = int(tokendata['user_id'])

        submitUser = User.objects.get(id=user_id)

        data = json.loads(request.body.decode('utf-8'))
        datafileId = data["datafileId"]

        # outf = open(settings.SUBMIT_FOLDER + uploadFolder.chksum + ".submit", "w")
        # outf.write(uploadFolder.chksum)
        # outf.close()

        outf = open(settings.UPLOAD_FOLDER + uploadFolder.chksum + ".analysis", "w")
        outf.write(analysisProtocol)
        outf.close()

        uploadFolder.status = "Analysis Terminated"
        # uploadFolder.analysisSubmittedDate = datetime.datetime.now()

        uploadFolder.save()

        uploadFolderJSON = { 'id':uploadFolder.id,'name':uploadFolder.name,'chksum':uploadFolder.chksum,
                             'user':str(uploadFolder.user),'description':uploadFolder.description,
                             'status':uploadFolder.status, 'uploadedDate':uploadFolder.uploadedDate.strftime('%Y-%m-%d'),
                             'fileName':uploadFolder.fileName,
                             'fileType':uploadFolder.fileType,
                             'analysisProtocol':uploadFolder.analysisProtocol,
                             'analysisSubmittedDate':uploadFolder.analysisSubmittedDate.strftime('%Y-%m-%d') if uploadFolder.analysisSubmittedDate else '',
                              'rowColor':statusColorMap[uploadFolder.status]}

    except:
        traceback.print_exc(file=sys.stdout)
        return JsonResponse({"message":"Error in job termination.", "uploadFolder":{}})

    return JsonResponse({"message":"Job successfully terminated.", "uploadFolder":uploadFolderJSON})

# @api_view([ "GET", "POST"])
# @permission_classes((IsAuthenticated, ))
def reSubmitAnalysis(request):
    outf = open('/www/projects/EEG_Portal/webEEGPortal/analysisResubmit.txt','a')

    try:

        auth = get_authorization_header(request).split()
        tokendata = auth[1].decode("utf-8")
        tokendata = jwt.decode(auth[1].decode("utf-8"),settings.SECRET_KEY, algorithms=['HS256'])
        user_id = int(tokendata['user_id'])

        submitUser = User.objects.get(id=user_id)

        data = json.loads(request.body.decode('utf-8'))
        datafileId = data["datafileId"]

        timeBandWidth = data["timeBandWidth"]
        numTapers = data["numTapers"]
        stepSize = data["stepSize"]
        timeWindow = data["windowSize"]
        upperFrequency = data["upperFrequency"]
        lowerFrequency = data["lowerFrequency"]
        upperTimeLimit = data["upperTimeLimit"]
        lowerTimeLimit = data["lowerTimeLimit"]

        print(" ******* in re submit analysis upperTimeLimit " + str(upperTimeLimit) + " lowerTimeLimit " + str(lowerTimeLimit))

        outf.write(" upperTimeLimit " + str(upperTimeLimit) + "\n")
        outf.write(" lowerTimeLimit " + str(lowerTimeLimit) + "\n")

        computePSDFlag = data["computePSDFlag"]

        computeCrossCorrelationFlag = data["computeCrossCorrelationFlag"]
        computePACFlag = data["computePACFlag"]
        computePLVFlag = data["computePLVFlag"]

        lcut = data["lcut"]
        hcut = data["hcut"]
        rippleDB = data["rippleDB"]
        bandWidth = data["bandWidth"]
        attenHz = data["attenHz"]

        channel1str = data["channel1"]
        channel2str = data["channel2"]

        # computeSpectrogramFlag = data["computeSpectrogramFlag"]
        selectedChannels = data["selectedChannels"]
        analysisProtocol = 'Multi-Taper Spectrogram'
        fileType = 'EEG'

        uploadFolder = UploadFolder.objects.get(pk = datafileId)

        datafileDirectory = '/home/siddhartha/self/andre/input_data/'
        fileName = uploadFolder.chksum

        # edfFile = pyedflib.EdfReader('/home/siddhartha/self/andre/input_data/' + uploadFolder.chksum)
        # # edfFile = pyedflib.EdfReader(settings.UPLOAD_FOLDER + uploadFolder.chksum)
        # numChannels = edfFile.signals_in_file
        # channels = edfFile.getSignalLabels()
        # fileDuration = edfFile.file_duration
        # beginTime = 0
        # endTime = int(fileDuration)
        #
        # samplingFrequency = edfFile.getSampleFrequencies()[0]
        #
        # edfFile._close()

        if uploadFolder.name.find('edf') != -1:

            edfFile = pyedflib.EdfReader(settings.UPLOAD_FOLDER + uploadFolder.chksum)

            try:
                numChannels = edfFile.signals_in_file
                channels = edfFile.getSignalLabels()
                samplingFrequency = edfFile.getSampleFrequencies()[0]
                fileDuration = edfFile.file_duration
                beginTime = 0
                endTime = int(fileDuration)
                print ( " 1 numSignals = " + str(fileDuration))

            except:
                edfFile._close()
                del edfFile

                edfFile = pyedflib.EdfReader(settings.UPLOAD_FOLDER + uploadFolder.chksum)
                numChannels = edfFile.signals_in_file
                channels = edfFile.getSignalLabels()

                samplingFrequency = edfFile.getSampleFrequencies()[0]
                fileDuration = edfFile.file_duration
                print ( " 2 numSignals = " + str(fileDuration))
                beginTime = 0
                endTime = int(fileDuration)

            edfFile._close()

        elif uploadFolder.name.find('mat') != -1:
            eegmat = loadmat(settings.UPLOAD_FOLDER + uploadFolder.chksum)

            channels = [str(x[0]) for x in eegmat["channelLabels"][0] ]

            samplingFrequency = int(eegmat["eegFS"])

            numChannels = len(channels)

            fileDuration = round(len(eegmat["eegData"][0])/samplingFrequency)
            beginTime = 0
            endTime = int(fileDuration)

        analysisDetail = AnalysisDetail(
            description = "Calculate Spectrogram",
            uploadFolder = uploadFolder,
            samplingFrequency = samplingFrequency,
            upperFrequency = upperFrequency,
            lowerFrequency = lowerFrequency,
            timeBandWidth = timeBandWidth,
            timeWindow = timeWindow,
            stepSize  = stepSize,
            numTapers  = numTapers,
            upperTimeLimit  = upperTimeLimit,
            lowerTimeLimit  = lowerTimeLimit,

            computeCrossCorrelationFlag = computeCrossCorrelationFlag,
            computePACFlag = computePACFlag,
            computePLVFlag = computePLVFlag,
            channel1 = channel1str,
            channel2 = channel2str,

            status = "submitted",
            submittedOn = datetime.datetime.now()
        )

        analysisDetail.save()

        for selectedChannel in selectedChannels:
            analysisDetailChannel = AnalysisDetailChannel(
                channelName = selectedChannel,
                analysisDetail = analysisDetail
            )
            analysisDetailChannel.save()

        pacParams = PacParams(
            analysisDetail = analysisDetail,
            lcut = lcut,
            hcut = hcut,
            rippleDB = rippleDB,
            bandWidth = bandWidth,
            attenHz = attenHz
        )

        pacParams.save()

        plvParams = PlvParams(
            analysisDetail = analysisDetail,
            lcut = lcut,
            hcut = hcut,
            rippleDB = rippleDB,
            bandWidth = bandWidth,
            attenHz = attenHz
        )
        plvParams.save()

        channelNums = [channels.index(x) for x in selectedChannels]

        channel1 = 0
        channel2 = 0

        try:
            channel1 = channels.index(channel1str)
            channel2 = channels.index(channel2str)
        except:
            pass

        results = Parallel(n_jobs= len(selectedChannels), backend="multiprocessing") (delayed(submitComputeSpectrogram)(channelNum, datafileDirectory, fileName, samplingFrequency,upperFrequency,lowerFrequency,timeBandWidth,timeWindow,stepSize,numTapers, upperTimeLimit, lowerTimeLimit, computePSDFlag, computeCrossCorrelationFlag,computePACFlag,computePLVFlag,channel1,channel2, lcut, hcut, rippleDB, bandWidth, attenHz, originalFileName
        ) for channelNum in channelNums)

        if computeCrossCorrelationFlag and channel1 != 0 and channel2 != 0:

            channelSets = [ channel1 ]

            results2 = Parallel(n_jobs= len(selectedChannels), backend="multiprocessing") (delayed(submitComputeCrossSpectrogram)(channel1, datafileDirectory, fileName, samplingFrequency,upperFrequency,lowerFrequency,timeBandWidth,timeWindow,stepSize,numTapers, upperTimeLimit, lowerTimeLimit, computePSDFlag, computeCrossCorrelationFlag,computePACFlag,computePLVFlag,channel1,channel2, lcut, hcut, rippleDB, bandWidth, attenHz, originalFileName
            ) for channelSet in channelSets)

        uploadFolder.status = "Analysis Submitted"
        uploadFolder.analysisProtocol = analysisProtocol
        uploadFolder.fileType = fileType

        uploadFolder.analysisSubmittedDate = datetime.datetime.now()

        uploadFolder.save()
        channelObjs = [{"channelLabel":channel, "isSelected":True} for channel in channels]
        uploadFolderJSON = { 'id':uploadFolder.id,'name':uploadFolder.name,'chksum':uploadFolder.chksum,
                             'user':str(uploadFolder.user),'description':uploadFolder.description,
                             'status':uploadFolder.status, 'uploadedDate':uploadFolder.uploadedDate.strftime('%Y-%m-%d'),
                             'fileName':uploadFolder.name,
                             'fileType':uploadFolder.fileType,'channelObjs':channelObjs,
                             'analysisProtocol':uploadFolder.analysisProtocol,
                             "beginTime":beginTime,
                             "endTime":endTime,
                             'analysisSubmittedDate':uploadFolder.analysisSubmittedDate.strftime('%Y-%m-%d') if uploadFolder.analysisSubmittedDate else '',
                              'rowColor':statusColorMap[uploadFolder.status]}

    except Exception as e:
        traceback.print_exc(file=sys.stdout)
        outf.write(str(e))

        return JsonResponse({"message":"Error in job submission.", "uploadFolder":{}})

    return JsonResponse({"message":"Job successfully submitted.", "uploadFolder":uploadFolderJSON})

# @api_view([ "GET", "POST"])
# @permission_classes((IsAuthenticated, ))
def submitAnalysis(request):
    try:

        print(" ******* in submit analysis 0000000000000000 ")
        print("begin upload")
        auth = get_authorization_header(request).split()
        tokendata = auth[1].decode("utf-8")
        print(tokendata)
        tokendata = jwt.decode(auth[1].decode("utf-8"),settings.SECRET_KEY, algorithms=['HS256'])
        user_id = int(tokendata['user_id'])

        submitUser = User.objects.get(id=user_id)

        data = json.loads(request.body.decode('utf-8'))
        datafileId = data["datafileId"]

        timeBandWidth = data["timeBandWidth"]
        numTapers = data["numTapers"]
        stepSize = data["stepSize"]
        timeWindow = data["windowSize"]
        upperFrequency = data["upperFrequency"]
        lowerFrequency = data["lowerFrequency"]
        upperTimeLimit = data["upperTimeLimit"]
        lowerTimeLimit = data["lowerTimeLimit"]
        computePSDFlag = data["computePSDFlag"]

        computeCrossCorrelationFlag = data["computeCrossCorrelationFlag"]
        computePACFlag = data["computePACFlag"]
        computePLVFlag = data["computePLVFlag"]
        channel1str = data["channel1"]
        channel2str = data["channel2"]

        print (" channel1 00 " + str(channel1str))
        print (" channel2 00 " + str(channel2str))

        lcut = data["lcut"]
        hcut = data["hcut"]
        rippleDB = data["rippleDB"]
        bandWidth = data["bandWidth"]
        attenHz = data["attenHz"]

        # computeSpectrogramFlag = data["computeSpectrogramFlag"]
        selectedChannels = data["selectedChannels"]
        print ( " &&&& selectedChannels " + str(selectedChannels))
        analysisProtocol = 'Multi-Taper Spectrogram'
        fileType = 'EEG'

        # print (" uploadFileId " + str(datafileId))
        # print (" analysisProtocol " + str(analysisProtocol))
        # print (" fileType " + str(fileType))

        uploadFolder = UploadFolder.objects.get(pk = datafileId)
        print(" ******* in submit analysis ")

        datafileDirectory = '/home/siddhartha/self/andre/input_data/'
        fileName = uploadFolder.chksum
        originalFileName = uploadFolder.name
        # edfFile = pyedflib.EdfReader('/home/siddhartha/self/andre/input_data/' + uploadFolder.chksum)
        # # edfFile = pyedflib.EdfReader(settings.UPLOAD_FOLDER + uploadFolder.chksum)
        # numChannels = edfFile.signals_in_file
        # channels = edfFile.getSignalLabels()
        # print (" channels = " + str(channels))
        #
        # samplingFrequency = edfFile.getSampleFrequencies()[0]
        #
        # edfFile._close()

        if uploadFolder.name.find('edf') != -1:

            edfFile = pyedflib.EdfReader(settings.UPLOAD_FOLDER + uploadFolder.chksum)

            try:
                numChannels = edfFile.signals_in_file
                channels = edfFile.getSignalLabels()
                samplingFrequency = edfFile.getSampleFrequencies()[0]
                fileDuration = edfFile.file_duration
                beginTime = 0
                endTime = int(fileDuration)
                print ( " 1 numSignals = " + str(fileDuration))

            except:
                edfFile._close()
                del edfFile

                edfFile = pyedflib.EdfReader(settings.UPLOAD_FOLDER + uploadFolder.chksum)
                numChannels = edfFile.signals_in_file
                channels = edfFile.getSignalLabels()

                samplingFrequency = edfFile.getSampleFrequencies()[0]
                fileDuration = edfFile.file_duration
                print ( " 2 numSignals = " + str(fileDuration))
                beginTime = 0
                endTime = int(fileDuration)

            edfFile._close()

        elif uploadFolder.name.find('mat') != -1:
            eegmat = loadmat(settings.UPLOAD_FOLDER + uploadFolder.chksum)

            channels = [str(x[0]) for x in eegmat["channelLabels"][0] ]

            samplingFrequency = int(eegmat["eegFS"])

            numChannels = len(channels)

            fileDuration = round(len(eegmat["eegData"][0])/samplingFrequency)
            beginTime = 0
            endTime = int(fileDuration)

        analysisDetail = AnalysisDetail(
            description = "Calculate Spectrogram",
            uploadFolder = uploadFolder,
            samplingFrequency = samplingFrequency,
            upperFrequency = upperFrequency,
            lowerFrequency = lowerFrequency,
            timeBandWidth = timeBandWidth,
            timeWindow = timeWindow,
            stepSize  = stepSize,
            numTapers  = numTapers,
            upperTimeLimit  = upperTimeLimit,
            lowerTimeLimit  = lowerTimeLimit,
            status = "submitted",

            computeCrossCorrelationFlag = computeCrossCorrelationFlag,
            computePACFlag = computePACFlag,
            computePLVFlag = computePLVFlag,
            channel1 = channel1str,
            channel2 = channel2str,

            submittedOn = datetime.datetime.now()
        )

        analysisDetail.save()
        print(" selectedChannels " + str(selectedChannels))

        for selectedChannel in selectedChannels:
            analysisDetailChannel = AnalysisDetailChannel(
                channelName = selectedChannel,
                analysisDetail = analysisDetail
            )
            analysisDetailChannel.save()

        pacParams = PacParams(
            analysisDetail = analysisDetail,
            lcut = lcut,
            hcut = hcut,
            rippleDB = rippleDB,
            bandWidth = bandWidth,
            attenHz = attenHz
        )

        pacParams.save()

        plvParams = PlvParams(
            analysisDetail = analysisDetail,
            lcut = lcut,
            hcut = hcut,
            rippleDB = rippleDB,
            bandWidth = bandWidth,
            attenHz = attenHz
        )
        plvParams.save()

        channelNums = [channels.index(x) for x in selectedChannels]
        channel1 = 0
        channel2 = 0

        try:
            channel1 = channels.index(channel1str)
            channel2 = channels.index(channel2str)
        except:
            traceback.print_exc(file=sys.stdout)
            pass

        print (" channel1 11 " + str(channel1))
        print (" channel2 11 " + str(channel2))

        results = Parallel(n_jobs= len(selectedChannels), backend="multiprocessing") (delayed(submitComputeSpectrogram)(channelNum, datafileDirectory, fileName, samplingFrequency,upperFrequency,lowerFrequency,timeBandWidth,timeWindow,stepSize,numTapers, upperTimeLimit, lowerTimeLimit, computePSDFlag, computeCrossCorrelationFlag,computePACFlag,computePLVFlag,channel1,channel2, lcut, hcut, rippleDB, bandWidth, attenHz, originalFileName
        ) for channelNum in channelNums)

        if computeCrossCorrelationFlag and channel1 != '' and channel2 != '':

            channelSets = [ channel1 ]

            results2 = Parallel(n_jobs= len(selectedChannels), backend="multiprocessing") (delayed(submitComputeCrossSpectrogram)(channel1, datafileDirectory, fileName, samplingFrequency,upperFrequency,lowerFrequency,timeBandWidth,timeWindow,stepSize,numTapers, upperTimeLimit, lowerTimeLimit, computePSDFlag, computeCrossCorrelationFlag,computePACFlag,computePLVFlag,channel1,channel2, lcut, hcut, rippleDB, bandWidth, attenHz, originalFileName
            ) for channelSet in channelSets)

        print(" after parallel ")

        uploadFolder.status = "Analysis Submitted"
        uploadFolder.analysisProtocol = analysisProtocol
        uploadFolder.fileType = fileType

        uploadFolder.analysisSubmittedDate = datetime.datetime.now()

        uploadFolder.save()

        channelObjs = [{"channelLabel":channel, "isSelected":True} for channel in channels]

        uploadFolderJSON = { 'id':uploadFolder.id,'name':uploadFolder.name,'chksum':uploadFolder.chksum,
                             'user':str(uploadFolder.user),'description':uploadFolder.description,
                             'status':uploadFolder.status, 'uploadedDate':uploadFolder.uploadedDate.strftime('%Y-%m-%d'),
                             'fileName':uploadFolder.name,'channelObjs':channelObjs,
                             'fileType':uploadFolder.fileType,
                             'analysisProtocol':uploadFolder.analysisProtocol,
                             'analysisSubmittedDate':uploadFolder.analysisSubmittedDate.strftime('%Y-%m-%d') if uploadFolder.analysisSubmittedDate else '',
                              'rowColor':statusColorMap[uploadFolder.status]}

    except:
        traceback.print_exc(file=sys.stdout)
        return JsonResponse({"message":"Error in job submission.", "uploadFolder":{}})

    return JsonResponse({"message":"Job successfully submitted.", "uploadFolder":uploadFolderJSON})

def submitComputeSpectrogram(channelNum, datafileDirectory, fileName, samplingFrequency,upperFrequency,lowerFrequency,timeBandWidth,timeWindow,stepSize,numTapers, upperTimeLimit, lowerTimeLimit, computePSDFlag, computeCrossCorrelationFlag,computePACFlag,computePLVFlag,channel1,channel2, lcut, hcut, rippleDB, bandWidth, attenHz, originalFileName):
# def submitComputeSpectrogram(channelNum, datafileDirectory, fileName, samplingFrequency,upperFrequency,lowerFrequency,timeBandWidth,timeWindow,stepSize,numTapers, upperTimeLimit, lowerTimeLimit, computePSDFlag):
    try:
        REMOTE_PASS='imij'
        REMOTE_USER='siddhartha'
        REMOTE_IP='127.0.0.1'

        REMOTE_COMMAND ='/home/siddhartha/anaconda3/envs/Nifti_Drop/bin/python'
        REMOTE_PROGRAM ='/www/projects/EEG_Portal/webEEGPortal/computeSpectrogram.py'

        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(REMOTE_IP,username=REMOTE_USER,password=REMOTE_PASS,allow_agent=False,look_for_keys=False)
        transport = ssh.get_transport()
        channel = transport.open_session()

        computeCrossCorrelationFlag = 1 if computeCrossCorrelationFlag else 0
        computePLVFlag = 1 if computePLVFlag else 0
        computePACFlag = 1 if computePACFlag else 0
        computePSDFlag = 1 if computePSDFlag else 0

        # REMOTE_PROGRAM += ' ' + str(datafileDirectory) + ' ' + str(fileName) + ' ' + str(channelNum) +  ' ' + str(samplingFrequency) + ' ' + str(upperFrequency) + ' ' + str(lowerFrequency) + ' ' + str(timeBandWidth) + ' ' + str(timeWindow) + ' ' + str(stepSize) + ' ' + str(numTapers) + ' ' + str(upperTimeLimit) + ' ' + str(lowerTimeLimit) + ' ' + str(computePSDFlag)
        REMOTE_PROGRAM += ' ' + str(datafileDirectory) + ' ' + str(fileName) + ' ' + str(channelNum) +  ' ' + str(samplingFrequency) + ' ' + str(upperFrequency) + ' ' + str(lowerFrequency) + ' ' + str(timeBandWidth) + ' ' + str(timeWindow) + ' ' + str(stepSize) + ' ' + str(numTapers) + ' ' + str(upperTimeLimit) + ' ' + str(lowerTimeLimit) + ' ' + str(computePSDFlag) + ' ' + str(computeCrossCorrelationFlag) + ' ' + str(computePACFlag)+ ' ' + str(computePLVFlag)+ ' ' + str(channel1)+ ' ' + str(channel2) + ' ' + str(lcut) + ' ' +  str(hcut) + ' ' +  str(rippleDB) + ' ' +  str(bandWidth) + ' ' + str(attenHz)
        print (REMOTE_PROGRAM)

        channel.exec_command(REMOTE_COMMAND + ' ' + REMOTE_PROGRAM)
    except:
        traceback.print_exc(file=sys.stdout)

def submitComputeCrossSpectrogram(channelNum, datafileDirectory, fileName, samplingFrequency,upperFrequency,lowerFrequency,timeBandWidth,timeWindow,stepSize,numTapers, upperTimeLimit, lowerTimeLimit, computePSDFlag, computeCrossCorrelationFlag,computePACFlag,computePLVFlag,channel1,channel2, lcut, hcut, rippleDB, bandWidth, attenHz, originalFileName):

    try:
        print (" in parallel for " + str(channelNum))
        REMOTE_PASS='imij'
        REMOTE_USER='siddhartha'
        REMOTE_IP='127.0.0.1'

        REMOTE_COMMAND ='/home/siddhartha/anaconda3/envs/Nifti_Drop/bin/python'
        REMOTE_PROGRAM ='/www/projects/EEG_Portal/webEEGPortal/computeCrossSpectrogram.py'

        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(REMOTE_IP,username=REMOTE_USER,password=REMOTE_PASS,allow_agent=False,look_for_keys=False)
        transport = ssh.get_transport()
        channel = transport.open_session()

        computePSDFlag = 1 if computePSDFlag else 0
        computeCrossCorrelationFlag = 1 if computeCrossCorrelationFlag else 0
        computePLVFlag = 1 if computePLVFlag else 0
        computePACFlag = 1 if computePACFlag else 0

        REMOTE_PROGRAM += ' ' + str(datafileDirectory) + ' ' + str(fileName) + ' ' + str(channelNum) +  ' ' + str(samplingFrequency) + ' ' + str(upperFrequency) + ' ' + str(lowerFrequency) + ' ' + str(timeBandWidth) + ' ' + str(timeWindow) + ' ' + str(stepSize) + ' ' + str(numTapers) + ' ' + str(upperTimeLimit) + ' ' + str(lowerTimeLimit) + ' ' + str(computePSDFlag) + ' ' + str(computeCrossCorrelationFlag) + ' ' + str(computePACFlag)+ ' ' + str(computePLVFlag)+ ' ' + str(channel1)+ ' ' + str(channel2) + ' ' + str(lcut) + ' ' +  str(hcut) + ' ' +  str(rippleDB) + ' ' +  str(bandWidth) + ' ' + str(attenHz)
        print (REMOTE_PROGRAM)
        channel.exec_command(REMOTE_COMMAND + ' ' + REMOTE_PROGRAM)
    except:
        traceback.print_exc(file=sys.stdout)
#
# def submitComputePSD(channelNum, datafileDirectory, fileName, samplingFrequency,upperFrequency,lowerFrequency,timeBandWidth,timeWindow,stepSize,numTapers, upperTimeLimit, lowerTimeLimit):
#
#     try:
#         print (" in parallel for " + str(channelNum))
#
#         REMOTE_PASS='imij'
#         REMOTE_USER='siddhartha'
#         REMOTE_IP='127.0.0.1'
#
#         REMOTE_COMMAND ='/home/siddhartha/anaconda3/envs/Nifti_Drop/bin/python'
#         REMOTE_PROGRAM ='/www/projects/EEG_Portal/webEEGPortal/computePSD.py'
#
#         ssh = paramiko.SSHClient()
#         ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
#         ssh.connect(REMOTE_IP,username=REMOTE_USER)
#         transport = ssh.get_transport()
#         channel = transport.open_session()
#
#         REMOTE_PROGRAM += ' ' + str(datafileDirectory) + ' ' + str(fileName) + ' ' + str(channelNum) +  ' ' + str(samplingFrequency) + ' ' + str(upperFrequency) + ' ' + str(lowerFrequency) + ' ' + str(timeBandWidth) + ' ' + str(timeWindow) + ' ' + str(stepSize) + ' ' + str(numTapers) + ' ' + str(upperTimeLimit) + ' ' + str(lowerTimeLimit)
#         print (REMOTE_PROGRAM)
#         channel.exec_command(REMOTE_COMMAND + ' ' + REMOTE_PROGRAM)
#     except:
#         traceback.print_exc(file=sys.stdout)
