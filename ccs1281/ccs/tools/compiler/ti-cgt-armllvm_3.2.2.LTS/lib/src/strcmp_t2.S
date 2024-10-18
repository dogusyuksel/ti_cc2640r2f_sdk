///****************************************************************************/
///*  strcmp_t2.S v#####                                                       */
///*  Copyright (c) 2022@%%%%  Texas Instruments Incorporated                 */
///****************************************************************************/
/*
 * MIT OR Apache-2.0 WITH LLVM-exception
 * =====================================
 *
 * MIT License
 * -----------
 *
 * Copyright (c) 1999-2022, Arm Limited.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * Apache-2.0 WITH LLVM-exception
 * ------------------------------
 *
 *                                Apache License
 *                           Version 2.0, January 2004
 *                         http://www.apache.org/licenses/
 *
 *     TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION
 *
 *     1. Definitions.
 *
 *       "License" shall mean the terms and conditions for use, reproduction,
 *       and distribution as defined by Sections 1 through 9 of this document.
 *
 *       "Licensor" shall mean the copyright owner or entity authorized by
 *       the copyright owner that is granting the License.
 *
 *       "Legal Entity" shall mean the union of the acting entity and all
 *       other entities that control, are controlled by, or are under common
 *       control with that entity. For the purposes of this definition,
 *       "control" means (i) the power, direct or indirect, to cause the
 *       direction or management of such entity, whether by contract or
 *       otherwise, or (ii) ownership of fifty percent (50%) or more of the
 *       outstanding shares, or (iii) beneficial ownership of such entity.
 *
 *       "You" (or "Your") shall mean an individual or Legal Entity
 *       exercising permissions granted by this License.
 *
 *       "Source" form shall mean the preferred form for making modifications,
 *       including but not limited to software source code, documentation
 *       source, and configuration files.
 *
 *       "Object" form shall mean any form resulting from mechanical
 *       transformation or translation of a Source form, including but
 *       not limited to compiled object code, generated documentation,
 *       and conversions to other media types.
 *
 *       "Work" shall mean the work of authorship, whether in Source or
 *       Object form, made available under the License, as indicated by a
 *       copyright notice that is included in or attached to the work
 *       (an example is provided in the Appendix below).
 *
 *       "Derivative Works" shall mean any work, whether in Source or Object
 *       form, that is based on (or derived from) the Work and for which the
 *       editorial revisions, annotations, elaborations, or other modifications
 *       represent, as a whole, an original work of authorship. For the purposes
 *       of this License, Derivative Works shall not include works that remain
 *       separable from, or merely link (or bind by name) to the interfaces of,
 *       the Work and Derivative Works thereof.
 *
 *       "Contribution" shall mean any work of authorship, including
 *       the original version of the Work and any modifications or additions
 *       to that Work or Derivative Works thereof, that is intentionally
 *       submitted to Licensor for inclusion in the Work by the copyright owner
 *       or by an individual or Legal Entity authorized to submit on behalf of
 *       the copyright owner. For the purposes of this definition, "submitted"
 *       means any form of electronic, verbal, or written communication sent
 *       to the Licensor or its representatives, including but not limited to
 *       communication on electronic mailing lists, source code control systems,
 *       and issue tracking systems that are managed by, or on behalf of, the
 *       Licensor for the purpose of discussing and improving the Work, but
 *       excluding communication that is conspicuously marked or otherwise
 *       designated in writing by the copyright owner as "Not a Contribution."
 *
 *       "Contributor" shall mean Licensor and any individual or Legal Entity
 *       on behalf of whom a Contribution has been received by Licensor and
 *       subsequently incorporated within the Work.
 *
 *     2. Grant of Copyright License. Subject to the terms and conditions of
 *       this License, each Contributor hereby grants to You a perpetual,
 *       worldwide, non-exclusive, no-charge, royalty-free, irrevocable
 *       copyright license to reproduce, prepare Derivative Works of,
 *       publicly display, publicly perform, sublicense, and distribute the
 *       Work and such Derivative Works in Source or Object form.
 *
 *     3. Grant of Patent License. Subject to the terms and conditions of
 *       this License, each Contributor hereby grants to You a perpetual,
 *       worldwide, non-exclusive, no-charge, royalty-free, irrevocable
 *       (except as stated in this section) patent license to make, have made,
 *       use, offer to sell, sell, import, and otherwise transfer the Work,
 *       where such license applies only to those patent claims licensable
 *       by such Contributor that are necessarily infringed by their
 *       Contribution(s) alone or by combination of their Contribution(s)
 *       with the Work to which such Contribution(s) was submitted. If You
 *       institute patent litigation against any entity (including a
 *       cross-claim or counterclaim in a lawsuit) alleging that the Work
 *       or a Contribution incorporated within the Work constitutes direct
 *       or contributory patent infringement, then any patent licenses
 *       granted to You under this License for that Work shall terminate
 *       as of the date such litigation is filed.
 *
 *     4. Redistribution. You may reproduce and distribute copies of the
 *       Work or Derivative Works thereof in any medium, with or without
 *       modifications, and in Source or Object form, provided that You
 *       meet the following conditions:
 *
 *       (a) You must give any other recipients of the Work or
 *           Derivative Works a copy of this License; and
 *
 *       (b) You must cause any modified files to carry prominent notices
 *           stating that You changed the files; and
 *
 *       (c) You must retain, in the Source form of any Derivative Works
 *           that You distribute, all copyright, patent, trademark, and
 *           attribution notices from the Source form of the Work,
 *           excluding those notices that do not pertain to any part of
 *           the Derivative Works; and
 *
 *       (d) If the Work includes a "NOTICE" text file as part of its
 *           distribution, then any Derivative Works that You distribute must
 *           include a readable copy of the attribution notices contained
 *           within such NOTICE file, excluding those notices that do not
 *           pertain to any part of the Derivative Works, in at least one
 *           of the following places: within a NOTICE text file distributed
 *           as part of the Derivative Works; within the Source form or
 *           documentation, if provided along with the Derivative Works; or,
 *           within a display generated by the Derivative Works, if and
 *           wherever such third-party notices normally appear. The contents
 *           of the NOTICE file are for informational purposes only and
 *           do not modify the License. You may add Your own attribution
 *           notices within Derivative Works that You distribute, alongside
 *           or as an addendum to the NOTICE text from the Work, provided
 *           that such additional attribution notices cannot be construed
 *           as modifying the License.
 *
 *       You may add Your own copyright statement to Your modifications and
 *       may provide additional or different license terms and conditions
 *       for use, reproduction, or distribution of Your modifications, or
 *       for any such Derivative Works as a whole, provided Your use,
 *       reproduction, and distribution of the Work otherwise complies with
 *       the conditions stated in this License.
 *
 *     5. Submission of Contributions. Unless You explicitly state otherwise,
 *       any Contribution intentionally submitted for inclusion in the Work
 *       by You to the Licensor shall be under the terms and conditions of
 *       this License, without any additional terms or conditions.
 *       Notwithstanding the above, nothing herein shall supersede or modify
 *       the terms of any separate license agreement you may have executed
 *       with Licensor regarding such Contributions.
 *
 *     6. Trademarks. This License does not grant permission to use the trade
 *       names, trademarks, service marks, or product names of the Licensor,
 *       except as required for reasonable and customary use in describing the
 *       origin of the Work and reproducing the content of the NOTICE file.
 *
 *     7. Disclaimer of Warranty. Unless required by applicable law or
 *       agreed to in writing, Licensor provides the Work (and each
 *       Contributor provides its Contributions) on an "AS IS" BASIS,
 *       WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
 *       implied, including, without limitation, any warranties or conditions
 *       of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
 *       PARTICULAR PURPOSE. You are solely responsible for determining the
 *       appropriateness of using or redistributing the Work and assume any
 *       risks associated with Your exercise of permissions under this License.
 *
 *     8. Limitation of Liability. In no event and under no legal theory,
 *       whether in tort (including negligence), contract, or otherwise,
 *       unless required by applicable law (such as deliberate and grossly
 *       negligent acts) or agreed to in writing, shall any Contributor be
 *       liable to You for damages, including any direct, indirect, special,
 *       incidental, or consequential damages of any character arising as a
 *       result of this License or out of the use or inability to use the
 *       Work (including but not limited to damages for loss of goodwill,
 *       work stoppage, computer failure or malfunction, or any and all
 *       other commercial damages or losses), even if such Contributor
 *       has been advised of the possibility of such damages.
 *
 *     9. Accepting Warranty or Additional Liability. While redistributing
 *       the Work or Derivative Works thereof, You may choose to offer,
 *       and charge a fee for, acceptance of support, warranty, indemnity,
 *       or other liability obligations and/or rights consistent with this
 *       License. However, in accepting such obligations, You may act only
 *       on Your own behalf and on Your sole responsibility, not on behalf
 *       of any other Contributor, and only if You agree to indemnify,
 *       defend, and hold each Contributor harmless for any liability
 *       incurred by, or claims asserted against, such Contributor by reason
 *       of your accepting any such warranty or additional liability.
 *
 *     END OF TERMS AND CONDITIONS
 *
 *     APPENDIX: How to apply the Apache License to your work.
 *
 *       To apply the Apache License to your work, attach the following
 *       boilerplate notice, with the fields enclosed by brackets "[]"
 *       replaced with your own identifying information. (Don't include
 *       the brackets!)  The text should be enclosed in the appropriate
 *       comment syntax for the file format. We also recommend that a
 *       file or class name and description of purpose be included on the
 *       same "printed page" as the copyright notice for easier
 *       identification within third-party archives.
 *
 *     Copyright [yyyy] [name of copyright owner]
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *
 *
 * --- LLVM Exceptions to the Apache 2.0 License ----
 *
 * As an exception, if, as a result of your compiling your source code, portions
 * of this Software are embedded into an Object form of such source code, you
 * may redistribute such embedded portions in such Object form without complying
 * with the conditions of Sections 4(a), 4(b) and 4(d) of the License.
 *
 * In addition, if you combine or link compiled forms of this Software with
 * software that is licensed under the GPLv2 ("Combined Software") and if a
 * court of competent jurisdiction determines that the patent provision (Section
 * 3), the indemnity provision (Section 9) or other Section of the License
 * conflicts with the conditions of the GPLv2, you may retroactively and
 * prospectively choose to deem waived or otherwise exclude such Section(s) of
 * the License, but only in their entirety and only with respect to the Combined
 * Software.
 */
#if __ARM_ARCH >= 7 && __ARM_FEATURE_DSP >=1

/* Implementation of strcmp for ARMv7 when DSP instructions are
   available.  Use ldrd to support wider loads, provided the data
   is sufficiently aligned.  Use saturating arithmetic to optimize
   the compares.  */

/*
 * Macros for asm code.
 *
 * Copyright (c) 2019-2020, Arm Limited.
 * SPDX-License-Identifier: MIT OR Apache-2.0 WITH LLVM-exception
 */

/* #include "asmdefs.h" */
#ifndef _ASMDEFS_H
#define _ASMDEFS_H

#if defined(__aarch64__)

/* Branch Target Identitication support.  */
#define BTI_C		hint	34
#define BTI_J		hint	36
/* Return address signing support (pac-ret).  */
#define PACIASP		hint	25; .cfi_window_save
#define AUTIASP		hint	29; .cfi_window_save

/* GNU_PROPERTY_AARCH64_* macros from elf.h.  */
#define FEATURE_1_AND 0xc0000000
#define FEATURE_1_BTI 1
#define FEATURE_1_PAC 2

/* Add a NT_GNU_PROPERTY_TYPE_0 note.  */
#define GNU_PROPERTY(type, value)	\
  .section .note.gnu.property, "a";	\
  .p2align 3;				\
  .word 4;				\
  .word 16;				\
  .word 5;				\
  .asciz "GNU";				\
  .word type;				\
  .word 4;				\
  .word value;				\
  .word 0;				\
  .text

/* If set then the GNU Property Note section will be added to
   mark objects to support BTI and PAC-RET.  */
#ifndef WANT_GNU_PROPERTY
#define WANT_GNU_PROPERTY 1
#endif

#if WANT_GNU_PROPERTY
/* Add property note with supported features to all asm files.  */
GNU_PROPERTY (FEATURE_1_AND, FEATURE_1_BTI|FEATURE_1_PAC)
#endif

#define ENTRY_ALIGN(name, alignment)	\
  .global name;		\
  .type name,%function;	\
  .align alignment;		\
  name:			\
  .cfi_startproc;	\
  BTI_C;

#else

#define END_FILE

#define ENTRY_ALIGN(name, alignment)	\
  .global name;		\
  .type name,%function;	\
  .align alignment;		\
  name:			\
  .cfi_startproc;

#endif

#define ENTRY(name)	ENTRY_ALIGN(name, 6)

#define ENTRY_ALIAS(name)	\
  .global name;		\
  .type name,%function;	\
  name:

#define END(name)	\
  .cfi_endproc;		\
  .size name, .-name;

#define L(l) .L ## l

#ifdef __ILP32__
  /* Sanitize padding bits of pointer arguments as per aapcs64 */
#define PTR_ARG(n)  mov w##n, w##n
#else
#define PTR_ARG(n)
#endif

#ifdef __ILP32__
  /* Sanitize padding bits of size arguments as per aapcs64 */
#define SIZE_ARG(n)  mov w##n, w##n
#else
#define SIZE_ARG(n)
#endif

#endif

/* END asmdefs.h */


/* Build Options:
   STRCMP_NO_PRECHECK: Don't run a quick pre-check of the first
   byte in the string.  If comparing completely random strings
   the pre-check will save time, since there is a very high
   probability of a mismatch in the first character: we save
   significant overhead if this is the common case.  However,
   if strings are likely to be identical (eg because we're
   verifying a hit in a hash table), then this check is largely
   redundant.  */

#define STRCMP_NO_PRECHECK	0

        .section .text:strcmp, "ax", %progbits

	/* This version uses Thumb-2 code.  */
	.thumb
	.syntax unified

#ifdef __ARM_BIG_ENDIAN
#define S2LO lsl
#define S2LOEQ lsleq
#define S2HI lsr
#define MSB 0x000000ff
#define LSB 0xff000000
#define BYTE0_OFFSET 24
#define BYTE1_OFFSET 16
#define BYTE2_OFFSET 8
#define BYTE3_OFFSET 0
#else /* not  __ARM_BIG_ENDIAN */
#define S2LO lsr
#define S2LOEQ lsreq
#define S2HI lsl
#define BYTE0_OFFSET 0
#define BYTE1_OFFSET 8
#define BYTE2_OFFSET 16
#define BYTE3_OFFSET 24
#define MSB 0xff000000
#define LSB 0x000000ff
#endif /* not  __ARM_BIG_ENDIAN */

/* Parameters and result.  */
#define src1		r0
#define src2		r1
#define result		r0	/* Overlaps src1.  */

/* Internal variables.  */
#define tmp1		r4
#define tmp2		r5
#define const_m1	r12

/* Additional internal variables for 64-bit aligned data.  */
#define data1a		r2
#define data1b		r3
#define data2a		r6
#define data2b		r7
#define syndrome_a	tmp1
#define syndrome_b	tmp2

/* Additional internal variables for 32-bit aligned data.  */
#define data1		r2
#define data2		r3
#define syndrome	tmp2


	/* Macro to compute and return the result value for word-aligned
	   cases.  */
	.macro strcmp_epilogue_aligned synd d1 d2 restore_r6
#ifdef __ARM_BIG_ENDIAN
	/* If data1 contains a zero byte, then syndrome will contain a 1 in
	   bit 7 of that byte.  Otherwise, the highest set bit in the
	   syndrome will highlight the first different bit.  It is therefore
	   sufficient to extract the eight bits starting with the syndrome
	   bit.  */
	clz	tmp1, \synd
	lsl	r1, \d2, tmp1
	.if \restore_r6
	ldrd	r6, r7, [sp, #8]
	.endif
	.cfi_restore 6
	.cfi_restore 7
	lsl	\d1, \d1, tmp1
	.cfi_remember_state
	lsr	result, \d1, #24
	ldrd	r4, r5, [sp], #16
	.cfi_restore 4
	.cfi_restore 5
	sub	result, result, r1, lsr #24
	bx	lr
#else
	/* To use the big-endian trick we'd have to reverse all three words.
	   that's slower than this approach.  */
	rev	\synd, \synd
	clz	tmp1, \synd
	bic	tmp1, tmp1, #7
	lsr	r1, \d2, tmp1
	.cfi_remember_state
	.if \restore_r6
	ldrd	r6, r7, [sp, #8]
	.endif
	.cfi_restore 6
	.cfi_restore 7
	lsr	\d1, \d1, tmp1
	and	result, \d1, #255
	and	r1, r1, #255
	ldrd	r4, r5, [sp], #16
	.cfi_restore 4
	.cfi_restore 5
	sub	result, result, r1

	bx	lr
#endif
	.endm

	.p2align	5
L(strcmp_start_addr):
#if STRCMP_NO_PRECHECK == 0
L(fastpath_exit):
	sub	r0, r2, r3
	bx	lr
	nop
        #endif

ENTRY_ALIGN (strcmp, 0)
#if STRCMP_NO_PRECHECK == 0
	ldrb	r2, [src1]
	ldrb	r3, [src2]
	cmp	r2, #1
	it	cs
	cmpcs	r2, r3
	bne	L(fastpath_exit)
#endif
	strd	r4, r5, [sp, #-16]!
	.cfi_def_cfa_offset 16
	.cfi_offset 4, -16
	.cfi_offset 5, -12
	orr	tmp1, src1, src2
	strd	r6, r7, [sp, #8]
	.cfi_offset 6, -8
	.cfi_offset 7, -4
	mvn	const_m1, #0
	lsl	r2, tmp1, #29
	cbz	r2, L(loop_aligned8)

L(not_aligned):
	eor	tmp1, src1, src2
	tst	tmp1, #7
	bne	L(misaligned8)

	/* Deal with mutual misalignment by aligning downwards and then
	   masking off the unwanted loaded data to prevent a difference.  */
	and	tmp1, src1, #7
	bic	src1, src1, #7
	and	tmp2, tmp1, #3
	bic	src2, src2, #7
	lsl	tmp2, tmp2, #3	/* Bytes -> bits.  */
	ldrd	data1a, data1b, [src1], #16
	tst	tmp1, #4
	ldrd	data2a, data2b, [src2], #16
	/* In thumb code we can't use MVN with a register shift, but
	   we do have ORN.  */
	S2HI	tmp1, const_m1, tmp2
	orn	data1a, data1a, tmp1
	orn	data2a, data2a, tmp1
	beq	L(start_realigned8)
	orn	data1b, data1b, tmp1
	mov	data1a, const_m1
	orn	data2b, data2b, tmp1
	mov	data2a, const_m1
	b	L(start_realigned8)

	/* Unwind the inner loop by a factor of 2, giving 16 bytes per
	   pass.  */
	.p2align 5,,12  /* Don't start in the tail bytes of a cache line.  */
	.p2align 2	/* Always word aligned.  */
L(loop_aligned8):
	ldrd	data1a, data1b, [src1], #16
	ldrd	data2a, data2b, [src2], #16
L(start_realigned8):
	uadd8	syndrome_b, data1a, const_m1	/* Only want GE bits,  */
	eor	syndrome_a, data1a, data2a
	sel	syndrome_a, syndrome_a, const_m1
	cbnz	syndrome_a, L(diff_in_a)
	uadd8	syndrome_b, data1b, const_m1	/* Only want GE bits.  */
	eor	syndrome_b, data1b, data2b
	sel	syndrome_b, syndrome_b, const_m1
	cbnz	syndrome_b, L(diff_in_b)

	ldrd	data1a, data1b, [src1, #-8]
	ldrd	data2a, data2b, [src2, #-8]
	uadd8	syndrome_b, data1a, const_m1	/* Only want GE bits,  */
	eor	syndrome_a, data1a, data2a
	sel	syndrome_a, syndrome_a, const_m1
	uadd8	syndrome_b, data1b, const_m1	/* Only want GE bits.  */
	eor	syndrome_b, data1b, data2b
	sel	syndrome_b, syndrome_b, const_m1
	/* Can't use CBZ for backwards branch.  */
	orrs	syndrome_b, syndrome_b, syndrome_a /* Only need if s_a == 0 */
	beq	L(loop_aligned8)

L(diff_found):
	cbnz	syndrome_a, L(diff_in_a)

L(diff_in_b):
	strcmp_epilogue_aligned syndrome_b, data1b, data2b 1

L(diff_in_a):
	.cfi_restore_state
	strcmp_epilogue_aligned syndrome_a, data1a, data2a 1

	.cfi_restore_state
L(misaligned8):
	tst	tmp1, #3
	bne	L(misaligned4)
	ands	tmp1, src1, #3
	bne	L(mutual_align4)

	/* Unrolled by a factor of 2, to reduce the number of post-increment
	   operations.  */
L(loop_aligned4):
	ldr	data1, [src1], #8
	ldr	data2, [src2], #8
L(start_realigned4):
	uadd8	syndrome, data1, const_m1	/* Only need GE bits.  */
	eor	syndrome, data1, data2
	sel	syndrome, syndrome, const_m1
	cbnz	syndrome, L(aligned4_done)
	ldr	data1, [src1, #-4]
	ldr	data2, [src2, #-4]
	uadd8	syndrome, data1, const_m1
	eor	syndrome, data1, data2
	sel	syndrome, syndrome, const_m1
	cmp	syndrome, #0
	beq	L(loop_aligned4)

L(aligned4_done):
	strcmp_epilogue_aligned syndrome, data1, data2, 0

L(mutual_align4):
	.cfi_restore_state
	/* Deal with mutual misalignment by aligning downwards and then
	   masking off the unwanted loaded data to prevent a difference.  */
	lsl	tmp1, tmp1, #3	/* Bytes -> bits.  */
	bic	src1, src1, #3
	ldr	data1, [src1], #8
	bic	src2, src2, #3
	ldr	data2, [src2], #8

	/* In thumb code we can't use MVN with a register shift, but
	   we do have ORN.  */
	S2HI	tmp1, const_m1, tmp1
	orn	data1, data1, tmp1
	orn	data2, data2, tmp1
	b	L(start_realigned4)

L(misaligned4):
	ands	tmp1, src1, #3
	beq	L(src1_aligned)
	sub	src2, src2, tmp1
	bic	src1, src1, #3
	lsls	tmp1, tmp1, #31
	ldr	data1, [src1], #4
	beq	L(aligned_m2)
	bcs	L(aligned_m1)

#if STRCMP_NO_PRECHECK == 1
	ldrb	data2, [src2, #1]
	uxtb	tmp1, data1, ror #BYTE1_OFFSET
	subs	tmp1, tmp1, data2
	bne	L(misaligned_exit)
	cbz	data2, L(misaligned_exit)

L(aligned_m2):
	ldrb	data2, [src2, #2]
	uxtb	tmp1, data1, ror #BYTE2_OFFSET
	subs	tmp1, tmp1, data2
	bne	L(misaligned_exit)
	cbz	data2, L(misaligned_exit)

L(aligned_m1):
	ldrb	data2, [src2, #3]
	uxtb	tmp1, data1, ror #BYTE3_OFFSET
	subs	tmp1, tmp1, data2
	bne	L(misaligned_exit)
	add	src2, src2, #4
	cbnz	data2, L(src1_aligned)
#else  /* STRCMP_NO_PRECHECK */
	/* If we've done the pre-check, then we don't need to check the
	   first byte again here.  */
	ldrb	data2, [src2, #2]
	uxtb	tmp1, data1, ror #BYTE2_OFFSET
	subs	tmp1, tmp1, data2
	bne	L(misaligned_exit)
	cbz	data2, L(misaligned_exit)

L(aligned_m2):
	ldrb	data2, [src2, #3]
	uxtb	tmp1, data1, ror #BYTE3_OFFSET
	subs	tmp1, tmp1, data2
	bne	L(misaligned_exit)
	cbnz	data2, L(aligned_m1)
#endif

L(misaligned_exit):
	.cfi_remember_state
	mov	result, tmp1
	ldr	r4, [sp], #16
	.cfi_restore 4
	bx	lr

#if STRCMP_NO_PRECHECK == 0
L(aligned_m1):
	add	src2, src2, #4
#endif
L(src1_aligned):
	.cfi_restore_state
	/* src1 is word aligned, but src2 has no common alignment
	   with it.  */
	ldr	data1, [src1], #4
	lsls	tmp1, src2, #31		/* C=src2[1], Z=src2[0].  */

	bic	src2, src2, #3
	ldr	data2, [src2], #4
	bhi	L(overlap1)		/* C=1, Z=0 => src2[1:0] = 0b11.  */
	bcs	L(overlap2)		/* C=1, Z=1 => src2[1:0] = 0b10.  */

	/* (overlap3) C=0, Z=0 => src2[1:0] = 0b01.  */
L(overlap3):
	bic	tmp1, data1, #MSB
	uadd8	syndrome, data1, const_m1
	eors	syndrome, tmp1, data2, S2LO #8
	sel	syndrome, syndrome, const_m1
	bne	4f
	cbnz	syndrome, 5f
	ldr	data2, [src2], #4
	eor	tmp1, tmp1, data1
	cmp	tmp1, data2, S2HI #24
	bne	6f
	ldr	data1, [src1], #4
	b	L(overlap3)
4:
	S2LO	data2, data2, #8
	b	L(strcmp_tail)

5:
	bics	syndrome, syndrome, #MSB
	bne	L(strcmp_done_equal)

	/* We can only get here if the MSB of data1 contains 0, so
	   fast-path the exit.  */
	ldrb	result, [src2]
	.cfi_remember_state
	ldrd	r4, r5, [sp], #16
	.cfi_restore 4
	.cfi_restore 5
	/* R6/7 Not used in this sequence.  */
	.cfi_restore 6
	.cfi_restore 7
	neg	result, result
	bx	lr

6:
	.cfi_restore_state
	S2LO	data1, data1, #24
	and	data2, data2, #LSB
	b	L(strcmp_tail)

	.p2align 5,,12	/* Ensure at least 3 instructions in cache line.  */
L(overlap2):
	and	tmp1, data1, const_m1, S2LO #16
	uadd8	syndrome, data1, const_m1
	eors	syndrome, tmp1, data2, S2LO #16
	sel	syndrome, syndrome, const_m1
	bne	4f
	cbnz	syndrome, 5f
	ldr	data2, [src2], #4
	eor	tmp1, tmp1, data1
	cmp	tmp1, data2, S2HI #16
	bne	6f
	ldr	data1, [src1], #4
	b	L(overlap2)
4:
	S2LO	data2, data2, #16
	b	L(strcmp_tail)
5:
	ands	syndrome, syndrome, const_m1, S2LO #16
	bne	L(strcmp_done_equal)

	ldrh	data2, [src2]
	S2LO	data1, data1, #16
#ifdef __ARM_BIG_ENDIAN
	lsl	data2, data2, #16
#endif
	b	L(strcmp_tail)

6:
	S2LO	data1, data1, #16
	and	data2, data2, const_m1, S2LO #16
	b	L(strcmp_tail)

	.p2align 5,,12	/* Ensure at least 3 instructions in cache line.  */
L(overlap1):
	and	tmp1, data1, #LSB
	uadd8	syndrome, data1, const_m1
	eors	syndrome, tmp1, data2, S2LO #24
	sel	syndrome, syndrome, const_m1
	bne	4f
	cbnz	syndrome, 5f
	ldr	data2, [src2], #4
	eor	tmp1, tmp1, data1
	cmp	tmp1, data2, S2HI #8
	bne	6f
	ldr	data1, [src1], #4
	b	L(overlap1)
4:
	S2LO	data2, data2, #24
	b	L(strcmp_tail)
5:
	tst	syndrome, #LSB
	bne	L(strcmp_done_equal)
	ldr	data2, [src2]
6:
	S2LO	data1, data1, #8
	bic	data2, data2, #MSB
	b	L(strcmp_tail)

L(strcmp_done_equal):
	mov	result, #0
	.cfi_remember_state
	ldrd	r4, r5, [sp], #16
	.cfi_restore 4
	.cfi_restore 5
	/* R6/7 not used in this sequence.  */
	.cfi_restore 6
	.cfi_restore 7
	bx	lr

L(strcmp_tail):
	.cfi_restore_state
#ifndef __ARM_BIG_ENDIAN
	rev	data1, data1
	rev	data2, data2
	/* Now everything looks big-endian...  */
#endif
	uadd8	tmp1, data1, const_m1
	eor	tmp1, data1, data2
	sel	syndrome, tmp1, const_m1
	clz	tmp1, syndrome
	lsl	data1, data1, tmp1
	lsl	data2, data2, tmp1
	lsr	result, data1, #24
	ldrd	r4, r5, [sp], #16
	.cfi_restore 4
	.cfi_restore 5
	/* R6/7 not used in this sequence.  */
	.cfi_restore 6
	.cfi_restore 7
	sub	result, result, data2, lsr #24
	bx	lr

END (strcmp)

#endif /* __ARM_ARCH >= 7 && __ARM_ARCH_ISA_ARM >= 1  */
