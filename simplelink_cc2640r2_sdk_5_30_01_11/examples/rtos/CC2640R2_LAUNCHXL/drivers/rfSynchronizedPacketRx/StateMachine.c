/*
 * Copyright (c) 2017, Texas Instruments Incorporated
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * *  Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *
 * *  Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * *  Neither the name of Texas Instruments Incorporated nor the names of
 *    its contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
 

#include "StateMachine.h"

/* BIOS Header files */ 
#include <ti/sysbios/BIOS.h>
#include <ti/sysbios/family/arm/m3/Hwi.h>

static void StateMachine_FinalState_defaultFunction();

const StateMachine_State StateMachine_FinalState = &StateMachine_FinalState_defaultFunction;
const StateMachine_State InvalidState = NULL;

void StateMachine_FinalState_defaultFunction() {}

static const StateMachine_Struct StateMachine_defaultObject = {
        .currentState = NULL,
        .nextState = NULL,
        .transitionPending = false,
        .exitCode = StateMachine_Exit_Normal,
        .deferredEvents = 0,
        .deferredEventsMask = 0,
        .ignoredEventsMask = 0,
        .pendingEvents = 0,
        .transitionPending = false
};

void StateMachine_construct(StateMachine_Struct* machine)
{
    *machine = StateMachine_defaultObject;

    Semaphore_Params params;
    Semaphore_Params_init(&params);
    params.mode = Semaphore_Mode_BINARY;
    Semaphore_construct(&machine->semaphore, 0, &params);
}


int StateMachine_exec(StateMachine_Struct* machine, StateMachine_State initialState)
{
    if (initialState == InvalidState)
    {
        return StateMachine_Exit_InvalidInitialState;
    }

    uint32_t previousHwiState = Hwi_disable();

    machine->nextState = initialState;
    machine->currentState = initialState;
    machine->deferredEventsMask = 0;
    machine->ignoredEventsMask = 0;
    machine->deferredEvents = 0;
    machine->pendingEvents = 0;
    machine->exitCode = 0;
    machine->transitionPending = false;

    for (; machine->currentState != StateMachine_FinalState;)
    {
        // The loop body describes the transition from
        // currentState to nextState.

        // Treat deferred events from previous state as pending events in this state
        machine->pendingEvents = machine->deferredEvents;
        machine->deferredEvents = 0;
        machine->deferredEventsMask = 0;
        machine->ignoredEventsMask = 0;

        machine->currentState = machine->nextState;
        machine->transitionPending = false;

        if (machine->currentState == NULL)
        {
            Hwi_restore(previousHwiState);
            return StateMachine_Exit_NoStateHandlerFunction;
        }

        // Execute the state handler
        Hwi_restore(true);
        machine->currentState();
        Hwi_disable();
    }

    Hwi_restore(previousHwiState);
    return machine->exitCode;
}


void StateMachine_exit(StateMachine_Struct* machine, int32_t exitcode)
{
    StateMachine_setExitCode(machine, exitcode);
    StateMachine_setNextState(machine, StateMachine_FinalState);
}


StateMachine_EventMask StateMachine_pendEvents(StateMachine_Struct* machine, StateMachine_EventMask eventmask, uint32_t timeoutTicks)
{
    StateMachine_EventMask effectiveEvents = 0;

    // These events are always subscribed
    eventmask |= StateMachine_Event_Transition | StateMachine_Event_Timeout;

    uint32_t previousHwiState = Hwi_disable();

    // Wait either for timeout or for matching subscribed events
    for (;;)
    {
        // Semaphore_pend must run without interrupts disabled. TODO: Double-check if this is necessary.
        Hwi_enable();
        bool timeoutOccured = !Semaphore_pend(Semaphore_handle(&machine->semaphore), timeoutTicks);
        Hwi_disable();

        if (timeoutOccured)
        {
            machine->pendingEvents |= StateMachine_Event_Timeout;
        }

        effectiveEvents = machine->pendingEvents & eventmask;
        if (effectiveEvents != 0)
        {
            // Consider all returned events not pending anymore.
            machine->pendingEvents &= ~effectiveEvents;
            break;
        }
    }

    Hwi_restore(previousHwiState);
    return effectiveEvents;
}

void StateMachine_postEvents(StateMachine_Struct* machine, uint32_t eventmask)
{
    uint32_t pendingEvents;

    // Ignored events are not handled
    eventmask &= ~machine->ignoredEventsMask;
    if (eventmask != 0)
    {
        uint32_t previousHwiState = Hwi_disable();

        machine->deferredEvents |= eventmask & machine->deferredEventsMask;
        pendingEvents = machine->pendingEvents;
        machine->pendingEvents = pendingEvents | (eventmask & (~machine->deferredEventsMask));


        // Wakeup the waiting thread in StateMachine_pendEvent() or post for later.
        if (eventmask & ~machine->deferredEventsMask)
        {
            Semaphore_post(Semaphore_handle(&machine->semaphore));
        }

        Hwi_restore(previousHwiState);
    }
}


void StateMachine_setEventsDeferred(StateMachine_Struct* machine, StateMachine_EventMask eventmask)
{
    // Transition and timeout events cannot be deferred
    eventmask &= ~StateMachine_Event_Transition;

    uint32_t previousHwiState = Hwi_disable();
    {
        // When calling this function multiple times with different values,
        // then there might be already events that are now no longer deferred.
        // Set them pending.
        StateMachine_EventMask raisedEvents = machine->deferredEvents & ~eventmask;
        machine->pendingEvents |= raisedEvents;
        machine->deferredEvents &= eventmask;

        // Keep only events that are not to be deferred
        machine->pendingEvents &= ~eventmask;
        // Remember mask for future events
        machine->deferredEventsMask = eventmask;

        if (raisedEvents != 0)
        {
            Semaphore_post(Semaphore_handle(&machine->semaphore));
        }
    }
    Hwi_restore(previousHwiState);
}

void StateMachine_setEventsIgnored(StateMachine_Struct* machine, StateMachine_EventMask eventmask)
{
    // Transition and timeout events cannot be masked
    eventmask &= ~StateMachine_Event_Transition;

    uint32_t previousHwiState = Hwi_disable();
    {
        // Ignore already pending events
        machine->pendingEvents &= eventmask;
        // Remember event mask for future events
        machine->ignoredEventsMask = eventmask;
    }
    Hwi_restore(previousHwiState);
}

void StateMachine_setExitCode(StateMachine_Struct* machine, int32_t value)
{
    machine->exitCode = value;
}

void StateMachine_setNextState(StateMachine_Struct* machine, StateMachine_State state)
{
    uint32_t previousHwiState = Hwi_disable();
    {
        // Allow only one transition at a time
        if (!machine->transitionPending)
        {
            machine->transitionPending = true;
            machine->nextState = state;
            StateMachine_postEvents(machine, StateMachine_Event_Transition);
        }
    }
    Hwi_restore(previousHwiState);
}
