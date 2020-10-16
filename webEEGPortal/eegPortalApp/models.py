from __future__ import absolute_import

from django.db import models
from django.contrib.auth.models import User

class Montage(models.Model):
    name = models.CharField(max_length=256)
    def __str__(self):
        return self.name

class MontageChannel(models.Model):
    channel1 = models.CharField(max_length=256)
    channel2 = models.CharField(max_length=256)
    resultChannel = models.CharField(max_length=256, blank = True, null = True)
    montage = models.ForeignKey(Montage, on_delete=models.CASCADE)
    def __str__(self):
        return self.name

class UploadFolder(models.Model):
    name = models.CharField(max_length=256)
    fileName = models.CharField(max_length=512, blank = True, null = True)
    fileType = models.CharField(max_length=256, blank = True, null = True)
    user = models.ForeignKey(User, blank = True, null=True, on_delete=models.CASCADE)
    chksum = models.CharField(max_length=256, default='')
    description = models.CharField(max_length=512, blank = True, null = True)
    status = models.CharField(max_length=255, blank = True, null = True)
    uploadedDate = models.DateTimeField(max_length=255, blank = True, null = True)
    referenceChannel = models.CharField(max_length=256, null=True, blank=True)
    montage = models.ForeignKey(Montage, null=True, blank=True, on_delete=models.CASCADE)
    useMontage = models.NullBooleanField()
    def __str__(self):
        return self.name

class Epoch(models.Model):
    uploadFolder = models.ForeignKey(UploadFolder, on_delete=models.CASCADE)
    startTime = models.IntegerField()
    endTime = models.IntegerField()
    description = models.CharField(max_length=512, blank = True, null = True)
    def __str__(self):
        return self.name

class AnalysisDetail(models.Model):
    description = models.CharField(max_length=512, blank = True, null = True)

    uploadFolder = models.ForeignKey(UploadFolder, on_delete=models.CASCADE)

    samplingFrequency = models.IntegerField()
    upperFrequency = models.IntegerField()
    lowerFrequency = models.IntegerField()
    timeBandWidth = models.IntegerField()
    timeWindow = models.IntegerField()
    stepSize  = models.IntegerField()
    numTapers  = models.IntegerField()
    upperTimeLimit  = models.IntegerField(null=True)
    lowerTimeLimit  = models.IntegerField(null=True)
    status = models.CharField(max_length=255)

    computeCrossCorrelationFlag = models.NullBooleanField()
    computePACFlag = models.NullBooleanField()
    computePLVFlag = models.NullBooleanField()
    channel1 = models.CharField(max_length=255, null=True)
    channel2 = models.CharField(max_length=255, null=True)

    submittedOn = models.DateTimeField()
    completedOn = models.DateTimeField(blank = True, null = True)
    # submittedBy:string;
    def __str__(self):
        return self.description

class AnalysisDetailChannel(models.Model):
    channelName = models.CharField(max_length=255, blank = True, null = True)
    analysisDetail = models.ForeignKey(AnalysisDetail, on_delete=models.CASCADE)
    # submittedBy:string;
    def __str__(self):
        return self.channelName

class PacParams(models.Model):

    analysisDetail = models.ForeignKey(AnalysisDetail, on_delete=models.CASCADE)

    lcut = models.FloatField()
    hcut = models.FloatField()
    rippleDB = models.FloatField()
    bandWidth = models.FloatField()
    attenHz = models.FloatField()

    def __str__(self):
        return str(self.analysisDetail)

class PlvParams(models.Model):

    analysisDetail = models.ForeignKey(AnalysisDetail, on_delete=models.CASCADE)

    lcut = models.FloatField()
    hcut = models.FloatField()
    rippleDB = models.FloatField()
    bandWidth = models.FloatField()
    attenHz = models.FloatField()

    def __str__(self):
        return str(self.analysisDetail)

class ImijUser(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    addressLine1 = models.CharField(max_length=512, blank = True, null = True)
    addressLine2 = models.CharField(max_length=512, blank = True, null = True)
    city = models.CharField(max_length=256, blank = True, null = True)
    state = models.CharField(max_length=2, blank = True, null = True)
    zipCode = models.CharField(max_length=12, blank = True, null = True)
    phoneNumber = models.CharField(max_length=12, blank = True, null = True)
    def __str__(self):
        return self.user.username

class CommentType(models.Model):
    userOrAlgorithm = models.BooleanField()
    algorithmUsed = models.CharField(max_length=256, blank = True, null = True)
    def __str__(self):
        return self.filePath

class Comment(models.Model):
    commentText = models.CharField(max_length=512)
    uploadFolder = models.ForeignKey(UploadFolder, on_delete=models.CASCADE)
    commentDate = models.DateTimeField()
    imageClass = models.IntegerField()
    xPosition = models.IntegerField()
    yPosition = models.IntegerField()
    zPosition = models.IntegerField()
    commentType = models.ForeignKey(CommentType, on_delete=models.CASCADE, blank = True, null = True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    def __str__(self):
        return self.name

class Process(models.Model):
    name = models.CharField(max_length=512)
    description = models.CharField(max_length=512, blank = True, null = True)
    def __str__(self):
        return self.name

class ProcessStep(models.Model):
    name = models.CharField(max_length=512)
    # fileType = models.ForeignKey(FileType, blank = True, null = True )
    process  = models.ForeignKey ( Process , on_delete=models.CASCADE)
    def __str__(self):
        return self.name

class LogFile(models.Model):
    antsCorticalThickness = models.CharField(max_length=512, blank = True, null = True)
    antsIntroduction = models.CharField(max_length=512, blank = True, null = True)
    jointLabelFusion = models.CharField(max_length=512, blank = True, null = True)
    warpImageMultiTransform = models.CharField(max_length=512, blank = True, null = True)
    uploadFolder = models.ForeignKey(UploadFolder, blank = True, null=True, on_delete=models.CASCADE)
    def __str__(self):
        return self.name

class JobStatusCode(models.Model):
    code = models.CharField(max_length=10)
    description = models.CharField(max_length=255, null=True)
    def __unicode__(self):
        return self.code

class SubmittedJob(models.Model):
    name = models.CharField(max_length=512)
    submittedBy = models.ForeignKey(User, on_delete=models.CASCADE)
    submittedOn = models.DateTimeField( null=True, blank = True)
    jobStatusCode = models.ForeignKey(JobStatusCode, on_delete=models.CASCADE)
    uploadeFolder = models.ForeignKey(UploadFolder, on_delete=models.CASCADE)
    completedTime = models.DateTimeField(null=True, blank=True)
    process = models.ForeignKey(Process, on_delete=models.CASCADE)
    def __unicode__(self):
        return self.name
