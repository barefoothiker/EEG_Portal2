class ImageObj(object):
    def __init__(self, imageName, imageType, imageWidth, imageHeight):
        self.imageName = imageName
        self.imageType = imageType
        self.imageWidth = imageWidth
        self.imageHeight = imageHeight

    def __unicode__(self):
        return str(self.name)

class ProcessObj(object):
    def __init__(self):

        self.processName = ''
        self.log = ''

    def __unicode__(self):
        return str(self.name)

class RegionObj(object):
    def __init__(self):

        self.regionId = ''
        self.regionName = ''

    def __unicode__(self):
        return str(self.regionName)

class ProcessingStepObj(object):
    def __init__(self, name, status, timeOfOccurrence):

        self.name = name
        self.status = status
        self.timeOfOccurrence = timeOfOccurrence

    def __unicode__(self):
        return str(self.name)

class FileObj(object):
    def __init__(self, fileName, index):

        self.fileName = fileName
        self.fileId = index

    def __unicode__(self):
        return str(self.project.name)

class CommentsObj(object):
    def __init__(self):

        self.commentNum = 0
        self.startTime = ''
        self.description = ''

    def __unicode__(self):
        return str(self.fileName)
