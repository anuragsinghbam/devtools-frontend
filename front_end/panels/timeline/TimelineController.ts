// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as Extensions from '../../models/extensions/extensions.js';
import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
import type * as Protocol from '../../generated/protocol.js';

import {ExtensionTracingSession} from './ExtensionTracingSession.js';
import {PerformanceModel} from './PerformanceModel.js';

const UIStrings = {
  /**
   * @description Text in Timeline Controller of the Performance panel.
   * A "CPU profile" is a recorded performance measurement how a specific target behaves.
   * "Target" in this context can mean a web page, service or normal worker.
   * "Not available" is used as there are multiple things that can go wrong, but we do not
   * know what exactly, just that the CPU profile was not correctly recorded.
   */
  cpuProfileForATargetIsNot: 'CPU profile for a target is not available.',
  /**
   *@description Text in Timeline Controller of the Performance panel indicating that the Performance Panel cannot
   * record a performance trace because the type of target (where possible types are page, service worker and shared
   * worker) doesn't support it.
   */
  tracingNotSupported: 'Performance trace recording not supported for this type of target',
};
const str_ = i18n.i18n.registerUIStrings('panels/timeline/TimelineController.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class TimelineController implements SDK.TargetManager.SDKModelObserver<SDK.CPUProfilerModel.CPUProfilerModel>,
                                           SDK.TracingManager.TracingManagerClient {
  private readonly target: SDK.Target.Target;
  private tracingManager: SDK.TracingManager.TracingManager|null;
  private performanceModel: PerformanceModel;
  private readonly client: Client;
  private readonly tracingModel: SDK.TracingModel.TracingModel;
  private extensionSessions: ExtensionTracingSession[];
  private extensionTraceProviders?: Extensions.ExtensionTraceProvider.ExtensionTraceProvider[];
  // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private tracingCompleteCallback?: ((value: any) => void)|null;
  private profiling?: boolean;
  // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private cpuProfiles?: Map<any, any>|null;

  constructor(target: SDK.Target.Target, client: Client) {
    this.target = target;
    this.tracingManager = target.model(SDK.TracingManager.TracingManager);
    this.performanceModel = new PerformanceModel();
    this.performanceModel.setMainTarget(target);
    this.client = client;

    const backingStorage = new Bindings.TempFile.TempFileBackingStorage();
    this.tracingModel = new SDK.TracingModel.TracingModel(backingStorage);

    this.extensionSessions = [];
    SDK.TargetManager.TargetManager.instance().observeModels(SDK.CPUProfilerModel.CPUProfilerModel, this);
  }

  dispose(): void {
    SDK.TargetManager.TargetManager.instance().unobserveModels(SDK.CPUProfilerModel.CPUProfilerModel, this);
  }

  mainTarget(): SDK.Target.Target {
    return this.target;
  }

  async startRecording(
      options: RecordingOptions, providers: Extensions.ExtensionTraceProvider.ExtensionTraceProvider[]):
      Promise<Protocol.ProtocolResponseWithError> {
    this.extensionTraceProviders = Extensions.ExtensionServer.ExtensionServer.instance().traceProviders().slice();

    function disabledByDefault(category: string): string {
      return 'disabled-by-default-' + category;
    }
    const categoriesArray = [
      '-*',
      'devtools.timeline',
      disabledByDefault('devtools.timeline'),
      disabledByDefault('devtools.timeline.frame'),
      'v8.execute',
      disabledByDefault('v8.compile'),
      TimelineModel.TimelineModel.TimelineModelImpl.Category.Console,
      TimelineModel.TimelineModel.TimelineModelImpl.Category.UserTiming,
      TimelineModel.TimelineModel.TimelineModelImpl.Category.Loading,
    ];
    categoriesArray.push(TimelineModel.TimelineModel.TimelineModelImpl.Category.LatencyInfo);

    if (!Root.Runtime.Runtime.queryParam('timelineTracingJSProfileDisabled') && options.enableJSSampling) {
      categoriesArray.push(disabledByDefault('v8.cpu_profiler'));
    }
    categoriesArray.push(disabledByDefault('devtools.timeline.stack'));
    if (Root.Runtime.experiments.isEnabled('timelineInvalidationTracking')) {
      categoriesArray.push(disabledByDefault('devtools.timeline.invalidationTracking'));
    }
    if (options.capturePictures) {
      categoriesArray.push(
          disabledByDefault('devtools.timeline.layers'), disabledByDefault('devtools.timeline.picture'),
          disabledByDefault('blink.graphics_context_annotations'));
    }
    if (options.captureFilmStrip) {
      categoriesArray.push(disabledByDefault('devtools.screenshot'));
    }

    this.extensionSessions = providers.map(provider => new ExtensionTracingSession(provider, this.performanceModel));
    this.extensionSessions.forEach(session => session.start());
    this.performanceModel.setRecordStartTime(Date.now());
    const response = await this.startRecordingWithCategories(categoriesArray.join(','), options.enableJSSampling);
    if (response.getError()) {
      await this.waitForTracingToStop(false);
      await SDK.TargetManager.TargetManager.instance().resumeAllTargets();
    }
    return response;
  }

  async stopRecording(): Promise<PerformanceModel> {
    if (this.tracingManager) {
      this.tracingManager.stop();
    }

    this.client.loadingStarted();
    await this.waitForTracingToStop(true);
    this.allSourcesFinished();
    return this.performanceModel;
  }

  private async waitForTracingToStop(awaitTracingCompleteCallback: boolean): Promise<void> {
    const tracingStoppedPromises = [];
    if (this.tracingManager && awaitTracingCompleteCallback) {
      tracingStoppedPromises.push(new Promise(resolve => {
        this.tracingCompleteCallback = resolve;
      }));
    }
    tracingStoppedPromises.push(this.stopProfilingOnAllModels());

    const extensionCompletionPromises = this.extensionSessions.map(session => session.stop());
    if (extensionCompletionPromises.length) {
      tracingStoppedPromises.push(
          Promise.race([Promise.all(extensionCompletionPromises), new Promise(r => setTimeout(r, 5000))]));
    }
    await Promise.all(tracingStoppedPromises);
  }

  modelAdded(cpuProfilerModel: SDK.CPUProfilerModel.CPUProfilerModel): void {
    if (this.profiling) {
      cpuProfilerModel.startRecording();
    }
  }

  modelRemoved(_cpuProfilerModel: SDK.CPUProfilerModel.CPUProfilerModel): void {
    // FIXME: We'd like to stop profiling on the target and retrieve a profile
    // but it's too late. Backend connection is closed.
  }

  private async startProfilingOnAllModels(): Promise<void> {
    this.profiling = true;
    const models = SDK.TargetManager.TargetManager.instance().models(SDK.CPUProfilerModel.CPUProfilerModel);
    await Promise.all(models.map(model => model.startRecording()));
  }

  private addCpuProfile(targetId: Protocol.Target.TargetID|'main', cpuProfile: Protocol.Profiler.Profile|null): void {
    if (!cpuProfile) {
      Common.Console.Console.instance().warn(i18nString(UIStrings.cpuProfileForATargetIsNot));
      return;
    }
    if (!this.cpuProfiles) {
      this.cpuProfiles = new Map();
    }
    this.cpuProfiles.set(targetId, cpuProfile);
  }

  private async stopProfilingOnAllModels(): Promise<void> {
    const models =
        this.profiling ? SDK.TargetManager.TargetManager.instance().models(SDK.CPUProfilerModel.CPUProfilerModel) : [];
    this.profiling = false;
    const promises = [];
    for (const model of models) {
      const targetId = model.target().id();
      const modelPromise = model.stopRecording().then(this.addCpuProfile.bind(this, targetId));
      promises.push(modelPromise);
    }
    await Promise.all(promises);
  }

  private async startRecordingWithCategories(categories: string, enableJSSampling?: boolean):
      Promise<Protocol.ProtocolResponseWithError> {
    if (!this.tracingManager) {
      throw new Error(UIStrings.tracingNotSupported);
    }
    // There might be a significant delay in the beginning of timeline recording
    // caused by starting CPU profiler, that needs to traverse JS heap to collect
    // all the functions data.
    await SDK.TargetManager.TargetManager.instance().suspendAllTargets('performance-timeline');
    if (enableJSSampling && Root.Runtime.Runtime.queryParam('timelineTracingJSProfileDisabled')) {
      await this.startProfilingOnAllModels();
    }

    return this.tracingManager.start(this, categories, '');
  }

  traceEventsCollected(events: SDK.TracingManager.EventPayload[]): void {
    this.tracingModel.addEvents(events);
  }

  tracingComplete(): void {
    if (!this.tracingCompleteCallback) {
      return;
    }
    this.tracingCompleteCallback(undefined);
    this.tracingCompleteCallback = null;
  }

  private allSourcesFinished(): void {
    this.client.processingStarted();
    setTimeout(() => this.finalizeTrace(), 0);
  }

  private async finalizeTrace(): Promise<void> {
    this.injectCpuProfileEvents();
    await SDK.TargetManager.TargetManager.instance().resumeAllTargets();
    this.tracingModel.tracingComplete();
    this.client.loadingComplete(this.tracingModel);
  }

  private injectCpuProfileEvent(pid: number, tid: number, cpuProfile: Protocol.Profiler.Profile|null): void {
    if (!cpuProfile) {
      return;
    }
    // TODO(crbug/1011811): This event type is not compatible with the SDK.TracingManager.EventPayload.
    // EventPayload requires many properties to be defined but it's not clear if they will have
    // any side effects.
    const cpuProfileEvent = ({
      cat: SDK.TracingModel.DevToolsMetadataEventCategory,
      ph: SDK.TracingModel.Phase.Instant,
      ts: this.tracingModel.maximumRecordTime() * 1000,
      pid: pid,
      tid: tid,
      name: TimelineModel.TimelineModel.RecordType.CpuProfile,
      args: {data: {cpuProfile: cpuProfile}},
      // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    this.tracingModel.addEvents([cpuProfileEvent]);
  }

  private buildTargetToProcessIdMap(): Map<string, number>|null {
    const metadataEventTypes = TimelineModel.TimelineModel.TimelineModelImpl.DevToolsMetadataEvent;
    const metadataEvents = this.tracingModel.devToolsMetadataEvents();
    const browserMetaEvent = metadataEvents.find(e => e.name === metadataEventTypes.TracingStartedInBrowser);
    if (!browserMetaEvent) {
      return null;
    }

    const pseudoPidToFrames = new Platform.MapUtilities.Multimap<string, string>();
    const targetIdToPid = new Map<string, number>();
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const frames: any[] = browserMetaEvent.args.data.frames;
    for (const frameInfo of frames) {
      targetIdToPid.set(frameInfo.frame, frameInfo.processId);
    }
    for (const event of metadataEvents) {
      const data = event.args.data;
      switch (event.name) {
        case metadataEventTypes.FrameCommittedInBrowser:
          if (data.processId) {
            targetIdToPid.set(data.frame, data.processId);
          } else {
            pseudoPidToFrames.set(data.processPseudoId, data.frame);
          }
          break;
        case metadataEventTypes.ProcessReadyInBrowser:
          for (const frame of pseudoPidToFrames.get(data.processPseudoId) || []) {
            targetIdToPid.set(frame, data.processId);
          }
          break;
      }
    }
    const mainFrame = frames.find(frame => !frame.parent);
    const mainRendererProcessId = mainFrame.processId;
    const mainProcess = this.tracingModel.getProcessById(mainRendererProcessId);
    if (mainProcess) {
      const target = SDK.TargetManager.TargetManager.instance().mainTarget();
      if (target) {
        targetIdToPid.set(target.id(), mainProcess.id());
      }
    }
    return targetIdToPid;
  }

  private injectCpuProfileEvents(): void {
    if (!this.cpuProfiles) {
      return;
    }

    const metadataEventTypes = TimelineModel.TimelineModel.TimelineModelImpl.DevToolsMetadataEvent;
    const metadataEvents = this.tracingModel.devToolsMetadataEvents();

    const targetIdToPid = this.buildTargetToProcessIdMap();
    if (targetIdToPid) {
      for (const [id, profile] of this.cpuProfiles) {
        const pid = targetIdToPid.get(id);
        if (!pid) {
          continue;
        }
        const process = this.tracingModel.getProcessById(pid);
        const thread =
            process && process.threadByName(TimelineModel.TimelineModel.TimelineModelImpl.RendererMainThreadName);
        if (thread) {
          this.injectCpuProfileEvent(pid, thread.id(), profile);
        }
      }
    } else {
      // Legacy backends support.
      const filteredEvents = metadataEvents.filter(event => event.name === metadataEventTypes.TracingStartedInPage);
      const mainMetaEvent = filteredEvents[filteredEvents.length - 1];
      if (mainMetaEvent) {
        const pid = mainMetaEvent.thread.process().id();
        if (this.tracingManager) {
          const mainCpuProfile = this.cpuProfiles.get(this.tracingManager.target().id());
          this.injectCpuProfileEvent(pid, mainMetaEvent.thread.id(), mainCpuProfile);
        }
      } else {
        // Or there was no tracing manager in the main target at all, in this case build the model full
        // of cpu profiles.
        let tid = 0;
        for (const pair of this.cpuProfiles) {
          const target = SDK.TargetManager.TargetManager.instance().targetById(pair[0]);
          const name = target && target.name();
          this.tracingModel.addEvents(
              TimelineModel.TimelineJSProfile.TimelineJSProfileProcessor.buildTraceProfileFromCpuProfile(
                  pair[1], ++tid, /* injectPageEvent */ tid === 1, name));
        }
      }
    }

    const workerMetaEvents =
        metadataEvents.filter(event => event.name === metadataEventTypes.TracingSessionIdForWorker);
    for (const metaEvent of workerMetaEvents) {
      const workerId = metaEvent.args['data']['workerId'];
      const cpuProfile = this.cpuProfiles.get(workerId);
      this.injectCpuProfileEvent(metaEvent.thread.process().id(), metaEvent.args['data']['workerThreadId'], cpuProfile);
    }
    this.cpuProfiles = null;
  }

  tracingBufferUsage(usage: number): void {
    this.client.recordingProgress(usage);
  }

  eventsRetrievalProgress(progress: number): void {
    this.client.loadingProgress(progress);
  }
}

export interface Client {
  recordingProgress(usage: number): void;
  loadingStarted(): void;
  processingStarted(): void;
  loadingProgress(progress?: number): void;
  loadingComplete(tracingModel: SDK.TracingModel.TracingModel|null): void;
}
export interface RecordingOptions {
  enableJSSampling?: boolean;
  capturePictures?: boolean;
  captureFilmStrip?: boolean;
  startCoverage?: boolean;
}
