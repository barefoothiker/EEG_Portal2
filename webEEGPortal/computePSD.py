import numpy as np
import os
import sys
import traceback
import math
import scipy.signal as signal
from scipy.signal import *
import matplotlib.pyplot as plt
from numpy import cos, sin, pi, absolute, arange
from numpy.random import normal
from scipy.signal import kaiserord, lfilter, firwin, freqz
from math import sqrt, log10
import pyedflib
import pandas as pd
from scipy import fftpack, linalg
import getopt, sys

def tridisolve(d, e, b, overwrite_b=True):
    """Symmetric tridiagonal system solver, from Golub and Van Loan pg 157.

    Note: Copied from NiTime

    Parameters
    ----------

    d : ndarray
      main diagonal stored in d[:]
    e : ndarray
      superdiagonal stored in e[:-1]
    b : ndarray
      RHS vector

    Returns
    -------

    x : ndarray
      Solution to Ax = b (if overwrite_b is False). Otherwise solution is
      stored in previous RHS vector b

    """
    N = len(b)
    # work vectors
    dw = d.copy()
    ew = e.copy()
    if overwrite_b:
        x = b
    else:
        x = b.copy()
    for k in range(1, N):
        # e^(k-1) = e(k-1) / d(k-1)
        # d(k) = d(k) - e^(k-1)e(k-1) / d(k-1)
        t = ew[k - 1]
        ew[k - 1] = t / dw[k - 1]
        dw[k] = dw[k] - t * ew[k - 1]
    for k in range(1, N):
        x[k] = x[k] - ew[k - 1] * x[k - 1]
    x[N - 1] = x[N - 1] / dw[N - 1]
    for k in range(N - 2, -1, -1):
        x[k] = x[k] / dw[k] - ew[k] * x[k + 1]

    if not overwrite_b:
        return x

def tridi_inverse_iteration(d, e, w, x0=None, rtol=1e-8):
    """Perform an inverse iteration.

    This will find the eigenvector corresponding to the given eigenvalue
    in a symmetric tridiagonal system.

    Note: Copied from NiTime

    Parameters
    ----------

    d : ndarray
      main diagonal of the tridiagonal system
    e : ndarray
      offdiagonal stored in e[:-1]
    w : float
      eigenvalue of the eigenvector
    x0 : ndarray
      initial point to start the iteration
    rtol : float
      tolerance for the norm of the difference of iterates

    Returns
    -------
    e: ndarray
      The converged eigenvector

    """
    eig_diag = d - w
    if x0 is None:
        x0 = np.random.randn(len(d))
    x_prev = np.zeros_like(x0)
    norm_x = np.linalg.norm(x0)
    # the eigenvector is unique up to sign change, so iterate
    # until || |x^(n)| - |x^(n-1)| ||^2 < rtol
    x0 /= norm_x
    while np.linalg.norm(np.abs(x0) - np.abs(x_prev)) > rtol:
        x_prev = x0.copy()
        tridisolve(eig_diag, e, x0)
        norm_x = np.linalg.norm(x0)
        x0 /= norm_x
    return x0


def dpss_windows(N, half_nbw, Kmax, low_bias=True, interp_from=None,
                 interp_kind='linear'):
    """Compute Discrete Prolate Spheroidal Sequences.

    Will give of orders [0,Kmax-1] for a given frequency-spacing multiple
    NW and sequence length N.

    Note: Copied from NiTime

    Parameters
    ----------
    N : int
        Sequence length
    half_nbw : float, unitless
        Standardized half bandwidth corresponding to 2 * half_bw = BW*f0
        = BW*N/dt but with dt taken as 1
    Kmax : int
        Number of DPSS windows to return is Kmax (orders 0 through Kmax-1)
    low_bias : Bool
        Keep only tapers with eigenvalues > 0.9
    interp_from : int (optional)
        The dpss can be calculated using interpolation from a set of dpss
        with the same NW and Kmax, but shorter N. This is the length of this
        shorter set of dpss windows.
    interp_kind : str (optional)
        This input variable is passed to scipy.interpolate.interp1d and
        specifies the kind of interpolation as a string ('linear', 'nearest',
        'zero', 'slinear', 'quadratic, 'cubic') or as an integer specifying the
        order of the spline interpolator to use.


    Returns
    -------
    v, e : tuple,
        v is an array of DPSS windows shaped (Kmax, N)
        e are the eigenvalues

    Notes
    -----
    Tridiagonal form of DPSS calculation from:

    Slepian, D. Prolate spheroidal wave functions, Fourier analysis, and
    uncertainty V: The discrete case. Bell System Technical Journal,
    Volume 57 (1978), 1371430
    """
    from scipy import interpolate
    Kmax = int(Kmax)
    W = float(half_nbw) / N
    nidx = np.arange(N, dtype='d')

    # In this case, we create the dpss windows of the smaller size
    # (interp_from) and then interpolate to the larger size (N)
    if interp_from is not None:
        if interp_from > N:
            e_s = 'In dpss_windows, interp_from is: %s ' % interp_from
            e_s += 'and N is: %s. ' % N
            e_s += 'Please enter interp_from smaller than N.'
            raise ValueError(e_s)
        dpss = []
        d, e = dpss_windows(interp_from, half_nbw, Kmax, low_bias=False)
        for this_d in d:
            x = np.arange(this_d.shape[-1])
            I = interpolate.interp1d(x, this_d, kind=interp_kind)
            d_temp = I(np.linspace(0, this_d.shape[-1] - 1, N, endpoint=False))

            # Rescale:
            d_temp = d_temp / np.sqrt(sum_squared(d_temp))

            dpss.append(d_temp)

        dpss = np.array(dpss)

    else:
        # here we want to set up an optimization problem to find a sequence
        # whose energy is maximally concentrated within band [-W,W].
        # Thus, the measure lambda(T,W) is the ratio between the energy within
        # that band, and the total energy. This leads to the eigen-system
        # (A - (l1)I)v = 0, where the eigenvector corresponding to the largest
        # eigenvalue is the sequence with maximally concentrated energy. The
        # collection of eigenvectors of this system are called Slepian
        # sequences, or discrete prolate spheroidal sequences (DPSS). Only the
        # first K, K = 2NW/dt orders of DPSS will exhibit good spectral
        # concentration
        # [see http://en.wikipedia.org/wiki/Spectral_concentration_problem]

        # Here I set up an alternative symmetric tri-diagonal eigenvalue
        # problem such that
        # (B - (l2)I)v = 0, and v are our DPSS (but eigenvalues l2 != l1)
        # the main diagonal = ([N-1-2*t]/2)**2 cos(2PIW), t=[0,1,2,...,N-1]
        # and the first off-diagonal = t(N-t)/2, t=[1,2,...,N-1]
        # [see Percival and Walden, 1993]
        diagonal = ((N - 1 - 2 * nidx) / 2.) ** 2 * np.cos(2 * np.pi * W)
        off_diag = np.zeros_like(nidx)
        off_diag[:-1] = nidx[1:] * (N - nidx[1:]) / 2.
        # put the diagonals in LAPACK "packed" storage
        ab = np.zeros((2, N), 'd')
        ab[1] = diagonal
        ab[0, 1:] = off_diag[:-1]
        # only calculate the highest Kmax eigenvalues
        w = linalg.eigvals_banded(ab, select='i',
                                  select_range=(N - Kmax, N - 1))
        w = w[::-1]

        # find the corresponding eigenvectors via inverse iteration
        t = np.linspace(0, np.pi, N)
        dpss = np.zeros((Kmax, N), 'd')
        for k in range(Kmax):
            dpss[k] = tridi_inverse_iteration(diagonal, off_diag, w[k],
                                              x0=np.sin((k + 1) * t))

    # By convention (Percival and Walden, 1993 pg 379)
    # * symmetric tapers (k=0,2,4,...) should have a positive average.
    # * antisymmetric tapers should begin with a positive lobe
    fix_symmetric = (dpss[0::2].sum(axis=1) < 0)
    for i, f in enumerate(fix_symmetric):
        if f:
            dpss[2 * i] *= -1
    # rather than test the sign of one point, test the sign of the
    # linear slope up to the first (largest) peak
    pk = np.argmax(np.abs(dpss[1::2, :N // 2]), axis=1)
    for i, p in enumerate(pk):
        if np.sum(dpss[2 * i + 1, :p]) < 0:
            dpss[2 * i + 1] *= -1

    # Now find the eigenvalues of the original spectral concentration problem
    # Use the autocorr sequence technique from Percival and Walden, 1993 pg 390

    # compute autocorr using FFT (same as nitime.utils.autocorr(dpss) * N)
    rxx_size = 2 * N - 1
    n_fft = 2 ** int(np.ceil(np.log2(rxx_size)))
    dpss_fft = fftpack.fft(dpss, n_fft)
    dpss_rxx = np.real(fftpack.ifft(dpss_fft * dpss_fft.conj()))
    dpss_rxx = dpss_rxx[:, :N]

    r = 4 * W * np.sinc(2 * W * nidx)
    r[0] = 2 * W
    eigvals = np.dot(dpss_rxx, r)

    if low_bias:
        idx = (eigvals > 0.9)
        if not idx.any():
            warn('Could not properly use low_bias, keeping lowest-bias taper')
            idx = [np.argmax(eigvals)]
        dpss, eigvals = dpss[idx], eigvals[idx]
    assert len(dpss) > 0  # should never happen
    assert dpss.shape[1] == N  # old nitime bug
    return dpss, eigvals

def getGridIndices(lowerFrequency, upperFrequency, paddedNumDataPoints, samplingFrequency):

  try:

      frequencyResolution = float ( samplingFrequency ) / float ( paddedNumDataPoints )

      gridValues = np.arange ( 0, samplingFrequency , frequencyResolution )

      gridValues = gridValues[ :paddedNumDataPoints ]

      gridIndices = [index for index, x in enumerate (gridValues) if x>= lowerFrequency and x<= upperFrequency ]

      gridValues = [x for index, x in enumerate (gridValues) if x>= lowerFrequency and x<= upperFrequency ]

  except:
    traceback.print_exc(file=sys.stdout)

  return gridValues , gridIndices

def parseLayFile(layFileName):

    try:

        print (layFileName)

        f = open(layFileName, "r")

        impedanceMapFound = False
        chennalMapFound = False
        patientDataFound = False
        epochDataFound = False
        commentsFound = False
        startFlag = False
        endFlag = False

        commentsObjList = []

        channelMap = {}
        patientMap = {}

        commentNum = 0

        for index, line in enumerate(f):

            line = line.replace("\n","").replace("\r","").replace("\t","")

            if line.find("ImpedanceMap") != -1:
                impedanceMapFound = True
                continue

            if line.find("ChannelMap") != -1:
                impedanceMapFound = False
                channelMapFound = True
                continue

            if line.find("Patient") != -1:
                channelMapFound = False
                patientDataFound = True
                continue

            if line.find("Comments") != -1:
                impedanceMapFound = False
                patientDataFound = False
                channelMapFound = False
                commentsFound = True
                continue

            if impedanceMapFound:
                data = line.split("=")
                print (" ####### data = " + str(data) )
                channelMap[data[0]] = data[1]

            if patientDataFound:
                data = line.split("=")
                #patientMap[data[0]] = data[1]

            #if commentsFound:
                #print ( str(line) )
                #data = line.split(",")
                #print ( str(data))
                #if line.find("START") != -1:
                    #startFlag = True
                    #endFlag = False
                    #commentsObj = CommentsObj()
                    #commentsObj.startTime = data[0]
                    #commentString = data[4]
                    #commentsObj.description = commentString[:commentString.find("START")]
                #elif line.find("END") != -1:
                    #commentsObj.endTime = data[0]
                    #print ( " ########## adding ########### ")
                    #commentsObjList.append(commentsObj)

            if commentsFound:

                print ( str(line) )
                data = line.split(",")
                print ( str(data))

                if line.find("loss") == -1:

                    commentsObj = CommentsObj()
                    commentsObj.commentNum = commentNum
                    commentNum += 1
                    commentsObj.startTime = data[0]
                    commentString = data[4]
                    commentsObj.description = commentString
                    commentsObjList.append(commentsObj)

        print ( "** " + str([ x.startTime + ":: " + x.description  for x in commentsObjList ]) )
        print ( channelMap )

    except:
        traceback.print_exc(file=sys.stdout)
    return channelMap, commentsObjList

def computePSD(datafileDirectory, fileName, channelNum, sampingFrequency, upperFrequency, lowerFrequency, timeBandWidth, timeWindow, stepSize, numTapers):
# def analyzeData():
    outf = open("/www/projects/EEG_Portal/webEEGPortal/analysisLogPSD_" + str(channelNum) + ".txt", "w")

    try:

        if os.environ.get('DISPLAY','') == '':
            print('no display found. Using :0.0')
            os.environ.__setitem__('DISPLAY', ':0.0')

        outf.write ( " in analyze data ")

        # layFileName = fileName[:fileName.index(".edf")] + ".lay"
        dataFileName = datafileDirectory + fileName
        # channelMap1, commentsObjList1 = parseLayFile(datafileDirectory + layFileName )

        edfFile = pyedflib.EdfReader(datafileDirectory +  fileName )

        numSignals = edfFile.signals_in_file
        data = np.zeros((numSignals, edfFile.getNSamples()[0]))
        for i in np.arange(numSignals):
            data[i, :] = edfFile.readSignal(i)

        fileDuration = edfFile.file_duration

        # data = data - data.mean(axis=1, keepdims=True)

        numDataPoints = fileDuration * samplingFrequency
        stepSize = stepSize * samplingFrequency
        padding = pad = 0

        winLen = timeWindow * samplingFrequency

        paddedNumDataPoints = int ( pow ( 2, math.ceil ( np.log2 ( winLen ) + pad) ) )

        print(" paddedNumDataPoints " + str(( np.log2 ( winLen ) )))
        print(" numDataPoints " + str(( numDataPoints )))
        print(" timeBandWidth " + str(( timeBandWidth )))

        if numTapers == 0:
            numTapers = 2 * timeBandWidth -1
        outf.write(" numTapers " + str(( numTapers )))
        [tapers, eigenValues] = dpss_windows(int(numDataPoints), float(timeBandWidth), int(numTapers) )

        fpass = [lowerFrequency,upperFrequency]

        outf.write ("fpass = " + str(fpass))
        outf.write ( " padded num = " + str(paddedNumDataPoints))
        outf.write (" samplingFrequency " + str(samplingFrequency))
        gridValues, gridIndices = getGridIndices(fpass[0], fpass[1], paddedNumDataPoints, samplingFrequency)

        outf.write (" grid values " + str(len(gridValues)))
        outf.write (" grid indices " + str(len(gridIndices) ))

        dataMatrix = []

        spectrumChannelSumData = []

        # for channelIndex in range(numChannels):

        spectrogramData = []

        channelData = data[channelNum]

        outf.write ( " channelData " + str(channelData))

        outf.write (" ** num channels = " + str(len(data)) + " len ( channelData ) " + str( len ( channelData ) ) + " numDataPoints " + str(numDataPoints) + " stepSize " + str(stepSize) + " winlen " + str(winLen))

        numWindows = int ( ( len ( channelData ) - winLen + 1) / ( stepSize  ) )
        # numWindows = math.floor ( float( len ( channelData ))/ float(winLen) )

        outf.write (" numWindows " + str(numWindows) + "\n")

        for windowNum in range ( numWindows ) :


              # outf.write (" ** for window  " + str(windowNum) + "\n")

              beginWin = windowNum * winLen
              endWin = beginWin + winLen

              windowData = channelData [ beginWin : endWin]

              spectrumChannelSumData = []
              for taperIndex, taper in enumerate ( tapers ) :

                taperData = [float(a)*float(b) for a,b in zip(windowData,taper)]

                fftData = fftpack.fft(taperData,paddedNumDataPoints)

                fftData = np.array (fftData)/float(samplingFrequency)

                fftData = fftData[gridIndices]

                spectrumChannelData = np.array([abs(x*np.conj(x)) for x in fftData])

                spectrumChannelSumData.append( list(spectrumChannelData))

              spectrumChannelAvgData = [float(sum(col))/len(col) for col in zip(*spectrumChannelSumData)]

              spectrogramData.append(list(spectrumChannelAvgData))

              # if windowNum < 3:
              #     outf.write(str(spectrogramData) + "\n")

        spectrumPSD = [float(sum(col))/len(col) for col in zip(*spectrogramData)]
        spectrumPSD = np.array(spectrumPSD)/100
        outf.write(" shape " + str(spectrumPSD.shape))
        # print(spectrogramData)

        plt.clf()
        plt.figure(1, figsize = (8.5,11))
        # outf.write ( " shape spectrogramData " + str(np.array(np.log(spectrogramData)).shape) + "\n")
        # plt.imshow(np.array(np.log(spectrogramData)).transpose())
        plt.plot(spectrumPSD)
        plt.title( "PSD for channel_" + str(channelNum) + '.png')

        plt.savefig('/home/siddhartha/self/andre/outplots/psd_' + str(channelNum) + '.png')
    # except:

    except Exception as e:
        outf.write(" error: " + str(e))
        outf.write(traceback.format_exc())
                # outf.write(traceback.print_exc(file=sys.stdout))
    return

if __name__ == "__main__":
    print(f"Arguments count: {len(sys.argv)}")

    datafileDirectory = sys.argv[1]
    fileName = sys.argv[2]
    channelNum = int(sys.argv[3])
    samplingFrequency = int(sys.argv[4])
    upperFrequency = int(sys.argv[5])
    lowerFrequency = int(sys.argv[6])
    timeBandWidth = int(sys.argv[7])
    timeWindow = int(sys.argv[8])
    stepSize = int(sys.argv[9])
    numTapers = int(sys.argv[10])
    startTime = int(sys.argv[10])
    endTime = int(sys.argv[10])

    computePSD(datafileDirectory, fileName, channelNum, samplingFrequency, upperFrequency, lowerFrequency, timeBandWidth, timeWindow, stepSize, numTapers)
