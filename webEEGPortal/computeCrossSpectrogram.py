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
# from scipy import *
import pandas as pd
from scipy import fftpack, linalg
import getopt, sys


def getMI(amp, phase, edges):

    '''
    compute modulation index as shown in Tort 2010
    Original Matlab code by Dino Dvorak 2012 dino@indus3.net
    Python version by Siddhartha Mitra 2017 mitra.siddhartha@gmail.com
    Input:
         - amp: Amplitude
         - phase: Phase
         - edges: Edges
    Output:
         - MI
    '''

    MI = ''
    try:

        # get histogram for phases
        h = []

        for hi in range ( len(edges) - 1 ):

            k = [ 1 if x >= edges[hi] and x < edges[hi+1] else 0 for x in phase]
            #print ( " k = " + str(k) )

            if sum(k) > 0: # only if there are some values, otherwise keep zero
                #print (sum([x for i,x in enumerate(amp) if k[i] == 1 ]))

                h.append( np.mean([x for i,x in enumerate(amp) if k[i] == 1 ])) # mean of amplitudes at that phase bin
            else:
                h.append(0)

        #print ( " h0 = " + str(h) )

        ## fix last value
        #k = [x == y for x,y in zip ( phase, edges [end])]
        #if not all([x == 0 for x in k]):
            #h[end] = h[end] + np.mean(amp[k])

        ## convert to probability
        h = h / sum(h)

        #print ( " h = " + str(h) )

        ## replace zeros by eps
        #k = h == 0
        #h[k] = eps

        ## calculate modulation index
        Hp = -1 * sum( [x*np.log(x) if x > 0 else 0 for x in h]) # entropy of the histogram
        #print ( " Hp = " + str(Hp) )

        D = np.log(len(h)) - Hp
        #print ( " D = " + str(D) )

        MI = D / np.log(len(h))
        #print ( " MI = " + str(MI) )

    except:
        traceback.print_exc(file=sys.stdout)

    return MI

def calcPLV(datafileDirectory, fileName, channel1, channel2, endTime, startTime,  lcut, hcut, sample_rate, ripple_db, bw, attenHz, originalFileName):
#  '''

#     Set the sampling frequency to 100. Sample period is 0.01.
#     A frequency of 1 will have 100 samples per cycle, and
#     therefore have 4 cycles in the 400 samples.

#     The desired attenuation in the stop band, in dB.
#     ripple_db = 40.0

#     # bw = 20 #bandwidth
#     attendB = ripple_db #attenuation
#     # attenHz = 4 #transition band

#  '''

  outf = open("/www/projects/EEG_Portal/webEEGPortal/analysisLogcros11s_" + str(channelNum) + ".txt", "a")
  outf.write(" **** in PLV *** ")

  outf.write(" **** channel1 *** " + str(channel1) + "\n")
  outf.write(" **** channel2 *** " + str(channel2) + "\n")

  outf.write(" **** startTime *** " + str(startTime) + "\n")
  outf.write(" **** endTime *** " + str(endTime) + "\n")
  outf.write(" **** lcut *** " + str(lcut) + "\n")
  outf.write(" **** hcut *** " + str(hcut) + "\n")
  outf.write(" **** rippleDB *** " + str(ripple_db) + "\n")
  outf.write(" **** bw *** " + str(bw) + "\n")
  outf.write(" **** attenHz *** " + str(attenHz) + "\n")

  try:

    # edfFile = pyedflib.EdfReader(datafileDirectory +  fileName)
    #
    # try:
    #     numSignals = edfFile.signals_in_file
    #     data = np.zeros((numSignals, edfFile.getNSamples()[0]))
    #     for i in np.arange(numSignals):
    #         data[i, :] = edfFile.readSignal(i)
    #
    # except:
    #     edfFile._close()
    #     del edfFile
    #
    #     edfFile = pyedflib.EdfReader(datafileDirectory +  fileName)
    #     numSignals = edfFile.signals_in_file
    #     data = np.zeros((numSignals, edfFile.getNSamples()[0]))
    #     for i in np.arange(numSignals):
    #         data[i, :] = edfFile.readSignal(i)

    if originalFileName.find('edf') != -1:

        edfFile = pyedflib.EdfReader(datafileDirectory +  fileName)

        try:
            numChannels = edfFile.signals_in_file
            channels = edfFile.getSignalLabels()
            samplingFrequency = edfFile.getSampleFrequencies()[0]
            fileDuration = edfFile.file_duration
            beginTime = 0
            endTime = int(fileDuration)
            print ( " 1 numSignals = " + str(fileDuration))

            data = np.zeros((numSignals, edfFile.getNSamples()[0]))
            for i in np.arange(numSignals):
                data[i, :] = edfFile.readSignal(i)

        except:
            edfFile._close()
            del edfFile

            edfFile = pyedflib.EdfReader(datafileDirectory +  fileName)
            numChannels = edfFile.signals_in_file
            channels = edfFile.getSignalLabels()

            samplingFrequency = edfFile.getSampleFrequencies()[0]
            fileDuration = edfFile.file_duration
            print ( " 2 numSignals = " + str(fileDuration))
            beginTime = 0
            endTime = int(fileDuration)

            data = np.zeros((numSignals, edfFile.getNSamples()[0]))
            for i in np.arange(numSignals):
                data[i, :] = edfFile.readSignal(i)

        edfFile._close()
        del edfFile

    elif originalFileName.find('mat') != -1:
        eegmat = loadmat(datafileDirectory +  fileName)

        channels = [str(x[0]) for x in eegmat["channelLabels"][0] ]

        samplingFrequency = int(eegmat["eegFS"])

        numChannels = len(channels)

        fileDuration = round(len(eegmat["eegData"][0])/samplingFrequency)
        beginTime = 0
        endTime = int(fileDuration)
        data = eegmat["eegData"]

    eeg1 = data[channel1]
    eeg2 = data[channel2]

    outf.write("start time "  )

    outf.write("start time " + str(startTime) + " end " + str(endTime)  )

    outf.write("end time "  )

    eeg1 = eeg1[startTime * samplingFrequency - 1 : endTime * samplingFrequency - 1 ]
    eeg2 = eeg2[startTime * samplingFrequency - 1 : endTime * samplingFrequency - 1 ]

    eeg1 = eeg1 - np.mean(eeg1, axis = 0)
    eeg2 = eeg2 - np.mean(eeg2, axis = 0)

    outf.write (" len (eeg1) = " + str(len(eeg1)))
    outf.write (" len (eeg2) = " + str(len(eeg2)))

    # edges for phase
    edges = np.linspace(-math.pi,math.pi,21)

    # lcut = 9.0
    # hcut = 13.0

    nyq = sample_rate / 2.0
    width = 2.0/nyq # pass to stop transition width

    # Compute the order and Kaiser parameter for the FIR filter.
    N, beta = kaiserord(ripple_db, width)

    #print ('N = ',N, 'beta = kaiser param = ', beta)

    # The cutoff frequency of the filter.
    cutoff_hz = lcut

    winLen = N
    # to be in conformance with MATLAB ( check documentation of fir1 in MATLAB, it automatically adds 1 for even sized windows)
    if N % 2 ==0:
            winLen = N + 1

    # Use firwin with a Kaiser window to create a lowpass FIR filter.
    hpftaps = firwin(winLen, cutoff_hz/nyq, window=('kaiser', beta), pass_zero=False)

    #print (hpftaps[:10])

    #----------------------------------------------------------
    # now create the taps for a high pass filter.
    # by multiplying tap coefficients by -1 and
    # add 1 to the centre tap ( must be even order filter)

    hpftaps = [-1*a for a in hpftaps]
    print ( len(hpftaps))
    midPoint = int(np.round(len(hpftaps)/2))
    if midPoint % 2 != 0:
        midPoint = midPoint -1
    hpftaps[midPoint] = hpftaps[midPoint] + 1

    #----------------------------------------------------------
    # Now calculate the tap weights for a lowpass filter at say 15hz

    cutoff_hz = hcut

    lpftaps = firwin(winLen, cutoff_hz/nyq, window=('kaiser', beta), pass_zero=False)

    # Subtract 1 from lpf centre tap for gain adjust for hpf + lpf
    lpftaps[midPoint] = lpftaps[midPoint] - 1

    taps = [sum(pair) for pair in zip(hpftaps, lpftaps)]

    denom = [0]*len(taps)
    denom[0] = 1
    #denom[-1] = 1

    [a,f] = group_delay( [ taps , denom ] , int(nyq))

    #print ( " num taps = " + str(len(taps)))
    #print ( " taps [:10] = " + str(taps[:10]))

    #print ( " a = " + str(a) )
    #print ( " f = " + str(len(f)) )

    bAlpha = taps

    bAlphax = np.array(a) * sample_rate/(2*math.pi)
    #print ( " bAlpha **** = " + str(bAlpha) )

    k = [f[i] for i,m in enumerate(bAlphax) if m >= 9 and m <= 13]
    #print ( " k = " + str(k) )

    gdAlpha = math.floor(np.mean(k))
    #print ( "gdAlpha = " + str(gdAlpha ) )

    fGamma = np.arange(20,101,5)

    #print ( " fGamma = " + str(fGamma) )

    # bw = 20 #bandwidth
    attendB = ripple_db #attenuation
    # attenHz = 4 #transition band

    filtersGamma = {}

    for fI in range ( len(fGamma) ):

        lcut = fGamma[fI]-bw/2
        hcut = fGamma[fI]+bw/2

        Fstop1 = (lcut - attenHz)  / nyq
        Fpass1 = lcut  / nyq
        Fpass2 = hcut / nyq

        Fstop2 = (hcut + attenHz) / nyq
        Astop1 = attendB
        Apass  = 1
        Astop2 = attendB

        #################
        hpftaps = firwin(N, lcut/nyq, window=('kaiser', beta))
        hpftaps = [-1*a for a in hpftaps]

        midPoint = int(np.round(len(hpftaps)/2))
        if midPoint % 2 != 0:
            midPoint = midPoint -1

        hpftaps[midPoint] = hpftaps[midPoint] + 1

        lpftaps = firwin(N, hcut/nyq, window=('kaiser', beta))
        lpftaps[midPoint] = lpftaps[midPoint] - 1

        taps = [sum(pair) for pair in zip(hpftaps, lpftaps)]

        denom = [0]*len(taps)
        denom[0] = 1

        [a,f] = group_delay( [ taps , denom ] , int(nyq))

        x = np.array(a) * sample_rate/(2*math.pi)

        k = [f[i] for i,m in enumerate(x) if m >= 9 and m <= 13]
        val = math.floor(np.mean(k))
        #################

        filtersGamma[fI] = []

        filtersGamma[fI].append (taps)
        filtersGamma[fI].append (val)

    PLVs = []

    ##amplitude for gamma range + MI
    for key, value in filtersGamma.items():

        #amplitude
        amp1 = lfilter(value[0],1,eeg1)
        amp2 = lfilter(value[0],1,eeg2)
        gd = value[1]

        amp1 = np.append(amp1[gd+1:], np.zeros(gd))
        amp2 = np.append(amp2[gd+1:], np.zeros(gd))

        ph1 = np.angle(hilbert(amp1))
        ph2 = np.angle(hilbert(amp2))

        phd = ph1 - ph2
        #compute raw modulation index
        #print (" amp = " + str(amp[:20]) )
        #print (" ph = " + str(ph[:20]) )
        #print (" edges = " + str(edges) )

        PLVs.append((1/len(phd))*(abs(sum(np.exp(1j*phd)))))

        #break

    print ( " MIs = " + str(PLVs))

    np.savetxt("/home/siddhartha/self/andre/outplots/outplv_fGamma_" + str(channel1) + "_" + str(channel2) + ".txt",fGamma)
    np.savetxt("/home/siddhartha/self/andre/outplots/outplv_PLV_" + str(channel1) + "_" + str(channel2) + ".txt",PLVs)

    # temp save for debug
    # np.savetxt("/home/siddhartha/self/andre/outplots/outplv_fGamma_" + str(channel1) + "_" + str(channel2) + "_" + str(startTime) + "_" + str(endTime) + ".txt",fGamma)
    # np.savetxt("/home/siddhartha/self/andre/outplots/outplv_PLV_" + str(channel1) + "_" + str(channel2) + "_" + str(startTime) + "_" + str(endTime) + ".txt",MIs)

  except Exception as e:
      outf.write(e)
      traceback.print_exc(file=sys.stdout)
  return

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

def analyzeData(datafileDirectory, fileName, channelNum, sampingFrequency, upperFrequency, lowerFrequency, timeBandWidth, timeWindow, stepSize, numTapers, upperTimeLimit, lowerTimeLimit, computePSDFlag, computeCrossCorrelationFlag,computePACFlag,computePLVFlag,channel1,channel2, lcut, hcut, rippleDB, bandWidth, attenHz, originalFileName):

    outf = open("/www/projects/EEG_Portal/webEEGPortal/analysisLogcross_" + str(channelNum) + ".txt", "a")

    try:

        if os.environ.get('DISPLAY','') == '':
            print('no display found. Using :0.0')
            os.environ.__setitem__('DISPLAY', ':0.0')

        outf.write ( " in analyze data ")

        # layFileName = fileName[:fileName.index(".edf")] + ".lay"
        dataFileName = datafileDirectory + fileName
        # channelMap1, commentsObjList1 = parseLayFile(datafileDirectory + layFileName )

        # edfFile = pyedflib.EdfReader(datafileDirectory +  fileName )
        #
        # numSignals = edfFile.signals_in_file
        # data = np.zeros((numSignals, edfFile.getNSamples()[0]))
        # for i in np.arange(numSignals):
        #     data[i, :] = edfFile.readSignal(i)
        #
        # fileDuration = edfFile.file_duration

        if originalFileName.find('edf') != -1:

            edfFile = pyedflib.EdfReader(datafileDirectory +  fileName)

            try:
                numChannels = edfFile.signals_in_file
                channels = edfFile.getSignalLabels()
                samplingFrequency = edfFile.getSampleFrequencies()[0]
                fileDuration = edfFile.file_duration
                beginTime = 0
                endTime = int(fileDuration)
                print ( " 1 numSignals = " + str(fileDuration))

                data = np.zeros((numSignals, edfFile.getNSamples()[0]))
                for i in np.arange(numSignals):
                    data[i, :] = edfFile.readSignal(i)

            except:
                edfFile._close()
                del edfFile

                edfFile = pyedflib.EdfReader(datafileDirectory +  fileName)
                numChannels = edfFile.signals_in_file
                channels = edfFile.getSignalLabels()

                samplingFrequency = edfFile.getSampleFrequencies()[0]
                fileDuration = edfFile.file_duration
                print ( " 2 numSignals = " + str(fileDuration))
                beginTime = 0
                endTime = int(fileDuration)

                data = np.zeros((numSignals, edfFile.getNSamples()[0]))
                for i in np.arange(numSignals):
                    data[i, :] = edfFile.readSignal(i)

            edfFile._close()
            del edfFile

        elif originalFileName.find('mat') != -1:
            eegmat = loadmat(datafileDirectory +  fileName)

            channels = [str(x[0]) for x in eegmat["channelLabels"][0] ]

            samplingFrequency = int(eegmat["eegFS"])

            numChannels = len(channels)

            fileDuration = round(len(eegmat["eegData"][0])/samplingFrequency)
            beginTime = 0
            endTime = int(fileDuration)
            data = eegmat["eegData"]

        # data = data - data.mean(axis=1, keepdims=True)

        numDataPoints = timeWindow * samplingFrequency
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
        outf.write (" computePSDFlag " + str(computePSDFlag ))

        dataMatrix = []

        spectrumChannelSumData = []

        # for channelIndex in range(numChannels):

        spectrogramData = []

        outf.write ( " channel1 " + str(channel1))
        outf.write ( " channel2 " + str(channel2))

        channel1Data = data[channel1]
        channel2Data = data[channel2]

        startPoint = lowerTimeLimit*samplingFrequency
        endPoint = upperTimeLimit*samplingFrequency

        channel1Data = channel1Data[startPoint:endPoint]
        channel2Data = channel2Data[startPoint:endPoint]

        outf.write ( " channel1Data " + str(channel1Data))
        outf.write ( " channel2Data " + str(channel2Data))

        outf.write (" ** num channels = " + str(len(data)) + " len ( channelData ) " + str( len ( channel1Data ) ) + " numDataPoints " + str(numDataPoints) + " stepSize " + str(stepSize) + " winlen " + str(winLen))

        numWindows = int ( ( len ( channel1Data ) - winLen + 1) / ( stepSize  ) )
        # numWindows = math.floor ( float( len ( channelData ))/ float(winLen) )

        outf.write (" numWindows " + str(numWindows) + "\n")

        for windowNum in range ( numWindows ) :

              # outf.write (" ** for window  " + str(windowNum) + "\n")

              beginWin = windowNum * stepSize
              endWin = beginWin + stepSize

              window1Data = channel1Data [ beginWin : endWin]
              meanVal1 = np.mean(window1Data)
              window1Data = [x-meanVal1 for x in window1Data]

              window2Data = channel2Data [ beginWin : endWin]
              meanVal2 = np.mean(window2Data)
              window2Data = [x-meanVal2 for x in window2Data]

              spectrumChannelSumData = []
              for taperIndex, taper in enumerate ( tapers ) :

                taper1Data = [float(a)*float(b) for a,b in zip(window1Data,taper)]
                taper2Data = [float(a)*float(b) for a,b in zip(window2Data,taper)]

                fftData1 = fftpack.fft(taper1Data,paddedNumDataPoints)
                fftData1 = np.array (fftData1)/float(samplingFrequency)
                fftData1 = fftData1[gridIndices]
                fftData1 = fftData1[lowerFrequency:upperFrequency]

                fftData2 = fftpack.fft(taper2Data,paddedNumDataPoints)
                fftData2 = np.array (fftData2)/float(samplingFrequency)
                fftData2 = fftData2[gridIndices]
                fftData2 = fftData2[lowerFrequency:upperFrequency]

                outf.write (" fftData2 " + str(fftData2) + "\n")
                outf.write (" fftData1 " + str(fftData1) + "\n")

                np.savetxt('/home/siddhartha/self/andre/outplots/crossspectrogram_' + str(channel1) + '_' + str(channel2) + '_fft1_'+str(lowerTimeLimit)+'.txt', fftData1)
                np.savetxt('/home/siddhartha/self/andre/outplots/crossspectrogram_' + str(channel1) + '_' + str(channel2) + '_fft2_'+str(lowerTimeLimit)+'.txt', fftData2)

                spectrumChannelData = np.array([x*np.conj(y) for x,y in zip(fftData1, fftData2)]) # S12=squeeze(mean(conj(J1).*J2,2));

                outf.write (" spectrumChannelData " + str(spectrumChannelData) + "\n")

                fftData1Sq = np.array([x*np.conj(y) for x,y in zip(fftData1, fftData1)])
                fftData2Sq = np.array([x*np.conj(y) for x,y in zip(fftData2, fftData2)])

                denom = np.sqrt ( [x*y for x,y in zip(fftData1Sq,fftData2Sq) ] )
                outf.write (" denom " + str(denom) + "\n")

                # J1=mtfftc(data1,tapers,nfft,Fs);
                # J2=mtfftc(data2,tapers,nfft,Fs);
                # J1=J1(findx,:,:); J2=J2(findx,:,:);
                # S12=squeeze(mean(conj(J1).*J2,2));
                # S1=squeeze(mean(conj(J1).*J1,2));
                # S2=squeeze(mean(conj(J2).*J2,2));
                # if trialave; S12=squeeze(mean(S12,2)); S1=squeeze(mean(S1,2)); S2=squeeze(mean(S2,2)); end;
                # C12=S12./sqrt(S1.*S2);
                # C=abs(C12);
                # phi=angle(C12);
                # if nargout>=9;
                #      [confC,phistd,Cerr]=coherr(C,J1,J2,err,trialave);
                # elseif nargout==8;
                #      [confC,phistd]=coherr(C,J1,J2,err,trialave);
                # end;

                outf.write (" before spectrumChannelData " + str(spectrumChannelData) + "\n")

                spectrumChannelData = [x/y if y != 0 else 0 for x,y in zip(spectrumChannelData, denom)] # S12./sqrt(S1.*S2);

                outf.write (" before abs ******* spectrumChannelData " + str(spectrumChannelData) + "\n")

                angle = np.angle(spectrumChannelData)
                outf.write (" angle 0000 spectrumChannelData " + str(angle) + "\n")

                spectrumChannelData = np.array([x*np.conj(y) for x,y in zip(spectrumChannelData, spectrumChannelData)])
                outf.write (" after spectrumChannelData " + str(spectrumChannelData) + "\n")

                # spectrumChannelSumData.append( list(spectrumChannelData))
                spectrumChannelSumData.append( list(angle))
                np.savetxt('/home/siddhartha/self/andre/outplots/angle_' + str(channel1) + '_' + str(channel2) + '_fft2_'+str(lowerTimeLimit)+'.txt', fftData2)

              spectrumChannelAvgData = [float(sum(col))/len(col) for col in zip(*spectrumChannelSumData)]

              spectrogramData.append(list(spectrumChannelAvgData))
              outf.write (" spectrumChannelAvgData " + str(spectrumChannelAvgData) + "\n")

              # if windowNum < 3:
              #     outf.write(str(spectrogramData) + "\n")

        outf.write ( " shape crossspectrogramData " + str(np.array(np.log(spectrogramData)).shape) + "\n")

        np.savetxt('/home/siddhartha/self/andre/outplots/crossspectrogram_' + str(channel1) + '_' + str(channel2) + '.txt', spectrogramData )

        plt.imshow(np.array(np.log(spectrogramData).transpose()), interpolation='nearest', aspect='auto')

        plt.gca().invert_yaxis()
        plt.axis([0, numWindows, lowerFrequency, upperFrequency])

        # plt.show()
        outf.write(" before save img \n")
        plt.title( "CrossSpectrogram for channel_" + str(channel1) + '_' + str(channel2) + '.png')

        plt.savefig('/home/siddhartha/self/andre/outplots/crossspectrogram_' + str(channel1) + '_' + str(channel2) +'.png')

        # if computePACFlag:
        #     calcPAC(filePath, channelNum, startTime, stopTime, lcut, hcut, sample_rate, ripple_db, bw, attenHz)

    # except:

    except Exception as e:
        outf.write(" error: " + str(e))
        outf.write(traceback.format_exc())
                # outf.write(traceback.print_exc(file=sys.stdout))
    return

if __name__ == "__main__":
    print(f"Arguments count: {len(sys.argv)}")

    outf = open("/www/projects/EEG_Portal/webEEGPortal/analysisCrossSpectrogram.txt", "a")
    outf.write("begin\n")
    print (" in program " )
    try:
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
        upperTimeLimit = int(sys.argv[11])
        lowerTimeLimit = int(sys.argv[12])
        computePSDFlag = int(sys.argv[13])

        computeCrossCorrelationFlag = int(sys.argv[14])
        computePACFlag = int(sys.argv[15])
        computePLVFlag = int(sys.argv[16])
        channel1 = int(sys.argv[17])
        channel2 = int(sys.argv[18])

        lcut = int(sys.argv[19])
        hcut = int(sys.argv[20])
        rippleDB = int(sys.argv[21])
        bandWidth = int(sys.argv[22])
        attenHz = int(sys.argv[23])
        originalFileName = sys.argv[24]

        print ( " before cross epctra - upperTimeLimit = " + str(upperTimeLimit) + " lowerTimeLimit = " + str(lowerTimeLimit) + "\n")

        analyzeData(datafileDirectory, fileName, channelNum, samplingFrequency, upperFrequency, lowerFrequency, timeBandWidth, timeWindow, stepSize, numTapers, upperTimeLimit, lowerTimeLimit, computePSDFlag, computeCrossCorrelationFlag,computePACFlag,computePLVFlag,channel1,channel2, lcut, hcut, rippleDB, bandWidth, attenHz, originalFileName)

        outf.write(" computePLVFlag " + str(computePLVFlag))

        if computePLVFlag == 1:
            outf.write(" calcPLV: " + str(upperTimeLimit) + " -- " + str(lowerTimeLimit))

            calcPLV(datafileDirectory, fileName,  channel1, channel2, upperTimeLimit, lowerTimeLimit, lcut, hcut, samplingFrequency, rippleDB, bandWidth, attenHz, originalFileName)

    except Exception as e:
        outf.write(str(e))
