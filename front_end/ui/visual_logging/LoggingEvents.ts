// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import type * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import {assertNotNullOrUndefined} from '../../core/platform/platform.js';

import {showDebugPopoverForEvent} from './Debugging.js';
import {type Loggable} from './Loggable.js';
import {getLoggingState} from './LoggingState.js';

export async function logImpressions(loggables: Loggable[]): Promise<void> {
  const impressions = await Promise.all(loggables.map(async loggable => {
    const loggingState = getLoggingState(loggable);
    assertNotNullOrUndefined(loggingState);
    const impression:
        Host.InspectorFrontendHostAPI.VisualElementImpression = {id: loggingState.veid, type: loggingState.config.ve};
    if (typeof loggingState.config.context !== 'undefined') {
      impression.context = await contextAsNumber(loggingState.config.context);
    }
    if (loggingState.parent) {
      impression.parent = loggingState.parent.veid;
    }
    if (loggingState.size) {
      impression.width = loggingState.size.width;
      impression.height = loggingState.size.height;
    }
    return impression;
  }));
  if (impressions.length) {
    Host.InspectorFrontendHost.InspectorFrontendHostInstance.recordImpression({impressions});
  }
}

export const logResize = (throttler: Common.Throttler.Throttler) => (loggable: Loggable, size: DOMRect) => {
  const loggingState = getLoggingState(loggable);
  if (!loggingState) {
    return;
  }
  loggingState.size = size;
  const resizeEvent: Host.InspectorFrontendHostAPI
      .ResizeEvent = {veid: loggingState.veid, width: loggingState.size.width, height: loggingState.size.height};
  void throttler.schedule(async () => {
    Host.InspectorFrontendHost.InspectorFrontendHostInstance.recordResize(resizeEvent);
    showDebugPopoverForEvent('Resize', loggingState?.config);
  });
};

export const logClick = (throttler: Common.Throttler.Throttler) => (
    loggable: Loggable, event: Event, options?: {doubleClick?: boolean}) => {
  const loggingState = getLoggingState(loggable);
  if (!loggingState) {
    return;
  }
  const button = event instanceof MouseEvent ? event.button : 0;
  const clickEvent: Host.InspectorFrontendHostAPI
      .ClickEvent = {veid: loggingState.veid, mouseButton: button, doubleClick: Boolean(options?.doubleClick)};
  void throttler.schedule(async () => {
    Host.InspectorFrontendHost.InspectorFrontendHostInstance.recordClick(clickEvent);
    showDebugPopoverForEvent('Click', loggingState?.config);
  });
};

export const logHover = (throttler: Common.Throttler.Throttler) => async (event: Event) => {
  const loggingState = getLoggingState(event.currentTarget as Element);
  assertNotNullOrUndefined(loggingState);
  const hoverEvent: Host.InspectorFrontendHostAPI.HoverEvent = {veid: loggingState.veid};
  void throttler.schedule(async () => {
    Host.InspectorFrontendHost.InspectorFrontendHostInstance.recordHover(hoverEvent);
    showDebugPopoverForEvent('Hover', loggingState?.config);
  });
};

export const logDrag = (throttler: Common.Throttler.Throttler) => async (event: Event) => {
  const loggingState = getLoggingState(event.currentTarget as Element);
  assertNotNullOrUndefined(loggingState);
  const dragEvent: Host.InspectorFrontendHostAPI.DragEvent = {veid: loggingState.veid};
  void throttler.schedule(async () => {
    Host.InspectorFrontendHost.InspectorFrontendHostInstance.recordDrag(dragEvent);
    showDebugPopoverForEvent('Drag', loggingState?.config);
  });
};

export async function logChange(event: Event): Promise<void> {
  const loggingState = getLoggingState(event.currentTarget as Element);
  assertNotNullOrUndefined(loggingState);
  const changeEvent: Host.InspectorFrontendHostAPI.ChangeEvent = {veid: loggingState.veid};
  Host.InspectorFrontendHost.InspectorFrontendHostInstance.recordChange(changeEvent);
  showDebugPopoverForEvent('Change', loggingState?.config);
}

export const logKeyDown =
    (throttler: Common.Throttler.Throttler, codes?: string[]) => async (event: Event|null, context?: string) => {
      if (!(event instanceof KeyboardEvent)) {
        return;
      }
      if (codes?.length && !codes.includes(event.code)) {
        return;
      }
      const loggingState = event?.currentTarget ? getLoggingState(event.currentTarget) : null;
      const keyDownEvent: Host.InspectorFrontendHostAPI.KeyDownEvent = {veid: loggingState?.veid};
      if (!context && codes?.length) {
        context = contextFromKeyCodes(event);
      }
      if (context) {
        keyDownEvent.context = await contextAsNumber(context);
      }
      void throttler.schedule(async () => {
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.recordKeyDown(keyDownEvent);
        showDebugPopoverForEvent('KeyDown', loggingState?.config, context);
      });
    };

function contextFromKeyCodes(event: Event): string|undefined {
  if (!(event instanceof KeyboardEvent)) {
    return undefined;
  }
  const components = [];
  if (event.shiftKey) {
    components.push('shift');
  }
  if (event.ctrlKey) {
    components.push('ctrl');
  }
  if (event.altKey) {
    components.push('alt');
  }
  if (event.metaKey) {
    components.push('meta');
  }
  components.push(event.key.toLowerCase());
  return components.join('-');
}

async function contextAsNumber(context: string|undefined): Promise<number|undefined> {
  if (typeof context === 'undefined') {
    return undefined;
  }
  const number = parseInt(context, 10);
  if (!isNaN(number)) {
    return number;
  }
  if (!crypto.subtle) {
    // Layout tests run in an insecure context where crypto.subtle is not available.
    return 0xDEADBEEF;
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(context);
  const digest = await crypto.subtle.digest('SHA-1', data);
  return new DataView(digest).getUint32(0, true);
}
