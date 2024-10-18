#include "sign_util.h"
#include "flash_interface.h"
#include "ext_flash.h"
uint8_t finalHash[ECDSA_KEY_LEN] = {0};

extern const certElement_t _secureCertElement;

/*********************************************************************
 * GLOBAL FUNCTION REFERENCES
 ********************************************************************/
PKA_EccParam256 K2_mont       = { .byte = { 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                                            0xff, 0xff, 0xff, 0xff, 0xfb, 0xff, 0xff, 0xff,
                                            0xfe, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
                                            0xfd, 0xff, 0xff, 0xff, 0x04, 0x00, 0x00, 0x00 }};

const PKA_EccParam256 a_mont  = { .byte  = { 0xfc, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
                                             0xff, 0xff, 0xff, 0xff, 0x03, 0x00, 0x00, 0x00,
                                             0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                                             0x04, 0x00, 0x00, 0x00, 0xfc, 0xff, 0xff, 0xff }};

const PKA_EccParam256 b_mont  = { .byte  = { 0xdf, 0xbd, 0xc4, 0x29, 0x62, 0xdf, 0x9c, 0xd8,
                                             0x90, 0x30, 0x84, 0x78, 0xcd, 0x05, 0xf0, 0xac,
                                             0xd6, 0x2e, 0x21, 0xf7, 0xab, 0x20, 0xa2, 0xe5,
                                             0x34, 0x48, 0x87, 0x04, 0x1d, 0x06, 0x30, 0xdc }};
extern uint8_t eccRom_verifyHash(uint32_t *, uint32_t *, uint32_t *, uint32_t *,
                                 uint32_t *);

void eccInit(ECCROMCC26XX_Params *pParams)
{
    /* Initialize Curve to NIST P-256 with window size 3 by default */
    pParams->curve.keyLen      = SECURE_FW_ECC_NIST_P256_KEY_LEN_IN_BYTES;
    pParams->curve.workzoneLen = SECURE_FW_ECC_NIST_P256_WORKZONE_LEN_IN_BYTES;
    pParams->curve.windowSize  = SECURE_FW_ECC_WINDOW_SIZE;
    pParams->curve.param_p     = &NIST_Curve_P256_p;
    pParams->curve.param_r     = &NIST_Curve_P256_r;
    pParams->curve.param_a     = &NIST_Curve_P256_a;
    pParams->curve.param_b     = &NIST_Curve_P256_b;
    pParams->curve.param_gx    = &NIST_Curve_P256_Gx;
    pParams->curve.param_gy    = &NIST_Curve_P256_Gy;
}

/*********************************************************************
 * @fn         initEccGlobals
 * @brief      Initializa global variables needed for ECC verify operation
 *
 * @param      pCurve - pointer to curve parameters for the curve used for ECC
 *                      operations
 */
static void initEccGlobals(ECCROMCC26XX_CurveParams *pCurve)
{
  /* Store client parameters into ECC ROM parameters */
  eccRom_param_p  = pCurve->param_p;
  eccRom_param_r  = pCurve->param_r;
  eccRom_param_a  = pCurve->param_a;
  eccRom_param_b  = pCurve->param_b;
  eccRom_param_Gx = pCurve->param_gx;
  eccRom_param_Gy = pCurve->param_gy;

  /* Initialize window size */
  eccRom_windowSize = pCurve->windowSize;
}

/*********************************************************************
 * @fn         reverseOrder
 * @brief      Reverse the byte order and copy to output buffer
 *
 * @param      pBufIn - pointer to input buffer
 * @param      pBufOut - pointer to output buffer
 */
static void reverseOrder(const uint8_t *pBufIn,uint8_t *pBufOut)
{
  uint8_t i=0;
  for(i=0;i<SECURE_FW_SIGN_LEN;i++)
  {
    pBufOut[i] = pBufIn[SECURE_FW_SIGN_LEN-1-i];
  }
}

/*********************************************************************
 * @fn         copyBytes
 * @brief      Copy data between memory locatins
 *
 * @param      pDst - pointer to destination buffer
 * @param      pSrc - pointer to source buffer
 * @param      len  - length of data to be copied
 */
static void copyBytes(uint8_t *pDst, const uint8_t *pSrc, uint32_t len)
{
  uint32_t i;
  for(i=0; i<len; i++)
    pDst[i]=pSrc[i];
}

/*!
 Utility function to compare the content of two memory locations

 Public function defined in secure_fw.h
 */
/*********************************************************************
 * @fn         compareBytes
 * @brief      Compare the content of two memory locations
 *
 * @param      pData1 - pointer to first memory location
 * @param      pData2 - pointer to second memory location
 * @param      len  - length of data to be compared
 */

int compareBytes(uint8_t *pData1, const uint8_t *pData2, uint8_t len)
{
  uint8_t i;
  for(i=0; i<len; i++) if(pData1[i]!=pData2[i]) return (1);
  return (0);
}

/*!
 Check the validity of cert element

 Public function defined in secure_fw.h
 */
uint8_t verifyCertElement(uint8_t *signerInfo)
{
  /* read type in sign element and compare with type in cert element */
  return compareBytes(signerInfo,
                               _secureCertElement.signerInfo,8);
}

/**
* @brief Check for Security Payload
*
*  Reads through the headers in the .bin file. If a security header is found
*  the function checks to see if the header has a populated payload.
*
*
*  @param       eFlStrAddr - The start address in external flash of the binary image
*
*  @return      0  - security not found
*  @return      1  - security found
*
*/
int8_t  bimVerifyImage_ecc(const uint8_t *publicKeyX, const uint8_t *publicKeyY,
                           uint8_t *hash, uint8_t *sign1, uint8_t *sign2, uint32_t *eccWorkzone,
                           uint8_t *tempWorkzone)
{
    uint8_t *publicKeyXBuf;
    uint8_t *publicKeyYBuf;
    uint8_t *hashBuf;
    uint8_t *sign1Buf;
    uint8_t *sign2Buf;
    int8_t statusPublicKey;
    int8_t statusSign1;
    int8_t statusSign2;
    int8_t status;

    // Variables to be allocated on the tempworkzone,
    /* Split allocated memory into buffers */
    uint8_t *reversedHash = tempWorkzone;
    uint8_t *reversedPubKeyX = reversedHash + ECDSA_KEY_LEN;
    uint8_t *reversedPubKeyY = reversedPubKeyX + ECDSA_KEY_LEN;
    uint8_t *reversedSign1 = reversedPubKeyY + ECDSA_KEY_LEN;
    uint8_t *reversedSign2 = reversedSign1 + ECDSA_KEY_LEN;

    ECCROMCC26XX_Params params;
    eccInit(&params);
    reverseOrder(hash, reversedHash);
    reverseOrder(publicKeyX, reversedPubKeyX);
    reverseOrder(publicKeyY, reversedPubKeyY);
    reverseOrder(sign1, reversedSign1);
    reverseOrder(sign2, reversedSign2);

    /*total memory for operation: workzone and 5 key buffers*/
    eccRom_workzone = &eccWorkzone[0];

    /* Split allocated memory into buffers */
    publicKeyXBuf = (uint8_t *)eccRom_workzone +
                 SECURE_FW_ECC_NIST_P256_WORKZONE_LEN_IN_BYTES;
    publicKeyYBuf = publicKeyXBuf +
                 SECURE_FW_ECC_BUF_TOTAL_LEN(SECURE_FW_ECC_NIST_P256_KEY_LEN_IN_BYTES);
    hashBuf =  publicKeyYBuf +
               SECURE_FW_ECC_BUF_TOTAL_LEN(SECURE_FW_ECC_NIST_P256_KEY_LEN_IN_BYTES);
    sign1Buf  = hashBuf +
             SECURE_FW_ECC_BUF_TOTAL_LEN(SECURE_FW_ECC_NIST_P256_KEY_LEN_IN_BYTES);
    sign2Buf  = sign1Buf +
             SECURE_FW_ECC_BUF_TOTAL_LEN(SECURE_FW_ECC_NIST_P256_KEY_LEN_IN_BYTES);


    initEccGlobals(&params.curve);

    /* Set length of keys in words in the first word of each buffer*/
    *((uint32_t *)&publicKeyXBuf[SECURE_FW_ECC_KEY_LEN_OFFSET]) =
      (uint32_t)(SECURE_FW_ECC_UINT32_BLK_LEN(SECURE_FW_ECC_NIST_P256_KEY_LEN_IN_BYTES));

    *((uint32_t *)&publicKeyYBuf[SECURE_FW_ECC_KEY_LEN_OFFSET]) =
     (uint32_t)(SECURE_FW_ECC_UINT32_BLK_LEN(SECURE_FW_ECC_NIST_P256_KEY_LEN_IN_BYTES));

    *((uint32_t *)&hashBuf[SECURE_FW_ECC_KEY_LEN_OFFSET]) =
      (uint32_t)(SECURE_FW_ECC_UINT32_BLK_LEN(SECURE_FW_ECC_NIST_P256_KEY_LEN_IN_BYTES));

    *((uint32_t *)&sign1Buf[SECURE_FW_ECC_KEY_LEN_OFFSET]) =
      (uint32_t)(SECURE_FW_ECC_UINT32_BLK_LEN(SECURE_FW_ECC_NIST_P256_KEY_LEN_IN_BYTES));

    *((uint32_t *)&sign2Buf[SECURE_FW_ECC_KEY_LEN_OFFSET]) =
      (uint32_t)(SECURE_FW_ECC_UINT32_BLK_LEN(SECURE_FW_ECC_NIST_P256_KEY_LEN_IN_BYTES));

    /* Copy input key into buffer */
    copyBytes( publicKeyXBuf + SECURE_FW_ECC_KEY_OFFSET,
               reversedPubKeyX,
               SECURE_FW_ECC_NIST_P256_KEY_LEN_IN_BYTES);
    copyBytes( publicKeyYBuf + SECURE_FW_ECC_KEY_OFFSET,
               reversedPubKeyY,
               SECURE_FW_ECC_NIST_P256_KEY_LEN_IN_BYTES);
     /* copy hash into buffer */
    copyBytes( hashBuf + SECURE_FW_ECC_KEY_OFFSET,reversedHash,
              SECURE_FW_ECC_NIST_P256_KEY_LEN_IN_BYTES);

    copyBytes( sign1Buf + SECURE_FW_ECC_KEY_OFFSET,
               reversedSign1,
               SECURE_FW_ECC_NIST_P256_KEY_LEN_IN_BYTES);
    copyBytes( sign2Buf + SECURE_FW_ECC_KEY_OFFSET,
               reversedSign2,
               SECURE_FW_ECC_NIST_P256_KEY_LEN_IN_BYTES);

    // validate public keys
    statusPublicKey = ECC_VerifyPublicKeyWeierstrass(&params,
                                                    publicKeyXBuf,
                                                    publicKeyYBuf,
                                                    params.curve.keyLen);
  
    //  validate sign1, sign2 (r and s)
    statusSign1 = ECC_verifyPrivateKeyWeierstrass((uint32_t *)sign1Buf, &params);
    statusSign2 = ECC_verifyPrivateKeyWeierstrass((uint32_t *)sign2Buf, &params);

    //  validate status of public, sign1 and sign2
    if((statusPublicKey == ECCROMCC26XX_STATUS_SUCCESS) &&
       (statusSign1 == ECCROMCC26XX_ECC_PRIVATE_VALID)  &&
       (statusSign2 == ECCROMCC26XX_ECC_PRIVATE_VALID))
    {
      // ECC verify hash.
      status = eccRom_verifyHash((uint32_t *)publicKeyXBuf,
                                 (uint32_t *)publicKeyYBuf,
                                 (uint32_t *)hashBuf,
                                 (uint32_t *)sign1Buf,
                                 (uint32_t *)sign2Buf);
    }
    else
    {
      status = ECCROMCC26XX_STATUS_ILLEGAL_PARAM;
    }

    return status;
}

#ifdef SECURITY /* The functions below are are only used in performing Secure OAD */

#ifdef OAD_ONCHIP
/*********************************************************************
 * @fn         computeSha2Hash
 * @brief      Computes SHA256 hash
 *
 * @param      imgStartAddr - start address of the image binary
 * @param      useExtFl - is image binary is stored on external flash
 * @param      finalHash - pointer to output buffer containing computed hash value
 *
 * @return     None
 */
uint8_t *computeSha2Hash(uint32_t imgStartAddr, uint8_t *SHABuff, uint16_t SHABuffLen, bool useExtFl)
{
    imgHdr_t *pImgHdr;

    /* Read first page of the image into the buffer. */
    readFlash((uint32_t)(imgStartAddr), SHABuff, SHABuffLen); //(shaBuf, (uint8_t *)(imgStartAddr), SHA_BUF_SZ);
    pImgHdr = (imgHdr_t *)(imgStartAddr);

    if(pImgHdr->fixedHdr.len == 0)
    {
        return NULL;
    }

    //pImgHdr->fixedHdr.len = pImgHdr->fixedHdr.imgEndAddr - pImgHdr->imgPayload.startAddr +1;
    uint32_t addrRead = imgStartAddr + SHABuffLen;
    uint32_t secHdrLen = HDR_LEN_WITH_SECURITY_INFO;

    SHA256_memory_t workzone;
    SHA2CC26XX_initialize(&workzone);

    SHA2CC26XX_execute(&workzone, &SHABuff[12], 4); //Start after the ID + CRC and go until CRC Status
    SHA2CC26XX_execute(&workzone, &SHABuff[18], 47); //Start after CRC status and go to signature
    SHA2CC26XX_execute(&workzone, &SHABuff[secHdrLen], (SHABuffLen - secHdrLen));

    uint32_t imgLengthLeft = pImgHdr->fixedHdr.len - SHABuffLen;
    uint32_t byteToRead = SHABuffLen;

    /* Read over image pages. */
    while(imgLengthLeft > 0)
    {
        /* Read data into the next buffer */
        memCpy(SHABuff, (uint8_t *)addrRead, byteToRead);
        SHA2CC26XX_execute(&workzone, SHABuff, byteToRead);

        imgLengthLeft -= byteToRead;
        if(imgLengthLeft > SHABuffLen)
            byteToRead = SHABuffLen;
        else
            byteToRead = imgLengthLeft;

        addrRead += SHABuffLen;
    } /* while(imgLengthLeft > 0) */

    SHA2CC26XX_output(&workzone, finalHash);
    return(finalHash);
}
#else
/*********************************************************************
 * @fn         computeSha2Hash
 * @brief      Computes SHA256 hash
 *
 * @param      imgStartAddr - start address of the image binary
 * @param      useExtFl - is image binary is stored on external flash
 *
 * @return     pointer to output buffer containing computed hash value
 */
uint8_t *computeSha2Hash(uint32_t imgStartAddr, uint8_t *SHABuff, uint16_t SHABuffLen, bool useExtFl)
{
    imgHdr_t *pImgHdr;

    /* Read first page of the image into the buffer. */
    if(!useExtFl)
    {
        memCpy(SHABuff, (uint8_t *)(imgStartAddr), SHABuffLen);
    }
    else
    {
        extFlashRead(imgStartAddr, SHABuffLen, SHABuff);
    }

    pImgHdr = (imgHdr_t *)(SHABuff);

    if(pImgHdr->fixedHdr.len == 0)
    {
        return NULL;
    }

    uint32_t addrRead = imgStartAddr + SHABuffLen;
    uint32_t secHdrLen = HDR_LEN_WITH_SECURITY_INFO;

    SHA256_memory_t workzone;
    SHA2CC26XX_initialize(&workzone);

    SHA2CC26XX_execute(&workzone, &SHABuff[12], 4); //Start after the ID + CRC and go until CRC Status
    SHA2CC26XX_execute(&workzone, &SHABuff[18], 47); //Start after CRC status and go to signature
    SHA2CC26XX_execute(&workzone, &SHABuff[secHdrLen], SHABuffLen - secHdrLen);
    uint32_t imgLengthLeft = pImgHdr->fixedHdr.len - SHABuffLen;
    uint32_t byteToRead = SHABuffLen;

    /* Read over image pages. */
    while(imgLengthLeft > 0)
    {
        /* Read data into the next buffer */
        if(!useExtFl)
        {
            memCpy(SHABuff, (uint8_t *)addrRead, byteToRead);
        }
        else
        {
            extFlashRead(addrRead, byteToRead, SHABuff);
        }

        SHA2CC26XX_execute(&workzone, SHABuff, byteToRead);

        imgLengthLeft -= byteToRead;
        if(imgLengthLeft > SHABuffLen)
            byteToRead = SHABuffLen;
        else
            byteToRead = imgLengthLeft;

        addrRead += SHABuffLen;
    } /* while(imgLengthLeft > 0) */

    SHA2CC26XX_output(&workzone, finalHash);
    return(finalHash);
}
#endif /* ifdef OAD_ONCHIP */

#endif /*#ifdef SECURITY */

/*
 *  ======== ECC_ArrayAllZeros ========
 */
bool ECC_ArrayAllZeros(const uint8_t *array, uint32_t arrayLength)
{
  uint32_t i;
  uint8_t arrayBits = 0;

  // We could speed things up by comparing word-wise rather than byte-wise.
  // However, this extra overhead is inconsequential compared to running an
  // actual PKA operation. Especially ECC operations.
  for (i = 0; i < arrayLength; i++)
  {
    arrayBits |= array[i];
  }

  if (arrayBits)
  {
    return FALSE;
  }
  else
  {
    return TRUE;
  }
}

/*
 *  ======== ECC_cmpBytes ========
 */
bool ECC_cmpBytes(uint8_t *in1, uint8_t *in2, uint8_t len)
{
  uint8_t bCnt = 0;
  do
  {
    if(in1[bCnt] != in2[bCnt])
    {
      return false;
    }
    bCnt++;
  }while(bCnt < len);
  return true;
}


/*
 *  ======== ECC_VerifyPublicKeyWeierstrass ========
 */
static int8_t ECC_VerifyPublicKeyWeierstrass(ECCROMCC26XX_Params *params, const uint8_t *curvePointX, const uint8_t *curvePointY, uint32_t length)
{
  uint32_t pkaResult;
  uint32_t len = length/sizeof(uint32_t), modBufLen = length/sizeof(uint32_t)+2; // Some operation required modulus form operator of 10 bytes length

  uint32_t * ECDSA_primeMod, * ECDSA_xImp_10Bt, * ECDSA_yImp_10Bt,
           * ECDSA_primeMod_10bt, * ECDSA_temp_buff, * ECDSA_temp_buff1,
           * ECDSA_gx_mont, * ECDSA_gy_mont, * ECDSA_gx_hat, * ECDSA_gy_hat,
           * ECDSA_x2_hat, * ECDSA_x3_hat, * ECDSA_xa_hat, * ECDSA_y2_hat;

  // Use allocated workzone instead of alllocating memory
  ECDSA_primeMod       = eccRom_workzone;
  ECDSA_xImp_10Bt      = (ECDSA_primeMod + modBufLen);
  ECDSA_yImp_10Bt      = (ECDSA_xImp_10Bt + modBufLen);
  ECDSA_primeMod_10bt  = (ECDSA_yImp_10Bt + modBufLen);
  ECDSA_gx_mont        = (ECDSA_primeMod_10bt + modBufLen);
  ECDSA_gy_mont        = (ECDSA_gx_mont + modBufLen);
  ECDSA_gx_hat         = (ECDSA_gy_mont + modBufLen);
  ECDSA_gy_hat         = (ECDSA_gx_hat + modBufLen);
  ECDSA_x2_hat         = (ECDSA_gy_hat + modBufLen);
  ECDSA_x3_hat         = (ECDSA_x2_hat + modBufLen);
  ECDSA_xa_hat         = (ECDSA_x3_hat + modBufLen);
  ECDSA_y2_hat         = (ECDSA_xa_hat + modBufLen);
  ECDSA_temp_buff      = (ECDSA_y2_hat + modBufLen);
  ECDSA_temp_buff1     = (ECDSA_temp_buff + modBufLen);

  memset(eccRom_workzone, 0x00, 16*(modBufLen)*sizeof(uint32_t));

  // Load curve order as modulus
  len = ((fn_twoOperand_t)(IMPORTMODULUS_rom))(ECDSA_primeMod, eccRom_param_p);
  if(len != length/sizeof(uint32_t)) return ECCROMCC26XX_STATUS_ILLEGAL_PARAM;

  // Set prime mod
  ((void (*)(uint32_t*, uint32_t))(mSET_rom))(ECDSA_primeMod, len);

  // Verify X != 0 (not point at infinity)
  if (ECC_ArrayAllZeros(curvePointX, length))
  {
    return ECCROMCC26XX_STATUS_ECDH_X_ZERO;
  }

  // Verify Y != 0 (not point at infinity)
  if (ECC_ArrayAllZeros(curvePointY, length))
  {
    return ECCROMCC26XX_STATUS_ECDH_Y_ZERO;
  }

  // Import  X point to operand format form for range check
  ((fn_twoOperand_t)(IMPORTDATA_rom))(ECDSA_xImp_10Bt, (uint32_t *)curvePointX);

  // Import  Y point to operand format form for range check
  ((fn_twoOperand_t)(IMPORTDATA_rom))(ECDSA_yImp_10Bt, (uint32_t *)curvePointY);

  // Import  P point to operand format form for range check
  ((fn_twoOperand_t)(IMPORTDATA_rom))(ECDSA_primeMod_10bt, (uint32_t *)params->curve.param_p);

  // Check X point range by subtarcting the X-P,
  // there should be borrow and len'th byte should be set to zero
  pkaResult = ((fn_threeOperand_t)(zSUB_rom))(ECDSA_temp_buff, ECDSA_xImp_10Bt, ECDSA_primeMod_10bt);
  if((pkaResult != 1) || (ECDSA_temp_buff[len] != 0))
  {
    return ECCROMCC26XX_STATUS_ECDH_X_LARGER_THAN_PRIME;
  }

  // Clear buffer
  memset(ECDSA_temp_buff, 0x00, (modBufLen*sizeof(uint32_t)));

  // Check Y point range Y <= [P -1]
  pkaResult = ((fn_threeOperand_t)(zSUB_rom))(ECDSA_temp_buff, ECDSA_yImp_10Bt, ECDSA_primeMod_10bt);
  if((pkaResult != 1) || (ECDSA_temp_buff[len] != 0))
  {
    return ECCROMCC26XX_STATUS_ECDH_Y_LARGER_THAN_PRIME;
  }

  // No need to compute the Montgomery constant
  // Covnert point to  [X, Y] Montgomery format
#ifdef DEBUG_ECDSA
  ((fn_threeOperandV_t)(mMULT_rom))(ECDSA_gx_mont, (uint32_t *)&gx.word, (uint32_t *)&K2_mont.word);
  ((fn_threeOperandV_t)(mMULT_rom))(ECDSA_gy_mont, (uint32_t *)&gy.word, (uint32_t *)&K2_mont.word);
#else
  ((fn_threeOperandV_t)(mMULT_rom))(ECDSA_gx_mont, (uint32_t *)ECDSA_xImp_10Bt, (uint32_t *)&K2_mont.word);  // Both X and Y points are in operand format
  ((fn_threeOperandV_t)(mMULT_rom))(ECDSA_gy_mont, (uint32_t *)ECDSA_yImp_10Bt, (uint32_t *)&K2_mont.word);
#endif // ifdef DEBUG_ECDSA

  // Conmpute x^2 hat
  ((fn_threeOperandV_t)(mMULT_rom))(ECDSA_x2_hat, (uint32_t *)ECDSA_gx_mont, (uint32_t *)ECDSA_gx_mont);

  // Conmpute x^3 hat
  ((fn_threeOperandV_t)(mMULT_rom))(ECDSA_x3_hat, (uint32_t *)ECDSA_x2_hat, (uint32_t *)ECDSA_gx_mont);

  // Conmpute xa_hat
  ((fn_threeOperandV_t)(mMULT_rom))(ECDSA_xa_hat, (uint32_t *)ECDSA_gx_mont, (uint32_t *)&a_mont.word);

  // Conmpute x3pax_hat
  memset(ECDSA_temp_buff, 0x00, sizeof(uint32_t)*10);
  ((fn_threeOperandV_t)(mADD_rom))(ECDSA_temp_buff, (uint32_t *)ECDSA_x3_hat, (uint32_t *)ECDSA_xa_hat);

  // Conmpute x3paxpb_hat
  ((fn_threeOperandV_t)(mADD_rom))(ECDSA_temp_buff, (uint32_t *)ECDSA_temp_buff, (uint32_t *)&b_mont.word);

  // Conmpute y2_hat
  ((fn_threeOperandV_t)(mMULT_rom))(ECDSA_y2_hat, (uint32_t *)ECDSA_gy_mont, (uint32_t *)ECDSA_gy_mont);

  memset(ECDSA_temp_buff1, 0x00, modBufLen*sizeof(uint32_t));

  if(ECC_cmpBytes((uint8_t *)ECDSA_y2_hat, (uint8_t *)ECDSA_temp_buff, len) != true)
  {
    return ECCROMCC26XX_STATUS_ECDH_PT_CHECK_FAIL;
  }

  return ECCROMCC26XX_STATUS_SUCCESS;
}

/*
 *  ======== ECC_verifyPrivateKeyWeierstrass ========
 */
static int8_t ECC_verifyPrivateKeyWeierstrass(uint32_t *privateKey, ECCROMCC26XX_Params *params)
{
    uint32_t result;
    uint32_t len;
    uint32_t modBufLen;
    uint32_t *order;
    uint32_t *privKey;
    uint32_t *tempBuf;
    uint32_t *ECDSA_primeMod;
    
    len = (params->curve.keyLen)/sizeof(uint32_t);
    modBufLen = ((params->curve.keyLen)/sizeof(uint32_t))+2; // Some operation require modulus form operators of 10 words length

    // Use allocated workzone instead of alllocating memory
    ECDSA_primeMod = eccRom_workzone;
    order = (ECDSA_primeMod + modBufLen);
    privKey = (order + modBufLen);
    tempBuf = (privKey + modBufLen);

    // Clear the locations used in the allocated workzone before loading data used in the workzone 
    memset(eccRom_workzone, 0x00, 4*(modBufLen)*sizeof(uint32_t));

    len = ((fn_twoOperand_t)(IMPORTMODULUS_rom))(ECDSA_primeMod, eccRom_param_p);
    if(len != (params->curve.keyLen)/sizeof(uint32_t)) return ECCROMCC26XX_STATUS_ILLEGAL_PARAM;

    // Set prime MOD and LEN (global variables inside the ECCLibrary)
    ((void (*)(uint32_t*, uint32_t))(mSET_rom))(ECDSA_primeMod, len);
    
    // Import order to operand format form for range check
    ((fn_twoOperand_t)(IMPORTDATA_rom))(order, (uint32_t *)params->curve.param_r);
    
    // Import private key to operand format form for range check
    ((fn_twoOperand_t)(IMPORTDATA_rom))(privKey, privateKey);

    // Verify private key != 0
    if (ECC_ArrayAllZeros((uint8_t *)privKey, len))
    {
        return ECCROMCC26XX_PRIVATE_KEY_ZERO;
    }
    
    // Check private key range by subtracting privateKey-N
    // If  private key <= [P-1], zSUB will return 1 indicating borrow and len'th byte will be set to zero
    result = ((fn_threeOperand_t)(zSUB_rom))(tempBuf, privKey, order);
    
     if((result !=1) || (tempBuf[len] !=0))
    {
      return ECCROMCC26XX_PRIVATE_KEY_LARGER_EQUAL_ORDER;
    }

    return ECCROMCC26XX_ECC_PRIVATE_VALID;
}
