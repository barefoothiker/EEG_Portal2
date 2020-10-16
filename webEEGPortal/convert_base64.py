import numpy as np
from PIL import Image
import datetime
import base64
import nibabel as nib
import os, sys, traceback
import gzip

REGIONS = {'17':'Left_Hippocampus',
           '53':'Right_Hippocampus',
           '1006':'Left_Enthorinal_Cortex',
           '2006':'Right_Enthorinal_Cortex'}

def convertData():

    try:

        # for fileName in os.listdir("/home/siddhartha/data/rois"):
                # dataGzip = base64.b64encode(gzip.compress(nib.load("/home/siddhartha/data/rois/" + fileName).get_data().ravel()))
                # open("/home/siddhartha/data/roi_base64/" + fileName.split(".")[0] + ".base64","w").write(dataGzip.decode('utf-8'))
                #
                # print(fileName)
                # print (nib.load("/home/siddhartha/data/rois/" + fileName).get_data().shape)
                # data = open("/home/siddhartha/data/rois/" + fileName, "rb").read()

                # data = nib.load("/home/siddhartha/data/rois/" + fileName).get_data().ravel()
                # b64Data = base64.b64encode(data)
                # b64DecodedData = base64.decodestring(data)
                # print (b64DecodedData)
                # print((base64.b64encode(data)).decode('utf-8'))
                # open("/home/siddhartha/data/roi_base64/" + fileName.split(".")[0] + ".base64","w").write((base64.b64encode(data)).decode('utf-8'))
                # with gzip.open("/home/siddhartha/data/roi_gz/" + fileName.split(".")[0] + ".gz","w") as f:
                #     # f.write(base64.b64encode(data))
                #     f.write(data)

        # brainData = nib.load("/home/siddhartha/data/brain/brain_w.nii.gz").get_data().ravel()
        # brainData = open("/home/siddhartha/data/brain/brain_w.nii.gz", "rb").read()
        # print("brain")
        # brainDataGzip = base64.b64encode(gzip.compress(nib.load("/home/siddhartha/data/brain/brain_w.nii.gz").get_data().ravel()))
        # print (nib.load("/home/siddhartha/data/brain/brain_w.nii.gz").get_data().shape)
        # print(brainDataGzip)
        # open("/home/siddhartha/data/brain_base64/brain_w.base64","w").write(brainDataGzip.decode('utf-8'))
        # with gzip.open("/home/siddhartha/data/brain_gz/brain_w.gz","w") as f:
        #     f.write(data)
            # f.write(base64.b64encode(data))

        # open("/home/siddhartha/data/brain_base64/brain_w.base64","w").write((base64.b64encode(brainData)).decode('utf-8'))
        # brainDataGzip = base64.b64encode(gzip.compress(nib.load("/home/siddhartha/data/latest/Base64/hey.nii").get_data().ravel()))
        # print (nib.load("/home/siddhartha/data/brain/brain_w.nii.gz").get_data().shape)
        # print(brainDataGzip)
        open("/home/siddhartha/data/brain_base64/brain_w.base64","w").write(base64.b64encode(open("/home/siddhartha/data/latest/Base64/hey.nii")).read()).decode('utf-8'))
        print (" no action ")
    except:
        traceback.print_exc(file=sys.stdout)
    return

convertData()
