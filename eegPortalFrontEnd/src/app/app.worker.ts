import * as math from 'mathjs'
import * as nifti from "nifti-reader-js"

addEventListener('message', ({ data }) => {
  const response = `worker response to ${data}`;

  // method to unpack binary data
  // from https://github.com/danguer/blog-examples/blob/master/js/base64-binary.js
   var Base64Binary = {
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    /* will return a  Uint8Array type */
    decodeArrayBuffer: function(input) {
      var bytes = (input.length/4) * 3;
      var ab = new ArrayBuffer(bytes);
      this.decode(input, ab);

      return ab;
    },

    removePaddingChars: function(input){
      var lkey = this._keyStr.indexOf(input.charAt(input.length - 1));
      if(lkey == 64){
        return input.substring(0,input.length - 1);
      }
      return input;
    },

    decode: function (input, arrayBuffer) {
      //get last chars to see if are valid
      input = this.removePaddingChars(input);
      input = this.removePaddingChars(input);

      var bytes = Math.floor((input.length / 4) * 3);
      // var bytes = (input.length / 4) * 3;

      var uarray;
      var chr1, chr2, chr3;
      var enc1, enc2, enc3, enc4;
      var i = 0;
      var j = 0;

      if (arrayBuffer)
        uarray = new Uint8Array(arrayBuffer);
      else
        uarray = new Uint8Array(bytes);

      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

      for (i=0; i<bytes; i+=3) {
        //get the 3 octects in 4 ascii chars
        enc1 = this._keyStr.indexOf(input.charAt(j++));
        enc2 = this._keyStr.indexOf(input.charAt(j++));
        enc3 = this._keyStr.indexOf(input.charAt(j++));
        enc4 = this._keyStr.indexOf(input.charAt(j++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        uarray[i] = chr1;
        if (enc3 != 64) uarray[i+1] = chr2;
        if (enc4 != 64) uarray[i+2] = chr3;
      }

      return uarray;
    }
  } // end method

  // self.addEventListener('message', ({ data }) => {

    // if (data === 'do some work') {

      console.log (" in worker " + data["imagePrefixes"]);

      // data = JSON.parse(data);

      // var Base64Binary = data["Base64Binary"];

      var fullScreenBrainDataArray = null;
      var fullScreenRoiDataArray = null;
      var fullScreenSaliencyDataArray = null;

      var fullScreenData = null;;
      var fullScreenNiftiHeader = null;
      var fullScreenNiftiImage = null;
      var fullScreenNiftiExt = null;

      var fullScreenRoiDataValue = []
      var fullScreenSaliencyDataValue = [];

      var fullScreenDims = null;

      var fullScreenNiftiHeaders = Array();
      var fullScreenNiftiImages = Array();
      var fullScreenRoiNiftiHeaders = Array();
      var fullScreenRoiNiftiImages = Array();
      var fullScreenSaliencyNiftiHeaders = Array();
      var fullScreenSaliencyNiftiImages = Array();

      var fullScreenNiftiHeader = null;
      var fullScreenNiftiImage = null;
      var fullScreenRoiNiftiHeader = null;
      var fullScreenRoiNiftiImage = null;
      var fullScreenSaliencyNiftiHeader = null;
      var fullScreenSaliencyNiftiImage = null;

      var fullScreenNiftiTypedDataList = [];
      var fullScreenRoiTypedDataList = [];
      var fullScreenSaliencyTypedDataList = [];
      var fullScreenDims:any;

      var outdata = [];

      var displayRoiFlag = data["displayRoiFlag"];
      var displaySaliencyFlag = data["displaySaliencyFlag"];

      // var shape = data["shape"];

      if (data && data["imagePrefixes"] && data["imagePrefixes"].length > 0) {

        for(var i = 0; i < (data["imagePrefixes"]).length; i++){

           fullScreenBrainDataArray = Base64Binary.decodeArrayBuffer(data.fullScreenBrainData[i]);

           fullScreenRoiDataArray = [];

           if (displayRoiFlag) {
             if (data["fullScreenRoiData"] && data["fullScreenRoiData"][i] && data["fullScreenRoiData"][i].length > 0){
               fullScreenRoiDataArray  = Base64Binary.decodeArrayBuffer(data.fullScreenRoiData[i]);
               // console.log( " fullScreenRoiDataArray len = " + fullScreenRoiDataArray.byteLength);
             }
           }

           if (displaySaliencyFlag) {
             if (data["fullScreenSaliencyData"] && data["fullScreenSaliencyData"].saliencyValues[i] && data["fullScreenSaliencyData"].saliencyValues[i].length > 0){
               fullScreenSaliencyDataArray = Base64Binary.decodeArrayBuffer(data["fullScreenSaliencyData"].saliencyValues[i]);
               // console.log( " fullScreenSaliencyDataArray len = " + fullScreenSaliencyDataArray.byteLength);
             }
           }

           fullScreenData = fullScreenBrainDataArray;
           fullScreenNiftiHeader = null;
           fullScreenNiftiImage = null;
           fullScreenNiftiExt = null;

           if (nifti.isCompressed(fullScreenData)) {
               fullScreenData = nifti.decompress(fullScreenData);
           }

           if (nifti.isNIFTI(fullScreenData)) {
              // console.log( " fullScreenData len = " + fullScreenData.length);

              fullScreenNiftiHeader = nifti.readHeader(fullScreenData);
              fullScreenNiftiHeaders.push(fullScreenNiftiHeader);

              fullScreenDims = fullScreenNiftiHeader.dims;

              fullScreenNiftiImage = nifti.readImage(fullScreenNiftiHeader, fullScreenData);
              fullScreenNiftiImages.push(fullScreenNiftiImage);

              if (nifti.hasExtension(fullScreenNiftiHeader)) {
                  fullScreenNiftiExt = nifti.readExtensionData(fullScreenNiftiHeader, fullScreenData);
              }

             fullScreenRoiDataValue = [];

             if (displayRoiFlag) {

               if (fullScreenRoiDataArray.byteLength > 0 && nifti.isCompressed(fullScreenRoiDataArray)) {

                   fullScreenRoiDataArray = nifti.decompress(fullScreenRoiDataArray);
               }

               fullScreenRoiNiftiHeader = []
               fullScreenRoiNiftiImage = [];


               if (nifti.isNIFTI(fullScreenRoiDataArray)) {
                  fullScreenRoiNiftiHeader = nifti.readHeader(fullScreenRoiDataArray);
                  fullScreenRoiNiftiHeaders.push(fullScreenRoiNiftiHeader);

                  fullScreenRoiNiftiImage = nifti.readImage(fullScreenRoiNiftiHeader, fullScreenRoiDataArray);
                  fullScreenRoiNiftiImages.push(fullScreenRoiNiftiImage);
               }

             }

             fullScreenSaliencyDataValue = [];

             if (displaySaliencyFlag) {

               if (fullScreenSaliencyDataArray.byteLength && nifti.isCompressed(fullScreenSaliencyDataArray)) {
                   fullScreenSaliencyDataArray = nifti.decompress(fullScreenSaliencyDataArray);
                }

                fullScreenSaliencyNiftiHeader = [];
                fullScreenSaliencyNiftiImage = [];

                if (nifti.isNIFTI(fullScreenSaliencyDataArray)) {

                   fullScreenSaliencyNiftiHeader = nifti.readHeader(fullScreenSaliencyDataArray);
                   fullScreenSaliencyNiftiImage = nifti.readImage(fullScreenSaliencyNiftiHeader, fullScreenSaliencyDataArray);

                   fullScreenSaliencyNiftiHeaders.push( fullScreenSaliencyNiftiHeader );
                   fullScreenSaliencyNiftiImages.push ( fullScreenSaliencyNiftiImage );

                }

              }
             // convert raw data to typed array based on nifti datatype
             var fullScreenTypedData;
             if (fullScreenNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT8) {
                 fullScreenTypedData = new Uint8Array(fullScreenNiftiImage);
             } else if (fullScreenNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT16) {
                 fullScreenTypedData = new Int16Array(fullScreenNiftiImage);
             } else if (fullScreenNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT32) {
                 fullScreenTypedData = new Int32Array(fullScreenNiftiImage);
             } else if (fullScreenNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT32) {
                 fullScreenTypedData = new Float32Array(fullScreenNiftiImage);
             } else if (fullScreenNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT64) {
                 fullScreenTypedData = new Float64Array(fullScreenNiftiImage);
             } else if (fullScreenNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT8) {
                 fullScreenTypedData = new Int8Array(fullScreenNiftiImage);
             } else if (fullScreenNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT16) {
                 fullScreenTypedData = new Uint16Array(fullScreenNiftiImage);
             } else if (fullScreenNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT32) {
                 fullScreenTypedData = new Uint32Array(fullScreenNiftiImage);
             }
             // else {
             //     return;
             // }

             var fullScreenNiftiTypedData = fullScreenTypedData;

             var fullScreenSaliencyTypedData;

             if (displaySaliencyFlag) {

               // saliencyTypedData = new Int32Array(saliencyNiftiImage);
               if (fullScreenSaliencyNiftiHeader && fullScreenSaliencyNiftiImage ) {
               // if (saliencyNiftiHeader && saliencyNiftiImage) {

                 if (fullScreenSaliencyNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT8) {
                     fullScreenSaliencyTypedData = new Uint8Array(fullScreenSaliencyNiftiImage);
                 } else if (fullScreenSaliencyNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT16) {
                     fullScreenSaliencyTypedData = new Int16Array(fullScreenSaliencyNiftiImage);
                 } else if (fullScreenSaliencyNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT32) {
                     fullScreenSaliencyTypedData = new Int32Array(fullScreenSaliencyNiftiImage);
                 } else if (fullScreenSaliencyNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT32) {
                     fullScreenSaliencyTypedData = new Float32Array(fullScreenSaliencyNiftiImage);
                 } else if (fullScreenSaliencyNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT64) {
                     fullScreenSaliencyTypedData = new Float64Array(fullScreenSaliencyNiftiImage);
                 } else if (fullScreenSaliencyNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT8) {
                     fullScreenSaliencyTypedData = new Int8Array(fullScreenSaliencyNiftiImage);
                 } else if (fullScreenSaliencyNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT16) {
                     fullScreenSaliencyTypedData = new Uint16Array(fullScreenSaliencyNiftiImage);
                 } else if (fullScreenSaliencyNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT32) {
                     fullScreenSaliencyTypedData = new Uint32Array(fullScreenSaliencyNiftiImage);
                 }
               }

             }
             var fullScreenRoiTypedData ;
             // console.log(" fullScreenRoiNiftiImage " + fullScreenRoiNiftiImage)

             if (displayRoiFlag) {

               if (fullScreenRoiNiftiHeader && fullScreenRoiNiftiImage ) {
                 if (fullScreenRoiNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT8) {
                     fullScreenRoiTypedData = new Uint8Array(fullScreenRoiNiftiImage);
                 } else if (fullScreenRoiNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT16) {
                     fullScreenRoiTypedData = new Int16Array(fullScreenRoiNiftiImage);
                 } else if (fullScreenRoiNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT32) {
                     fullScreenRoiTypedData = new Int32Array(fullScreenRoiNiftiImage);
                 } else if (fullScreenRoiNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT32) {
                     fullScreenRoiTypedData = new Float32Array(fullScreenRoiNiftiImage);
                 } else if (fullScreenRoiNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT64) {
                     fullScreenRoiTypedData = new Float64Array(fullScreenRoiNiftiImage);
                 } else if (fullScreenRoiNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT8) {
                     fullScreenRoiTypedData = new Int8Array(fullScreenRoiNiftiImage);
                 } else if (fullScreenRoiNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT16) {
                     fullScreenRoiTypedData = new Uint16Array(fullScreenRoiNiftiImage);
                 } else if (fullScreenRoiNiftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT32) {
                     fullScreenRoiTypedData = new Uint32Array(fullScreenRoiNiftiImage);
                 }
               }
             }
           // console.log (" pushing for " + i + " fullScreenNiftiTypedData.length " + fullScreenNiftiTypedData.length);
           // console.log (" pushing for " + i + " fullScreenRoiTypedData.length " + fullScreenRoiTypedData.length);
           // console.log (" pushing for " + i + " fullScreenSaliencyTypedData.length " + fullScreenSaliencyTypedData.length);

           fullScreenNiftiTypedDataList.push(fullScreenNiftiTypedData);
           fullScreenRoiTypedDataList.push(fullScreenRoiTypedData);
           fullScreenSaliencyTypedDataList.push(fullScreenSaliencyTypedData);

           }// if full screen data
         }// end for
      } // end if
      // ******************** end fior
      console.log (" fullScreenNiftiTypedDataList.length " + fullScreenNiftiTypedDataList[0][100]);
      outdata[0] = fullScreenNiftiTypedDataList;
      // console.log (" fullScreenRoiTypedDataList.length " + fullScreenRoiTypedDataList);
      outdata[1] = fullScreenRoiTypedDataList;
      // console.log (" fullScreenSaliencyTypedDataList.length " + fullScreenSaliencyTypedDataList.length);
      outdata[2] = fullScreenSaliencyTypedDataList;
      outdata[3] = fullScreenDims;
      // outdata[4] = shape;
      console.log(' completed worker ');
      // ctx.postMessage({ message: outdata });
      postMessage(outdata);

});
