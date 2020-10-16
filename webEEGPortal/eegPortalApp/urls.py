from django.conf.urls import url, include
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from eegPortalApp.views import *
from django.contrib.auth.views import LoginView
from django.contrib.auth.views import LogoutView
from rest_framework_jwt.views import obtain_jwt_token, refresh_jwt_token

admin.autodiscover()

urlpatterns = [

    url(r'^admin/', admin.site.urls),

    url(r'^eegPortalApp/submitUploadFile/', submitUploadFile, name = 'submitUploadFile'),
    url(r'^eegPortalApp/signupUser/', signupUser, name = 'signupUser'),
    url(r'^eegPortalApp/checkUser/', checkUser, name = 'checkUser'),
    url(r'^eegPortalApp/checkEmail/', checkEmail, name = 'checkEmail'),
    url(r'^eegPortalApp/checkLogin/', checkLogin, name = 'checkLogin'),
    url(r'^eegPortalApp/resetPassword/', resetPassword, name = 'resetPassword'),
    url(r'^eegPortalApp/emailPasswordLink/', emailPasswordLink, name = 'emailPasswordLink'),
    url(r'^eegPortalApp/logoutUser/', logoutUser, name = 'logoutUser'),
    url(r'^eegPortalApp/listUploadedFiles/', listUploadedFiles, name = 'listUploadedFiles'),
    url(r'^eegPortalApp/getDatafile/', getDatafile, name = 'getDatafile'),
    url(r'^eegPortalApp/saveComment/', saveComment, name = 'saveComment'),
    url(r'^eegPortalApp/fetchAllComments/', fetchAllComments, name = 'fetchAllComments'),
    url(r'^eegPortalApp/fetchCommentsByLocation/', fetchCommentsByLocation, name = 'fetchCommentsByLocation'),
    url(r'^eegPortalApp/deleteDatafile/', deleteDatafile, name = 'deleteDatafile'),

    url(r'^eegPortalApp/submitAnalysis/', submitAnalysis, name = 'submitAnalysis'),
    url(r'^eegPortalApp/reSubmitAnalysis/', reSubmitAnalysis, name = 'reSubmitAnalysis'),

    url(r'^eegPortalApp/submitICA/', submitICA, name = 'submitICA'),

    url(r'^eegPortalApp/reloadDatafile/', reloadDatafile, name = 'reloadDatafile'),

    url(r'^eegPortalApp/updateDatafileName/', updateDatafileName, name = 'updateDatafileName'),
    url(r'^eegPortalApp/searchUploadedFolders/', searchUploadedFolders, name = 'searchUploadedFolders'),
    url(r'^eegPortalApp/getUserProfile/', getUserProfile, name = 'getUserProfile'),
    url(r'^eegPortalApp/updateUser/', updateUser, name = 'updateUser'),
    url(r'^eegPortalApp/getRunningJobs/', getRunningJobs, name = 'getRunningJobs'),
    url(r'^eegPortalApp/terminateJob/', terminateJob, name = 'terminateJob'),
    url(r'^eegPortalApp/getAnalysisDetail/', getAnalysisDetail, name = 'getAnalysisDetail'),

    url(r'^eegPortalApp/addEpoch/', addEpoch, name = 'addEpoch'),
    url(r'^eegPortalApp/removeEpoch/', removeEpoch, name = 'removeEpoch'),

    url(r'^eegPortalApp/getMontage/', getMontage, name = 'getMontage'),

    url(r'^eegPortalApp/addMontage/', addMontage, name = 'addMontage'),
    url(r'^eegPortalApp/removeMontage/', removeMontage, name = 'removeMontage'),

    url(r'^eegPortalApp/addMontageChannel/', addMontageChannel, name = 'addMontageChannel'),
    url(r'^eegPortalApp/removeMontageChannel/', removeMontageChannel, name = 'removeMontageChannel'),

    url(r'^eegPortalApp/api-token-auth/', obtain_jwt_token),
    url(r'^eegPortalApp/api-token-refresh/', refresh_jwt_token),


    url('accounts/', include('django.contrib.auth.urls')), # new
    url(r'^admin/', admin.site.urls),

]

urlpatterns += staticfiles_urlpatterns()

#print str(urlpatterns)
