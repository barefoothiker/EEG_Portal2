import numpy as np
import os
import sys
import traceback
from scipy.io import loadmat
import math
import scipy.signal as signal
from scipy.signal import *
import matplotlib.pyplot as plt
from numpy import cos, sin, pi, absolute, arange
from numpy.random import normal
from scipy.signal import kaiserord, lfilter, firwin, freqz
from math import sqrt, log10
from google.colab import drive
drive.mount('/content/drive')
import numpy as np
import os
import sys
import traceback
from scipy.io import loadmat
import math
import scipy.signal as signal
from scipy.signal import *
#from scipy.signal import mfreqz, impz, kaiser, group_delay, hilbert
import matplotlib.pyplot as plt

from numpy import cos, sin, pi, absolute, arange
from numpy.random import normal
from scipy.signal import kaiserord, lfilter, firwin, freqz
#from pylab import figure, clf, plot, xlabel, ylabel, xlim, ylim, title, grid, axes, show
from math import sqrt, log10

import pyedflib
from scipy import *
import numpy as np
import math
import pandas as pd
import matplotlib.pyplot as plt
import sys
import os
import traceback
import scipy
from scipy.io import savemat, loadmat
from scipy import fftpack, linalg
SELECTED_CHANNELS = ['F7','T5', 'F3','P3', 'F4','P4', 'F8','T6', 'Fp1','O1', 'Fp2','O2']
import numpy as np
import os, sys, traceback
# from google.colab import drive

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

#calcPLV('/content/drive/My Drive/andre/EEG181.mat',14, 50, 80, 9.0, 13.0, 250, 40.0, 20, 4)
def calcPLV(filePath, channelNum, startTime, stopTime, lcut, hcut, sample_rate, ripple_db, bw, attenHz):

  try:
    eegData = loadmat('/content/drive/My Drive/andre/EEG181.mat')

    eegFS = 250 # sampling frequency

    eegData = eegData["eegData"]

    eeg = eegData[14]

    #print ( eeg[:5])

    eeg = eeg[50 * eegFS - 1 : 80 * eegFS - 1 ]

    eeg = eeg - np.mean(eeg, axis = 0)

    x = np.linspace(0,200,5000);

    s1 = np.sin( x * pi / 180 )

    s2 = np.sin( x * pi / 18 )

    s2 = np.array ( [x*y for x,y in zip(s1,s2) ] )

    s3 = s1 + s2

    eeg = s3

    # edges for phase
    edges = np.linspace(-math.pi,math.pi,21)

    #edges = np.array(list(edges).append(math.pi))

    lcut = 9.0
    hcut = 13.0

    #----------------------------------------------------------
    # Set the sampling frequency to 100. Sample period is 0.01.
    # A frequency of 1 will have 100 samples per cycle, and
    # therefore have 4 cycles in the 400 samples.

    sample_rate = 250.0
    nyq = sample_rate / 2.0
    width = 2.0/nyq # pass to stop transition width

    # The desired attenuation in the stop band, in dB.
    ripple_db = 40.0

    # Compute the order and Kaiser parameter for the FIR filter.
    N, beta = kaiserord(ripple_db, width)

    #print ('N = ',N, 'beta = kaiser param = ', beta)

    # The cutoff frequency of the filter.
    cutoff_hz = lcut

    # Use firwin with a Kaiser window to create a lowpass FIR filter.
    hpftaps = firwin(N, cutoff_hz/nyq, window=('kaiser', beta), pass_zero=False)

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
    lpftaps = firwin(N, cutoff_hz/nyq, window=('kaiser', beta), pass_zero=False)

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

    bw = 20 #bandwidth
    attendB = ripple_db #attenuation
    attenHz = 4 #transition band

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

    MIs = []
    # phase (alpha)

    #print ( " bAlpha = " + str(bAlpha[:20] ) )
    #print ( " eeg = " + str(eeg[:20] ) )

    ph = lfilter(bAlpha,1,eeg)

    #print ( " ph before angle = " + str(ph[:10] ) )

    ph = np.append(ph[gdAlpha+1:], np.zeros(gdAlpha))
    ph = np.angle(hilbert(ph))

    #print ( " ph after angle = " + str(ph[:10] ) )

    ##amplitude for gamma range + MI
    for key, value in filtersGamma.items():

        #amplitude
        amp = lfilter(value[0],1,eeg)
        gd = value[1]

        amp = np.append(amp[gd+1:], np.zeros(gd))
        amp = abs(hilbert(amp))

        #compute raw modulation index
        #print (" amp = " + str(amp[:20]) )
        #print (" ph = " + str(ph[:20]) )
        #print (" edges = " + str(edges) )

        MI = getMI(amp,ph,edges)
        MIs.append(MI)
        #print (" MI = " + str(MI))
        #break

    #print ( " MIs = " + str(MIs))
    plt.plot(fGamma,MIs)
    plt.show()

  except:
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

def analyzeData(datafileDirectory , fileName):
    try:
        print ( " in analyze data ")

        layFileName = fileName[:fileName.index(".edf")] + ".lay"
        dataFileName = datafileDirectory + fileName
        channelMap1, commentsObjList1 = parseLayFile(datafileDirectory + layFileName )

        data = loadmat(datafileDirectory + "indata/edfData_257802.mat")["eegData"]

#         filePath = "/Users/smitra/self/andre/MIT-concussion/257802-post_season_20161206_142914.edf"
        #f = pyedflib.EdfReader(dataFileName)
        #signal_labels = f.getSignalLabels()
        #numChannels = f.signals_in_file

        data = data - data.mean(axis=1, keepdims=True)
        numChannels = 16

        beginWin = 0
        endWin = 0

        samplingFrequency = eegFS = 250
        upperFrequency = 100
        lowerFrequency = 0
        timeBandWidth = 4
        timeWindow = 3 # time window in seconds
        STEP_SIZE = 2 # in seconds

        numDataPoints =  timeWindow * samplingFrequency
        stepSize = STEP_SIZE * samplingFrequency
        padding = pad = 0

        winLen = timeWindow * eegFS

        paddedNumDataPoints = int ( pow ( 2, math.ceil ( np.log2 ( winLen ) + pad) ) )
        print(" paddedNumDataPoints " + str(( np.log2 ( winLen ) )))
        print(" numDataPoints " + str(( numDataPoints )))
        print(" timeBandWidth " + str(( timeBandWidth )))

        numTapers = 2 * timeBandWidth -1
        print(" numTapers " + str(( numTapers )))
        [tapers, eigenValues] = dpss_windows(int(numDataPoints), float(timeBandWidth), int(numTapers) )

        #numTapers = len(tapers)
        numTapers = 6

        fpass = [lowerFrequency,upperFrequency]

        print ("fpass = " + str(fpass))
        print ( " padded num = " + str(paddedNumDataPoints))
        print (" eeg fs " + str(eegFS))
        gridValues, gridIndices = getGridIndices(fpass[0], fpass[1], paddedNumDataPoints, eegFS)

        print (" grid values " + str(len(gridValues)))
        print (" grid indices " + str(len(gridIndices)))

        dataMatrix = []

        #spectrumChannelSumData = [0] * ( upperFrequency - lowerFrequency + 1 )
        spectrumChannelSumData = []

        for channelIndex in range(numChannels):

          spectrogramData = []

          channelData = data[channelIndex]

          #channelData = f.readSignal(channelIndex)
          #channelData = channelData - channelData.mean(axis=1, keepdims=True)

          #channelLabel = signal_labels[channelIndex]

          # only process selected channels
          if channelIndex != 13:
            continue
          #print ("for channel " + channelLabel)

          print (str(len(  channelData )))
          numWindows = int ( ( len ( channelData ) - numDataPoints + 1) / ( stepSize  ) )
          numWindows = math.floor ( float( len ( channelData ))/ float(numDataPoints) )

          #print ( " numWindows = " + str(numWindows) )

          #theta (4-7 Hz), alpha (9-13 Hz), beta (15-25 Hz) and gamma (30-50 Hz)
          thetaPowerSpectra = []
          alphaPowerSpectra = []
          betaPowerSpectra = []
          gammaPowerSpectra = []

          for windowNum in range ( numWindows ) :

              beginWin = windowNum * numDataPoints
              endWin = beginWin + numDataPoints

              print (" window num = " + str(windowNum) )

              #print ( " beginWin = " + str(beginWin) + " endWin = " + str(endWin))

              windowData = channelData [ beginWin : endWin]

              #print ( " windowData = " + str(windowData) )

              if len(windowData) == 0:

                break

              #if windowNum == 5:
              #      break


              spectrumChannelSumData = []
              for taperIndex, taper in enumerate ( tapers ) :

                taperData = [float(a)*float(b) for a,b in zip(windowData,taper)]

                fftData = scipy.fftpack.fft(taperData,paddedNumDataPoints)

                #print ( " fftData before = " + str(len(fftData)) )
                #print ( " paddedNumDataPoints before = " + str(paddedNumDataPoints) )

                fftData = np.array (fftData)/float(eegFS)

                fftData = fftData[gridIndices]
                #print (fftData)
                #break
                #fftData = [fftData[x] for x in gridIndices]
                #print (np.shape(windowData))
                #print (windowData)

                #spectrumChannelData = np.array([log(abs(x*conj(x))) for x in fftData])
                spectrumChannelData = np.array([abs(x*conj(x)) for x in fftData])

                plt.figure(1, figsize = (8.5,11))
                plt.title('Spectrogram')
                #plt.plot(spectrumChannelData)

                #print (spectrumChannelData)

                #break

                spectrumChannelSumData.append( list(spectrumChannelData))

              #break
              #print (spectrumChannelSumData)
              #print ( " shape = " + str(np.shape(spectrumChannelSumData)))
              spectrumChannelAvgData = [float(sum(col))/len(col) for col in zip(*spectrumChannelSumData)]
              #spectrumChannelAvgData = [log(x) for x in spectrumChannelAvgData]
              #spectrumChannelAvgData = np.mean( spectrumChannelSumData, axis = 0 )

              spectrogramData.append(list(spectrumChannelAvgData))

              #if windowNum == 0:
              #    plt.plot(spectrumChannelAvgData)
              #    plt.show()

          #break

          spectrumPSD = [float(sum(col))/len(col) for col in zip(*spectrogramData)]
          spectrumPSD = np.array(spectrumPSD)/100

          plt.clf()
          #plt.show()
          plt.figure(1, figsize = (8.5,11))
          #plt.figure()

          #print([len(x) for x in spectrogramData])
          #np.savetxt("outdata/py_spectrogram_data" + str(channelIndex+1) + ".txt", np.array(spectrogramData).transpose() )
          #print ( " shape = " + str(np.shape(np.array(spectrogramData))))
          #plt.figure(1)
          #plt.subplot(211)
          #plt.plot(spectrumPSD)

          #plt.subplot(212)
          plt.figure(1, figsize = (8.5,11))
          plt.imshow(np.array(log(spectrogramData)).transpose())
          #plt.imshow(np.array(spectrogramData).transpose())

          plt.gca().invert_yaxis()
          plt.axis([0, 416, 0, 100])
          plt.show()
          break
    except:
            traceback.print_exc(file=sys.stdout)
    return

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


def calcPAC(filePath, channelNum, startTime, stopTime, lcut, hcut, sample_rate, ripple_db, bw, attenHz):
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
  try:

    #eegData = loadmat('/content/drive/My Drive/andre/EEG181.mat')

    eegData = loadmat(filePath)
    eegFS = 250 # sampling frequency

    eegData = eegData["eegData"]

    eeg1 = eegData[channelNum]

    print ( eeg1[:5])

    eeg1 = eeg1[startTime * eegFS - 1 : stopTime * eegFS - 1 ]

    eeg1 = eeg1 - np.mean(eeg1, axis = 0)

    eeg2 = eegData[15]

    print ( eeg2[:5])

    eeg2 = eeg2[startTime * eegFS - 1 : stopTime * eegFS - 1 ]

    eeg2 = eeg2 - np.mean(eeg2, axis = 0)

    # edges for phase
    edges = np.linspace(-math.pi,math.pi,21)

    x = np.linspace(0,200,5000);

    s1 = np.sin( x * pi / 180 )

    s2 = np.sin( x * pi / 18 )

    s2 = np.array ( [x*y for x,y in zip(s1,s2) ] )

    s3 = s1 + s2

    eeg = s3

    #edges = np.array(list(edges).append(math.pi))

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

    # phase (alpha)

    #print ( " bAlpha = " + str(bAlpha[:20] ) )
    #print ( " eeg = " + str(eeg[:20] ) )

    #ph = lfilter(bAlpha,1,eeg)

    ##print ( " ph before angle = " + str(ph[:10] ) )

    #ph = np.append(ph[gdAlpha+1:], np.zeros(gdAlpha))
    #ph = np.angle(hilbert(ph))

    #print ( " ph after angle = " + str(ph[:10] ) )

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
    plt.plot(fGamma,PLVs)
    plt.show()
    #plt.savefig("PAC_channel_")

  except:
      traceback.print_exc(file=sys.stdout)
  return

#  calcPAC('/content/drive/My Drive/andre/EEG181.mat',14, 50, 80, 9.0, 13.0, 250, 40.0, 20, 4)

def analyzeData(datafileDirectory , fileName, numChannels, beginWin, endWin, sampingFrequency, upperFrequency, lowerFrequency, timeBandWidth, timeWindow, STEP_SIZE, numTapers):
    try:
        print ( " in analyze data ")

        layFileName = fileName[:fileName.index(".edf")] + ".lay"
        dataFileName = datafileDirectory + fileName
        channelMap1, commentsObjList1 = parseLayFile(datafileDirectory + layFileName )

        data = loadmat(datafileDirectory + "indata/edfData_257802.mat")["eegData"]

#         filePath = "/Users/smitra/self/andre/MIT-concussion/257802-post_season_20161206_142914.edf"
        #f = pyedflib.EdfReader(dataFileName)
        #signal_labels = f.getSignalLabels()
        #numChannels = f.signals_in_file

        data = data - data.mean(axis=1, keepdims=True)
        #numChannels = 16

        #beginWin = 0
        #endWin = 0

        samplingFrequency = eegFS = 250
        #upperFrequency = 100
        #lowerFrequency = 0
        #timeBandWidth = 4
        #timeWindow = 3 # time window in seconds
        #STEP_SIZE = 2 # in seconds

        numDataPoints =  timeWindow * samplingFrequency
        stepSize = STEP_SIZE * samplingFrequency
        padding = pad = 0

        winLen = timeWindow * eegFS

        paddedNumDataPoints = int ( pow ( 2, math.ceil ( np.log2 ( winLen ) + pad) ) )
        print(" paddedNumDataPoints " + str(( np.log2 ( winLen ) )))
        print(" numDataPoints " + str(( numDataPoints )))
        print(" timeBandWidth " + str(( timeBandWidth )))

        numTapers = 2 * timeBandWidth -1
        print(" numTapers " + str(( numTapers )))
        [tapers, eigenValues] = dpss_windows(int(numDataPoints), float(timeBandWidth), int(numTapers) )

        #numTapers = len(tapers)
        #numTapers = 6

        fpass = [lowerFrequency,upperFrequency]

        print ("fpass = " + str(fpass))
        print ( " padded num = " + str(paddedNumDataPoints))
        print (" eeg fs " + str(eegFS))
        gridValues, gridIndices = getGridIndices(fpass[0], fpass[1], paddedNumDataPoints, eegFS)

        print (" grid values " + str(len(gridValues)))
        print (" grid indices " + str(len(gridIndices)))

        dataMatrix = []

        #spectrumChannelSumData = [0] * ( upperFrequency - lowerFrequency + 1 )
        spectrumChannelSumData = []

        for channelIndex in range(numChannels):

          spectrogramData = []

          channelData = data[channelIndex]

          #channelData = f.readSignal(channelIndex)
          #channelData = channelData - channelData.mean(axis=1, keepdims=True)

          #channelLabel = signal_labels[channelIndex]

          # only process selected channels
          if channelIndex != 13:
            continue
          #print ("for channel " + channelLabel)

          print (str(len(  channelData )))
          numWindows = int ( ( len ( channelData ) - numDataPoints + 1) / ( stepSize  ) )
          numWindows = math.floor ( float( len ( channelData ))/ float(numDataPoints) )

          #print ( " numWindows = " + str(numWindows) )

          #theta (4-7 Hz), alpha (9-13 Hz), beta (15-25 Hz) and gamma (30-50 Hz)
          thetaPowerSpectra = []
          alphaPowerSpectra = []
          betaPowerSpectra = []
          gammaPowerSpectra = []

          for windowNum in range ( numWindows ) :

              beginWin = windowNum * numDataPoints
              endWin = beginWin + numDataPoints

              print (" window num = " + str(windowNum) )

              #print ( " beginWin = " + str(beginWin) + " endWin = " + str(endWin))

              windowData = channelData [ beginWin : endWin]

              #print ( " windowData = " + str(windowData) )

              if len(windowData) == 0:

                break

              #if windowNum == 5:
              #      break


              spectrumChannelSumData = []
              for taperIndex, taper in enumerate ( tapers ) :

                taperData = [float(a)*float(b) for a,b in zip(windowData,taper)]

                fftData = scipy.fftpack.fft(taperData,paddedNumDataPoints)

                #print ( " fftData before = " + str(len(fftData)) )
                #print ( " paddedNumDataPoints before = " + str(paddedNumDataPoints) )

                fftData = np.array (fftData)/float(eegFS)

                fftData = fftData[gridIndices]
                #print (fftData)
                #break
                #fftData = [fftData[x] for x in gridIndices]
                #print (np.shape(windowData))
                #print (windowData)

                #spectrumChannelData = np.array([log(abs(x*conj(x))) for x in fftData])
                spectrumChannelData = np.array([abs(x*conj(x)) for x in fftData])

                plt.figure(1, figsize = (8.5,11))
                plt.title('Spectrogram')
                #plt.plot(spectrumChannelData)

                #print (spectrumChannelData)

                #break

                spectrumChannelSumData.append( list(spectrumChannelData))

              #break
              #print (spectrumChannelSumData)
              #print ( " shape = " + str(np.shape(spectrumChannelSumData)))
              spectrumChannelAvgData = [float(sum(col))/len(col) for col in zip(*spectrumChannelSumData)]
              #spectrumChannelAvgData = [log(x) for x in spectrumChannelAvgData]
              #spectrumChannelAvgData = np.mean( spectrumChannelSumData, axis = 0 )

              spectrogramData.append(list(spectrumChannelAvgData))

              #if windowNum == 0:
              #    plt.plot(spectrumChannelAvgData)
              #    plt.show()

          #break

          spectrumPSD = [float(sum(col))/len(col) for col in zip(*spectrogramData)]
          spectrumPSD = np.array(spectrumPSD)/100

          plt.clf()
          #plt.show()
          plt.figure(1, figsize = (8.5,11))
          #plt.figure()

          #print([len(x) for x in spectrogramData])
          #np.savetxt("outdata/py_spectrogram_data" + str(channelIndex+1) + ".txt", np.array(spectrogramData).transpose() )
          #print ( " shape = " + str(np.shape(np.array(spectrogramData))))
          #plt.figure(1)
          #plt.subplot(211)
          #plt.plot(spectrumPSD)

          #plt.subplot(212)
          plt.figure(1, figsize = (8.5,11))
          plt.imshow(np.array(log(spectrogramData)).transpose())
          #plt.imshow(np.array(spectrogramData).transpose())

          plt.gca().invert_yaxis()
          plt.axis([0, 416, 0, 100])
          plt.show()
          break
    except:
            traceback.print_exc(file=sys.stdout)
    return
